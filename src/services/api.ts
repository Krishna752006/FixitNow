// API Configuration
import { API_BASE_URL } from '../config/environment';

// Types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: 'user' | 'professional';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive?: boolean; // account/availability status
  addresses?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
    coordinates?: { lat: number; lng: number };
    label?: string;
    isDefault?: boolean;
  }[];
  address?: { // Keep single address for backward compatibility
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
    coordinates?: { lat: number; lng: number };
  };
  profileImage?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences?: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      showPhone: boolean;
      showEmail: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface Professional extends User {
  services: string[];
  experience: number;
  city: string;
  bio?: string;
  businessName?: string;
  zipCode?: string;
  serviceArea?: { radius?: number };
  locationPoint?: { type: 'Point'; coordinates: [number, number] };
  verificationStatus: 'pending' | 'in_review' | 'verified' | 'rejected';
  isBusy?: boolean;
  currentJob?: string;
  rating: {
    average: number;
    count: number;
  };
  bankAccount?: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branchName?: string;
    accountType: 'savings' | 'current';
    isVerified: boolean;
    addedAt: string;
  };
}

export interface ProfessionalExtended extends Professional {
  zipCode?: string;
  serviceArea?: { radius?: number };
  locationPoint?: { type: 'Point'; coordinates: [number, number] };
}


export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user?: User;
    professional?: Professional;
    token: string;
  };
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface SignupUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface SignupProfessionalData extends SignupUserData {
  services: string[];
  experience: number;
  city: string;
  bio?: string;
}

export interface LoginData {
  identifier: string; // email or phone
  password: string;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  user: string | User;
  professional?: Professional;
  location: {
    address: string;
    city: string;
    state?: string;
    zipCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number;
  budget?: {
    min?: number;
    max?: number;
    currency: string;
  };
  finalPrice?: number;
  tipAmount?: number;
  commission?: {
    total: number;
    companyFee: number;
    providerEarnings: number;
    commissionRate: number;
  };
  paymentMethod?: 'online' | 'cash';
  paymentStatus: 'pending' | 'paid' | 'verified' | 'refunded' | 'cash_pending' | 'cash_verified' | 'payment_received' | 'payment_confirmed';
  cashPaymentDetails?: {
    professionalMarkedReceived?: boolean;
    professionalReceivedAt?: string;
    customerConfirmed?: boolean;
    customerConfirmedAt?: string;
    professionalVerified?: boolean;
    verifiedAt?: string;
    receiptPhotos?: Array<{
      url: string;
      uploadedBy: 'professional' | 'customer';
      uploadedAt: string;
    }>;
    amount?: number;
    verificationCode?: string;
    disputeRaised?: boolean;
    disputeDetails?: {
      raisedBy: 'professional' | 'customer';
      reason: string;
      raisedAt: string;
      status: 'pending' | 'under_review' | 'resolved';
      resolution?: string;
      resolvedAt?: string;
    };
  };
  distance?: number; // Distance in meters from professional
  completedAt?: string;
  rating?: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  relatedJob?: Job;
  createdAt: string;
}

export interface PaymentMethod {
  _id: string;
  type: 'card' | 'bank' | 'digital_wallet';
  name: string;
  details: {
    cardNumber?: string;
    lastFour?: string;
    expiryMonth?: number;
    expiryYear?: number;
    cardType?: string;
    accountNumber?: string;
    routingNumber?: string;
    bankName?: string;
    walletType?: string;
    walletId?: string;
    holderName?: string;
  };
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface ChatMessage {
  _id: string;
  sender: User | Professional;
  senderModel: 'User' | 'Professional';
  message: string;
  timestamp: string;
}

export interface Conversation {
  _id: string;
  title: string;
  status: string;
  otherParty: User | Professional;
  lastMessage?: {
    message: string;
    timestamp: string;
    isFromMe: boolean;
  };
  unreadCount: number;
  updatedAt: string;
}

export interface DashboardStats {
  activeJobs: number;
  upcomingJobs: number;
  completedJobs: number;
  totalJobs: number;
  totalSpent: number;
  averageRating: number;
  unreadNotifications: number;
  memberSince: string;
}

export interface CreateJobData {
  title: string;
  description: string;
  category: string;
  priority?: string;
  location: {
    address: string;
    city: string;
    state?: string;
    zipCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration?: number;
  budget?: {
    min?: number;
    max?: number;
  };
  finalPrice?: number;
  professionalId?: string;
}

export interface ProfessionalStats {
  activeJobs: number;
  pendingJobs: number;
  completedJobs: number;
  totalJobs: number;
  totalEarnings: number;
  monthlyEarnings: number;
  averageRating: number;
  totalReviews: number;
  unreadNotifications: number;
  memberSince: string;
}

export interface Payout {
  _id: string;
  professional: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  bankAccount: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branchName?: string;
    accountType: 'savings' | 'current';
  };
  transactionReference?: string;
  processingFee: number;
  netAmount: number;
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  failureReason?: string;
  notes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccountData {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName?: string;
  accountType: 'savings' | 'current';
}

export interface PayoutBalance {
  totalEarnings: number;
  totalPaidOut: number;
  pendingAmount: number;
  availableBalance: number;
  minimumPayout: number;
}

// API Service Class
class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // For auth endpoints, return the data even if not ok (to handle validation errors)
      if (endpoint.includes('/auth/')) {
        return data;
      }

      if (!response.ok) {
        // Create error object with detailed validation errors if available
        const error: any = new Error(data.message || `HTTP error! status: ${response.status}`);
        if (data.errors) {
          error.errors = data.errors;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request('/health');
  }

  // User authentication
  async signupUser(userData: SignupUserData): Promise<AuthResponse> {
    return this.request('/auth/signup/user', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async signupProfessional(professionalData: SignupProfessionalData): Promise<AuthResponse> {
    return this.request('/auth/signup/professional', {
      method: 'POST',
      body: JSON.stringify(professionalData),
    });
  }

  async loginUser(loginData: LoginData): Promise<AuthResponse> {
    return this.request('/auth/login/user', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
  }

  async loginProfessional(loginData: LoginData): Promise<AuthResponse> {
    return this.request('/auth/login/professional', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
  }

  async getCurrentUser(): Promise<{
    success: boolean;
    data: {
      user: User | Professional;
      userType: 'user' | 'professional';
    };
  }> {
    return this.request('/auth/me');
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // User profile management
  async updateProfile(profileData: Partial<User>): Promise<{
    success: boolean;
    message: string;
    data?: { user: User };
  }> {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getDashboardStats(): Promise<{
    success: boolean;
    data: { stats: DashboardStats };
  }> {
    return this.request('/user/dashboard-stats');
  }

  // Notifications
  async getNotifications(page = 1, limit = 10): Promise<{
    success: boolean;
    data: {
      notifications: Notification[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalNotifications: number;
        unreadCount: number;
      };
    };
  }> {
    const userType = localStorage.getItem('userType');
    const endpoint = userType === 'professional' ? '/professional/notifications' : '/user/notifications';
    return this.request(`${endpoint}?page=${page}&limit=${limit}`);
  }

  async markNotificationAsRead(notificationId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const userType = localStorage.getItem('userType');
    const endpoint = userType === 'professional' ? '/professional/notifications' : '/user/notifications';
    return this.request(`${endpoint}/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(): Promise<{
    success: boolean;
    message: string;
  }> {
    const userType = localStorage.getItem('userType');
    const endpoint = userType === 'professional' ? '/professional/notifications' : '/user/notifications';
    return this.request(`${endpoint}/mark-all-read`, {
      method: 'PUT',
    });
  }

  // Aliases for user notifications (to match context expectations)
  async getUserNotifications(page = 1, limit = 10): Promise<{
    success: boolean;
    data: {
      notifications: Notification[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalNotifications: number;
        unreadCount: number;
      };
    };
  }> {
    return this.getNotifications(page, limit);
  }

  async markUserNotificationAsRead(notificationId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.markNotificationAsRead(notificationId);
  }

  // Address management
  async addAddress(addressData: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
    coordinates?: { lat: number; lng: number };
    label?: string;
    isDefault?: boolean;
  }): Promise<{
    success: boolean;
    message: string;
    data?: { user: User };
  }> {
    return this.request('/user/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async getAddresses(): Promise<{
    success: boolean;
    data: { addresses: {
      _id: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country?: string;
      coordinates?: { lat: number; lng: number };
      label?: string;
      isDefault?: boolean;
    }[] };
  }> {
    return this.request('/user/addresses');
  }

  async setDefaultAddress(addressId: string): Promise<{
    success: boolean;
    message: string;
    data?: { user: User };
  }> {
    return this.request(`/user/addresses/${addressId}/default`, {
      method: 'PUT',
    });
  }

  // Job management
  async createJob(jobData: CreateJobData): Promise<{
    success: boolean;
    message: string;
    data?: { job: Job };
  }> {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async scheduleJob(jobData: Omit<CreateJobData, 'title' | 'description' | 'budget'>): Promise<{
    success: boolean;
    message: string;
    data?: { job: Job };
  }> {
    const fullJobData: CreateJobData = {
      ...jobData,
      title: jobData.category,
      description: `Service request for ${jobData.category}`,
    };
    return this.createJob(fullJobData);
  }

  async debugLocation(params: { lat?: number; lng?: number; city?: string; zipCode?: string }): Promise<{
    success: boolean;
    data: {
      testLocation: any;
      matchingProfessionals: number;
      professionals: any[];
    };
  }> {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)])
    ).toString();
    return this.request(`/jobs/debug/location?${queryString}`);
  }

  async getJobs(page = 1, limit = 10, status?: string): Promise<{
    success: boolean;
    data: {
      jobs: Job[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalJobs: number;
      };
    };
  }> {
    const statusParam = status ? `&status=${status}` : '';
    return this.request(`/jobs?page=${page}&limit=${limit}${statusParam}`);
  }

  async getJob(jobId: string): Promise<{
    success: boolean;
    data: { job: Job };
  }> {
    return this.request(`/jobs/${jobId}`);
  }

  async getJobsPendingPayment(page = 1, limit = 10): Promise<{
    success: boolean;
    data: {
      jobs: Job[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalJobs: number;
      };
    };
  }> {
    return this.request(`/jobs/pending-payment?page=${page}&limit=${limit}`);
  }

  async updateJob(jobId: string, jobData: Partial<CreateJobData>): Promise<{
    success: boolean;
    message: string;
    data?: { job: Job };
  }> {
    return this.request(`/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  }

  async cancelJob(jobId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request(`/jobs/${jobId}`, {
      method: 'DELETE',
    });
  }

  async rateJob(jobId: string, rating: number, review?: string): Promise<{
    success: boolean;
    message: string;
    data?: { job: Job };
  }> {
    return this.request(`/jobs/${jobId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, review }),
    });
  }

  // Professional-specific endpoints
  async getProfessionalProfile(): Promise<{
    success: boolean;
    data: { professional: Professional };
  }> {
    return this.request('/professional/profile');
  }

  async updateProfessionalProfile(profileData: Partial<Professional>): Promise<{
    success: boolean;
    message: string;
    data?: { professional: Professional };
  }> {
    return this.request('/professional/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getProfessionalDashboardStats(): Promise<{
    success: boolean;
    data: { stats: ProfessionalStats };
  }> {
    return this.request('/professional/dashboard-stats');
  }

  async getProfessionalJobs(page = 1, limit = 10, status?: string): Promise<{
    success: boolean;
    data: {
      jobs: Job[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalJobs: number;
      };
    };
  }> {
    const statusParam = status ? `&status=${status}` : '';
    return this.request(`/professional/jobs?page=${page}&limit=${limit}${statusParam}`);
  }

  async getAvailableJobs(page = 1, limit = 10, city?: string): Promise<{
    success: boolean;
    data: {
      jobs: Job[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalJobs: number;
      };
    };
  }> {
    const cityParam = city ? `&city=${encodeURIComponent(city)}` : '';
    return this.request(`/professional/available-jobs?page=${page}&limit=${limit}${cityParam}`);
  }

  async debugJobMatching(): Promise<{
    success: boolean;
    data: {
      professional: {
        _id: string;
        services: string[];
        city: string;
        zipCode?: string;
        locationPoint?: { type: 'Point'; coordinates: [number, number] };
        serviceArea?: { radius?: number };
      };
      debug: {
        allPendingJobs: number;
        serviceMatchingJobs: number;
        cityMatchingJobs: number;
        fullyMatchingJobs: number;
        sampleJobs: Job[];
      };
    };
  }> {
    return this.request('/professional/debug/jobs');
  }

  async acceptJob(jobId: string): Promise<{
    success: boolean;
    message: string;
    data?: { job: Job };
  }> {
    return this.request(`/professional/jobs/${jobId}/accept`, {
      method: 'POST',
    });
  }

  async declineJob(jobId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request(`/professional/jobs/${jobId}/decline`, {
      method: 'POST',
    });
  }

  async startJob(jobId: string): Promise<{
    success: boolean;
    message: string;
    data?: { job: Job };
  }> {
    return this.request(`/professional/jobs/${jobId}/start`, {
      method: 'POST',
    });
  }

  async completeJob(jobId: string, finalPrice?: number, paymentMethod?: 'online' | 'cash'): Promise<{
    success: boolean;
    message: string;
    data?: { job: Job };
  }> {
    return this.request(`/professional/jobs/${jobId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ finalPrice, paymentMethod }),
    });
  }

  async sendJobMessage(jobId: string, message: string): Promise<{
    success: boolean;
    message: string;
    data?: { message: ChatMessage[] };
  }> {
    return this.request(`/jobs/${jobId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getJobMessages(jobId: string): Promise<{
    success: boolean;
    message: string;
    data?: { messages: ChatMessage[] };
  }> {
    return this.request(`/jobs/${jobId}/messages`);
  }

  async updateAvailability(isActive: boolean): Promise<{
    success: boolean;
    message: string;
    data?: { professional: Professional };
  }> {
    return this.request('/professional/availability', {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  }

  async getProfessionalNotifications(page = 1, limit = 10): Promise<{
    success: boolean;
    data: {
      notifications: Notification[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalNotifications: number;
        unreadCount: number;
      };
    };
  }> {
    return this.request(`/professional/notifications?page=${page}&limit=${limit}`);
  }

  // Chat methods
  async getChatMessages(jobId: string): Promise<{
    success: boolean;
    data: {
      job: {
        _id: string;
        title: string;
        status: string;
        user: User;

        professional?: Professional;
      };
      messages: ChatMessage[];
    };
  }> {
    return this.request(`/chat/jobs/${jobId}/messages`);
  }

  async markProfessionalNotificationAsRead(notificationId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request(`/professional/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllProfessionalNotificationsAsRead(): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request('/professional/notifications/mark-all-read', {
      method: 'PUT',
    });
  }

  async sendChatMessage(jobId: string, message: string): Promise<{
    success: boolean;
    message: string;
    data: { message: ChatMessage };
  }> {
    return this.request(`/chat/jobs/${jobId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getConversations(): Promise<{
    success: boolean;
    data: { conversations: Conversation[] };
  }> {
    return this.request('/chat/conversations');
  }

  async markMessagesAsRead(jobId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request(`/chat/jobs/${jobId}/read`, {
      method: 'PUT',
    });
  }

  // Professionals listing methods
  async getProfessionals(params: {
    page?: number;
    limit?: number;
    city?: string;
    service?: string;
    search?: string;
    minRating?: number;
    maxPrice?: number;
    sortBy?: string;
  } = {}): Promise<{
    success: boolean;
    data: {
      professionals: (Professional & { stats: { completedJobs: number; averageRating: number; totalEarnings: number } })[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalProfessionals: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
      filters: Record<string, unknown>;
    };
  }> {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)])
    ).toString();
    return this.request(`/professionals?${queryString}`);
  }

  async getPublicProfessionalProfile(id: string): Promise<{
    success: boolean;
    data: {
      professional: Professional & {
        stats: {
          completedJobs: number;
          averageRating: number;
          totalRatings: number;
          totalEarnings: number;
        };
        recentReviews: { rating: number; review: string; completedAt: string; user: { firstName: string; lastName: string } }[];
      };
    };
  }> {
    return this.request(`/professionals/${id}`);
  }

  async getServiceCategories(city?: string): Promise<{
    success: boolean;
    data: {
      categories: {
        _id: string;
        count: number;
        avgRating: number;
        avgHourlyRate: number;
      }[];
    };
  }> {
    const params = city ? new URLSearchParams({ city }) : '';
    return this.request(`/professionals/services/categories${params ? '?' + params : ''}`);
  }

  async getCities(): Promise<{
    success: boolean;
    data: {
      cities: {
        _id: string;
        count: number;
      }[];
    };
  }> {
    return this.request('/professionals/locations/cities');
  }

  async contactProfessional(id: string, data: {
    message: string;
    jobTitle: string;
    category: string;
  }): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request(`/professionals/${id}/contact`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Payment methods
  async getPaymentMethods(): Promise<{
    success: boolean;
    data: { paymentMethods: PaymentMethod[] };
  }> {
    return this.request('/payments/methods');
  }

  async addPaymentMethod(paymentMethod: {
    type: 'card' | 'bank' | 'digital_wallet';
    name: string;
    details: Record<string, unknown>;
    isDefault?: boolean;
  }): Promise<{
    success: boolean;
    message: string;
    data: { paymentMethod: PaymentMethod };
  }> {
    return this.request('/payments/methods', {
      method: 'POST',
      body: JSON.stringify(paymentMethod),
    });
  }

  async updatePaymentMethod(methodId: string, updates: {
    name?: string;
    isDefault?: boolean;
    isActive?: boolean;
  }): Promise<{
    success: boolean;
    message: string;
    data: { paymentMethod: PaymentMethod };
  }> {
    return this.request(`/payments/methods/${methodId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deletePaymentMethod(methodId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request(`/payments/methods/${methodId}`, {
      method: 'DELETE',
    });
  }

  async processPayment(jobId: string, data: {
    paymentMethodId: string;
    amount: number;
  }): Promise<{
    success: boolean;
    message: string;
    data: { job: Job };
  }> {
    return this.request(`/payments/jobs/${jobId}/pay`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTransactions(page = 1, limit = 10): Promise<{
    success: boolean;
    data: {
      transactions: {
        _id: string;
        title: string;
        finalPrice: number;
        paymentMethod: string;
        paidAt: string;
        professional: { firstName: string; lastName: string };
        status: string;
      }[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalTransactions: number;
      };
    };
  }> {
    return this.request(`/payments/transactions?page=${page}&limit=${limit}`);
  }

  // Razorpay integration
  async getRazorpayKey(): Promise<{
    success: boolean;
    data: { keyId: string };
  }> {
    return this.request('/payments/razorpay/key');
  }

  async createRazorpayOrder(data: {
    jobId: string;
    amount: number;
    currency?: string;
  }): Promise<{
    success: boolean;
    data: {
      order: {
        id: string;
        amount: number;
        currency: string;
        receipt: string;
      };
      keyId: string;
    };
  }> {
    return this.request('/payments/razorpay/order', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyRazorpayPayment(data: {
    jobId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: { job: Job };
  }> {
    return this.request('/payments/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Cash payment methods
  async confirmCashPayment(data: {
    jobId: string;
    professionalId: string;
    amount: number;
  }): Promise<{
    success: boolean;
    message: string;
    data?: { job: Job };
  }> {
    return this.request('/payments/cash/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyCashPayment(jobId: string): Promise<{
    success: boolean;
    message: string;
    data?: { job: Job };
  }> {
    return this.request(`/payments/cash/${jobId}/verify`, {
      method: 'POST',
    });
  }

  // Address Management
  async getUserAddresses(): Promise<{ success: boolean; data: { addresses: any[] } }> {
    return this.request('/user/addresses');
  }

  async addUserAddress(address: any): Promise<{ success: boolean; data: any }> {
    return this.request('/user/addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    });
  }

  async updateUserAddress(addressId: string, address: any): Promise<{ success: boolean; data: any }> {
    return this.request(`/user/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(address),
    });
  }

  async deleteUserAddress(addressId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/user/addresses/${addressId}`, {
      method: 'DELETE',
    });
  }

  // Bank Account and Payout Methods
  async updateBankAccount(data: BankAccountData): Promise<{
    success: boolean;
    message: string;
    data: { 
      professional: Professional;
      verification?: {
        status: string;
        verificationId?: string;
        error?: string;
      };
    };
  }> {
    return this.request('/professional/bank-account', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async verifyBankAccount(): Promise<{
    success: boolean;
    message: string;
    data: {
      professional: Professional;
      verification: {
        status: string;
        verificationId?: string;
        error?: string;
      };
    };
  }> {
    return this.request('/professional/verify-bank-account', {
      method: 'POST',
    });
  }

  async getBankVerificationStatus(): Promise<{
    success: boolean;
    data: {
      status: string;
      results?: any;
      isVerified: boolean;
    };
  }> {
    return this.request('/professional/bank-verification-status');
  }

  async requestPayout(amount: number, notes?: string): Promise<{
    success: boolean;
    message: string;
    data: { payout: Payout };
  }> {
    return this.request('/professional/request-payout', {
      method: 'POST',
      body: JSON.stringify({ amount, notes }),
    });
  }

  async getPayouts(page = 1, limit = 10): Promise<{
    success: boolean;
    data: {
      payouts: Payout[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalPayouts: number;
      };
    };
  }> {
    return this.request(`/professional/payouts?page=${page}&limit=${limit}`);
  }

  async getPayoutBalance(): Promise<{
    success: boolean;
    data: PayoutBalance;
  }> {
    return this.request('/professional/payout-balance');
  }

  async recordTransaction(data: {
    jobId: string;
    amount: number;
    type: string;
    status: string;
  }): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request('/payments/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProviderEarnings(jobId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request(`/professional/jobs/${jobId}/update-earnings`, {
      method: 'POST',
    });
  }

  // Admin/Configuration methods
  async setRazorpayCredentials(keyId: string, keySecret: string): Promise<{
    success: boolean;
    message: string;
    data?: {
      keyId: string;
      configured: boolean;
    };
  }> {
    return this.request('/admin/config/razorpay', {
      method: 'POST',
      body: JSON.stringify({ keyId, keySecret }),
    });
  }

  async getConfigStatus(): Promise<{
    success: boolean;
    data: {
      razorpay: {
        configured: boolean;
        keyId: string | null;
      };
    };
  }> {
    return this.request('/admin/config/status');
  }

  async resetRazorpayConfig(): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request('/admin/config/razorpay', {
      method: 'DELETE',
    });
  }

  // Profile image upload
  async uploadProfileImage(formData: FormData): Promise<{
    success: boolean;
    message: string;
    data?: { profileImage: string };
  }> {
    const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    
    const endpoint = userType === 'professional' ? '/professional/profile/image' : '/user/profile/image';
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  // Reviews API
  async submitReview(jobId: string, rating: number, review?: string, categories?: any): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    return this.request('/reviews/submit', {
      method: 'POST',
      body: JSON.stringify({ jobId, rating, review, categories }),
    });
  }

  async getProfessionalReviews(professionalId: string, page = 1, limit = 10): Promise<{
    success: boolean;
    data: {
      reviews: any[];
      totalPages: number;
      currentPage: number;
      total: number;
    };
  }> {
    return this.request(`/reviews/professional/${professionalId}?page=${page}&limit=${limit}`);
  }

  async getProfessionalById(professionalId: string): Promise<{
    success: boolean;
    data: {
      professional: Professional & {
        stats: {
          completedJobs: number;
          averageRating: number;
          totalRatings: number;
          totalEarnings: number;
        };
        recentReviews: any[];
      };
    };
  }> {
    return this.request(`/professionals/${professionalId}`);
  }

  async getMyReviews(page = 1, limit = 10): Promise<{
    success: boolean;
    data: {
      reviews: any[];
      totalPages: number;
      currentPage: number;
      total: number;
    };
  }> {
    return this.request(`/reviews/customer/my-reviews?page=${page}&limit=${limit}`);
  }

  async respondToReview(reviewId: string, responseText: string): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    return this.request(`/reviews/${reviewId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ responseText }),
    });
  }

  // Favorites API
  async addFavorite(professionalId: string, notes?: string): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    return this.request('/favorites/add', {
      method: 'POST',
      body: JSON.stringify({ professionalId, notes }),
    });
  }

  async removeFavorite(professionalId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request(`/favorites/remove/${professionalId}`, {
      method: 'DELETE',
    });
  }

  async getMyFavorites(): Promise<{
    success: boolean;
    data: {
      favorites: any[];
    };
  }> {
    return this.request('/favorites/my-favorites');
  }

  async checkFavoriteStatus(professionalId: string): Promise<{
    success: boolean;
    data: { isFavorite: boolean };
  }> {
    return this.request(`/favorites/check/${professionalId}`);
  }

  async getPreviousProfessionals(): Promise<{
    success: boolean;
    data: {
      previousProfessionals: any[];
    };
  }> {
    return this.request('/favorites/previous-professionals');
  }

  // Enhanced Payment API
  async markPaymentReceived(jobId: string, paymentMethod: string, amount: number): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    return this.request('/payment/mark-received', {
      method: 'POST',
      body: JSON.stringify({ jobId, paymentMethod, amount }),
    });
  }

  async confirmPayment(jobId: string, tipAmount?: number, verificationCode?: string): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    return this.request('/payment/confirm-payment', {
      method: 'POST',
      body: JSON.stringify({ jobId, tipAmount: tipAmount || 0, verificationCode }),
    });
  }

  async uploadReceipt(jobId: string, file: File): Promise<{
    success: boolean;
    message: string;
    data?: { receiptUrl: string };
  }> {
    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('receipt', file);

    const response = await fetch(`${this.baseURL}/payment/upload-receipt/${jobId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  async raisePaymentDispute(jobId: string, reason: string): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    return this.request('/payment/raise-dispute', {
      method: 'POST',
      body: JSON.stringify({ jobId, reason }),
    });
  }

  async getPaymentStatus(jobId: string): Promise<{
    success: boolean;
    data: {
      paymentStatus: string;
      paymentMethod: string;
      cashPaymentDetails: any;
      finalPrice: number;
    };
  }> {
    return this.request(`/payment/status/${jobId}`);
  }

  // Auto-assignment
  async toggleAutoAssignment(enabled: boolean): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request('/user/preferences/auto-assign', {
      method: 'PUT',
      body: JSON.stringify({ autoAssignProfessional: enabled }),
    });
  }
}

// Create and export API instance
export const api = new ApiService(API_BASE_URL);

// Helper functions
export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userType');
  localStorage.removeItem('userData');
};

export const setUserData = (user: User | Professional, userType: 'user' | 'professional') => {
  localStorage.setItem('userData', JSON.stringify(user));
  localStorage.setItem('userType', userType);
};

export const getUserData = (): { user: User | Professional; userType: 'user' | 'professional' } | null => {
  const userData = localStorage.getItem('userData');
  const userType = localStorage.getItem('userType');

  if (userData && userType) {
    return {
      user: JSON.parse(userData),
      userType: userType as 'user' | 'professional',
    };
  }

  return null;
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// Address Management Methods (add to ApiService class)
declare module './api' {
  interface ApiService {
    getUserAddresses(): Promise<{ success: boolean; data: { addresses: any[] } }>;
    addUserAddress(address: any): Promise<{ success: boolean; data: any }>;
    updateUserAddress(addressId: string, address: any): Promise<{ success: boolean; data: any }>;
    deleteUserAddress(addressId: string): Promise<{ success: boolean; message: string }>;
    setDefaultAddress(addressId: string): Promise<{ success: boolean; message: string }>;
  }
}
