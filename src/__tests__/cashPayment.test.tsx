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
  });

  // Customer Payment Confirmation Tests
  describe('Customer Payment Confirmation', () => {
    it('should update status to cash_pending when customer confirms', async () => {
      (api.confirmCashPayment as jest.Mock).mockResolvedValue({
        success: true,
        data: { job: { ...mockJob, paymentStatus: 'cash_pending' } }
      });

      render(
        <MemoryRouter initialEntries={['/user/dashboard']}>
          <Routes>
            <Route path="/user/dashboard" element={<UserDashboard />} />
          </Routes>
        </MemoryRouter>
      );

      fireEvent.click(await screen.findByText('Pay Now'));
      fireEvent.click(await screen.findByText('Payment Completed'));

      await waitFor(() => {
        expect(api.confirmCashPayment).toHaveBeenCalled();
        expect(toast).toHaveBeenCalledWith({
          title: 'Payment Confirmed',
          description: 'The cash payment has been recorded'
        });
      });
    });

    it('should record transaction history', async () => {
      (api.confirmCashPayment as jest.Mock).mockResolvedValue({
        success: true,
        data: { 
          job: { ...mockJob, paymentStatus: 'cash_pending' },
          transaction: {
            _id: 'txn123',
            amount: 100,
            type: 'cash_payment',
            status: 'pending'
          }
        }
      });

      render(
        <MemoryRouter initialEntries={['/user/dashboard']}>
          <Routes>
            <Route path="/user/dashboard" element={<UserDashboard />} />
          </Routes>
        </MemoryRouter>
      );

      fireEvent.click(await screen.findByText('Pay Now'));
      fireEvent.click(await screen.findByText('Payment Completed'));

      await waitFor(() => {
        expect(api.getTransactions).toHaveBeenCalled();
        expect(screen.getByText('Pending Cash Payment')).toBeInTheDocument();
      });
    });
  });

  // Provider Verification Tests
  describe('Provider Verification', () => {
    it('should update status to cash_verified when provider verifies', async () => {
      (api.verifyCashPayment as jest.Mock).mockResolvedValue({
        success: true,
        data: { job: { ...mockJob, paymentStatus: 'cash_verified' } }
      });

      render(
        <MemoryRouter initialEntries={['/provider/dashboard']}>
          <Routes>
            <Route path="/provider/dashboard" element={<ProviderDashboard />} />
          </Routes>
        </MemoryRouter>
      );

      fireEvent.click(await screen.findByText('Verify Payment'));

      await waitFor(() => {
        expect(api.verifyCashPayment).toHaveBeenCalled();
        expect(toast).toHaveBeenCalledWith({
          title: 'Success',
          description: 'Cash payment verified successfully'
        });
      });
    });

    it('should update provider earnings', async () => {
      (api.verifyCashPayment as jest.Mock).mockResolvedValue({
        success: true,
        data: { 
          job: { ...mockJob, paymentStatus: 'cash_verified' },
          payoutBalance: {
            availableBalance: 100,
            pendingAmount: 0
          }
        }
      });

      render(
        <MemoryRouter initialEntries={['/provider/dashboard']}>
          <Routes>
            <Route path="/provider/dashboard" element={<ProviderDashboard />} />
          </Routes>
        </MemoryRouter>
      );

      fireEvent.click(await screen.findByText('Verify Payment'));

      await waitFor(() => {
        expect(api.getPayoutBalance).toHaveBeenCalled();
        expect(screen.getByText('₹100.00 available')).toBeInTheDocument();
      });
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should handle unverified payments', async () => {
      (api.confirmCashPayment as jest.Mock).mockResolvedValue({
        success: true,
        data: { job: { ...mockJob, paymentStatus: 'cash_pending' } }
      });

      render(
        <MemoryRouter initialEntries={['/user/dashboard']}>
          <Routes>
            <Route path="/user/dashboard" element={<UserDashboard />} />
          </Routes>
        </MemoryRouter>
      );

      fireEvent.click(await screen.findByText('Pay Now'));
      fireEvent.click(await screen.findByText('Payment Completed'));

      await waitFor(() => {
        expect(screen.getByText('Awaiting Verification')).toBeInTheDocument();
      });
    });

    it('should prevent premature verification', async () => {
      (api.verifyCashPayment as jest.Mock).mockRejectedValue(
        new Error('Payment not confirmed')
      );

      render(
        <MemoryRouter initialEntries={['/provider/dashboard']}>
          <Routes>
            <Route path="/provider/dashboard" element={<ProviderDashboard />} />
          </Routes>
        </MemoryRouter>
      );

      fireEvent.click(await screen.findByText('Verify Payment'));

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to verify cash payment',
          variant: 'destructive'
        });
      });
    });

    it('should prevent duplicate verifications', async () => {
      (api.verifyCashPayment as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Payment already verified'
      });

      render(
        <MemoryRouter initialEntries={['/provider/dashboard']}>
          <Routes>
            <Route path="/provider/dashboard" element={<ProviderDashboard />} />
          </Routes>
        </MemoryRouter>
      );

      fireEvent.click(await screen.findByText('Verify Payment'));
      fireEvent.click(await screen.findByText('Verify Payment'));

      await waitFor(() => {
        expect(api.verifyCashPayment).toHaveBeenCalledTimes(1);
        expect(toast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Payment already verified',
          variant: 'destructive'
        });
      });
    });
  });
});
