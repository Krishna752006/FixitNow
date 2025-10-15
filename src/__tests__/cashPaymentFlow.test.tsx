import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { api } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import UserDashboard from '@/pages/UserDashboard';
import ProviderDashboard from '@/pages/ProviderDashboard';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

jest.mock('@/services/api');
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('Cash Payment Flow', () => {
  const mockJob = {
    _id: 'job123',
    title: 'Test Job',
    professional: 'prof456',
    finalPrice: 100,
    paymentMethod: 'cash',
    paymentStatus: 'pending'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock API responses
    (api.getJobsPendingPayment as jest.Mock).mockResolvedValue({
      success: true,
      data: { jobs: [mockJob] }
    });
    
    (api.confirmCashPayment as jest.Mock).mockResolvedValue({
      success: true,
      data: { 
        job: { ...mockJob, paymentStatus: 'cash_pending' }
      }
    });
    
    (api.verifyCashPayment as jest.Mock).mockResolvedValue({
      success: true,
      data: { 
        job: { ...mockJob, paymentStatus: 'cash_verified' }
      }
    });
  });

  it('should complete full cash payment flow', async () => {
    // Render user dashboard with pending payment
    render(
      <MemoryRouter initialEntries={['/user/dashboard']}>
        <Routes>
          <Route path="/user/dashboard" element={<UserDashboard />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Customer marks payment as complete
    await waitFor(() => {
      expect(screen.getByText('Pay Now')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Pay Now'));
    
    // Verify cash payment dialog appears
    await waitFor(() => {
      expect(screen.getByText('Cash Payment')).toBeInTheDocument();
    });
    
    // Customer confirms payment
    fireEvent.click(screen.getByText('Payment Completed'));
    
    await waitFor(() => {
      expect(api.confirmCashPayment).toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith({
        title: 'Payment Confirmed',
        description: 'The cash payment has been recorded'
      });
    });
    
    // Switch to provider dashboard
    render(
      <MemoryRouter initialEntries={['/provider/dashboard']}>
        <Routes>
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Provider verifies payment
    await waitFor(() => {
      expect(screen.getByText('Verify Payment')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Verify Payment'));
    
    await waitFor(() => {
      expect(api.verifyCashPayment).toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Cash payment verified successfully'
      });
    });
  });

  it('should handle edge case: provider verifies before customer', async () => {
    (api.verifyCashPayment as jest.Mock).mockRejectedValue(new Error('Payment not confirmed'));
    
    render(
      <MemoryRouter initialEntries={['/provider/dashboard']}>
        <Routes>
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Provider tries to verify before customer
    await waitFor(() => {
      expect(screen.getByText('Verify Payment')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Verify Payment'));
    
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to verify cash payment',
        variant: 'destructive'
      });
    });
  });
});
