import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Send, Loader2, HelpCircle, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  source?: 'faq' | 'openai' | 'error' | 'gemini' | 'filtered';
}

interface Professional {
  _id: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  rating?: {
    average: number;
    count: number;
  };
  profileImage?: string;
  matchScore: number;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! 👋 I\'m FixItNow\'s AI Assistant. I can help you with:\n• Booking services\n• Payment & pricing questions\n• Professional information\n• General FAQs\n\nHow can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
      source: 'openai',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [faqCategories, setFaqCategories] = useState<any[]>([]);
  const [showProfessionals, setShowProfessionals] = useState(false);
  const [matchedProfessionals, setMatchedProfessionals] = useState<Professional[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Load FAQ categories when component mounts
  useEffect(() => {
    if (isOpen) {
      fetchFAQCategories();
    }
  }, [isOpen]);

  const fetchFAQCategories = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/chatbot/faq');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setFaqCategories(data.data.categories);
      }
    } catch (error) {
      console.error('Error fetching FAQ:', error);
      toast({
        title: 'Warning',
        description: 'Could not load FAQ categories. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const messageText = inputValue;
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          conversationHistory: messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.data.message,
          sender: 'bot',
          timestamp: new Date(),
          source: data.data.source,
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      
      // Add error message to chat
      const errorBotMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: `Sorry, I encountered an error: ${errorMessage}. Please make sure the backend server is running.`,
        sender: 'bot',
        timestamp: new Date(),
        source: 'error',
      };
      setMessages(prev => [...prev, errorBotMessage]);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFAQClick = async (category: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/chatbot/faq/${category}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.success) {
        const faqText = data.data.items
          .map((item: any) => `Q: ${item.q}\nA: ${item.a}`)
          .join('\n\n');

        const botMessage: Message = {
          id: Date.now().toString(),
          text: `Here are the FAQs for ${category}:\n\n${faqText}`,
          sender: 'bot',
          timestamp: new Date(),
          source: 'faq',
        };
        setMessages(prev => [...prev, botMessage]);
        setShowFAQ(false);
      } else {
        throw new Error(data.message || 'Failed to load FAQ');
      }
    } catch (error) {
      console.error('Error fetching FAQ:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load FAQ';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chatbot Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-primary text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all hover:scale-110 z-40"
          title="Open AI Assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-t-lg pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <div>
                  <CardTitle className="text-lg">FixItNow AI</CardTitle>
                  <p className="text-xs text-white/80">Always here to help</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  {message.source && message.sender === 'bot' && (
                    <Badge
                      variant="outline"
                      className="mt-2 text-xs"
                    >
                      {message.source === 'faq' ? '📚 FAQ' : message.source === 'gemini' ? '✨ Gemini AI' : message.source === 'filtered' ? '🔒 Filtered' : '🤖 AI'}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </ScrollArea>

          {/* Quick Actions */}
          {!showFAQ && !showProfessionals && (
            <div className="px-4 py-2 border-t space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFAQ(true)}
                className="w-full justify-start gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                View FAQs
              </Button>
            </div>
          )}

          {/* FAQ Categories */}
          {showFAQ && (
            <div className="px-4 py-2 border-t space-y-2 max-h-32 overflow-y-auto">
              <p className="text-xs font-semibold text-gray-600">Select a category:</p>
              {faqCategories.map(cat => (
                <Button
                  key={cat.name}
                  variant="outline"
                  size="sm"
                  onClick={() => handleFAQClick(cat.name.toLowerCase())}
                  className="w-full justify-start text-xs"
                >
                  {cat.name}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFAQ(false)}
                className="w-full text-xs"
              >
                Back
              </Button>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t p-4 space-y-2">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="text-sm"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim()}
                size="sm"
                className="px-3"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Powered by AI • Always learning
            </p>
          </div>
        </Card>
      )}
    </>
  );
}
