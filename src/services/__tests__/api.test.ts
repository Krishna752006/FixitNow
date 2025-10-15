import { jest } from 'jest';
import fetchMock from 'jest-fetch-mock';
import { api } from '../api';

// Setup fetch mocking
beforeAll(() => {
  fetchMock.enableMocks();
});

afterEach(() => {
  fetchMock.resetMocks();
});

describe('Cash Payment API Endpoints', () => {
  it('should call confirmCashPayment endpoint correctly', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({
      success: true,
      data: { job: { _id: 'job123', paymentStatus: 'cash_pending' } }
    }));

    const response = await api.confirmCashPayment({
      jobId: 'job123',
      professionalId: 'prof456',
      amount: 100
    });

    expect(response.success).toBe(true);
    expect(response.data?.job.paymentStatus).toBe('cash_pending');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/payments/cash/confirm'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          jobId: 'job123',
          professionalId: 'prof456',
          amount: 100
        })
      })
    );
  });

  it('should call verifyCashPayment endpoint correctly', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({
      success: true,
      data: { job: { _id: 'job123', paymentStatus: 'cash_verified' } }
    }));

    const response = await api.verifyCashPayment('job123');

    expect(response.success).toBe(true);
    expect(response.data?.job.paymentStatus).toBe('cash_verified');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/payments/cash/job123/verify'),
      expect.objectContaining({
        method: 'POST'
      })
    );
  });
});
