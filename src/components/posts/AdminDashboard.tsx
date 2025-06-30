import React, { useState, useEffect } from 'react';
import { Shield, Flag, Eye, Trash2, CheckCircle, AlertTriangle, Users, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface Report {
  id: string;
  reason: string;
  message: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
  user: {
    full_name: string;
    email: string;
  };
  post: {
    id: string;
    content: string;
    user: {
      full_name: string;
    };
  };
}

interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  pendingReports: number;
  totalReports: number;
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPosts: 0,
    pendingReports: 0,
    totalReports: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'reports' | 'stats'>('reports');

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
        </CardContent>
      </Card>
    );
  }

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          user:users!user_id(full_name, email),
          post:posts(
            id,
            content,
            user:users!user_id(full_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    }
  };

  const fetchStats = async () => {
    try {
      const [usersResult, postsResult, reportsResult] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true })
      ]);

      const pendingReportsResult = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        totalUsers: usersResult.count || 0,
        totalPosts: postsResult.count || 0,
        totalReports: reportsResult.count || 0,
        pendingReports: pendingReportsResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load statistics');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchReports(), fetchStats()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const updateReportStatus = async (reportId: string, status: 'reviewed' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status })
        .eq('id', reportId);

      if (error) throw error;

      setReports(prev => 
        prev.map(report => 
          report.id === reportId ? { ...report, status } : report
        )
      );

      toast.success(`Report marked as ${status}`);
      
      // Update stats
      await fetchStats();
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Failed to update report');
    }
  };

  const deletePost = async (postId: string, reportId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      // Update report status to resolved
      await updateReportStatus(reportId, 'resolved');
      
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'spam': return 'bg-yellow-100 text-yellow-800';
      case 'hate': return 'bg-red-100 text-red-800';
      case 'scam': return 'bg-orange-100 text-orange-800';
      case 'false_info': return 'bg-purple-100 text-purple-800';
      case 'inappropriate': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage reports and monitor platform activity</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalUsers}</h3>
            <p className="text-gray-600">Total Users</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalPosts}</h3>
            <p className="text-gray-600">Total Posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{stats.pendingReports}</h3>
            <p className="text-gray-600">Pending Reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Flag className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalReports}</h3>
            <p className="text-gray-600">Total Reports</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setSelectedTab('reports')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedTab === 'reports'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Reports
        </button>
        <button
          onClick={() => setSelectedTab('stats')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedTab === 'stats'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Statistics
        </button>
      </div>

      {/* Reports Tab */}
      {selectedTab === 'reports' && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Content Reports</h2>
            <p className="text-gray-600">Review and manage reported content</p>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-8">
                <Flag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reports</h3>
                <p className="text-gray-600">All clear! No content has been reported.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReasonColor(report.reason)}`}>
                          {report.reason.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Reported by:</h4>
                        <p className="text-sm text-gray-600">{report.user.full_name}</p>
                        <p className="text-xs text-gray-500">{report.user.email}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Post author:</h4>
                        <p className="text-sm text-gray-600">{report.post.user.full_name}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-1">Report message:</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {report.message}
                      </p>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-1">Reported post:</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {report.post.content.substring(0, 200)}
                        {report.post.content.length > 200 && '...'}
                      </p>
                    </div>

                    {report.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => updateReportStatus(report.id, 'reviewed')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                          Mark as Reviewed
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateReportStatus(report.id, 'resolved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Resolve (Keep Post)
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deletePost(report.post.id, report.id)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Post
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Tab */}
      {selectedTab === 'stats' && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Platform Statistics</h2>
            <p className="text-gray-600">Overview of platform activity and health</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">User Activity</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Users:</span>
                    <span className="font-medium">{stats.totalUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Posts:</span>
                    <span className="font-medium">{stats.totalPosts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Posts per User:</span>
                    <span className="font-medium">
                      {stats.totalUsers > 0 ? (stats.totalPosts / stats.totalUsers).toFixed(1) : '0'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Moderation</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Reports:</span>
                    <span className="font-medium">{stats.totalReports}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending Reports:</span>
                    <span className="font-medium text-yellow-600">{stats.pendingReports}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Report Rate:</span>
                    <span className="font-medium">
                      {stats.totalPosts > 0 ? ((stats.totalReports / stats.totalPosts) * 100).toFixed(1) : '0'}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}