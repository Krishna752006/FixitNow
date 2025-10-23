// Simple test server to verify backend is working
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Test route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Test server is running',
    timestamp: new Date().toISOString()
  });
});

// Chatbot test route
app.get('/api/chatbot/faq', (req, res) => {
  res.json({
    success: true,
    data: {
      categories: [
        { name: 'Booking', items: [] },
        { name: 'Payment', items: [] }
      ],
      total: 2
    }
  });
});

app.post('/api/chatbot/chat', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Test response from chatbot',
      source: 'test'
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`📊 Test: http://localhost:${PORT}/api/health`);
  console.log(`🤖 Chatbot FAQ: http://localhost:${PORT}/api/chatbot/faq`);
});
