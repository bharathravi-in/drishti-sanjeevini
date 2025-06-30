import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  onLikeChange: (liked: boolean, newCount: number) => void;
}

export function LikeButton({ postId, initialLiked, initialCount, onLikeChange }: LikeButtonProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (!user || loading) return;

    setLoading(true);
    const wasLiked = liked;
    const newLiked = !wasLiked;
    const newCount = wasLiked ? count - 1 : count + 1;

    // Optimistic update
    setLiked(newLiked);
    setCount(newCount);
    onLikeChange(newLiked, newCount);

    try {
      if (wasLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success('Like removed');
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) throw error;
        toast.success('Post liked!');
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      
      // Revert optimistic update
      setLiked(wasLiked);
      setCount(wasLiked ? newCount + 1 : newCount - 1);
      onLikeChange(wasLiked, wasLiked ? newCount + 1 : newCount - 1);
      
      if (error.code === '23505') {
        toast.error('You have already liked this post');
      } else {
        toast.error('Failed to update like');
      }
    } finally {
      setLoading(false);
    }
  };

  const getLikeText = () => {
    if (count === 0) return 'Like';
    if (count === 1) {
      return liked ? 'You liked this' : '1 like';
    }
    if (liked) {
      return count === 2 ? 'You and 1 other' : `You and ${count - 1} others`;
    }
    return `${count} likes`;
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLike}
      disabled={loading}
      className={`transition-all duration-200 ${
        liked 
          ? 'text-red-500 border-red-200 bg-red-50 hover:bg-red-100' 
          : 'text-gray-600 hover:text-red-500 hover:border-red-200 hover:bg-red-50'
      }`}
    >
      <Heart 
        className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} 
      />
      <span className="font-medium">
        {getLikeText()}
      </span>
    </Button>
  );
}