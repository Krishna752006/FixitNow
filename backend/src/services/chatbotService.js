import axios from 'axios';
import Job from '../models/Job.js';
import Professional from '../models/Professional.js';
import Notification from '../models/Notification.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCMt7WYaD-qxqXD9a5F-VG9PRG_zGrQNys';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Project-related keywords for filtering
const PROJECT_KEYWORDS = [
  'booking', 'book', 'service', 'professional', 'plumber', 'electrician', 'carpenter',
  'payment', 'price', 'cost', 'budget', 'rating', 'review', 'job', 'appointment',
  'schedule', 'cancel', 'complete', 'invoice', 'tip', 'cash', 'card', 'online',
  'fixitnow', 'fixit', 'professional', 'customer', 'user', 'account', 'profile',
  'address', 'location', 'city', 'area', 'service area', 'availability', 'urgent',
  'painting', 'cleaning', 'hvac', 'appliance', 'repair', 'handyman', 'landscaping',
  'verification', 'verified', 'trusted', 'reliable', 'quality', 'support', 'help',
  'question', 'issue', 'problem', 'error', 'refund', 'dispute', 'complaint'
];

// FAQ Knowledge Base
const FAQ_KNOWLEDGE_BASE = {
  booking: [
    { q: 'How do I book a service?', a: 'Go to Dashboard > Book Service, select category, fill details, and confirm.' },
    { q: 'Can I cancel a booking?', a: 'Yes, you can cancel pending jobs from the Jobs tab.' },
    { q: 'How long does it take to get a professional?', a: 'Usually 15-30 minutes. Professionals in your area are notified immediately.' },
  ],
  payment: [
    { q: 'What payment methods do you accept?', a: 'We accept online payments (cards, UPI) and cash payments.' },
    { q: 'Is my payment secure?', a: 'Yes, we use Razorpay for secure online payments.' },
    { q: 'Can I get a refund?', a: 'Refunds are processed within 5-7 business days after job cancellation.' },
  ],
  professionals: [
    { q: 'How are professionals verified?', a: 'All professionals are verified with ID, background check, and skill certification.' },
    { q: 'What if I\'m not satisfied with the professional?', a: 'You can rate them and file a complaint. We take action on poor ratings.' },
    { q: 'Can I book the same professional again?', a: 'Yes! Go to Favorites tab and book from your previous professionals.' },
  ],
  pricing: [
    { q: 'How is pricing determined?', a: 'Pricing depends on service category, complexity, location, and professional experience.' },
    { q: 'Are there hidden charges?', a: 'No, all charges are transparent. You see the final price before confirming.' },
    { q: 'Can I negotiate the price?', a: 'Yes, you can discuss pricing with the professional after they accept the job.' },
  ],
  general: [
    { q: 'Is there a customer support?', a: 'Yes, contact us via chat, email, or phone. We respond within 2 hours.' },
    { q: 'What services do you offer?', a: 'We offer Plumbing, Electrical, Carpentry, Painting, Cleaning, HVAC, and more.' },
    { q: 'How do I rate a professional?', a: 'After job completion, go to Jobs > Past Jobs and click Rate Professional.' },
  ],
};

// Check if message is project-related
const isProjectRelated = (message) => {
  const lowerMessage = message.toLowerCase();
  return PROJECT_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
};

// Generate system prompt for chatbot
const generateSystemPrompt = () => {
  return `You are FixItNow's AI Support Assistant. IMPORTANT: You ONLY answer questions related to the FixItNow platform.

You help users with:
1. Booking services on FixItNow
2. Payment and pricing questions
3. Professional information and verification
4. Job status and tracking
5. Account and profile management
6. General platform support

RULES:
- ONLY answer questions about FixItNow services, booking, payments, professionals, and support
- If a question is NOT about FixItNow, politely decline and redirect to FixItNow topics
- Be friendly, concise, and professional
- Keep responses under 150 words
- Use bullet points for clarity
- If you don't know something, suggest contacting support

Available Services: Plumbing, Electrical, Carpentry, Painting, Cleaning, Appliance Repair, HVAC, Landscaping, Handyman`;
};

// Chat with Google Gemini API
export const chatWithAI = async (userMessage, conversationHistory = []) => {
  try {
    // Check if message is project-related
    if (!isProjectRelated(userMessage)) {
      return {
        success: true,
        message: "I'm here to help with FixItNow platform questions only. Please ask me about booking services, payments, professionals, or any other FixItNow-related topics! 😊",
        source: 'filtered',
      };
    }

    // Check FAQ first for quick answers
    const faqAnswer = searchFAQ(userMessage);
    if (faqAnswer) {
      return {
        success: true,
        message: faqAnswer,
        source: 'faq',
      };
    }

    // If not in FAQ, use Gemini API
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: generateSystemPrompt(),
              },
              ...conversationHistory.map(msg => ({
                text: msg.content,
              })),
              {
                text: userMessage,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const aiMessage = response.data.candidates[0].content.parts[0].text;

    return {
      success: true,
      message: aiMessage,
      source: 'gemini',
    };
  } catch (error) {
    console.error('Chatbot error:', error);
    return {
      success: false,
      message: 'Sorry, I encountered an error. Please try again or contact support.',
      source: 'error',
    };
  }
};

// Search FAQ knowledge base
const searchFAQ = (userMessage) => {
  const lowerMessage = userMessage.toLowerCase();

  for (const category of Object.values(FAQ_KNOWLEDGE_BASE)) {
    for (const item of category) {
      const keywords = item.q.toLowerCase().split(' ');
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return item.a;
      }
    }
  }

  return null;
};

// Find top 3 matching professionals for a job
export const findMatchingProfessionals = async (jobData) => {
  try {
    const {
      category,
      location,
      budget,
      priority,
      scheduledDate,
    } = jobData;

    // Find professionals with matching skills
    let query = {
      skills: category,
      isVerified: true,
      isActive: true,
    };

    // Get professionals within reasonable distance (50km)
    if (location?.coordinates?.latitude && location?.coordinates?.longitude) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [location.coordinates.longitude, location.coordinates.latitude],
          },
          $maxDistance: 50000, // 50km in meters
        },
      };
    }

    const professionals = await Professional.find(query)
      .select('firstName lastName email phone skills rating.average rating.count location profileImage businessName')
      .limit(20);

    // Score professionals based on multiple factors
    const scoredProfessionals = professionals.map(prof => {
      let score = 0;

      // Rating score (0-30 points)
      const avgRating = prof.rating?.average || 0;
      score += (avgRating / 5) * 30;

      // Experience score based on number of jobs (0-20 points)
      const jobCount = prof.rating?.count || 0;
      score += Math.min((jobCount / 100) * 20, 20);

      // Availability score (0-20 points)
      const isAvailable = prof.availability?.includes(new Date(scheduledDate).toLocaleDateString());
      score += isAvailable ? 20 : 10;

      // Budget match score (0-20 points)
      if (budget?.max) {
        const profRate = prof.hourlyRate || budget.max;
        const budgetMatch = 1 - Math.abs(profRate - budget.max) / budget.max;
        score += Math.max(budgetMatch * 20, 0);
      } else {
        score += 15;
      }

      // Priority match (0-10 points)
      if (priority === 'urgent' && prof.acceptsUrgent) {
        score += 10;
      }

      return {
        ...prof.toObject(),
        matchScore: Math.round(score),
      };
    });

    // Sort by score and return top 3
    const topMatches = scoredProfessionals
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    return {
      success: true,
      professionals: topMatches,
    };
  } catch (error) {
    console.error('Job matching error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Notify professionals of matching jobs
export const notifyProfessionalsOfJob = async (jobId, professionalIds) => {
  try {
    const job = await Job.findById(jobId).populate('user', 'firstName lastName');

    const notifications = professionalIds.map(profId => ({
      recipient: profId,
      type: 'job_match',
      title: 'New Job Match!',
      message: `New ${job.category} job in your area: ${job.title || 'Professional Service Needed'}`,
      relatedJob: jobId,
      priority: job.priority === 'urgent' ? 'high' : 'medium',
      actionUrl: `/jobs/available/${jobId}`,
    }));

    await Notification.insertMany(notifications);

    return {
      success: true,
      notified: professionalIds.length,
    };
  } catch (error) {
    console.error('Notification error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get FAQ categories
export const getFAQCategories = () => {
  return Object.keys(FAQ_KNOWLEDGE_BASE).map(category => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    items: FAQ_KNOWLEDGE_BASE[category],
  }));
};

// Search FAQ by category
export const searchFAQByCategory = (category) => {
  const items = FAQ_KNOWLEDGE_BASE[category.toLowerCase()];
  if (!items) {
    return { success: false, error: 'Category not found' };
  }
  return { success: true, items };
};
