import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api, ProfessionalStats, Job, Notification, Professional, User } from '@/services/api';
import { toast } from '@/components/ui/use-toast';
import JobStatusBadge from '@/components/JobStatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRealTime } from '@/contexts/RealTimeContext';
import { Input } from '@/components/ui/input';
import {
  DollarSign,
  Clock,
  Star,
  MessageCircle,
  User as UserIcon,
  Bell,
  TrendingUp,
  CheckCircle2,
  X,
  Calendar as CalendarIcon,
  BarChart3,
  Settings,
  MapPin,
  Phone,
  Mail,
  Wrench,
  LogOut,
  Power,
  Loader2,
  Eye,
  Check,
  AlertCircle,
  Navigation,
  Globe,
  HelpCircle
} from 'lucide-react';

import BankAccountForm from '@/components/BankAccountForm';
import PayoutRequestDialog from '@/components/PayoutRequestDialog';
import PayoutHistory from '@/components/PayoutHistory';
import ChatDialog from '@/components/ChatDialog';
import ReviewsDisplay from '@/components/ReviewsDisplay';
import Support from '@/components/Support';

const ProviderDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState<ProfessionalStats | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [selectedChatJob, setSelectedChatJob] = useState<Job | null>(null);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [completedJobs, setCompletedJobs] = useState<Job[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [isLoadingAvailableJobs, setIsLoadingAvailableJobs] = useState(false);

  const { notifications: rtNotifications, unreadCount, markNotificationAsRead, markAllNotificationsAsRead } = useRealTime();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [payoutBalance, setPayoutBalance] = useState<any>(null);
  const [isLoadingPayoutBalance, setIsLoadingPayoutBalance] = useState(false);
  const [isCompleteJobDialogOpen, setIsCompleteJobDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [finalPrice, setFinalPrice] = useState<number | undefined>(undefined);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    city: '',
    zipCode: '',
    services: [] as string[],
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    serviceArea: {
      radius: 10,
      areas: [] as string[],
    },
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [showCashVerificationDialog, setShowCashVerificationDialog] = useState(false);
  const [currentVerificationJob, setCurrentVerificationJob] = useState<Job | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  const navigate = useNavigate();
  
  // Simple debounce helper
  const debounce = useMemo(() => {
    let t: any;
    return (fn: (...args: any[]) => void, wait = 400) => {
      clearTimeout(t);
      t = setTimeout(() => fn(), wait);
    };
  }, []);

  const { user, userType, isAuthenticated, logout, isLoading, updateUserLocal } = useAuth();

  const getUserName = (jobUser: string | User) => {
    if (typeof jobUser === 'string') return 'User';
    return `${jobUser.firstName || ''} ${jobUser.lastName || ''}`.trim();
  };

  const getUserInitials = (jobUser: string | User) => {
    if (typeof jobUser === 'string') return 'U';
    return `${jobUser.firstName?.[0] || ''}${jobUser.lastName?.[0] || ''}`.toUpperCase();
  };

  useEffect(() => {
    if (!isAuthenticated || !user || userType !== 'professional') {
      navigate('/login');
      return;
    }

    // Set profile data from user
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        bio: (user as Professional).bio || '',
        city: (user as Professional).city || '',
        zipCode: (user as Professional).zipCode || '',
        services: (user as Professional).services || [],
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
        },
        serviceArea: {
          radius: (user as Professional).serviceArea?.radius || 10,
          areas: ((user as Professional).serviceArea as any)?.areas || [],
        },
      });
    }

    loadDashboardStats();
    loadJobs();
    loadAvailableJobs();
    loadNotifications();
    loadPayoutBalance();
    loadReviews();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await api.getProfessionalDashboardStats();
      if (response.success) {
        setDashboardStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadJobs = async (status?: string) => {
    try {
      setIsLoadingJobs(true);
      const response = await api.getProfessionalJobs(1, 10, status);
      console.log('Professional jobs response:', response);
      if (response.success) {
        setJobs(response.data.jobs);
        console.log('Loaded jobs:', response.data.jobs.length);
      } else {
        console.log('Failed to load jobs:', response);
        setJobs([]);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      setJobs([]);
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive",
      });
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const loadAvailableJobs = async () => {
    try {
      setIsLoadingAvailableJobs(true);

      // Backend will use professional's city automatically
      const response = await api.getAvailableJobs(1, 10);
      console.log('Available jobs response:', response);

      if (response.success) {
        const jobs = response.data.jobs || [];
        console.log('Available jobs loaded:', jobs.length);
        setAvailableJobs(jobs);
      } else {
        console.log('No available jobs found:', response.message);
        if (response.message?.includes('city')) {
          toast({
            title: "Location Required",
            description: "Please set your city in profile settings to see available jobs",
            variant: "destructive",
          });
        }
        setAvailableJobs([]);
      }
    } catch (error: any) {
      console.error('Error loading available jobs:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load available jobs",
        variant: "destructive",
      });
      setAvailableJobs([]);
    } finally {
      setIsLoadingAvailableJobs(false);
    }
  };

  const loadCompletedJobs = async () => {
    if (!user) return;
    
    try {
      const response = await api.getProfessionalJobs(1, 10, 'completed');
      if (response.success) {
        setCompletedJobs(response.data.jobs);
      }
    } catch (error) {
      console.error('Error loading completed jobs:', error);
    }
  };


  const loadNotifications = async () => {
    try {
      const response = await api.getNotifications();
      if (response.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadReviews = async (page = 1) => {
    if (!user?._id) return;
    
    try {
      setIsLoadingReviews(true);
      const response = await api.getProfessionalReviews(user._id, page, 10);
      if (response.success) {
        setReviews(response.data.reviews);
        setTotalReviews(response.data.total);
        setReviewsPage(page);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const loadPayoutBalance = async () => {
    try {
      setIsLoadingPayoutBalance(true);
      const response = await api.getPayoutBalance();
      if (response.success) {
        setPayoutBalance(response.data);
        setAvailableBalance(response.data.availableBalance);
      }
    } catch (error) {
      console.error('Error loading payout balance:', error);
    } finally {
      setIsLoadingPayoutBalance(false);
    }
  };

  const handleAcceptJob = async (jobId: string) => {
    try {
      const response = await api.acceptJob(jobId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Job accepted successfully!",
        });
        // Refresh all data
        await Promise.all([
          loadJobs(),
          loadAvailableJobs(),
          loadDashboardStats()
        ]);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to accept job",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error accepting job:', error);
      toast({
        title: "Error",
        description: "Failed to accept job. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeclineJob = async (jobId: string) => {
    try {
      const response = await api.declineJob(jobId);
      if (response.success) {
        toast({
          title: "Job Declined",
          description: "You have declined this job. It will remain available for other professionals.",
        });
        // Refresh available jobs to remove it from the list
        await loadAvailableJobs();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to decline job",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error declining job:', error);
      toast({
        title: "Error",
        description: "Failed to decline job. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleAvailability = async (checked: boolean) => {
    const previous = user.isActive;
    setIsUpdatingAvailability(true);

    // Optimistic update
    if (updateUserLocal) {
      updateUserLocal({ isActive: checked });
    }

    try {
      // Update the user's availability status
      const response = await api.updateProfessionalProfile({ isActive: checked });
      if (response.success) {
        toast({ title: "Success", description: "Availability updated successfully" });
        // Refresh dashboard data
        loadDashboardStats();
      } else {
        // Rollback on server-side rejection
        if (updateUserLocal) {
          updateUserLocal({ isActive: previous });
        }
        toast({ title: "Error", description: response.message || 'Failed to update availability', variant: 'destructive' });
      }
    } catch (error) {
      // Rollback on network or other errors
      if (updateUserLocal) {
        updateUserLocal({ isActive: previous });
      }
      console.error('Error updating availability:', error);
      toast({ title: "Error", description: "Failed to update availability", variant: "destructive" });
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  const handleCompleteJob = async () => {
    if (!selectedJob) return;

    try {
      const response = await api.completeJob(selectedJob._id, finalPrice);
      if (response.success) {
        toast({ title: "Success", description: "Job marked as complete!" });
        setIsCompleteJobDialogOpen(false);
        // Refresh all data
        await Promise.all([
          loadJobs(),
          loadCompletedJobs(),
          loadDashboardStats(),
        ]);
      } else {
        toast({ title: "Error", description: response.message || 'Failed to complete job', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error completing job:', error);
      toast({ title: "Error", description: "Failed to complete job. Please try again.", variant: 'destructive' });
    }
  };

  const handleVerifyCashPayment = async (jobId: string) => {
    try {
      const response = await api.verifyCashPayment(jobId);
      if (response.success) {
        // Update earnings
        await api.updateProviderEarnings(jobId);
        
        toast({
          title: "Success",
          description: "Cash payment verified successfully",
        });
        // Refresh job data
        loadJobs();
        loadCompletedJobs();
        loadDashboardStats();
      }
    } catch (error) {
      console.error('Error verifying cash payment:', error);
      toast({
        title: "Error",
        description: "Failed to verify cash payment",
        variant: "destructive",
      });
    }
  };

  const handleVerifyPaymentClick = (job: Job) => {
    setCurrentVerificationJob(job);
    setShowCashVerificationDialog(true);
  };

  const handleConfirmVerification = async () => {
    if (!currentVerificationJob) return;
    
    try {
      const response = await api.verifyCashPayment(currentVerificationJob._id);
      if (response.success) {
        toast({
          title: "Payment Verified",
          description: `You confirmed collecting ₹${currentVerificationJob.finalPrice} in cash`,
        });
        loadJobs();
        loadCompletedJobs();
        loadDashboardStats();
      }
    } catch (error) {
      console.error('Verification failed:', error);
      toast({
        title: "Error",
        description: "Failed to verify payment",
        variant: "destructive",
      });
    } finally {
      setShowCashVerificationDialog(false);
      setCurrentVerificationJob(null);
    }
  };

  const handleServiceChange = (service: string) => {
    setProfileData(prevData => {
      const services = prevData.services.includes(service)
        ? prevData.services.filter(s => s !== service)
        : [...prevData.services, service];
      return { ...prevData, services };
    });
  };

  const handleUpdateProfile = async () => {
    try {
      setIsUpdatingProfile(true);
      const response = await api.updateProfessionalProfile(profileData);
      if (response.success) {
        toast({ 
          title: "Success", 
          description: "Profile updated successfully" 
        });
        // Update local user data
        if (updateUserLocal && response.data?.professional) {
          updateUserLocal(response.data.professional);
        }
      } else {
        toast({ 
          title: "Error", 
          description: response.message || "Failed to update profile", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({ 
        title: "Error", 
        description: "Failed to update profile. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdatingProfile(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await api.uploadProfileImage(formData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Profile picture updated successfully",
        });
        
        // Update local user data with new profile image
        if (updateUserLocal && response.data?.profileImage) {
          updateUserLocal({ ...user, profileImage: response.data.profileImage });
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to upload profile picture",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Get current location services
  const currentLocationServices = useMemo(() => {
    if (!user || !(user as Professional).city) return [];
    
    const professional = user as Professional;
    return professional.services?.filter(service => {
      // Filter services based on city demand (this could be enhanced with real data)
      const cityServices = {
        'Plumbing': ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'],
        'Electrical': ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'],
        'Carpentry': ['Mumbai', 'Delhi', 'Bangalore', 'Chennai'],
        'Painting': ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'],
        'Cleaning': ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'],
        'Appliance Repair': ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'],
        'HVAC': ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'],
        'Landscaping': ['Mumbai', 'Delhi', 'Bangalore', 'Chennai'],
        'Handyman': ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'],
      };
      
      return cityServices[service as keyof typeof cityServices]?.includes(professional.city) || true;
    }) || [];
  }, [user]  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'earnings') {
      loadPayoutBalance();
    }
  };

  const handlePayoutSuccess = () => {
    loadPayoutBalance();
    loadDashboardStats();
  };

  // Generate user initials for avatar
  const userInitials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : '';

  // Format user's full name
  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';

  // Loading state
  if (isLoading || !user) {
    return (
      <div className="min-h-screen dashboard-bg-pro flex items-center justify-center">
        <div className="text-center glass-card p-8 rounded-xl animate-pulse-glow">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Create animated particles for background
  const renderParticles = () => {
    const particles = [];
    for (let i = 0; i < 8; i++) {
      const size = Math.floor(Math.random() * 40) + 10;
      const left = Math.floor(Math.random() * 100);
      const animationDuration = Math.floor(Math.random() * 20) + 10;
      const delay = Math.floor(Math.random() * 10);

      particles.push(
        <div
          key={i}
          className="particle animate-float"
          style={{
            width: size + 'px',
            height: size + 'px',
            left: left + '%',
            top: Math.floor(Math.random() * 100) + '%',
            opacity: Math.random() * 0.3,
            background: `hsl(var(--accent) / 0.3)`,
            animation: `particleFloat ${animationDuration}s ease-in-out ${delay}s infinite`
          }}
        />
      );
    }
    return particles;
  };

  const renderCashPaymentStatus = (job: Job) => {
    if (job.paymentMethod !== 'cash') return null;
    
    return (
      <div className="flex items-center gap-2 mt-2">
        {job.paymentStatus === 'cash_pending' && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleVerifyPaymentClick(job)}
            className="text-success border-success/50 hover:bg-success/10"
          >
            <Check className="h-4 w-4 mr-2" />
            Verify Payment
          </Button>
        )}
        {job.paymentStatus === 'cash_verified' && (
          <Badge variant="success">
            <Check className="h-4 w-4 mr-2" />
            Payment Verified
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen dashboard-bg-pro">
      {/* Animated background particles */}
      {renderParticles()}

      {/* Enhanced Header */}
      <header className="border-b glass-nav sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-accent/20 hover-glow">
                  <AvatarImage src={user.profileImage || "/placeholder.svg"} />
                  <AvatarFallback className="bg-accent/10 text-accent font-semibold">{userInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Welcome back, {user.firstName}!</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{(user as Professional).city || 'Location not set'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl glass-card animate-shimmer">
                  <Power className="h-4 w-4" />
                  <span className="text-sm font-medium">Status:</span>
                  <Switch
                    checked={user.isActive || false}
                    onCheckedChange={handleToggleAvailability}
                    disabled={isUpdatingAvailability || (user as Professional).isBusy}
                    className="data-[state=checked]:bg-success"
                  />
                  <span className="text-sm font-semibold">
                    {(user as Professional).isBusy 
                      ? 'Busy' 
                      : user.isActive ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    (user as Professional).isBusy
                      ? "bg-warning/10 text-warning border-warning/20 px-3 py-1 hover-glow"
                      : user.isActive
                      ? "bg-success/10 text-success border-success/20 px-3 py-1 hover-glow"
                      : "bg-muted text-muted-foreground px-3 py-1 hover-glow"
                  }
                >
                  {(user as Professional).isBusy 
                    ? '🔧 Busy with Job' 
                    : user.isActive ? '⚡ Available for Jobs' : '🔴 Unavailable'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-warning/10 hover:border-warning/50 hover-lift"
                onClick={() => setIsNotificationsOpen(true)}
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="ml-2 bg-warning text-warning-foreground px-1 py-0 text-xs animate-pulse">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="hover:bg-accent/10 hover:border-accent/50 hover-lift"
                onClick={() => setActiveTab('profile')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive hover-lift">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <div className="relative">
                <Avatar className="h-10 w-10 ring-2 ring-success/30 hover-glow">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-success/10 text-success font-semibold">MS</AvatarFallback>
                </Avatar>

                <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
                  <DialogContent className="max-w-xl">
                    <DialogHeader>
                      <div className="flex items-center justify-between">
                        <DialogTitle>Notifications {unreadCount > 0 ? `( ${unreadCount} new )` : ''}</DialogTitle>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => loadNotifications()}>Refresh</Button>
                          <Button variant="outline" size="sm" onClick={async () => { await markAllNotificationsAsRead(); }} disabled={unreadCount === 0}>Mark all as read</Button>
                        </div>
                      </div>
                    </DialogHeader>
                    <div className="space-y-3 max-h-[60vh] overflow-auto">
                      {rtNotifications.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No notifications yet</div>
                      ) : (
                        rtNotifications.map((n) => (
                          <div key={n._id} className={`flex items-start gap-3 p-3 rounded-lg border ${!n.isRead ? 'bg-accent/5 border-accent/20' : ''}`}>
                            <div className="mt-1">
                              <Bell className={`h-4 w-4 ${!n.isRead ? 'text-accent' : 'text-muted-foreground'}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">{n.title}</h4>
                                <span className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{n.message}</p>
                            </div>
                            {!n.isRead && (
                              <Button size="sm" variant="outline" onClick={async () => { await markNotificationAsRead(n._id); }}>
                                Mark as read
                              </Button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background animate-pulse ${(user as Professional).isBusy ? 'bg-warning' : user.isActive ? 'bg-success' : 'bg-muted'}`}></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 animate-fade-in">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 glass-card rounded-xl p-1 interactive-tabs">
            <TabsTrigger value="overview" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground hover-glow">Overview</TabsTrigger>
            <TabsTrigger value="jobs" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground hover-glow">Jobs</TabsTrigger>
            <TabsTrigger value="earnings" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground hover-glow">Earnings</TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground hover-glow">Reviews</TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground hover-glow">Notifications</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground hover-glow">Analytics</TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground hover-glow">Profile</TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground hover-glow">
              <HelpCircle className="h-4 w-4 mr-1" />
              Support
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Busy Status Alert */}
            {(user as Professional).isBusy && (
              <Card className="animated-card glass-card border-warning/50 bg-warning/5 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-warning/20 rounded-xl">
                      <AlertCircle className="h-6 w-6 text-warning" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-warning mb-1">You are currently busy with a job</h3>
                      <p className="text-sm text-muted-foreground">
                        Complete your current job to become available for new service requests in nearby locations.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location-based Services Summary */}
            <Card className="animated-card glass-card border-0 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Services in {(user as Professional).city || 'Your Area'}
                </CardTitle>
                <CardDescription>
                  Available services and opportunities in your service area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {currentLocationServices.map((service, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-accent/5 border border-accent/20">
                      <Wrench className="h-4 w-4 text-accent" />
                      <span className="text-sm font-medium">{service}</span>
                    </div>
                  ))}
                  {currentLocationServices.length === 0 && (
                    <div className="col-span-full text-center py-4 text-muted-foreground">
                      No services configured for your area. Update your location to see available services.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card className="animated-card glass-card border-0 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 gradient-warning rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 animate-pulse-glow">
                      <Bell className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Jobs</p>
                      <p className="text-2xl font-bold">
                        {isLoadingStats ?
                          <span className="inline-block w-8 h-8 bg-muted/30 rounded animate-pulse"></span> :
                          dashboardStats?.pendingJobs || 0
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="animated-card glass-card border-0 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 gradient-primary rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 animate-pulse-glow">
                      <Wrench className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Jobs</p>
                      <p className="text-2xl font-bold">
                        {isLoadingStats ?
                          <span className="inline-block w-8 h-8 bg-muted/30 rounded animate-pulse"></span> :
                          dashboardStats?.activeJobs || 0
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="animated-card glass-card border-0 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 gradient-success rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 animate-pulse-glow">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Earnings</p>
                      <p className="text-2xl font-bold">
                        ₹{isLoadingStats ?
                          <span className="inline-block w-8 h-8 bg-muted/30 rounded animate-pulse"></span> :
                          dashboardStats?.monthlyEarnings || 0
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="animated-card glass-card border-0 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 gradient-accent rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 animate-pulse-glow">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <p className="text-2xl font-bold">
                        {isLoadingStats ?
                          <span className="inline-block w-8 h-8 bg-muted/30 rounded animate-pulse"></span> :
                          dashboardStats?.averageRating || 0
                        }
                        <span className="text-sm text-muted-foreground ml-1 animate-fade-in">
                          ({dashboardStats?.totalReviews || 0} reviews)
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="animated-card glass-card border-0 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-muted/80 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 animate-pulse-glow">
                      <TrendingUp className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                      <p className="text-2xl font-bold">
                        {isLoadingStats ?
                          <span className="inline-block w-8 h-8 bg-muted/30 rounded animate-pulse"></span> :
                          "98%"
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* New Job Requests */}
            <Card>
              <CardHeader>
                <CardTitle>New Job Requests in Your Area</CardTitle>
                <CardDescription>Review and respond to incoming requests near {(user as Professional).city || 'your location'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingAvailableJobs ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading available jobs...</p>
                  </div>
                ) : availableJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No available jobs in your area</p>
                    <p className="text-sm text-muted-foreground">Check back later or expand your service area</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(() => {
                      const displayedJobs = availableJobs.slice(0, 3);
                      const jobElements = [];
                      for (let i = 0; i < displayedJobs.length; i++) {
                        const job = displayedJobs[i];
                        jobElements.push(
                          <div key={job._id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                            <div className="flex items-center gap-4">
                              <Avatar>
                                <AvatarFallback>
                                  {getUserInitials(job.user)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h4 className="font-semibold">{job.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {typeof job.user === 'string' ? 'User' : `${job.user.firstName || ''} ${job.user.lastName || ''}`.trim()} •
                                  <span className="text-primary">{job.location.address}</span>
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                  <div className="flex items-center gap-1">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                      {new Date(job.scheduledDate).toLocaleDateString()} at {job.scheduledTime}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">
                                      ₹{job.budget?.min || 0}{job.budget?.max && job.budget.max !== job.budget.min ? ` - ₹${job.budget.max}` : ''}
                                    </span>
                                  </div>
                                  {(job as any).distance !== undefined && (
                                    <Badge variant="outline" className="text-xs">
                                      {(((job as any).distance as number) / 1000).toFixed(1)} km away
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDeclineJob(job._id)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Decline
                              </Button>
                              <Button size="sm" onClick={() => handleAcceptJob(job._id)}>
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                            </div>
                          </div>
                        );
                      }
                      return jobElements;
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Active Jobs</CardTitle>
                <CardDescription>Your current ongoing projects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingJobs ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading active jobs...</p>
                  </div>
                ) : jobs.filter(job => ['accepted', 'in_progress'].includes(job.status)).length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No active jobs</p>
                    <p className="text-sm text-muted-foreground">Accept jobs from the Available Jobs tab</p>
                  </div>
                ) : (
                  jobs.filter(job => ['accepted', 'in_progress'].includes(job.status)).slice(0, 2).map((job) => (
                    <div key={job._id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar>
                          <AvatarFallback>
                            {(job.user as User)?.firstName?.[0]}{(job.user as User)?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{job.title}</h4>
                            <Badge variant={job.status === 'in_progress' ? 'default' : 'secondary'}>
                              {job.status === 'in_progress' ? 'In Progress' : 'Accepted'}
                            </Badge>
                            <Badge variant="outline">{job.category}</Badge>
                          </div>
                          {job.description && (
                            <p className="text-sm text-muted-foreground mb-1">{job.description}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            <strong>Customer:</strong> {(job.user as User)?.firstName} {(job.user as User)?.lastName}
                            <span className="ml-2 text-success text-xs">
                              📞 {(job.user as User)?.phone} | ✉️ {(job.user as User)?.email}
                            </span>
                          </p>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {new Date(job.scheduledDate).toLocaleDateString()} at {job.scheduledTime}
                              </span>
                            </div>
                            {job.estimatedDuration && (
                              <span className="text-sm text-muted-foreground">
                                • {job.estimatedDuration} hrs
                              </span>
                            )}
                            {(job.budget?.min || job.budget?.max) && (
                              <Badge variant="outline" className="text-success">
                                ₹{job.budget.min || 0}{job.budget.max && job.budget.max !== job.budget.min ? ` - ₹${job.budget.max}` : ''}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedChatJob(job);
                            setShowChatDialog(true);
                          }}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedJob(job);
                            setFinalPrice(job.budget?.max || job.budget?.min || 500);
                            setIsCompleteJobDialogOpen(true);
                          }}
                        >
                          Mark Complete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Management Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <h2 className="text-xl font-semibold">Job Management</h2>

            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All Jobs ({jobs.length})</TabsTrigger>
                <TabsTrigger value="available">Available Jobs</TabsTrigger>
                <TabsTrigger value="active">Active Jobs</TabsTrigger>
                <TabsTrigger value="completed">Completed Jobs</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>All Your Jobs</CardTitle>
                    <CardDescription>Complete list of all jobs assigned to you</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {jobs.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No jobs found</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {jobs.map((job) => (
                          <Card key={job._id} className="overflow-hidden">
                            <div className="flex items-center justify-between p-4">
                              <div className="flex items-center gap-4 flex-1">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={typeof job.user === 'object' ? job.user.profileImage : undefined} />
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {typeof job.user === 'object' ? `${job.user.firstName?.[0]}${job.user.lastName?.[0]}` : 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h4 className="font-semibold">{job.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {typeof job.user === 'object' && `${job.user.firstName} ${job.user.lastName}`}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={
                                      job.status === 'completed' ? 'default' :
                                      job.status === 'in_progress' ? 'secondary' :
                                      job.status === 'accepted' ? 'outline' :
                                      'destructive'
                                    }>
                                      {job.status}
                                    </Badge>
                                    <Badge variant="outline">{job.category}</Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(job.scheduledDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Button 
                                size="sm"
                                variant={expandedJobId === job._id ? "default" : "outline"}
                                onClick={() => setExpandedJobId(expandedJobId === job._id ? null : job._id)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                {expandedJobId === job._id ? 'Hide' : 'View'} Details
                              </Button>
                            </div>

                            {/* Expanded Job Details */}
                            {expandedJobId === job._id && (
                              <div className="border-t bg-muted/30 p-6 space-y-6">
                                {/* Job Information */}
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-base flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4" />
                                    Job Information
                                  </h4>
                                  <div className="grid gap-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Category:</span>
                                      <span className="font-medium">{job.category}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Status:</span>
                                      <Badge variant={
                                        job.status === 'completed' ? 'default' :
                                        job.status === 'in_progress' ? 'secondary' :
                                        job.status === 'accepted' ? 'outline' :
                                        'destructive'
                                      }>
                                        {job.status}
                                      </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Scheduled:</span>
                                      <span className="font-medium">
                                        {new Date(job.scheduledDate).toLocaleDateString()} at {job.scheduledTime}
                                      </span>
                                    </div>
                                    {job.estimatedDuration && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Duration:</span>
                                        <span className="font-medium">{job.estimatedDuration} hours</span>
                                      </div>
                                    )}
                                    {job.budget && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Budget:</span>
                                        <span className="font-medium">₹{job.budget.min || 0} - ₹{job.budget.max || 0}</span>
                                      </div>
                                    )}
                                    {job.finalPrice && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Final Price:</span>
                                        <span className="font-medium text-success">₹{job.finalPrice}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="border-t pt-4" />

                                {/* Location */}
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-base flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Location
                                  </h4>
                                  <div className="text-sm space-y-1">
                                    <p className="font-medium">{job.location?.address || 'Address not specified'}</p>
                                    <p className="text-muted-foreground">
                                      {job.location?.city}, {job.location?.state} {job.location?.zipCode}
                                    </p>
                                    {job.location?.coordinates?.lat && job.location?.coordinates?.lng && (
                                      <a
                                        className="text-primary hover:underline inline-flex items-center gap-1 mt-2"
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${job.location.coordinates.lat},${job.location.coordinates.lng}`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <Navigation className="h-3 w-3" />
                                        Get Directions
                                      </a>
                                    )}
                                  </div>
                                </div>

                                <div className="border-t pt-4" />

                                {/* Customer Details */}
                                {typeof job.user === 'object' && (
                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-base flex items-center gap-2">
                                      <UserIcon className="h-4 w-4" />
                                      Customer Details
                                    </h4>
                                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                                      <Avatar className="h-12 w-12">
                                        <AvatarImage src={job.user.profileImage} />
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                          {job.user.firstName?.[0]}{job.user.lastName?.[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 space-y-2">
                                        <p className="font-semibold">
                                          {job.user.firstName} {job.user.lastName}
                                        </p>
                                        <div className="flex flex-wrap gap-3 text-xs">
                                          {job.user.phone && (
                                            <a href={`tel:${job.user.phone}`} className="flex items-center gap-1 text-muted-foreground hover:text-primary">
                                              <Phone className="h-3 w-3" />
                                              {job.user.phone}
                                            </a>
                                          )}
                                          {job.user.email && (
                                            <a href={`mailto:${job.user.email}`} className="flex items-center gap-1 text-muted-foreground hover:text-primary">
                                              <Mail className="h-3 w-3" />
                                              {job.user.email}
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="available" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Available Jobs in Your Area</CardTitle>
                        <CardDescription>Jobs matching your services and location</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={loadAvailableJobs}
                          disabled={isLoadingAvailableJobs}
                        >
                          <Loader2 className={`h-4 w-4 mr-2 ${isLoadingAvailableJobs ? 'animate-spin' : ''}`} />
                          Refresh
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoadingAvailableJobs ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading available jobs...</p>
                      </div>
                    ) : availableJobs.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground font-semibold">No available jobs at the moment</p>
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg text-left max-w-md mx-auto">
                          <p className="text-sm font-medium mb-3">Jobs are matched based on:</p>
                          <ul className="text-sm space-y-2">
                            <li className="flex items-start gap-2">
                              <span className={`${(user as any)?.city ? 'text-success' : 'text-destructive'}`}>
                                {(user as any)?.city ? '✓' : '✗'}
                              </span>
                              <div>
                                <strong>Your city:</strong> {(user as any)?.city || 'Not set'}
                                {!(user as any)?.city && (
                                  <p className="text-xs text-destructive mt-1">⚠️ Set your city in Profile Settings</p>
                                )}
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className={`${(user as any)?.services?.length ? 'text-success' : 'text-destructive'}`}>
                                {(user as any)?.services?.length ? '✓' : '✗'}
                              </span>
                              <div>
                                <strong>Your services:</strong> {(user as any)?.services?.join(', ') || 'None set'}
                                {!(user as any)?.services?.length && (
                                  <p className="text-xs text-destructive mt-1">⚠️ Add services in Profile Settings</p>
                                )}
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-muted-foreground">•</span>
                              <div>
                                <strong>Job status:</strong> Pending (not assigned to anyone)
                              </div>
                            </li>
                          </ul>
                          <div className="mt-4 p-3 bg-primary/10 rounded text-xs">
                            <p className="font-medium">💡 Tip:</p>
                            <p className="mt-1">Jobs will appear here when customers in <strong>{(user as any)?.city || 'your city'}</strong> post jobs for services you offer.</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {availableJobs.map((job) => (
                        <div key={job._id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarFallback>
                                {typeof job.user === 'string' ? 'U' : job.user?.firstName?.[0]}{typeof job.user === 'string' ? '' : job.user?.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-lg">{job.title}</h4>
                                  <Badge variant="secondary">{job.category}</Badge>
                                </div>
                                {job.description && (
                                  <p className="text-sm text-muted-foreground">{job.description}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                  <strong>Customer:</strong> {getUserName(job.user)}
                                  {typeof job.user !== 'string' && (
                                    <span className="ml-2 text-success">
                                      📞 {job.user.phone} | ✉️ {job.user.email}
                                    </span>
                                  )}
                                </p>
                                <p className="text-sm">
                                  <MapPin className="h-3 w-3 inline mr-1" />
                                  <a
                                    className="underline-offset-2 hover:underline text-primary"
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${job.location.address}, ${job.location.city}, ${job.location.state} ${job.location.zipCode || ''}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Open in Google Maps"
                                  >
                                    {job.location.address}, {job.location.city}
                                  </a>
                                </p>
                              </div>
                              <div className="flex items-center gap-3 mt-3 flex-wrap">
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {new Date(job.scheduledDate).toLocaleDateString()} at {job.scheduledTime}
                                  </span>
                                </div>
                                {job.estimatedDuration && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{job.estimatedDuration} hrs</span>
                                  </div>
                                )}
                                {(job.budget?.min || job.budget?.max) && (
                                  <Badge variant="outline" className="text-success border-success/50">
                                    <DollarSign className="h-3 w-3 mr-1" />
                                    ₹{job.budget.min || 0}{job.budget.max && job.budget.max !== job.budget.min ? ` - ₹${job.budget.max}` : ''}
                                  </Badge>
                                )}

									{(job as any).distance !== undefined && (
									  <Badge variant="outline" title="Distance from you">
									    {(((job as any).distance as number) / 1000).toFixed(1)} km away
									  </Badge>
									)}

									<a
									  className="text-sm text-primary hover:underline"
									  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${job.location.coordinates?.lat},${job.location.coordinates?.lng}`)}`}
									  target="_blank"
									  rel="noopener noreferrer"
									>
									  Get Directions
									</a>


                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {/* View details */}}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAcceptJob(job._id)}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                          </div>
                        </div>
                        ))}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="active" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Jobs</CardTitle>
                    <CardDescription>Jobs you're currently working on</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      console.log('Active Jobs Tab - Total jobs:', jobs.length);
                      console.log('Active Jobs Tab - Jobs:', jobs);
                      const activeJobs = jobs.filter(job => ['accepted', 'in_progress'].includes(job.status));
                      console.log('Active Jobs Tab - Filtered active jobs:', activeJobs.length);
                      return null;
                    })()}
                    {isLoadingJobs ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading active jobs...</p>
                      </div>
                    ) : jobs.filter(job => ['accepted', 'in_progress'].includes(job.status)).length === 0 ? (
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No active jobs</p>
                        <p className="text-sm text-muted-foreground">Accept jobs from the Available Jobs tab</p>
                        <div className="mt-4 p-4 bg-muted rounded-lg text-left">
                          <p className="text-sm font-medium mb-2">Debug: All your jobs ({jobs.length}):</p>
                          {jobs.map(j => (
                            <div key={j._id} className="text-xs mb-1">
                              • {j.title} - Status: <strong>{j.status}</strong>
                            </div>
                          ))}
                          <p className="text-xs text-muted-foreground mt-2">
                            Active jobs must have status 'accepted' or 'in_progress'
                          </p>
                        </div>
                      </div>
                    ) : (
                      jobs.filter(job => ['accepted', 'in_progress'].includes(job.status)).map((job) => (
                        <Card key={job._id} className="overflow-hidden">
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4 flex-1">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={typeof job.user === 'object' ? job.user.profileImage : undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {typeof job.user === 'object' ? `${job.user.firstName?.[0]}${job.user.lastName?.[0]}` : 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h4 className="font-semibold">{job.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {typeof job.user === 'object' && `${job.user.firstName} ${job.user.lastName}`}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant={job.status === 'in_progress' ? 'default' : 'secondary'}>
                                    {job.status === 'in_progress' ? 'In Progress' : 'Accepted'}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(job.scheduledDate).toLocaleDateString()} at {job.scheduledTime}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedChatJob(job);
                                  setShowChatDialog(true);
                                }}
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Message
                              </Button>
                              <Button 
                                size="sm"
                                variant={expandedJobId === job._id ? "default" : "outline"}
                                onClick={() => setExpandedJobId(expandedJobId === job._id ? null : job._id)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                {expandedJobId === job._id ? 'Hide' : 'View'} Details
                              </Button>
                            </div>
                          </div>

                          {/* Expanded Job Details */}
                          {expandedJobId === job._id && (
                            <div className="border-t bg-muted/30 p-6 space-y-6">
                              {/* Job Information */}
                              <div className="space-y-3">
                                <h4 className="font-semibold text-base flex items-center gap-2">
                                  <CalendarIcon className="h-4 w-4" />
                                  Job Information
                                </h4>
                                <div className="grid gap-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Category:</span>
                                    <span className="font-medium">{job.category}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status:</span>
                                    <Badge variant={job.status === 'in_progress' ? 'default' : 'secondary'}>
                                      {job.status === 'in_progress' ? 'In Progress' : 'Accepted'}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Scheduled:</span>
                                    <span className="font-medium">
                                      {new Date(job.scheduledDate).toLocaleDateString()} at {job.scheduledTime}
                                    </span>
                                  </div>
                                  {job.estimatedDuration && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Duration:</span>
                                      <span className="font-medium">{job.estimatedDuration} hours</span>
                                    </div>
                                  )}
                                  {job.budget && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Budget:</span>
                                      <span className="font-medium">₹{job.budget.min || 0} - ₹{job.budget.max || 0}</span>
                                    </div>
                                  )}
                                  {job.finalPrice && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Final Price:</span>
                                      <span className="font-medium text-success">₹{job.finalPrice}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="border-t pt-4" />

                              {/* Location */}
                              <div className="space-y-3">
                                <h4 className="font-semibold text-base flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  Location
                                </h4>
                                <div className="text-sm space-y-1">
                                  <p className="font-medium">{job.location?.address || 'Address not specified'}</p>
                                  <p className="text-muted-foreground">
                                    {job.location?.city}, {job.location?.state} {job.location?.zipCode}
                                  </p>
                                  {job.location?.coordinates?.lat && job.location?.coordinates?.lng && (
                                    <a
                                      className="text-primary hover:underline inline-flex items-center gap-1 mt-2"
                                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${job.location.coordinates.lat},${job.location.coordinates.lng}`)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Navigation className="h-3 w-3" />
                                      Get Directions
                                    </a>
                                  )}
                                </div>
                              </div>

                              <div className="border-t pt-4" />

                              {/* Customer Details */}
                              {typeof job.user === 'object' && (
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-base flex items-center gap-2">
                                    <UserIcon className="h-4 w-4" />
                                    Customer Details
                                  </h4>
                                  <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                                    <Avatar className="h-12 w-12">
                                      <AvatarImage src={job.user.profileImage} />
                                      <AvatarFallback className="bg-primary/10 text-primary">
                                        {job.user.firstName?.[0]}{job.user.lastName?.[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-2">
                                      <p className="font-semibold">
                                        {job.user.firstName} {job.user.lastName}
                                      </p>
                                      <div className="flex flex-wrap gap-3 text-xs">
                                        {job.user.phone && (
                                          <a href={`tel:${job.user.phone}`} className="flex items-center gap-1 text-muted-foreground hover:text-primary">
                                            <Phone className="h-3 w-3" />
                                            {job.user.phone}
                                          </a>
                                        )}
                                        {job.user.email && (
                                          <a href={`mailto:${job.user.email}`} className="flex items-center gap-1 text-muted-foreground hover:text-primary">
                                            <Mail className="h-3 w-3" />
                                            {job.user.email}
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </Card>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Completed Jobs</CardTitle>
                    <CardDescription>Your job history and earnings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoadingJobs ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading completed jobs...</p>
                      </div>
                    ) : completedJobs.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No completed jobs yet</p>
                        <p className="text-sm text-muted-foreground">Complete jobs to see them here</p>
                      </div>
                    ) : (
                      completedJobs.map((job) => (
                        <div key={job._id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarFallback>
                                {job.user?.firstName?.[0]}{job.user?.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-semibold">{job.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {job.user?.firstName} {job.user?.lastName} •
                                <a
                                  className="underline-offset-2 hover:underline"
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${job.location.address}, ${job.location.city}, ${job.location.state} ${job.location.zipCode || ''}`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {job.location.address}
                                </a>
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <Badge variant="default" className="bg-success text-success-foreground">
                                  Completed
                                </Badge>
                                {job.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-warning text-warning" />
                                    <span className="text-sm font-medium">{job.rating}</span>
                                  </div>
                                )}
                                {job.finalPrice && (
                                  <Badge variant="outline" className="text-success">
                                    ${job.finalPrice}
                                  </Badge>
                                )}
                                {renderCashPaymentStatus(job)}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Earnings & Payouts</h2>
              <Button 
                onClick={() => setIsPayoutDialogOpen(true)}
                disabled={!payoutBalance?.availableBalance || payoutBalance?.availableBalance <= 0 || isLoadingPayoutBalance}
              >
                {isLoadingPayoutBalance ? 'Loading...' : 'Request Payout'}
              </Button>
            </div>

            {/* Bank Account Section */}
            {user && (
              <BankAccountForm 
                professional={user} 
                onUpdate={(updatedProfessional) => {
                  updateUserLocal(updatedProfessional);
                }} 
              />
            )}

            {/* Earnings Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <DollarSign className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Earnings (After 10% Fee)</p>
                      <p className="text-2xl font-bold">
                        ₹{isLoadingPayoutBalance ? '...' : (payoutBalance?.totalEarnings || dashboardStats?.totalEarnings || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Available Balance</p>
                      <p className="text-2xl font-bold text-accent">
                        ₹{isLoadingPayoutBalance ? '...' : (payoutBalance?.availableBalance || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">This Month (After Fee)</p>
                      <p className="text-2xl font-bold">
                        ₹{isLoadingStats ? '...' : (dashboardStats?.monthlyEarnings || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-warning/10 rounded-lg">
                      <Clock className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Jobs Completed</p>
                      <p className="text-2xl font-bold">
                        {isLoadingStats ? '...' : dashboardStats?.completedJobs || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Completed Jobs with Earnings */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Completed Jobs</CardTitle>
                <CardDescription>Jobs completed with earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedJobs.length > 0 ? (
                    completedJobs.map((job) => (
                      <div key={job._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{job.title}</h4>
                            <Badge variant={job.paymentMethod === 'cash' ? 'default' : 'secondary'}>
                              {job.paymentMethod === 'cash' ? 'Cash' : 'Online'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Completed on {new Date(job.completedAt || job.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-success">
                            ₹{(job.commission?.providerEarnings || job.finalPrice || job.budget?.max || 0).toFixed(2)}
                          </p>
                          {job.paymentMethod === 'online' && job.commission && (
                            <p className="text-xs text-muted-foreground">
                              (₹{job.finalPrice?.toFixed(2)} - 10% fee)
                            </p>
                          )}
                          {job.paymentMethod === 'cash' && (
                            <p className="text-xs text-muted-foreground">
                              (No platform fee)
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {job.location?.city}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No completed jobs yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payout History Component */}
            <PayoutHistory />

            {/* Payout Request Dialog */}
            {user && (
              <PayoutRequestDialog
                isOpen={isPayoutDialogOpen}
                onOpenChange={setIsPayoutDialogOpen}
                professional={user as Professional}
                availableBalance={payoutBalance?.availableBalance || 0}
                onSuccess={handlePayoutSuccess}
              />
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Customer Reviews</h2>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-warning text-warning" />
                <span className="text-lg font-bold">
                  {user?.rating?.average?.toFixed(1) || '0.0'}
                </span>
                <span className="text-muted-foreground">
                  ({user?.rating?.count || 0} reviews)
                </span>
              </div>
            </div>

            <ReviewsDisplay type="received" professionalId={user?._id} />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Notifications</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={loadNotifications}
              >
                Refresh
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No notifications</p>
                    <p className="text-sm text-muted-foreground">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`flex items-start gap-4 p-4 rounded-lg border ${
                          !notification.isRead ? 'bg-accent/5 border-accent/20' : 'bg-muted/20'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          notification.type === 'job_created' ? 'bg-primary/10' :
                          notification.type === 'payment_received' ? 'bg-success/10' :
                          notification.type === 'review_received' ? 'bg-warning/10' :
                          'bg-muted/10'
                        }`}>
                          {notification.type === 'job_created' && <Wrench className="h-4 w-4 text-primary" />}
                          {notification.type === 'payment_received' && <DollarSign className="h-4 w-4 text-success" />}
                          {notification.type === 'review_received' && <Star className="h-4 w-4 text-warning" />}
                          {!['job_created', 'payment_received', 'review_received'].includes(notification.type) &&
                            <Bell className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{notification.title}</h4>
                            <span className="text-xs text-muted-foreground">{new Date(notification.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                        </div>
                        {!notification.isRead && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            New
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-xl font-semibold">Performance Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="hover-scale">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Job Acceptance Rate</p>
                      <p className="text-2xl font-bold">95%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-scale">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Completion Time</p>
                      <p className="text-2xl font-bold">2.3h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-scale">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-success" />
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Growth</p>
                      <p className="text-2xl font-bold">+12%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-scale">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Wrench className="h-5 w-5 text-warning" />
                    <div>
                      <p className="text-sm text-muted-foreground">Popular Service</p>
                      <p className="text-xl font-bold">Plumbing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-xl font-semibold">Profile & Services</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Picture Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>Upload a professional photo to build trust with customers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-32 w-32 ring-4 ring-accent/20">
                      <AvatarImage src={user.profileImage || "/placeholder.svg"} />
                      <AvatarFallback className="bg-accent/10 text-accent font-semibold text-2xl">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="hidden"
                        id="profile-image-upload"
                      />
                      <label
                        htmlFor="profile-image-upload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <UserIcon className="h-4 w-4 mr-2" />
                        Change Photo
                      </label>
                      <p className="text-xs text-muted-foreground mt-2">
                        JPG, PNG or GIF. Max size 5MB.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                  <CardDescription>Update your business details and services</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Business Name</label>
                    <input 
                      className="w-full mt-1 p-2 border rounded" 
                      defaultValue={(user as Professional).businessName || `${user.firstName}'s Services`}
                      placeholder="Enter your business name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Services Offered</label>
                    <div className="mt-2 space-y-2">
                      {['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning', 'Appliance Repair', 'HVAC', 'Landscaping', 'Handyman', 'Other'].map((service) => (
                        <label key={service} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={profileData.services.includes(service)}
                            onChange={() => handleServiceChange(service)}
                            className="rounded"
                          />
                          <span className="text-sm">{service}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Experience (Years)</label>
                    <input 
                      type="number" 
                      className="w-full mt-1 p-2 border rounded" 
                      defaultValue={(user as Professional).experience || 0}
                      min="0"
                      max="50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Bio</label>
                    <textarea 
                      className="w-full mt-1 p-2 border rounded" 
                      rows={3}
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      placeholder="Tell customers about your expertise and experience..."
                    />
                  </div>
                  <Button 
                    className="w-full"
                    onClick={handleUpdateProfile}
                    disabled={isUpdatingProfile}
                  >
                    {isUpdatingProfile ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Profile'
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Work Location & Service Area</CardTitle>
                  <CardDescription>Choose where you want to work and your service coverage area</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">City</label>
                      <Input
                        className="w-full mt-1"
                        value={profileData.city}
                        onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                        placeholder="e.g., Mumbai, Bangalore"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">State</label>
                      <select 
                        className="w-full mt-1 p-2 border rounded-md"
                        value={(user as Professional).address?.state || ''}
                        onChange={(e) => setProfileData({ 
                          ...profileData, 
                          address: { ...profileData.address, state: e.target.value } 
                        })}
                      >
                        <option value="">Select State</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                        <option value="Assam">Assam</option>
                        <option value="Bihar">Bihar</option>
                        <option value="Chhattisgarh">Chhattisgarh</option>
                        <option value="Goa">Goa</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                        <option value="Jharkhand">Jharkhand</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Manipur">Manipur</option>
                        <option value="Meghalaya">Meghalaya</option>
                        <option value="Mizoram">Mizoram</option>
                        <option value="Nagaland">Nagaland</option>
                        <option value="Odisha">Odisha</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Sikkim">Sikkim</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Tripura">Tripura</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Uttarakhand">Uttarakhand</option>
                        <option value="West Bengal">West Bengal</option>
                        <option value="Delhi">Delhi</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">PIN Code</label>
                      <Input
                        className="w-full mt-1"
                        value={profileData.zipCode}
                        onChange={(e) => {
                          // Only allow numbers and limit to 6 digits
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setProfileData({ ...profileData, zipCode: value });
                        }}
                        placeholder="e.g., 400001"
                        maxLength={6}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        6-digit Indian PIN code
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Service Area (Optional)</label>
                    <Input
                      className="w-full mt-1"
                      placeholder="e.g., Andheri, Bandra, Juhu (specific areas you serve)"
                      value={profileData.serviceArea?.areas?.join(', ') || ''}
                      onChange={(e) => {
                        const areas = e.target.value.split(',').map(area => area.trim()).filter(Boolean);
                        setProfileData({ 
                          ...profileData, 
                          serviceArea: { 
                            radius: profileData.serviceArea?.radius || 10,
                            areas 
                          } 
                        });
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Comma-separated list of specific areas you serve within your city</p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">📍 Location Matching</h4>
                    <p className="text-sm text-blue-800">
                      Jobs will be matched based on your city, state, and PIN code. 
                      If you specify service areas, you'll get priority for jobs in those specific areas.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Keep your contact details up to date</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <input 
                      className="w-full mt-1 p-2 border rounded" 
                      defaultValue={user.email || ''}
                      type="email"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <input 
                      className="w-full mt-1 p-2 border rounded" 
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Address</label>
                    <input 
                      className="w-full mt-1 p-2 border rounded" 
                      value={(user as Professional).address?.street || ''}
                      readOnly
                      placeholder="Street address (set via profile)"
                    />
                  </div>
                  <Button 
                    className="w-full"
                    onClick={handleUpdateProfile}
                    disabled={isUpdatingProfile}
                  >
                    {isUpdatingProfile ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Services in Your Area</CardTitle>
                  <CardDescription>Services available in {(user as Professional).city || 'your location'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {currentLocationServices.map((service, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-accent/5 border border-accent/20">
                        <Wrench className="h-4 w-4 text-accent" />
                        <span className="text-sm font-medium">{service}</span>
                        <Badge variant="outline" className="ml-auto text-xs">Active</Badge>
                      </div>
                    ))}
                    {currentLocationServices.length === 0 && (
                      <div className="col-span-2 text-center py-4 text-muted-foreground">
                        <Globe className="h-8 w-8 mx-auto mb-2" />
                        <p>No services configured for your area</p>
                        <p className="text-xs">Update your location to see available services</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <Support userType="professional" />
          </TabsContent>
        </Tabs>
      </div>

      {/* Complete Job Dialog */}
      <Dialog open={isCompleteJobDialogOpen} onOpenChange={setIsCompleteJobDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Mark this job as complete. The fixed price will be charged to the customer.
              </p>
              {selectedJob && (
                <div className="p-4 bg-muted/50 rounded-lg mb-4">
                  <h4 className="font-semibold mb-2">{selectedJob.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {typeof selectedJob.user === 'string' ? 'Customer' : `${selectedJob.user.firstName} ${selectedJob.user.lastName}`}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Category:</span>
                      <span className="text-sm font-medium">{selectedJob.category}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Fixed Service Price:</span>
                      <span className="text-lg font-bold text-primary">₹{finalPrice || 0}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Fixed Pricing</p>
                  <p className="text-xs text-muted-foreground">
                    This is the fixed price for {selectedJob?.category} services. Customer can add a tip during payment.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">₹{finalPrice || 0}</p>
                  <p className="text-xs text-muted-foreground">Base Amount</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsCompleteJobDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCompleteJob}
                disabled={!finalPrice || finalPrice <= 0}
              >
                Mark as Complete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cash Verification Dialog */}
      <Dialog open={showCashVerificationDialog} onOpenChange={setShowCashVerificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Cash Payment</DialogTitle>
          </DialogHeader>
          {currentVerificationJob && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-3">{currentVerificationJob.title}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Service Amount:</span>
                    <span className="text-sm font-medium">₹{currentVerificationJob.finalPrice - (currentVerificationJob.tipAmount || 0)}</span>
                  </div>
                  {currentVerificationJob.tipAmount && currentVerificationJob.tipAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Tip Amount:</span>
                      <span className="text-sm font-medium text-green-600">₹{currentVerificationJob.tipAmount}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-semibold">Total Collected:</span>
                      <span className="text-xl font-bold text-primary">₹{currentVerificationJob.finalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Did you collect this payment in cash from the customer?
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCashVerificationDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmVerification}>
                  Yes, I Received Payment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      {selectedChatJob && typeof selectedChatJob.user === 'object' && (
        <ChatDialog
          open={showChatDialog}
          onOpenChange={setShowChatDialog}
          jobId={selectedChatJob._id}
          otherUser={{
            _id: selectedChatJob.user._id,
            firstName: selectedChatJob.user.firstName,
            lastName: selectedChatJob.user.lastName,
            profileImage: selectedChatJob.user.profileImage,
            phone: selectedChatJob.user.phone,
          }}
          jobTitle={selectedChatJob.title}
        />
      )}
    </div>
  );
};

export default ProviderDashboard;