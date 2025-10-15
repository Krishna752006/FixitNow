import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { api, Job, Notification } from '@/services/api';
import { toast } from '@/components/ui/use-toast';

interface RealTimeContextType {
  jobs: Job[];
  availableJobs: Job[];
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  refreshData: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  updateJobStatus: (jobId: string, status: string) => Promise<void>;
  sendMessage: (jobId: string, message: string) => Promise<void>;
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(undefined);

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (context === undefined) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
};

interface RealTimeProviderProps {
  children: ReactNode;
}

export const RealTimeProvider: React.FC<RealTimeProviderProps> = ({ children }) => {
  const { user, userType, isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Refresh all data
  const refreshData = async () => {
    if (!isAuthenticated || !user) return;

    try {
      setIsConnected(true);

      // Load jobs based on user type
      if (userType === 'user') {
        const jobsResponse = await api.getJobs(1, 50);
        if (jobsResponse.success) {
          setJobs(jobsResponse.data.jobs);
        }
      } else if (userType === 'professional') {
        const [jobsResponse, availableJobsResponse] = await Promise.all([
          api.getProfessionalJobs(1, 50),
          api.getAvailableJobs(1, 50)
        ]);

        if (jobsResponse.success) {
          setJobs(jobsResponse.data.jobs);
        }

        if (availableJobsResponse.success) {
          setAvailableJobs(availableJobsResponse.data.jobs);
        }
      }

      // Load notifications
      const notificationsResponse = userType === 'user'
        ? await api.getUserNotifications(1, 20)
        : await api.getProfessionalNotifications(1, 20);

      if (notificationsResponse.success) {
        setNotifications(notificationsResponse.data.notifications);
        setUnreadCount(notificationsResponse.data.notifications.filter(n => !n.isRead).length);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error refreshing data:', error);
      setIsConnected(false);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = userType === 'user'
        ? await api.markUserNotificationAsRead(notificationId)
        : await api.markProfessionalNotificationAsRead(notificationId);

      if (response.success) {
        setNotifications(prev =>
          prev.map(notification =>
            notification._id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      const response = userType === 'user'
        ? await api.markAllNotificationsAsRead()
        : await api.markAllProfessionalNotificationsAsRead();
      if (response.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        toast({ title: 'All caught up', description: 'All notifications marked as read' });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({ title: 'Error', description: 'Failed to mark all as read', variant: 'destructive' });
    }
  };

  // Update job status
  const updateJobStatus = async (jobId: string, status: string) => {
    try {
      let response;

      if (userType === 'professional') {
        switch (status) {
          case 'accepted':
            response = await api.acceptJob(jobId);
            break;
          case 'in_progress':
            response = await api.startJob(jobId);
            break;
          case 'completed':
            response = await api.completeJob(jobId);
            break;
          default:
            throw new Error('Invalid status for professional');
        }
      } else {
        // User can cancel jobs
        if (status === 'cancelled') {
          response = await api.cancelJob(jobId);
        } else {
          throw new Error('Invalid status for user');
        }
      }

      if (response?.success) {
        // Refresh data to get updated job
        await refreshData();

        const titles: Record<string, string> = {
          accepted: 'Job Accepted',
          in_progress: 'Job Started',
          completed: 'Job Completed',
          cancelled: 'Job Cancelled',
        };
        toast({
          title: titles[status] || 'Status Updated',
          description: `Job status updated to ${status}`,
        });
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive",
      });
    }
  };

  // Send message in job
  const sendMessage = async (jobId: string, message: string) => {
    try {
      const response = await api.sendJobMessage(jobId, message);
      if (response.success) {
        // Refresh data to get updated job with new message
        await refreshData();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  // Initial data load
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshData();
    }
  }, [isAuthenticated, user, userType]);

  // Disable polling; use event-driven refresh only
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    // Intentionally no interval here; components should call refreshData on meaningful events
    return () => {};
  }, [isAuthenticated, user, userType]);

  // Listen for job status changes and show notifications
  useEffect(() => {
    if (jobs.length === 0) return;

    // Check for new job status changes
    const checkForUpdates = () => {
      jobs.forEach(job => {
        // Show toast for status changes (you can enhance this with more sophisticated tracking)
        if (job.status === 'accepted' && userType === 'user') {
          // Could show notification for newly accepted jobs
        }
      });
    };

    checkForUpdates();
  }, [jobs, userType]);

  // Show real-time notifications
  useEffect(() => {
    if (notifications.length === 0) return;

    // Show toast for new unread notifications
    const newNotifications = notifications.filter(n =>
      !n.isRead &&
      new Date(n.createdAt) > new Date(Date.now() - 15000) // Last 15 seconds
    );

    newNotifications.forEach(notification => {
      // Show toast for important notification types
      if (notification.type === 'job_accepted' ||
          notification.type === 'job_completed' ||
          notification.type === 'job_cancelled' ||
          notification.type === 'payment_received' ||
          notification.type === 'payment_due' ||
          notification.type === 'profile_verified' ||
          notification.type === 'bank_verification_completed' ||
          notification.type === 'bank_verification_failed') {
        
        // Use different styling for different notification types
        const isPaymentNotification = notification.type === 'payment_received';
        const isPaymentDueNotification = notification.type === 'payment_due';
        const isVerificationNotification = notification.type === 'profile_verified' || 
                                          notification.type === 'bank_verification_completed';
        const isErrorNotification = notification.type === 'bank_verification_failed';
        
        toast({
          title: notification.title,
          description: notification.message,
          variant: isErrorNotification ? 'destructive' : 'default',
          className: isPaymentNotification ? 'bg-green-50 border-green-200 text-green-800' :
                    isPaymentDueNotification ? 'bg-orange-50 border-orange-200 text-orange-800' :
                    isVerificationNotification ? 'bg-blue-50 border-blue-200 text-blue-800' :
                    isErrorNotification ? 'bg-red-50 border-red-200 text-red-800' : undefined,
        });
      }
    });
  }, [notifications]);

  const value: RealTimeContextType = {
    jobs,
    availableJobs,
    notifications,
    unreadCount,
    isConnected,
    refreshData,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    updateJobStatus,
    sendMessage,
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
};

export default RealTimeProvider;
