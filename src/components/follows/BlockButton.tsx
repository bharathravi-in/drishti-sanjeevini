import React, { useState, useEffect } from 'react';
import { Shield, ShieldOff, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface BlockButtonProps {
  targetUserId: string;
  targetUserName: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function BlockButton({ 
  targetUserId, 
  targetUserName, 
  className = '',
  size = 'sm'
}: BlockButtonProps) {
  const { user } = useAuth();
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Don't show block button for self
  if (!user || user.id === targetUserId) {
    return null;
  }

  const checkBlockStatus = async () => {
    try {
      setInitialLoading(true);
      
      const { data, error } = await supabase
        .from('user_blocks')
        .select('id')
        .eq('blocker_id', user.id)
        .eq('blocked_id', targetUserId)
        .maybeSingle();

      if (error) throw error;
      setIsBlocked(!!data);
    } catch (error) {
      console.error('Error checking block status:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    checkBlockStatus();
  }, [targetUserId, user.id]);

  const handleBlock = async () => {
    if (loading) return;

    const action = isBlocked ? 'unblock' : 'block';
    const confirmMessage = isBlocked 
      ? `Are you sure you want to unblock ${targetUserName}?`
      : `Are you sure you want to block ${targetUserName}? This will remove any existing follows and prevent future interactions.`;

    if (!confirm(confirmMessage)) return;

    setLoading(true);

    try {
      if (isBlocked) {
        // Unblock
        const { error } = await supabase
          .from('user_blocks')
          .delete()
          .eq('blocker_id', user.id)
          .eq('blocked_id', targetUserId);

        if (error) throw error;

        setIsBlocked(false);
        toast.success(`Unblocked ${targetUserName}`);
      } else {
        // Block
        const { error } = await supabase
          .from('user_blocks')
          .insert({
            blocker_id: user.id,
            blocked_id: targetUserId
          });

        if (error) throw error;

        setIsBlocked(true);
        toast.success(`Blocked ${targetUserName}`);
      }
    } catch (error: any) {
      console.error('Error toggling block:', error);
      
      if (error.code === '23505') {
        toast.error('User is already blocked');
        checkBlockStatus();
      } else {
        toast.error(`Failed to ${action} user. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className={className}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      onClick={handleBlock}
      loading={loading}
      variant="outline"
      size={size}
      className={`transition-all duration-200 ${
        isBlocked 
          ? 'text-orange-600 hover:text-orange-700 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20' 
          : 'text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
      } ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isBlocked ? (
        <>
          <ShieldOff className="w-4 h-4" />
          Unblock
        </>
      ) : (
        <>
          <Shield className="w-4 h-4" />
          Block
        </>
      )}
    </Button>
  );
}