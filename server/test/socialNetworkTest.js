// Comprehensive test for social network analysis system
import SocialNetworkAnalyzer from '../utils/socialNetworkAnalysis.js';

const analyzer = new SocialNetworkAnalyzer();

// Test data and functions
class SocialNetworkTester {
    async runAllTests() {
        console.log('🧪 Starting Social Network Analysis Tests...\n');
        
        const results = {
            passed: 0,
            failed: 0,
            tests: []
        };

        // Test 1: Build Network Graph
        await this.runTest('Build Network Graph', async () => {
            const graph = await analyzer.buildNetworkGraph();
            if (!graph || !graph.nodes || !graph.edges || !graph.adjacencyList) {
                throw new Error('Invalid graph structure');
            }
            console.log(`✅ Graph built with ${graph.nodes.length} nodes and ${graph.edges.length} edges`);
            return true;
        }, results);

        // Test 2: Calculate User Metrics
        await this.runTest('Calculate User Metrics', async () => {
            // Get a sample user ID from the graph
            const graph = await analyzer.buildNetworkGraph();
            if (graph.nodes.length === 0) {
                console.log('⚠️ No users found in database');
                return true;
            }
            
            const sampleUserId = graph.nodes[0].id;
            const metrics = await analyzer.calculateUserMetrics(sampleUserId);
            
            if (!metrics || !metrics.basicMetrics || !metrics.engagementMetrics) {
                throw new Error('Invalid metrics structure');
            }
            
            console.log(`✅ Metrics calculated for user ${sampleUserId}`);
            console.log(`   Followers: ${metrics.basicMetrics.followers}`);
            console.log(`   Connections: ${metrics.basicMetrics.connections}`);
            console.log(`   Influence Score: ${metrics.influenceScore}`);
            return true;
        }, results);

        // Test 3: Influence Score Calculation
        await this.runTest('Influence Score Calculation', async () => {
            const testMetrics = {
                followers: 100,
                connections: 50,
                avgLikesPerPost: 25,
                totalStoryViews: 200,
                sentMessages: 75,
                degree: 30
            };
            
            const score = analyzer.calculateInfluenceScore(testMetrics);
            if (typeof score !== 'number' || score < 0) {
                throw new Error('Invalid influence score');
            }
            
            console.log(`✅ Influence score calculated: ${score}`);
            return true;
        }, results);

        // Test 4: Find Influential Users
        await this.runTest('Find Influential Users', async () => {
            const influentialUsers = await analyzer.findInfluentialUsers(5);
            if (!Array.isArray(influentialUsers)) {
                throw new Error('Invalid influential users response');
            }
            
            console.log(`✅ Found ${influentialUsers.length} influential users`);
            if (influentialUsers.length > 0) {
                console.log(`   Top user: ${influentialUsers[0].username} (Score: ${influentialUsers[0].influenceScore})`);
            }
            return true;
        }, results);

        // Test 5: User Recommendations
        await this.runTest('Generate User Recommendations', async () => {
            const graph = await analyzer.buildNetworkGraph();
            if (graph.nodes.length < 2) {
                console.log('⚠️ Not enough users for recommendations');
                return true;
            }
            
            const sampleUserId = graph.nodes[0].id;
            const recommendations = await analyzer.generateRecommendations(sampleUserId, 3);
            
            if (!Array.isArray(recommendations)) {
                throw new Error('Invalid recommendations response');
            }
            
            console.log(`✅ Generated ${recommendations.length} recommendations for user ${sampleUserId}`);
            recommendations.forEach((rec, index) => {
                console.log(`   ${index + 1}. ${rec.user.fullName} (Score: ${rec.recommendationScore}) - ${rec.reason}`);
            });
            return true;
        }, results);

        // Test 6: Connection Strength
        await this.runTest('Calculate Connection Strength', async () => {
            const graph = await analyzer.buildNetworkGraph();
            if (graph.nodes.length < 2) {
                console.log('⚠️ Not enough users for connection strength test');
                return true;
            }
            
            const user1Id = graph.nodes[0].id;
            const user2Id = graph.nodes[1].id;
            const strength = await analyzer.calculateConnectionStrength(user1Id, user2Id);
            
            if (typeof strength !== 'number' || strength < 0) {
                throw new Error('Invalid connection strength');
            }
            
            console.log(`✅ Connection strength calculated: ${strength}`);
            return true;
        }, results);

        // Test 7: Network Statistics
        await this.runTest('Get Network Statistics', async () => {
            const stats = await analyzer.getNetworkStatistics();
            if (!stats || typeof stats.totalUsers !== 'number') {
                throw new Error('Invalid network statistics');
            }
            
            console.log(`✅ Network statistics retrieved:`);
            console.log(`   Total Users: ${stats.totalUsers}`);
            console.log(`   Total Connections: ${stats.totalConnections}`);
            console.log(`   Total Posts: ${stats.totalPosts}`);
            console.log(`   Total Messages: ${stats.totalMessages}`);
            return true;
        }, results);

        // Test 8: User Connection Analysis
        await this.runTest('Analyze User Connections', async () => {
            const graph = await analyzer.buildNetworkGraph();
            if (graph.nodes.length === 0) {
                console.log('⚠️ No users found for connection analysis');
                return true;
            }
            
            const sampleUserId = graph.nodes[0].id;
            const analysis = await analyzer.analyzeUserConnections(sampleUserId);
            
            if (!analysis || typeof analysis.totalFollowers !== 'number') {
                throw new Error('Invalid connection analysis');
            }
            
            console.log(`✅ Connection analysis completed for user ${sampleUserId}`);
            console.log(`   Total Followers: ${analysis.totalFollowers}`);
            console.log(`   Total Following: ${analysis.totalFollowing}`);
            console.log(`   Network Density: ${(analysis.networkDensity * 100).toFixed(2)}%`);
            return true;
        }, results);

        // Print final results
        this.printResults(results);
    }

    async runTest(testName, testFunction, results) {
        try {
            console.log(`\n🔍 Testing: ${testName}`);
            await testFunction();
            results.passed++;
            results.tests.push({ name: testName, status: 'PASSED' });
        } catch (error) {
            results.failed++;
            results.tests.push({ name: testName, status: 'FAILED', error: error.message });
            console.log(`❌ Failed: ${error.message}`);
        }
    }

    printResults(results) {
        console.log('\n' + '='.repeat(50));
        console.log('📊 TEST RESULTS SUMMARY');
        console.log('='.repeat(50));
        console.log(`Total Tests: ${results.passed + results.failed}`);
        console.log(`✅ Passed: ${results.passed}`);
        console.log(`❌ Failed: ${results.failed}`);
        console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
        
        console.log('\n📋 Detailed Results:');
        results.tests.forEach(test => {
            const icon = test.status === 'PASSED' ? '✅' : '❌';
            console.log(`${icon} ${test.name}`);
            if (test.error) {
                console.log(`   Error: ${test.error}`);
            }
        });

        if (results.failed === 0) {
            console.log('\n🎉 All tests passed! Social Network Analysis is working correctly.');
        } else {
            console.log('\n⚠️ Some tests failed. Please check the errors above.');
        }
    }
}

// Test API endpoints
class APITester {
    constructor() {
        this.baseURL = process.env.VITE_BASEURL || 'http://localhost:4000';
        this.token = null;
    }

    async testAPIEndpoints() {
        console.log('\n🌐 Testing API Endpoints...\n');
        
        // Note: These tests require a valid authentication token
        console.log('⚠️ API tests require authentication token');
        console.log('To test API endpoints manually:');
        console.log('1. Start the server: npm run dev');
        console.log('2. Get auth token from Clerk authentication');
        console.log('3. Test these endpoints:');
        
        const endpoints = [
            'GET /api/social-network/metrics',
            'GET /api/social-network/connections/analysis',
            'GET /api/social-network/influential?limit=10',
            'GET /api/social-network/recommendations?limit=10',
            'GET /api/social-network/statistics',
            'GET /api/social-network/graph?depth=2',
            'GET /api/social-network/connections/strength/:userId'
        ];

        endpoints.forEach(endpoint => {
            console.log(`   ${endpoint}`);
        });
    }
}

// Main test runner
async function runAllTests() {
    const networkTester = new SocialNetworkTester();
    const apiTester = new APITester();
    
    // Run core functionality tests
    await networkTester.runAllTests();
    
    // API endpoint testing info
    await apiTester.testAPIEndpoints();
    
    console.log('\n🔧 Frontend Testing Checklist:');
    console.log('1. Start frontend: npm run dev');
    console.log('2. Navigate to /network-analytics');
    console.log('3. Check if all tabs load correctly');
    console.log('4. Verify data displays properly');
    console.log('5. Test navigation between tabs');
    console.log('6. Check responsive design on mobile');
    
    console.log('\n📱 Integration Testing:');
    console.log('1. Create test users and connections');
    console.log('2. Make posts and interactions');
    console.log('3. Send messages between users');
    console.log('4. Check if analytics update correctly');
    console.log('5. Verify recommendation accuracy');
}

// Run tests
runAllTests().catch(console.error);

export { SocialNetworkTester, APITester };
