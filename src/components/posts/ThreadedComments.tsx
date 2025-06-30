import React, { useState, useEffect } from 'react';
import { Send, MessageCircle, Clock, MoreHorizontal, Trash2, Edit3, Reply } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface Comment {
  id: string;
  text: string;
  created_at: string;
  parent_id: string | null;
  user: {
    id: string;
    full_name: string;
    role: 'seeker' | 'supporter';
    profile_photo_url?: string;
  };
  replies?: Comment[];
}

interface ThreadedCommentsProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  onCommentCountChange: (count: number) => void;
}

export function ThreadedComments({ postId, isOpen, onClose, onCommentCountChange }: ThreadedCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [showReplyForm, setShowReplyForm] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const fetchComments = async () => {
    if (!isOpen) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:users(id, full_name, role, profile_photo_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Organize comments into threaded structure
      const commentMap = new Map<string, Comment>();
      const topLevelComments: Comment[] = [];

      // First pass: create all comment objects
      data?.forEach(comment => {
        const commentObj: Comment = {
          ...comment,
          replies: []
        };
        commentMap.set(comment.id, commentObj);
      });

      // Second pass: organize into threads
      data?.forEach(comment => {
        const commentObj = commentMap.get(comment.id)!;
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id);
          if (parent) {
            parent.replies!.push(commentObj);
          }
        } else {
          topLevelComments.push(commentObj);
        }
      });

      setComments(topLevelComments);
      onCommentCountChange(data?.length || 0);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [isOpen, postId]);

  const handleSubmitComment = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    
    const text = parentId ? replyText[parentId] : newComment;
    if (!text?.trim() || !user) return;

    try {
      setSubmitting(true);
      
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          text: text.trim(),
          parent_id: parentId || null
        })
        .select(`
          *,
          user:users(id, full_name, role, profile_photo_url)
        `)
        .single();

      if (error) throw error;

      // Refresh comments to get updated structure
      await fetchComments();
      
      if (parentId) {
        setReplyText(prev => ({ ...prev, [parentId]: '' }));
        setShowReplyForm(prev => ({ ...prev, [parentId]: false }));
      } else {
        setNewComment('');
      }
      
      toast.success(parentId ? 'Reply added!' : 'Comment added!');
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .update({ text: editText.trim() })
        .eq('id', commentId);

      if (error) throw error;

      await fetchComments();
      setEditingComment(null);
      setEditText('');
      toast.success('Comment updated!');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      await fetchComments();
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString();
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 mt-3' : ''}`}>
      <div className="flex space-x-3 group">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            {comment.user.profile_photo_url ? (
              <img
                src={comment.user.profile_photo_url}
                alt={comment.user.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                <span className="text-white font-semibold text-xs">
                  {comment.user.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                {comment.user.full_name}
              </h4>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  comment.user.role === 'seeker' 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                }`}>
                  {comment.user.role === 'seeker' ? 'Seeking' : 'Helping'}
                </span>
                {user?.id === comment.user.id && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      className="p-1 h-5 w-5"
                      onClick={() => {
                        // Simple dropdown menu
                        const menu = document.createElement('div');
                        menu.className = 'absolute right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10';
                        menu.innerHTML = `
                          <button class="edit-btn block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Edit</button>
                          <button class="delete-btn block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Delete</button>
                        `;
                        
                        const editBtn = menu.querySelector('.edit-btn');
                        const deleteBtn = menu.querySelector('.delete-btn');
                        
                        editBtn?.addEventListener('click', () => {
                          setEditingComment(comment.id);
                          setEditText(comment.text);
                          menu.remove();
                        });
                        
                        deleteBtn?.addEventListener('click', () => {
                          handleDeleteComment(comment.id);
                          menu.remove();
                        });
                        
                        document.body.appendChild(menu);
                        
                        const rect = (event?.target as HTMLElement)?.getBoundingClientRect();
                        if (rect) {
                          menu.style.position = 'fixed';
                          menu.style.top = `${rect.bottom + 5}px`;
                          menu.style.right = `${window.innerWidth - rect.right}px`;
                        }
                        
                        const closeMenu = (e: MouseEvent) => {
                          if (!menu.contains(e.target as Node)) {
                            menu.remove();
                            document.removeEventListener('click', closeMenu);
                          }
                        };
                        setTimeout(() => document.addEventListener('click', closeMenu), 0);
                      }}
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {editingComment === comment.id ? (
              <div className="space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={2}
                  autoFocus
                />
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleEditComment(comment.id)}
                    disabled={!editText.trim()}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingComment(null);
                      setEditText('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-900 dark:text-white text-sm leading-relaxed">
                {comment.text}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-4 mt-1 ml-3">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {formatTimeAgo(comment.created_at)}
              </span>
            </div>
            
            {!isReply && (
              <button
                onClick={() => setShowReplyForm(prev => ({ 
                  ...prev, 
                  [comment.id]: !prev[comment.id] 
                }))}
                className="text-xs text-gray-500 hover:text-green-600 font-medium transition-colors"
              >
                <Reply className="w-3 h-3 inline mr-1" />
                Reply
              </button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm[comment.id] && (
            <form 
              onSubmit={(e) => handleSubmitComment(e, comment.id)} 
              className="mt-3 ml-3"
            >
              <div className="flex space-x-2">
                <div className="flex-1">
                  <textarea
                    value={replyText[comment.id] || ''}
                    onChange={(e) => setReplyText(prev => ({ 
                      ...prev, 
                      [comment.id]: e.target.value 
                    }))}
                    placeholder="Write a reply..."
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={2}
                    maxLength={500}
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!replyText[comment.id]?.trim() || submitting}
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReplyForm(prev => ({ 
                      ...prev, 
                      [comment.id]: false 
                    }))}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
        <CardContent className="p-0 flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Comments ({comments.reduce((total, comment) => 
                  total + 1 + (comment.replies?.length || 0), 0
                )})
              </h3>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex space-x-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No comments yet</h4>
                <p className="text-gray-600 dark:text-gray-400">Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map(comment => renderComment(comment))
            )}
          </div>

          {/* Comment Input */}
          <div className="p-6 border-t border-gray-100 dark:border-gray-700">
            <form onSubmit={(e) => handleSubmitComment(e)} className="space-y-3">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    {user?.profile_photo_url ? (
                      <img
                        src={user.profile_photo_url}
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                        <span className="text-white font-semibold text-xs">
                          {user?.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={2}
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {newComment.length}/500
                    </span>
                    <Button
                      type="submit"
                      loading={submitting}
                      disabled={!newComment.trim()}
                      size="sm"
                    >
                      <Send className="w-4 h-4" />
                      Comment
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}