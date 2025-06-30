import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface StartConversationButtonProps {
  targetUserId: string;
  targetUserName: string;
  onConversationStarted?: () => void;
  className?: string;
}

export function StartConversationButton({ 
  targetUserId, 
  targetUserName, 
  onConversationStarted,
  className = '' 
}: StartConversationButtonProps) {
  const { user } = useAuth();

  // Don't show message button for self
  if (!user || user.id === targetUserId) {
    return null;
  }

  const handleStartConversation = async () => {
    try {
      // Check if conversation already exists
      const { data: existingMessages } = await supabase
        .from('messages')
        .select('id')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id})`)
        .limit(1);

      if (existingMessages && existingMessages.length > 0) {
        // Conversation exists, just navigate to messages
        onConversationStarted?.();
        return;
      }

      // Create initial message to start conversation
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: targetUserId,
          content: `Hi ${targetUserName}! I'd like to connect with you.`
        });

      if (error) throw error;

      toast.success(`Started conversation with ${targetUserName}`);
      onConversationStarted?.();

    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  return (
    <Button
      onClick={handleStartConversation}
      variant="primary"
      size="sm"
      className={className}
    >
      <MessageCircle className="w-4 h-4" />
      Message
    </Button>
  );
}