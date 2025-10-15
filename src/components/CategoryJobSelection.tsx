import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  FaWrench, FaBolt, FaBroom, FaPaintRoller, FaTree,
  FaTint, FaSnowflake, FaHammer, FaTools,
  FaCar, FaLock, FaShieldAlt, FaDog
} from 'react-icons/fa';
import { Badge } from '@/components/ui/badge';
import ScheduleJobModal from './ScheduleJobModal';

type Category = {
  id: string;
  name: string;
  icon: React.ReactNode;
  fixedRate: number;
  description: string;
  duration: string;
  tags: string[];
};

const categories: Category[] = [
  // Original Categories with enhanced details
  {
    id: 'plumbing',
    name: 'Plumbing',
    icon: <FaTint className="h-5 w-5" />,
    fixedRate: 50,
    description: 'Pipe repairs, faucet installation, drain cleaning',
    duration: '1-3 hours',
    tags: ['water', 'pipes', 'toilet']
  },
  {
    id: 'electrical',
    name: 'Electrical',
    icon: <FaBolt className="h-5 w-5" />,
    fixedRate: 75,
    description: 'Wiring, outlet installation, lighting fixtures',
    duration: '2-4 hours',
    tags: ['wiring', 'lights', 'panel']
  },
  // ... (other original categories with similar enhancements)
  {
    id: 'cleaning',
    name: 'Cleaning',
    icon: <FaBroom className="h-5 w-5" />,
    fixedRate: 45,
    description: 'House cleaning, deep cleaning, move-in/out cleaning',
    duration: '2-4 hours',
    tags: ['clean', 'housekeeping', 'maid']
  },
  {
    id: 'painting',
    name: 'Painting',
    icon: <FaPaintRoller className="h-5 w-5" />,
    fixedRate: 120,
    description: 'Interior/exterior painting, wall repairs, color consultation',
    duration: '4-8 hours',
    tags: ['paint', 'walls', 'color']
  },
  {
    id: 'landscaping',
    name: 'Landscaping',
    icon: <FaTree className="h-5 w-5" />,
    fixedRate: 80,
    description: 'Lawn care, garden design, tree trimming, irrigation',
    duration: '2-6 hours',
    tags: ['garden', 'lawn', 'plants']
  },
  {
    id: 'hvac',
    name: 'HVAC',
    icon: <FaSnowflake className="h-5 w-5" />,
    fixedRate: 100,
    description: 'Heating and cooling system repair, maintenance, installation',
    duration: '2-4 hours',
    tags: ['heating', 'cooling', 'air']
  },
  {
    id: 'carpentry',
    name: 'Carpentry',
    icon: <FaHammer className="h-5 w-5" />,
    fixedRate: 85,
    description: 'Custom woodwork, furniture repair, deck building',
    duration: '3-6 hours',
    tags: ['wood', 'furniture', 'construction']
  },
  {
    id: 'handyman',
    name: 'Handyman',
    icon: <FaWrench className="h-5 w-5" />,
    fixedRate: 65,
    description: 'General repairs, installations, maintenance tasks',
    duration: '1-4 hours',
    tags: ['repair', 'fix', 'maintenance']
  },
  
  // New Specialized Categories
  {
    id: 'auto',
    name: 'Auto Repair',
    icon: <FaCar className="h-5 w-5" />,
    fixedRate: 90,
    description: 'Basic car maintenance, diagnostics, minor repairs',
    duration: '2-5 hours',
    tags: ['vehicle', 'mechanic', 'car']
  },
  {
    id: 'locksmith',
    name: 'Locksmith',
    icon: <FaLock className="h-5 w-5" />,
    fixedRate: 85,
    description: 'Lock installation, key duplication, emergency entry',
    duration: '1-2 hours',
    tags: ['security', 'keys', 'emergency']
  },
  {
    id: 'moving',
    name: 'Moving',
    icon: <FaTools className="h-5 w-5" />,
    fixedRate: 150,
    description: 'Local moving services, packing, loading/unloading',
    duration: '4-8 hours',
    tags: ['relocation', 'packing', 'transport']
  },
  {
    id: 'pest-control',
    name: 'Pest Control',
    icon: <FaShieldAlt className="h-5 w-5" />,
    fixedRate: 70,
    description: 'Pest extermination, prevention, inspection services',
    duration: '1-3 hours',
    tags: ['bugs', 'rodents', 'extermination']
  },
  {
    id: 'pet-care',
    name: 'Pet Care',
    icon: <FaDog className="h-5 w-5" />,
    fixedRate: 35,
    description: 'Pet sitting, dog walking, grooming services',
    duration: '1-2 hours',
    tags: ['animals', 'dogs', 'cats']
  },
  {
    id: 'security',
    name: 'Security',
    icon: <FaShieldAlt className="h-5 w-5" />,
    fixedRate: 95,
    description: 'Home security systems, cameras, alarm installation',
    duration: '2-4 hours',
    tags: ['protection', 'cameras', 'alarms']
  }
  // ... (other new categories)
];

const CategoryJobSelection = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState<number | null>(null);

  // Debug logging
  console.log('CategoryJobSelection rendering with categories:', categories.length);
  console.log('Categories:', categories.map(c => c.name));

  const filteredCategories = categories.filter(category => {
    const matchesSearch = 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPrice = priceFilter ? category.fixedRate <= priceFilter : true;
    
    return matchesSearch && matchesPrice;
  });

  console.log('Filtered categories:', filteredCategories.length);

  return (
    <div className="space-y-6">
      {/* Debug info */}
      <div className="p-4 bg-red-100 border border-red-300 rounded">
        <p className="text-red-800">DEBUG: CategoryJobSelection is rendering!</p>
        <p className="text-red-800">Categories count: {categories.length}</p>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <select
          className="bg-background border rounded-md px-3 py-2"
          value={priceFilter || ''}
          onChange={(e) => setPriceFilter(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">All Prices</option>
          <option value="50">Under $50</option>
          <option value="75">Under $75</option>
          <option value="100">Under $100</option>
          <option value="150">Under $150</option>
        </select>
      </div>

      {/* Enhanced Categories Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Debug: Show all categories */}
        <div className="col-span-full p-4 bg-yellow-100 border border-yellow-300 rounded mb-4">
          <p className="text-yellow-800 font-bold">DEBUG: All Categories ({categories.length}):</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {categories.map((category, index) => (
              <span key={category.id} className="px-2 py-1 bg-yellow-200 text-yellow-800 text-sm rounded">
                {index + 1}. {category.name}
              </span>
            ))}
          </div>
        </div>

        {filteredCategories.map((category) => (
          <Card
            key={category.id}
            className="cursor-pointer transition-all hover:border-primary hover:shadow-lg group"
            onClick={() => setSelectedCategory(category)}
          >
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                {category.icon}
              </div>
              <CardTitle className="text-lg">{category.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground mb-3">{category.description}</p>
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="text-sm">{category.duration}</Badge>
                <p className="font-bold text-primary">From ${category.fixedRate}</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {category.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Debug: Show filtered count */}
        <div className="col-span-full p-4 bg-blue-100 border border-blue-300 rounded mt-4">
          <p className="text-blue-800">Filtered Categories: {filteredCategories.length} / {categories.length}</p>
          {filteredCategories.length !== categories.length && (
            <p className="text-blue-600 mt-2">
              Search: "{searchTerm}" | Price Filter: {priceFilter || 'None'}
            </p>
          )}
        </div>
      </div>

      {/* Job Scheduling Modal */}
      {selectedCategory && (
        <ScheduleJobModal
          category={selectedCategory.name}
          open={!!selectedCategory}
          onOpenChange={(open) => !open && setSelectedCategory(null)}
          onJobScheduled={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
};

export default CategoryJobSelection;
