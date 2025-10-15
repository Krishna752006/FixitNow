import Razorpay from 'razorpay';

// Dynamic configuration store
class DynamicConfig {
  constructor() {
    this.config = {
      razorpay: {
        keyId: null,
        keySecret: null,
        instance: null
      }
    };
  }

  // Set Razorpay credentials dynamically
  setRazorpayCredentials(keyId, keySecret) {
    this.config.razorpay.keyId = keyId;
    this.config.razorpay.keySecret = keySecret;
    
    // Create new Razorpay instance with the credentials
    this.config.razorpay.instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    
    console.log('✅ Razorpay credentials updated successfully');
    return true;
  }

  // Get Razorpay instance
  getRazorpayInstance() {
    if (!this.config.razorpay.instance) {
      // Try to initialize from environment variables as fallback
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      
      if (keyId && keySecret) {
        this.setRazorpayCredentials(keyId, keySecret);
      } else {
        throw new Error('Razorpay credentials not configured. Please set them dynamically or in environment variables.');
      }
    }
    
    return this.config.razorpay.instance;
  }

  // Get Razorpay key ID for frontend
  getRazorpayKeyId() {
    return this.config.razorpay.keyId || process.env.RAZORPAY_KEY_ID;
  }

  // Check if Razorpay is configured
  isRazorpayConfigured() {
    return !!(this.config.razorpay.keyId && this.config.razorpay.keySecret);
  }

  // Get configuration status
  getStatus() {
    return {
      razorpay: {
        configured: this.isRazorpayConfigured(),
        keyId: this.config.razorpay.keyId ? `${this.config.razorpay.keyId.substring(0, 8)}...` : null
      }
    };
  }

  // Reset configuration
  reset() {
    this.config.razorpay = {
      keyId: null,
      keySecret: null,
      instance: null
    };
    console.log('🔄 Configuration reset');
  }
}

// Create singleton instance
const dynamicConfig = new DynamicConfig();

export default dynamicConfig;
