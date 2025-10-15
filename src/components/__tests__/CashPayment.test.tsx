import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CashPayment } from '../CashPayment';
import { api } from '@/services/api';
import { toast } from '@/hooks/use-toast';

jest.mock('@/services/api');
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('CashPayment Component', () => {
  const mockProps = {
    jobId: 'job123',
    professionalId: 'prof456',
    amount: 100,
    onSuccess: jest.fn(),
    onCancel: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders payment details correctly', () => {
    render(<CashPayment {...mockProps} />);
    
    expect(screen.getByText(`Amount: ₹${mockProps.amount.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText('Please pay the professional directly and confirm here')).toBeInTheDocument();
    expect(screen.getByText('Payment Completed')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls confirmCashPayment API on button click', async () => {
    (api.confirmCashPayment as jest.Mock).mockResolvedValue({ success: true });
    
    render(<CashPayment {...mockProps} />);
    fireEvent.click(screen.getByText('Payment Completed'));
    
    await waitFor(() => {
      expect(api.confirmCashPayment).toHaveBeenCalledWith({
        jobId: 'job123',
        professionalId: 'prof456',
        amount: 100
      });
      expect(mockProps.onSuccess).toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith({
        title: 'Payment Confirmed',
        description: 'The cash payment has been recorded'
      });
    });
  });

  it('handles API errors gracefully', async () => {
    (api.confirmCashPayment as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    render(<CashPayment {...mockProps} />);
    fireEvent.click(screen.getByText('Payment Completed'));
    
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to confirm cash payment',
        variant: 'destructive'
      });
    });
  });
});
