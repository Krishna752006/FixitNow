import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle, Clock } from "lucide-react";
import { api, ChatMessage } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { format, isToday, isYesterday } from 'date-fns';

interface ChatComponentProps {
  jobId: string;
  onClose?: () => void;
}

interface JobInfo {
  _id: string;
  title: string;
  status: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  professional?: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

const ChatComponent = ({ jobId, onClose }: ChatComponentProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [jobInfo, setJobInfo] = useState<JobInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
  }, [jobId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mark messages as read when component mounts or new messages arrive
    if (jobId && messages.length > 0) {
      markAsRead();
    }
  }, [jobId, messages.length]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.getChatMessages(jobId);
      if (response.success) {
        setJobInfo(response.data.job);
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await api.sendChatMessage(jobId, newMessage.trim());
      if (response.success) {
        setMessages(prev => [...prev, response.data.message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async () => {
    try {
      await api.markMessagesAsRead(jobId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM dd, HH:mm');
    }
  };

  const getOtherParty = () => {
    if (!jobInfo || !user) return null;
    
    if (user.userType === 'user') {
      return jobInfo.professional;
    } else {
      return jobInfo.user;
    }
  };

  const isMyMessage = (message: ChatMessage) => {
    return message.sender._id === user?._id;
  };

  if (loading) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Loading chat...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!jobInfo) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Chat not found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const otherParty = getOtherParty();

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={otherParty?.profileImage} />
              <AvatarFallback>
                {otherParty ? `${otherParty.firstName[0]}${otherParty.lastName[0]}` : 'N/A'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-sm">
                {otherParty ? `${otherParty.firstName} ${otherParty.lastName}` : 'Unknown'}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{jobInfo.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={jobInfo.status === 'completed' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {jobInfo.status}
            </Badge>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground">
            <MessageCircle className="w-8 h-8 mx-auto mb-2" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                    isMyMessage(message)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1 opacity-70" />
                    <span className="text-xs opacity-70">
                      {formatMessageTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </CardContent>

      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
          />
          <Button 
            onClick={sendMessage} 
            disabled={!newMessage.trim() || sending}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatComponent;
