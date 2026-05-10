import express from 'express';
import { 
    getUserNetworkMetrics, 
    analyzeUserConnections, 
    getInfluentialUsers, 
    getUserRecommendations, 
    getNetworkStatistics, 
    getConnectionStrength, 
    getNetworkGraph 
} from '../controllers/socialNetworkController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// User-specific analytics
router.get('/metrics', protect, getUserNetworkMetrics);
router.get('/connections/analysis', protect, analyzeUserConnections);
router.get('/recommendations', protect, getUserRecommendations);
router.get('/connections/strength/:targetUserId', protect, getConnectionStrength);

// Global analytics
router.get('/influential', getInfluentialUsers);
router.get('/statistics', getNetworkStatistics);
router.get('/graph', protect, getNetworkGraph);

export default router;
