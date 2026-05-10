import SocialNetworkAnalyzer from '../utils/socialNetworkAnalysis.js';

const analyzer = new SocialNetworkAnalyzer();

// Get user network metrics
export const getUserNetworkMetrics = async (req, res) => {
    try {
        const { userId } = req.auth();
        
        const metrics = await analyzer.calculateUserMetrics(userId);
        
        res.json({ 
            success: true, 
            data: metrics 
        });
    } catch (error) {
        console.error('Error getting user network metrics:', error);
        res.json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Analyze user connections
export const analyzeUserConnections = async (req, res) => {
    try {
        const { userId } = req.auth();
        
        const analysis = await analyzer.analyzeUserConnections(userId);
        
        res.json({ 
            success: true, 
            data: analysis 
        });
    } catch (error) {
        console.error('Error analyzing user connections:', error);
        res.json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get influential users
export const getInfluentialUsers = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        const influentialUsers = await analyzer.findInfluentialUsers(limit);
        
        res.json({ 
            success: true, 
            data: influentialUsers 
        });
    } catch (error) {
        console.error('Error getting influential users:', error);
        res.json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get user recommendations
export const getUserRecommendations = async (req, res) => {
    try {
        const { userId } = req.auth();
        const limit = parseInt(req.query.limit) || 10;
        
        const recommendations = await analyzer.generateRecommendations(userId, limit);
        
        res.json({ 
            success: true, 
            data: recommendations 
        });
    } catch (error) {
        console.error('Error getting user recommendations:', error);
        res.json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get network statistics
export const getNetworkStatistics = async (req, res) => {
    try {
        const statistics = await analyzer.getNetworkStatistics();
        
        res.json({ 
            success: true, 
            data: statistics 
        });
    } catch (error) {
        console.error('Error getting network statistics:', error);
        res.json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get connection strength between two users
export const getConnectionStrength = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { targetUserId } = req.params;
        
        const strength = await analyzer.calculateConnectionStrength(userId, targetUserId);
        
        res.json({ 
            success: true, 
            data: { 
                userId,
                targetUserId,
                connectionStrength: strength 
            } 
        });
    } catch (error) {
        console.error('Error getting connection strength:', error);
        res.json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get network graph for visualization
export const getNetworkGraph = async (req, res) => {
    try {
        const { userId } = req.auth();
        const depth = parseInt(req.query.depth) || 2; // How many levels of connections to include
        
        const graph = await analyzer.buildNetworkGraph(userId);
        
        // Filter graph based on depth if needed
        if (depth > 0 && userId) {
            const filteredNodes = new Set([userId]);
            const nodesToExplore = [userId];
            
            for (let i = 0; i < depth && nodesToExplore.length > 0; i++) {
                const currentLevel = [...nodesToExplore];
                nodesToExplore.length = 0;
                
                for (const nodeId of currentLevel) {
                    const connections = graph.adjacencyList.get(nodeId) || new Set();
                    for (const connectionId of connections) {
                        if (!filteredNodes.has(connectionId)) {
                            filteredNodes.add(connectionId);
                            nodesToExplore.push(connectionId);
                        }
                    }
                }
            }
            
            // Filter nodes and edges
            graph.nodes = graph.nodes.filter(node => filteredNodes.has(node.id));
            graph.edges = graph.edges.filter(edge => 
                filteredNodes.has(edge.from) && filteredNodes.has(edge.to)
            );
        }
        
        res.json({ 
            success: true, 
            data: graph 
        });
    } catch (error) {
        console.error('Error getting network graph:', error);
        res.json({ 
            success: false, 
            message: error.message 
        });
    }
};
