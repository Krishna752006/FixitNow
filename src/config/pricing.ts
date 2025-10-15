// Fixed pricing for service categories based on difficulty and complexity

export interface CategoryPricing {
  category: string;
  basePrice: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  description: string;
  estimatedDuration: number; // in hours
}

export const CATEGORY_PRICING: CategoryPricing[] = [
  // Easy - Basic services
  {
    category: 'Cleaning',
    basePrice: 500,
    difficulty: 'easy',
    description: 'Basic cleaning services',
    estimatedDuration: 2
  },
  {
    category: 'Gardening',
    basePrice: 600,
    difficulty: 'easy',
    description: 'Garden maintenance and care',
    estimatedDuration: 2
  },
  {
    category: 'Painting',
    basePrice: 800,
    difficulty: 'medium',
    description: 'Interior/exterior painting',
    estimatedDuration: 3
  },

  // Medium - Skilled services
  {
    category: 'Plumbing',
    basePrice: 1000,
    difficulty: 'medium',
    description: 'Plumbing repairs and installations',
    estimatedDuration: 2
  },
  {
    category: 'Electrical',
    basePrice: 1200,
    difficulty: 'medium',
    description: 'Electrical repairs and installations',
    estimatedDuration: 2
  },
  {
    category: 'Carpentry',
    basePrice: 1100,
    difficulty: 'medium',
    description: 'Furniture and woodwork',
    estimatedDuration: 3
  },
  {
    category: 'Appliance Repair',
    basePrice: 900,
    difficulty: 'medium',
    description: 'Home appliance repairs',
    estimatedDuration: 2
  },

  // Hard - Technical services
  {
    category: 'AC Repair',
    basePrice: 1500,
    difficulty: 'hard',
    description: 'AC installation and repair',
    estimatedDuration: 3
  },
  {
    category: 'HVAC',
    basePrice: 1800,
    difficulty: 'hard',
    description: 'Heating, ventilation, and air conditioning',
    estimatedDuration: 4
  },
  {
    category: 'Roofing',
    basePrice: 2000,
    difficulty: 'hard',
    description: 'Roof repairs and installation',
    estimatedDuration: 4
  },
  {
    category: 'Flooring',
    basePrice: 1600,
    difficulty: 'hard',
    description: 'Floor installation and repair',
    estimatedDuration: 4
  },

  // Expert - Specialized services
  {
    category: 'Smart Home',
    basePrice: 2500,
    difficulty: 'expert',
    description: 'Smart home automation setup',
    estimatedDuration: 4
  },
  {
    category: 'Solar Installation',
    basePrice: 3000,
    difficulty: 'expert',
    description: 'Solar panel installation',
    estimatedDuration: 6
  },
  {
    category: 'Pool Maintenance',
    basePrice: 1400,
    difficulty: 'hard',
    description: 'Swimming pool cleaning and maintenance',
    estimatedDuration: 3
  },

  // Other common services
  {
    category: 'Pest Control',
    basePrice: 700,
    difficulty: 'easy',
    description: 'Pest control and extermination',
    estimatedDuration: 2
  },
  {
    category: 'Locksmith',
    basePrice: 800,
    difficulty: 'medium',
    description: 'Lock installation and repair',
    estimatedDuration: 1
  },
  {
    category: 'Moving',
    basePrice: 1500,
    difficulty: 'medium',
    description: 'Moving and relocation services',
    estimatedDuration: 4
  },
  {
    category: 'Handyman',
    basePrice: 600,
    difficulty: 'easy',
    description: 'General handyman services',
    estimatedDuration: 2
  }
];

// Helper function to get pricing for a category
export const getCategoryPricing = (category: string): CategoryPricing | undefined => {
  return CATEGORY_PRICING.find(
    (pricing) => pricing.category.toLowerCase() === category.toLowerCase()
  );
};

// Helper function to get all categories sorted by price
export const getCategoriesByPrice = (): CategoryPricing[] => {
  return [...CATEGORY_PRICING].sort((a, b) => a.basePrice - b.basePrice);
};

// Helper function to get categories by difficulty
export const getCategoriesByDifficulty = (
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
): CategoryPricing[] => {
  return CATEGORY_PRICING.filter((pricing) => pricing.difficulty === difficulty);
};

// Difficulty level colors for UI
export const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-orange-100 text-orange-800',
  expert: 'bg-red-100 text-red-800'
};

// Difficulty level labels
export const DIFFICULTY_LABELS = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert'
};
