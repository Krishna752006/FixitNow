import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import {
  HelpCircle,
  Mail,
  Phone,
  MessageCircle,
  Send,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  FileText,
  Shield,
  CreditCard,
  Users,
  Wrench,
  HeadphonesIcon
} from 'lucide-react';

interface SupportProps {
  userType?: 'user' | 'professional';
}

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const Support: React.FC<SupportProps> = ({ userType = 'user' }) => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    email: '',
    priority: 'normal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userFAQs: FAQ[] = [
    {
      category: 'Booking',
      question: 'How do I book a service?',
      answer: 'Navigate to the "Book Service" tab, select your desired service category, choose a specific service, fill in the details including your address and preferred time, and submit. You\'ll receive notifications when professionals respond to your request.'
    },
    {
      category: 'Booking',
      question: 'Can I schedule a service for a future date?',
      answer: 'Yes! When booking a service, you can select your preferred date and time. Our professionals will confirm their availability for your chosen slot.'
    },
    {
      category: 'Payment',
      question: 'What payment methods are accepted?',
      answer: 'We accept multiple payment methods including credit/debit cards, UPI, net banking, and cash payments. You can choose your preferred payment method when completing a job.'
    },
    {
      category: 'Payment',
      question: 'When do I need to pay for a service?',
      answer: 'Payment is required after the service is completed. The professional will mark the job as complete, and you\'ll receive a notification to make the payment. You can also leave a review after payment.'
    },
    {
      category: 'Payment',
      question: 'Is my payment information secure?',
      answer: 'Yes, all online payments are processed through Razorpay, a secure payment gateway. We never store your complete card details. Cash payments are verified by the service provider.'
    },
    {
      category: 'Jobs',
      question: 'How do I track my service request?',
      answer: 'Go to the "Jobs" tab to see all your service requests. You can filter by current, past, or pending jobs. Each job shows its current status and you can chat with the assigned professional.'
    },
    {
      category: 'Jobs',
      question: 'Can I cancel a service request?',
      answer: 'Yes, you can cancel a pending service request before it\'s accepted by a professional. Once accepted, please contact the professional through the chat feature to discuss cancellation.'
    },
    {
      category: 'Professionals',
      question: 'How are professionals verified?',
      answer: 'All professionals on our platform undergo a verification process including identity verification, skill assessment, and background checks. You can view their ratings and reviews from other customers.'
    },
    {
      category: 'Professionals',
      question: 'Can I choose a specific professional?',
      answer: 'Yes! You can save your favorite professionals and request them specifically for future services. Check the "Favorites" and "Previous" tabs to find professionals you\'ve worked with before.'
    },
    {
      category: 'Account',
      question: 'How do I update my profile information?',
      answer: 'Go to the "Edit Profile" tab where you can update your personal information, contact details, and saved addresses. Make sure to save your changes.'
    }
  ];

  const professionalFAQs: FAQ[] = [
    {
      category: 'Jobs',
      question: 'How do I accept job requests?',
      answer: 'Go to the "Jobs" tab and check the "Available Jobs" section. You\'ll see all job requests in your service area. Click "Accept" on any job you want to take. Make sure you\'re marked as "Available" in your status.'
    },
    {
      category: 'Jobs',
      question: 'What happens when I accept a job?',
      answer: 'Once you accept a job, you\'ll be marked as "Busy" and won\'t receive new job requests until you complete the current one. You can chat with the customer and see their location details.'
    },
    {
      category: 'Jobs',
      question: 'How do I mark a job as complete?',
      answer: 'After finishing the service, go to the job details and click "Complete Job". You can enter the final price if it differs from the estimate. The customer will then be notified to make the payment.'
    },
    {
      category: 'Earnings',
      question: 'When do I receive payment for completed jobs?',
      answer: 'For online payments, the amount is added to your earnings after the customer pays. For cash payments, you need to verify receipt of cash. You can request payouts from your available balance.'
    },
    {
      category: 'Earnings',
      question: 'How do I request a payout?',
      answer: 'Go to the "Earnings" tab, ensure you have added your bank account details, and click "Request Payout". Enter the amount you want to withdraw (minimum ₹500). Payouts are processed within 2-3 business days.'
    },
    {
      category: 'Earnings',
      question: 'What is the platform fee?',
      answer: 'We charge a small service fee on each completed job to maintain the platform and provide support. The fee percentage is clearly shown in your earnings breakdown.'
    },
    {
      category: 'Profile',
      question: 'How do I update my service area?',
      answer: 'Go to the "Profile" tab and update your city and service radius. This determines which job requests you\'ll see. Make sure your location is accurate to receive relevant job opportunities.'
    },
    {
      category: 'Profile',
      question: 'How can I improve my ratings?',
      answer: 'Provide excellent service, communicate clearly with customers, arrive on time, and complete jobs professionally. Positive reviews from satisfied customers will improve your overall rating.'
    },
    {
      category: 'Availability',
      question: 'How does the availability status work?',
      answer: 'Toggle your status to "Available" when you\'re ready to accept jobs. You\'ll automatically be marked as "Busy" when you accept a job. Remember to turn your status back to "Available" after completing jobs.'
    },
    {
      category: 'Account',
      question: 'How do I verify my cash payments?',
      answer: 'When a customer pays in cash, you\'ll see a "Verify Payment" button on the completed job. Click it to confirm you\'ve received the cash. This updates your earnings and completes the transaction.'
    }
  ];

  const faqs = userType === 'user' ? userFAQs : professionalFAQs;
  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.subject || !contactForm.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          subject: contactForm.subject,
          message: contactForm.message,
          priority: contactForm.priority,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Message Sent!",
          description: "Our support team will get back to you within 24 hours.",
        });
        setContactForm({
          subject: '',
          message: '',
          email: '',
          priority: 'normal'
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <HeadphonesIcon className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold">Support Center</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get help with your {userType === 'user' ? 'service requests' : 'jobs and earnings'}. 
          Browse FAQs or contact our support team.
        </p>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-0 hover-lift">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Email Support</h3>
            <p className="text-sm text-muted-foreground mb-3">service.fixitnow@gmail.com</p>
            <Badge variant="secondary">24-48 hours response</Badge>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 hover-lift">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone className="h-6 w-6 text-success" />
            </div>
            <h3 className="font-semibold mb-2">Phone Support</h3>
            <p className="text-sm text-muted-foreground mb-3">+91 1800-123-4567</p>
            <Badge variant="secondary">Mon-Sat, 9 AM - 6 PM</Badge>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 hover-lift">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-sm text-muted-foreground mb-3">Chat with us</p>
            <Badge variant="secondary">Available 24/7</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQs Section */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Find quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categories.map((category) => (
                <div key={category} className="space-y-2">
                  <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                    {category === 'Booking' && <Calendar className="h-4 w-4" />}
                    {category === 'Payment' && <CreditCard className="h-4 w-4" />}
                    {category === 'Jobs' && <Wrench className="h-4 w-4" />}
                    {category === 'Earnings' && <DollarSign className="h-4 w-4" />}
                    {category === 'Professionals' && <Users className="h-4 w-4" />}
                    {category === 'Profile' && <UserIcon className="h-4 w-4" />}
                    {category === 'Availability' && <Clock className="h-4 w-4" />}
                    {category === 'Account' && <Shield className="h-4 w-4" />}
                    {category}
                  </h3>
                  {faqs
                    .filter(faq => faq.category === category)
                    .map((faq, index) => {
                      const globalIndex = faqs.indexOf(faq);
                      return (
                        <div
                          key={globalIndex}
                          className="border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
                        >
                          <button
                            onClick={() => toggleFAQ(globalIndex)}
                            className="w-full p-4 text-left flex items-center justify-between hover:bg-accent/5 transition-colors"
                          >
                            <span className="font-medium pr-4">{faq.question}</span>
                            {expandedFAQ === globalIndex ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            )}
                          </button>
                          {expandedFAQ === globalIndex && (
                            <div className="p-4 pt-0 text-sm text-muted-foreground border-t bg-accent/5">
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="space-y-4">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Contact Support
              </CardTitle>
              <CardDescription>
                Can't find what you're looking for? Send us a message.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitContact} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject *</label>
                  <Input
                    placeholder="Brief description of your issue"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email (Optional)</label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll use your account email if not provided
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <select
                    className="w-full p-2 border rounded-md bg-background"
                    value={contactForm.priority}
                    onChange={(e) => setContactForm({ ...contactForm, priority: e.target.value })}
                  >
                    <option value="low">Low - General inquiry</option>
                    <option value="normal">Normal - Need assistance</option>
                    <option value="high">High - Urgent issue</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Message *</label>
                  <Textarea
                    placeholder="Describe your issue in detail..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="min-h-[120px]"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Additional Resources */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Terms of Service
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Shield className="mr-2 h-4 w-4" />
                Privacy Policy
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <AlertCircle className="mr-2 h-4 w-4" />
                Report an Issue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Missing imports that need to be added
import { Calendar, DollarSign, User as UserIcon } from 'lucide-react';

export default Support;
