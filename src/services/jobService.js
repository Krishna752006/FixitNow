import axios from 'axios';

const API_BASE_URL = '/api/jobs';

const jobService = {
  /**
   * Get job details by ID
   * @param {string} jobId - The ID of the job to fetch
   * @returns {Promise<Object>} The job data
   */
  getJob: async (jobId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update job status
   * @param {string} jobId - The ID of the job to update
   * @param {string} status - The new status
   * @param {string} notes - Optional notes about the status change
   * @returns {Promise<Object>} The updated job data
   */
  updateStatus: async (jobId, status, notes = '') => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/${jobId}/status`,
        { status, notes }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating job status:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get job status history
   * @param {string} jobId - The ID of the job
   * @returns {Promise<Array>} Array of status history items
   */
  getStatusHistory: async (jobId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${jobId}/status-history`);
      return response.data.statusHistory || [];
    } catch (error) {
      console.error('Error fetching status history:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Generate an invoice for a completed job
   * @param {string} jobId - The ID of the job
   * @returns {Promise<Object>} The generated invoice data
   */
  generateInvoice: async (jobId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/${jobId}/generate-invoice`);
      return response.data.invoice;
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Download invoice as PDF
   * @param {string} jobId - The ID of the job
   * @returns {Promise<void>}
   */
  downloadInvoice: async (jobId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${jobId}/invoice/download`, {
        responseType: 'blob',
      });
      
      // Create a blob URL for the PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${jobId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading invoice:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get all jobs for the current user
   * @param {Object} filters - Optional filters for the job list
   * @returns {Promise<Array>} Array of jobs
   */
  getJobs: async (filters = {}) => {
    try {
      const response = await axios.get(API_BASE_URL, { params: filters });
      return response.data.jobs || [];
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Cancel a job
   * @param {string} jobId - The ID of the job to cancel
   * @param {string} reason - Reason for cancellation
   * @returns {Promise<Object>} The updated job data
   */
  cancelJob: async (jobId, reason = '') => {
    try {
      const response = await axios.post(`${API_BASE_URL}/${jobId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error cancelling job:', error);
      throw error.response?.data || error.message;
    }
  },
};

export default jobService;
