import User from '../models/User.js';
import Post from '../models/Post.js';
import Message from '../models/Message.js';
import Story from '../models/Story.js';
import Connection from '../models/Connection.js';

/**
 * Social Network Analysis Utilities
 * Implements algorithms for analyzing user connections, influence, and recommendations
 */

class SocialNetworkAnalyzer {
    constructor() {
        this.userCache = new Map();
        this.interactionCache = new Map();
    }

    /**
     * Build user interaction network graph
     */
    async buildNetworkGraph(userId = null) {
        try {
            const users = await User.find({});
            const graph = {
                nodes: [],
                edges: [],
                adjacencyList: new Map()
            };

            // Build nodes
            users.forEach(user => {
                const node = {
                    id: user._id,
                    username: user.username,
                    fullName: user.full_name,
                    profilePicture: user.profile_picture,
                    followers: user.followers.length,
                    following: user.following.length,
                    connections: user.connections.length
                };
                graph.nodes.push(node);
                graph.adjacencyList.set(user._id, new Set());
            });

            // Build edges based on connections, followers, and following
            for (const user of users) {
                // Add connection edges
                user.connections.forEach(connectedUserId => {
                    if (graph.adjacencyList.has(user._id) && graph.adjacencyList.has(connectedUserId)) {
                        graph.adjacencyList.get(user._id).add(connectedUserId);
                        graph.adjacencyList.get(connectedUserId).add(user._id);
                        
                        graph.edges.push({
                            from: user._id,
                            to: connectedUserId,
                            type: 'connection',
                            weight: 3
                        });
                    }
                });

                // Add follower edges
                user.followers.forEach(followerId => {
                    if (graph.adjacencyList.has(user._id) && graph.adjacencyList.has(followerId)) {
                        graph.adjacencyList.get(followerId).add(user._id);
                        
                        graph.edges.push({
                            from: followerId,
                            to: user._id,
                            type: 'follow',
                            weight: 1
                        });
                    }
                });
            }

            return graph;
        } catch (error) {
            console.error('Error building network graph:', error);
            throw error;
        }
    }

    /**
     * Calculate network metrics for a user
     */
    async calculateUserMetrics(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) throw new Error('User not found');

            const graph = await this.buildNetworkGraph();
            const userNode = graph.nodes.find(n => n.id === userId);
            
            if (!userNode) return null;

            // Basic metrics
            const degree = graph.adjacencyList.get(userId)?.size || 0;
            const followerCount = user.followers.length;
            const followingCount = user.following.length;
            const connectionCount = user.connections.length;

            // Engagement metrics
            const posts = await Post.find({ user: userId });
            const totalLikes = posts.reduce((sum, post) => sum + post.likes_count.length, 0);
            const avgLikesPerPost = posts.length > 0 ? totalLikes / posts.length : 0;

            // Message activity
            const sentMessages = await Message.countDocuments({ from_user_id: userId });
            const receivedMessages = await Message.countDocuments({ to_user_id: userId });

            // Story views
            const stories = await Story.find({ user: userId });
            const totalStoryViews = stories.reduce((sum, story) => sum + story.views_count.length, 0);

            // Calculate influence score
            const influenceScore = this.calculateInfluenceScore({
                followers: followerCount,
                connections: connectionCount,
                avgLikesPerPost,
                totalStoryViews,
                sentMessages,
                degree
            });

            return {
                userId,
                username: user.username,
                fullName: user.full_name,
                basicMetrics: {
                    followers: followerCount,
                    following: followingCount,
                    connections: connectionCount,
                    degree
                },
                engagementMetrics: {
                    postCount: posts.length,
                    totalLikes,
                    avgLikesPerPost,
                    sentMessages,
                    receivedMessages,
                    totalStoryViews
                },
                influenceScore
            };
        } catch (error) {
            console.error('Error calculating user metrics:', error);
            throw error;
        }
    }

    /**
     * Calculate influence score based on multiple factors
     */
    calculateInfluenceScore(metrics) {
        const {
            followers = 0,
            connections = 0,
            avgLikesPerPost = 0,
            totalStoryViews = 0,
            sentMessages = 0,
            degree = 0
        } = metrics;

        // Weighted formula for influence calculation
        const followerWeight = 0.3;
        const connectionWeight = 0.25;
        const engagementWeight = 0.25;
        const activityWeight = 0.2;

        // Normalize values (logarithmic scaling for large numbers)
        const normalizedFollowers = Math.log10(followers + 1);
        const normalizedConnections = Math.log10(connections + 1);
        const normalizedEngagement = Math.log10(avgLikesPerPost + 1);
        const normalizedActivity = Math.log10(sentMessages + totalStoryViews + 1);

        const influenceScore = 
            (normalizedFollowers * followerWeight) +
            (normalizedConnections * connectionWeight) +
            (normalizedEngagement * engagementWeight) +
            (normalizedActivity * activityWeight);

        return Math.round(influenceScore * 100) / 100; // Round to 2 decimal places
    }

    /**
     * Find influential users in the network
     */
    async findInfluentialUsers(limit = 10) {
        try {
            const users = await User.find({});
            const userMetrics = [];

            for (const user of users) {
                const metrics = await this.calculateUserMetrics(user._id);
                if (metrics) {
                    userMetrics.push(metrics);
                }
            }

            // Sort by influence score
            userMetrics.sort((a, b) => b.influenceScore - a.influenceScore);

            return userMetrics.slice(0, limit);
        } catch (error) {
            console.error('Error finding influential users:', error);
            throw error;
        }
    }

    /**
     * Analyze user connections and interactions
     */
    async analyzeUserConnections(userId) {
        try {
            const user = await User.findById(userId)
                .populate('followers', 'username full_name profile_picture')
                .populate('following', 'username full_name profile_picture')
                .populate('connections', 'username full_name profile_picture');

            if (!user) throw new Error('User not found');

            // Find mutual connections
            const mutualConnections = user.followers.filter(follower => 
                user.following.includes(follower._id)
            );

            // Analyze connection strength based on interactions
            const connectionStrengths = new Map();
            
            for (const connectionId of user.connections) {
                const strength = await this.calculateConnectionStrength(userId, connectionId);
                connectionStrengths.set(connectionId, strength);
            }

            // Sort connections by strength
            const sortedConnections = user.connections
                .map(connId => ({
                    user: connId,
                    strength: connectionStrengths.get(connId) || 0
                }))
                .sort((a, b) => b.strength - a.strength);

            return {
                userId,
                totalFollowers: user.followers.length,
                totalFollowing: user.following.length,
                totalConnections: user.connections.length,
                mutualConnections: mutualConnections.length,
                connectionStrengths: sortedConnections.slice(0, 10), // Top 10 strongest connections
                networkDensity: await this.calculateNetworkDensity(userId)
            };
        } catch (error) {
            console.error('Error analyzing user connections:', error);
            throw error;
        }
    }

    /**
     * Calculate connection strength between two users
     */
    async calculateConnectionStrength(userId1, userId2) {
        try {
            // Direct connection
            const user1 = await User.findById(userId1);
            const user2 = await User.findById(userId2);
            
            let strength = 0;

            // Check if directly connected
            if (user1.connections.includes(userId2)) {
                strength += 5;
            }

            // Check mutual following
            if (user1.following.includes(userId2) && user2.following.includes(userId1)) {
                strength += 3;
            }

            // Message interactions
            const messageCount = await Message.countDocuments({
                $or: [
                    { from_user_id: userId1, to_user_id: userId2 },
                    { from_user_id: userId2, to_user_id: userId1 }
                ]
            });
            strength += Math.min(messageCount / 10, 2); // Cap at 2 points

            // Post interactions (likes)
            const user1Posts = await Post.find({ user: userId1 });
            const user2Posts = await Post.find({ user: userId2 });

            let interactionCount = 0;
            
            // Check if user2 liked user1's posts
            user1Posts.forEach(post => {
                if (post.likes_count.includes(userId2)) interactionCount++;
            });

            // Check if user1 liked user2's posts
            user2Posts.forEach(post => {
                if (post.likes_count.includes(userId1)) interactionCount++;
            });

            strength += Math.min(interactionCount / 5, 2); // Cap at 2 points

            return Math.round(strength * 100) / 100;
        } catch (error) {
            console.error('Error calculating connection strength:', error);
            return 0;
        }
    }

    /**
     * Calculate network density for a user
     */
    async calculateNetworkDensity(userId) {
        try {
            const user = await User.findById(userId);
            const allConnections = [...user.followers, ...user.following, ...user.connections];
            const uniqueConnections = [...new Set(allConnections)];
            
            if (uniqueConnections.length < 2) return 0;

            const graph = await this.buildNetworkGraph();
            let actualEdges = 0;

            // Count edges within the user's network
            for (const conn1 of uniqueConnections) {
                for (const conn2 of uniqueConnections) {
                    if (conn1 !== conn2 && graph.adjacencyList.get(conn1)?.has(conn2)) {
                        actualEdges++;
                    }
                }
            }

            const possibleEdges = uniqueConnections.length * (uniqueConnections.length - 1);
            return possibleEdges > 0 ? actualEdges / possibleEdges : 0;
        } catch (error) {
            console.error('Error calculating network density:', error);
            return 0;
        }
    }

    /**
     * Generate user recommendations based on network relationships
     */
    async generateRecommendations(userId, limit = 10) {
        try {
            const user = await User.findById(userId);
            if (!user) throw new Error('User not found');

            const recommendations = new Map();
            
            // Get user's connections
            const userConnections = new Set([
                ...user.followers,
                ...user.following,
                ...user.connections
            ]);

            // Find friends of friends (2nd degree connections)
            for (const connectionId of userConnections) {
                const connection = await User.findById(connectionId);
                if (!connection) continue;

                const connectionsConnections = new Set([
                    ...connection.followers,
                    ...connection.following,
                    ...connection.connections
                ]);

                for (const potentialRecommendation of connectionsConnections) {
                    // Skip if already connected or is the user themselves
                    if (userConnections.has(potentialRecommendation) || potentialRecommendation === userId) {
                        continue;
                    }

                    // Calculate recommendation score
                    const score = await this.calculateRecommendationScore(userId, potentialRecommendation);
                    recommendations.set(potentialRecommendation, score);
                }
            }

            // Sort by recommendation score
            const sortedRecommendations = Array.from(recommendations.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, limit);

            // Get user details for recommendations
            const recommendedUsers = await User.find({
                _id: { $in: sortedRecommendations.map(([id]) => id) }
            });

            return sortedRecommendations.map(([userId, score]) => {
                const user = recommendedUsers.find(u => u._id === userId);
                return {
                    user: {
                        id: user._id,
                        username: user.username,
                        fullName: user.full_name,
                        profilePicture: user.profile_picture,
                        bio: user.bio
                    },
                    recommendationScore: Math.round(score * 100) / 100,
                    reason: this.getRecommendationReason(userId, user._id)
                };
            });
        } catch (error) {
            console.error('Error generating recommendations:', error);
            throw error;
        }
    }

    /**
     * Calculate recommendation score for a potential connection
     */
    async calculateRecommendationScore(userId, potentialUserId) {
        try {
            let score = 0;

            // Mutual connections count
            const user = await User.findById(userId);
            const potentialUser = await User.findById(potentialUserId);

            const userConnections = new Set([
                ...user.followers,
                ...user.following,
                ...user.connections
            ]);

            const potentialConnections = new Set([
                ...potentialUser.followers,
                ...potentialUser.following,
                ...potentialUser.connections
            ]);

            const mutualConnections = [...userConnections].filter(conn => 
                potentialConnections.has(conn)
            );

            score += mutualConnections.length * 2; // 2 points per mutual connection

            // Similarity in engagement patterns
            const userMetrics = await this.calculateUserMetrics(userId);
            const potentialMetrics = await this.calculateUserMetrics(potentialUserId);

            if (userMetrics && potentialMetrics) {
                const engagementSimilarity = Math.abs(
                    userMetrics.engagementMetrics.avgLikesPerPost - 
                    potentialMetrics.engagementMetrics.avgLikesPerPost
                );
                
                score += Math.max(0, 2 - engagementSimilarity); // Higher score for similar engagement
            }

            // Geographic proximity (if location data available)
            if (user.location && potentialUser.location && user.location === potentialUser.location) {
                score += 1;
            }

            return score;
        } catch (error) {
            console.error('Error calculating recommendation score:', error);
            return 0;
        }
    }

    /**
     * Get recommendation reason for user
     */
    async getRecommendationReason(userId, recommendedUserId) {
        try {
            const user = await User.findById(userId);
            const recommendedUser = await User.findById(recommendedUserId);

            const userConnections = new Set([
                ...user.followers,
                ...user.following,
                ...user.connections
            ]);

            const recommendedConnections = new Set([
                ...recommendedUser.followers,
                ...recommendedUser.following,
                ...recommendedUser.connections
            ]);

            const mutualConnections = [...userConnections].filter(conn => 
                recommendedConnections.has(conn)
            );

            if (mutualConnections.length > 0) {
                return `Connected with ${mutualConnections.length} mutual connection${mutualConnections.length > 1 ? 's' : ''}`;
            }

            if (user.location && recommendedUser.location && user.location === recommendedUser.location) {
                return `Located in ${user.location}`;
            }

            return 'Suggested based on network analysis';
        } catch (error) {
            console.error('Error getting recommendation reason:', error);
            return 'Suggested based on network analysis';
        }
    }

    /**
     * Get network statistics
     */
    async getNetworkStatistics() {
        try {
            const totalUsers = await User.countDocuments();
            const totalConnections = await User.aggregate([
                { $project: { connectionsCount: { $size: "$connections" } } },
                { $group: { _id: null, total: { $sum: "$connectionsCount" } } }
            ]);

            const totalFollows = await User.aggregate([
                { $project: { followingCount: { $size: "$following" } } },
                { $group: { _id: null, total: { $sum: "$followingCount" } } }
            ]);

            const totalPosts = await Post.countDocuments();
            const totalMessages = await Message.countDocuments();

            return {
                totalUsers,
                totalConnections: totalConnections[0]?.total || 0,
                totalFollows: totalFollows[0]?.total || 0,
                totalPosts,
                totalMessages,
                avgConnectionsPerUser: totalUsers > 0 ? (totalConnections[0]?.total || 0) / totalUsers : 0,
                avgFollowsPerUser: totalUsers > 0 ? (totalFollows[0]?.total || 0) / totalUsers : 0
            };
        } catch (error) {
            console.error('Error getting network statistics:', error);
            throw error;
        }
    }
}

export default SocialNetworkAnalyzer;
