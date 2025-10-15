import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/PageHeader';
import ScheduleJobModal from '@/components/ScheduleJobModal';
import {
  FaWrench, FaBolt, FaBroom, FaPaintRoller, FaTree,
  FaTint, FaSnowflake, FaHammer, FaTools,
  FaCar, FaLock, FaShieldAlt, FaDog
} from 'react-icons/fa';

type Category = {
  id: string;
  name: string;
  icon: React.ReactNode;
  fixedRate: number;
  description: string;
  duration: string;
  tags: string[];
  services: Service[];
};

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
};

const categories: Category[] = [
  {
    id: 'plumbing',
    name: 'Plumbing',
    icon: <FaTint className="h-5 w-5" />,
    fixedRate: 50,
    description: 'Professional plumbing services',
    duration: '1-3 hours',
    tags: ['water', 'pipes', 'toilet'],
    services: [
      { id: 'faucet-repair', name: 'Faucet Repair/Replacement', description: 'Fix or replace leaky faucets', price: 45, duration: '1-2 hours' },
      { id: 'drain-cleaning', name: 'Drain Cleaning', description: 'Clear clogged drains and pipes', price: 60, duration: '1-2 hours' },
      { id: 'toilet-repair', name: 'Toilet Repair', description: 'Fix running toilets and leaks', price: 55, duration: '1-2 hours' },
      { id: 'pipe-repair', name: 'Pipe Repair', description: 'Fix burst or leaking pipes', price: 75, duration: '2-4 hours' }
    ]
  },
  {
    id: 'electrical',
    name: 'Electrical',
    icon: <FaBolt className="h-5 w-5" />,
    fixedRate: 75,
    description: 'Electrical installation and repair',
    duration: '2-4 hours',
    tags: ['wiring', 'lights', 'panel'],
    services: [
      { id: 'outlet-installation', name: 'Outlet Installation', description: 'Install new electrical outlets', price: 65, duration: '1-2 hours' },
      { id: 'light-fixture', name: 'Light Fixture Installation', description: 'Install or replace light fixtures', price: 80, duration: '2-3 hours' },
      { id: 'switch-replacement', name: 'Switch Replacement', description: 'Replace faulty light switches', price: 45, duration: '1 hour' },
      { id: 'ceiling-fan', name: 'Ceiling Fan Installation', description: 'Install new ceiling fans', price: 90, duration: '2-3 hours' }
    ]
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    icon: <FaBroom className="h-5 w-5" />,
    fixedRate: 45,
    description: 'Professional cleaning services',
    duration: '2-4 hours',
    tags: ['clean', 'housekeeping', 'maid'],
    services: [
      { id: 'deep-cleaning', name: 'Deep House Cleaning', description: 'Thorough cleaning of entire home', price: 120, duration: '4-6 hours' },
      { id: 'regular-cleaning', name: 'Regular Cleaning', description: 'Standard weekly/bi-weekly cleaning', price: 80, duration: '2-3 hours' },
      { id: 'move-in-out', name: 'Move In/Out Cleaning', description: 'Detailed cleaning for moving', price: 150, duration: '5-7 hours' }
    ]
  },
  {
    id: 'painting',
    name: 'Painting',
    icon: <FaPaintRoller className="h-5 w-5" />,
    fixedRate: 120,
    description: 'Interior and exterior painting',
    duration: '4-8 hours',
    tags: ['paint', 'walls', 'color'],
    services: [
      { id: 'interior-painting', name: 'Interior Painting', description: 'Paint interior walls and ceilings', price: 200, duration: '1-2 days' },
      { id: 'exterior-painting', name: 'Exterior Painting', description: 'Paint house exterior and trim', price: 300, duration: '2-3 days' },
      { id: 'cabinet-painting', name: 'Cabinet Painting', description: 'Refinish kitchen cabinets', price: 250, duration: '2-3 days' }
    ]
  },
  {
    id: 'landscaping',
    name: 'Landscaping',
    icon: <FaTree className="h-5 w-5" />,
    fixedRate: 80,
    description: 'Lawn and garden services',
    duration: '2-6 hours',
    tags: ['garden', 'lawn', 'plants'],
    services: [
      { id: 'lawn-mowing', name: 'Lawn Mowing', description: 'Regular lawn mowing and edging', price: 40, duration: '1-2 hours' },
      { id: 'garden-design', name: 'Garden Design', description: 'Design and plant new gardens', price: 150, duration: '4-6 hours' },
      { id: 'tree-trimming', name: 'Tree Trimming', description: 'Trim and shape trees and shrubs', price: 100, duration: '2-4 hours' }
    ]
  },
  {
    id: 'hvac',
    name: 'HVAC',
    icon: <FaSnowflake className="h-5 w-5" />,
    fixedRate: 100,
    description: 'Heating and cooling services',
    duration: '2-4 hours',
    tags: ['heating', 'cooling', 'air'],
    services: [
      { id: 'ac-repair', name: 'AC Repair', description: 'Diagnose and repair air conditioning', price: 120, duration: '2-4 hours' },
      { id: 'furnace-service', name: 'Furnace Service', description: 'Clean and maintain heating systems', price: 90, duration: '2-3 hours' },
      { id: 'duct-cleaning', name: 'Duct Cleaning', description: 'Clean air ducts and vents', price: 200, duration: '3-5 hours' }
    ]
  },
  {
    id: 'carpentry',
    name: 'Carpentry',
    icon: <FaHammer className="h-5 w-5" />,
    fixedRate: 85,
    description: 'Custom woodwork and repairs',
    duration: '3-6 hours',
    tags: ['wood', 'furniture', 'construction'],
    services: [
      { id: 'custom-shelves', name: 'Custom Shelves', description: 'Build custom shelving units', price: 150, duration: '4-6 hours' },
      { id: 'deck-repair', name: 'Deck Repair', description: 'Repair or replace deck boards', price: 120, duration: '3-5 hours' },
      { id: 'furniture-repair', name: 'Furniture Repair', description: 'Fix broken furniture pieces', price: 80, duration: '2-4 hours' }
    ]
  },
  {
    id: 'handyman',
    name: 'Handyman',
    icon: <FaWrench className="h-5 w-5" />,
    fixedRate: 65,
    description: 'General home repairs',
    duration: '1-4 hours',
    tags: ['repair', 'fix', 'maintenance'],
    services: [
      { id: 'drywall-repair', name: 'Drywall Repair', description: 'Patch holes and cracks in walls', price: 60, duration: '2-3 hours' },
      { id: 'door-repair', name: 'Door Repair', description: 'Fix squeaky or sticking doors', price: 50, duration: '1-2 hours' },
      { id: 'minor-plumbing', name: 'Minor Plumbing', description: 'Small plumbing fixes and installations', price: 55, duration: '1-3 hours' }
    ]
  },
  {
    id: 'auto',
    name: 'Auto Repair',
    icon: <FaCar className="h-5 w-5" />,
    fixedRate: 90,
    description: 'Basic automotive services',
    duration: '2-5 hours',
    tags: ['vehicle', 'mechanic', 'car'],
    services: [
      { id: 'oil-change', name: 'Oil Change', description: 'Complete oil and filter change', price: 50, duration: '1 hour' },
      { id: 'brake-service', name: 'Brake Service', description: 'Inspect and service brakes', price: 120, duration: '2-3 hours' },
      { id: 'battery-replacement', name: 'Battery Replacement', description: 'Install new car battery', price: 80, duration: '30-60 minutes' }
    ]
  },
  {
    id: 'locksmith',
    name: 'Locksmith',
    icon: <FaLock className="h-5 w-5" />,
    fixedRate: 85,
    description: 'Lock and security services',
    duration: '1-2 hours',
    tags: ['security', 'keys', 'emergency'],
    services: [
      { id: 'lock-installation', name: 'Lock Installation', description: 'Install new deadbolts or locks', price: 70, duration: '1-2 hours' },
      { id: 'key-duplication', name: 'Key Duplication', description: 'Make duplicate keys', price: 15, duration: '15-30 minutes' },
      { id: 'emergency-lockout', name: 'Emergency Lockout', description: 'Emergency lockout service', price: 100, duration: '30-60 minutes' }
    ]
  },
  {
    id: 'moving',
    name: 'Moving',
    icon: <FaTools className="h-5 w-5" />,
    fixedRate: 150,
    description: 'Local moving assistance',
    duration: '4-8 hours',
    tags: ['relocation', 'packing', 'transport'],
    services: [
      { id: 'local-moving', name: 'Local Moving', description: 'Moving within the city', price: 200, duration: '4-6 hours' },
      { id: 'packing-service', name: 'Packing Service', description: 'Professional packing of belongings', price: 150, duration: '3-5 hours' },
      { id: 'loading-unloading', name: 'Loading/Unloading', description: 'Help loading or unloading truck', price: 100, duration: '2-3 hours' }
    ]
  },
  {
    id: 'pest-control',
    name: 'Pest Control',
    icon: <FaShieldAlt className="h-5 w-5" />,
    fixedRate: 70,
    description: 'Pest extermination services',
    duration: '1-3 hours',
    tags: ['bugs', 'rodents', 'extermination'],
    services: [
      { id: 'general-pest', name: 'General Pest Control', description: 'Treatment for common household pests', price: 80, duration: '1-2 hours' },
      { id: 'rodent-control', name: 'Rodent Control', description: 'Mouse and rat extermination', price: 100, duration: '2-3 hours' },
      { id: 'termite-inspection', name: 'Termite Inspection', description: 'Professional termite inspection', price: 60, duration: '1 hour' }
    ]
  },
  {
    id: 'pet-care',
    name: 'Pet Care',
    icon: <FaDog className="h-5 w-5" />,
    fixedRate: 35,
    description: 'Pet sitting and care services',
    duration: '1-2 hours',
    tags: ['animals', 'dogs', 'cats'],
    services: [
      { id: 'dog-walking', name: 'Dog Walking', description: 'Daily dog walking service', price: 25, duration: '30-60 minutes' },
      { id: 'pet-sitting', name: 'Pet Sitting', description: 'In-home pet sitting while away', price: 50, duration: '1-2 hours' },
      { id: 'pet-grooming', name: 'Pet Grooming', description: 'Professional pet grooming', price: 60, duration: '1-2 hours' }
    ]
  },
  {
    id: 'security',
    name: 'Security',
    icon: <FaShieldAlt className="h-5 w-5" />,
    fixedRate: 95,
    description: 'Home security systems',
    duration: '2-4 hours',
    tags: ['protection', 'cameras', 'alarms'],
    services: [
      { id: 'camera-installation', name: 'Security Camera Installation', description: 'Install security cameras', price: 120, duration: '2-4 hours' },
      { id: 'alarm-system', name: 'Alarm System Setup', description: 'Install home alarm system', price: 150, duration: '3-5 hours' },
      { id: 'smart-locks', name: 'Smart Lock Installation', description: 'Install smart door locks', price: 100, duration: '1-2 hours' }
    ]
  }
];

export default function CreateJob() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || '');

  // Debug logging
  console.log('CreateJob component rendering');
  console.log('Total categories:', categories.length);
  console.log('Categories:', categories.map(c => c.name));

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Debug Info */}
      <div className="mb-8 p-4 bg-red-100 border border-red-300 rounded">
        <h2 className="text-red-800 font-bold">🔍 DEBUG INFO</h2>
        <p className="text-red-800">Total Categories: {categories.length}</p>
        <p className="text-red-800">Active Category: {activeCategory}</p>
        <div className="mt-2">
          <p className="text-red-700 font-medium">Available Categories:</p>
          <ul className="text-red-700 text-sm">
            {categories.map((cat, index) => (
              <li key={cat.id}>{index + 1}. {cat.name} ({cat.services.length} services)</li>
            ))}
          </ul>
        </div>
      </div>

      <PageHeader
        title="Book a Service"
        description="Browse all available services by category"
        className="mb-8"
      />

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 mb-8">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
              {category.icon}
              <span className="hidden sm:inline">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                {category.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{category.name} Services</h2>
                <p className="text-muted-foreground">{category.description}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {category.services.map((service) => (
                <Card
                  key={service.id}
                  className="cursor-pointer transition-all hover:border-primary hover:shadow-lg group"
                  onClick={() => {
                    setSelectedService(service);
                    setSelectedCategory(category);
                  }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center mb-3">
                      <Badge variant="outline">{service.duration}</Badge>
                      <p className="font-bold text-primary">${service.price}</p>
                    </div>
                    <Button className="w-full" onClick={() => {
                      setSelectedService(service);
                      setSelectedCategory(category);
                    }}>
                      Book This Service
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Service Booking Modal */}
      {selectedService && selectedCategory && (
        <ScheduleJobModal
          category={selectedCategory.name}
          serviceName={selectedService.name}
          servicePrice={selectedService.price}
          serviceDuration={selectedService.duration}
          open={!!selectedService}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedService(null);
              setSelectedCategory(null);
            }
          }}
          onJobScheduled={() => {
            setSelectedService(null);
            setSelectedCategory(null);
          }}
        />
      )}
    </div>
  );
}
