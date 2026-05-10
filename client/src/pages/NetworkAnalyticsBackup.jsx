import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Network, UserCheck, MessageCircle, Eye, BarChart3, Activity } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const NetworkAnalytics = () => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({
    userMetrics: null,
    connectionAnalysis: null,
    influentialUsers: [],
    recommendations: [],
    networkStats: null
  });

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    try {
      const token = await getToken();
      
      // Fetch all network data in parallel with individual error handling
      const results = await Promise.allSettled([
        api.get('/api/social-network/metrics', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => {
          console.error('Metrics API error:', err);
          return { data: { data: null } };
        }),
        api.get('/api/social-network/connections/analysis', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => {
          console.error('Connections API error:', err);
          return { data: { data: null } };
        }),
        api.get('/api/social-network/influential?limit=10').catch(err => {
          console.error('Influential API error:', err);
          return { data: { data: [] } };
        }),
        api.get('/api/social-network/recommendations?limit=10', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => {
          console.error('Recommendations API error:', err);
          return { data: { data: [] } };
        }),
        api.get('/api/social-network/statistics').catch(err => {
          console.error('Stats API error:', err);
          return { data: { data: null } };
        })
      ]);

      // Extract data from settled promises
      const [
        metricsResponse,
        connectionsResponse,
        influentialResponse,
        recommendationsResponse,
        statsResponse
      ] = results;

      setData({
        userMetrics: metricsResponse.value?.data?.data || null,
        connectionAnalysis: connectionsResponse.value?.data?.data || null,
        influentialUsers: influentialResponse.value?.data?.data || [],
        recommendations: recommendationsResponse.value?.data?.data || [],
        networkStats: statsResponse.value?.data?.data || null
      });
    } catch (error) {
      console.error('Error fetching network data:', error);
      toast.error('Failed to load network analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading network analytics...</p>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
      <div className='bg-white p-6 rounded-lg shadow-md'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-600'>Followers</p>
            <p className='text-2xl font-bold text-gray-900'>
              {data.userMetrics?.basicMetrics?.followers || 0}
            </p>
          </div>
          <Users className='w-8 h-8 text-blue-500' />
        </div>
      </div>

      <div className='bg-white p-6 rounded-lg shadow-md'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-600'>Connections</p>
            <p className='text-2xl font-bold text-gray-900'>
              {data.userMetrics?.basicMetrics?.connections || 0}
            </p>
          </div>
          <Network className='w-8 h-8 text-green-500' />
        </div>
      </div>

      <div className='bg-white p-6 rounded-lg shadow-md'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-600'>Influence Score</p>
            <p className='text-2xl font-bold text-gray-900'>
              {data.userMetrics?.influenceScore || 0}
            </p>
          </div>
          <TrendingUp className='w-8 h-8 text-purple-500' />
        </div>
      </div>

      <div className='bg-white p-6 rounded-lg shadow-md'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-600'>Network Density</p>
            <p className='text-2xl font-bold text-gray-900'>
              {Math.round((data.connectionAnalysis?.networkDensity || 0) * 100)}%
            </p>
          </div>
          <Activity className='w-8 h-8 text-orange-500' />
        </div>
      </div>
    </div>
  );

  const renderInfluentialUsers = () => {
    console.log('Rendering influential users:', data.influentialUsers);
    
    if (!data.influentialUsers || data.influentialUsers.length === 0) {
      return (
        <div className='bg-white rounded-lg shadow-md p-8 text-center'>
          <TrendingUp className='w-12 h-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>No Influential Users Found</h3>
          <p className='text-gray-600'>Influential users will appear here as your network grows.</p>
        </div>
      );
    }

    return (
      <div className='bg-white rounded-lg shadow-md'>
        <div className='p-6 border-b border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
            <TrendingUp className='w-5 h-5' />
            Top Influential Users
          </h3>
        </div>
        <div className='divide-y divide-gray-200'>
          {data.influentialUsers.map((user, index) => (
          <div key={user.userId} className='p-4 hover:bg-gray-50 transition-colors'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='text-lg font-bold text-gray-500 w-8'>
                  #{index + 1}
                </div>
                <img 
                  src={user.user.profilePicture || '/default-avatar.png'} 
                  alt={user.user.fullName}
                  className='w-10 h-10 rounded-full'
                />
                <div>
                  <p className='font-medium text-gray-900'>{user.user.fullName}</p>
                  <p className='text-sm text-gray-500'>@{user.user.username}</p>
                </div>
              </div>
              <div className='text-right'>
                <p className='font-semibold text-indigo-600'>{user.influenceScore}</p>
                <p className='text-xs text-gray-500'>Influence Score</p>
              </div>
            </div>
            <div className='mt-3 grid grid-cols-3 gap-4 text-sm'>
              <div>
                <p className='text-gray-500'>Followers</p>
                <p className='font-medium'>{user.basicMetrics.followers}</p>
              </div>
              <div>
                <p className='text-gray-500'>Connections</p>
                <p className='font-medium'>{user.basicMetrics.connections}</p>
              </div>
              <div>
                <p className='text-gray-500'>Avg Likes</p>
                <p className='font-medium'>
                  {user.engagementMetrics.avgLikesPerPost.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRecommendations = () => {
    console.log('Rendering recommendations:', data.recommendations);
    
    if (!data.recommendations || data.recommendations.length === 0) {
      return (
        <div className='bg-white rounded-lg shadow-md p-8 text-center'>
          <UserCheck className='w-12 h-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>No Recommendations Yet</h3>
          <p className='text-gray-600'>Recommendations will appear here as you make more connections.</p>
        </div>
      );
    }

    return (
      <div className='bg-white rounded-lg shadow-md'>
        <div className='p-6 border-b border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
            <UserCheck className='w-5 h-5' />
            Recommended Connections
          </h3>
        </div>
        <div className='divide-y divide-gray-200'>
          {data.recommendations.map((recommendation) => (
          <div key={recommendation.user.id} className='p-4 hover:bg-gray-50 transition-colors'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <img 
                  src={recommendation.user.profilePicture || '/default-avatar.png'} 
                  alt={recommendation.user.fullName}
                  className='w-10 h-10 rounded-full'
                />
                <div>
                  <p className='font-medium text-gray-900'>{recommendation.user.fullName}</p>
                  <p className='text-sm text-gray-500'>@{recommendation.user.username}</p>
                  <p className='text-xs text-gray-400 mt-1'>{recommendation.reason}</p>
                </div>
              </div>
              <div className='text-right'>
                <p className='font-semibold text-green-600'>{recommendation.recommendationScore}</p>
                <p className='text-xs text-gray-500'>Match Score</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderConnectionAnalysis = () => (
    <div className='space-y-6'>
      <div className='bg-white rounded-lg shadow-md p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>Connection Strength Analysis</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <h4 className='font-medium text-gray-700 mb-3'>Strongest Connections</h4>
            <div className='space-y-2'>
              {data.connectionAnalysis?.connectionStrengths?.slice(0, 5).map((conn, index) => (
                <div key={conn.user} className='flex items-center justify-between p-2 bg-gray-50 rounded'>
                  <span className='text-sm font-medium'>User {conn.user.substring(0, 8)}...</span>
                  <span className='text-sm font-bold text-green-600'>{conn.strength}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className='font-medium text-gray-700 mb-3'>Network Statistics</h4>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Total Followers</span>
                <span className='font-medium'>{data.connectionAnalysis?.totalFollowers || 0}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Total Following</span>
                <span className='font-medium'>{data.connectionAnalysis?.totalFollowing || 0}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Mutual Connections</span>
                <span className='font-medium'>{data.connectionAnalysis?.mutualConnections || 0}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Network Density</span>
                <span className='font-medium'>
                  {Math.round((data.connectionAnalysis?.networkDensity || 0) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow-md p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>Engagement Metrics</h3>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='text-center p-4 bg-blue-50 rounded-lg'>
            <MessageCircle className='w-8 h-8 text-blue-600 mx-auto mb-2' />
            <p className='text-2xl font-bold text-gray-900'>
              {data.userMetrics?.engagementMetrics?.postCount || 0}
            </p>
            <p className='text-sm text-gray-600'>Posts</p>
          </div>
          <div className='text-center p-4 bg-green-50 rounded-lg'>
            <TrendingUp className='w-8 h-8 text-green-600 mx-auto mb-2' />
            <p className='text-2xl font-bold text-gray-900'>
              {data.userMetrics?.engagementMetrics?.totalLikes || 0}
            </p>
            <p className='text-sm text-gray-600'>Total Likes</p>
          </div>
          <div className='text-center p-4 bg-purple-50 rounded-lg'>
            <MessageCircle className='w-8 h-8 text-purple-600 mx-auto mb-2' />
            <p className='text-2xl font-bold text-gray-900'>
              {data.userMetrics?.engagementMetrics?.sentMessages || 0}
            </p>
            <p className='text-sm text-gray-600'>Messages Sent</p>
          </div>
          <div className='text-center p-4 bg-orange-50 rounded-lg'>
            <Eye className='w-8 h-8 text-orange-600 mx-auto mb-2' />
            <p className='text-2xl font-bold text-gray-900'>
              {data.userMetrics?.engagementMetrics?.totalStoryViews || 0}
            </p>
            <p className='text-sm text-gray-600'>Story Views</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNetworkStats = () => (
    <div className='bg-white rounded-lg shadow-md p-6'>
      <h3 className='text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2'>
        <BarChart3 className='w-5 h-5' />
        Global Network Statistics
      </h3>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <div className='text-center p-4 bg-indigo-50 rounded-lg'>
          <Users className='w-8 h-8 text-indigo-600 mx-auto mb-2' />
          <p className='text-2xl font-bold text-gray-900'>
            {data.networkStats?.totalUsers || 0}
          </p>
          <p className='text-sm text-gray-600'>Total Users</p>
        </div>
        <div className='text-center p-4 bg-green-50 rounded-lg'>
          <Network className='w-8 h-8 text-green-600 mx-auto mb-2' />
          <p className='text-2xl font-bold text-gray-900'>
            {data.networkStats?.totalConnections || 0}
          </p>
          <p className='text-sm text-gray-600'>Total Connections</p>
        </div>
        <div className='text-center p-4 bg-purple-50 rounded-lg'>
          <TrendingUp className='w-8 h-8 text-purple-600 mx-auto mb-2' />
          <p className='text-2xl font-bold text-gray-900'>
            {data.networkStats?.totalPosts || 0}
          </p>
          <p className='text-sm text-gray-600'>Total Posts</p>
        </div>
        <div className='text-center p-4 bg-blue-50 rounded-lg'>
          <MessageCircle className='w-8 h-8 text-blue-600 mx-auto mb-2' />
          <p className='text-2xl font-bold text-gray-900'>
            {data.networkStats?.totalMessages || 0}
          </p>
          <p className='text-sm text-gray-600'>Total Messages</p>
        </div>
        <div className='text-center p-4 bg-orange-50 rounded-lg'>
          <Activity className='w-8 h-8 text-orange-600 mx-auto mb-2' />
          <p className='text-2xl font-bold text-gray-900'>
            {(data.networkStats?.avgConnectionsPerUser || 0).toFixed(1)}
          </p>
          <p className='text-sm text-gray-600'>Avg Connections/User</p>
        </div>
        <div className='text-center p-4 bg-red-50 rounded-lg'>
          <UserCheck className='w-8 h-8 text-red-600 mx-auto mb-2' />
          <p className='text-2xl font-bold text-gray-900'>
            {(data.networkStats?.avgFollowsPerUser || 0).toFixed(1)}
          </p>
          <p className='text-sm text-gray-600'>Avg Follows/User</p>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'influential', label: 'Influential Users', icon: TrendingUp },
    { id: 'recommendations', label: 'Recommendations', icon: UserCheck },
    { id: 'connections', label: 'Connection Analysis', icon: Network },
    { id: 'network', label: 'Network Stats', icon: Users }
  ];

  return (
    <div className='min-h-screen bg-slate-50'>
      <div className='max-w-7xl mx-auto p-6'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Network Analytics</h1>
          <p className='text-slate-600'>Analyze your social network and discover insights</p>
        </div>

        {/* Tab Navigation */}
        <div className='mb-8 border-b border-gray-200'>
          <nav className='flex space-x-8'>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className='w-4 h-4' />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className='space-y-6'>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'influential' && renderInfluentialUsers()}
          {activeTab === 'recommendations' && renderRecommendations()}
          {activeTab === 'connections' && renderConnectionAnalysis()}
          {activeTab === 'network' && renderNetworkStats()}
        </div>
      </div>
    </div>
  );
};

export default NetworkAnalytics;
