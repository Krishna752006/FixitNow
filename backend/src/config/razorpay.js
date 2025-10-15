import Razorpay from 'razorpay';

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.warn('Razorpay keys are missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment.');
}

const razorpay = new Razorpay({
  key_id: keyId || 'missing',
  key_secret: keySecret || 'missing',
});

export default razorpay;