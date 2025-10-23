import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface ServiceCardsProps {
  selectedCategory: string | null;
  onBookService: (service?: {title: string; price: string; duration: string; category: string}) => void;
}

const ServiceCards = ({ selectedCategory, onBookService }: ServiceCardsProps) => {
  const servicesByCategory: Record<string, Array<{title: string; description: string; duration: string; price: string}>> = {
    'Plumbing': [
      { title: 'Faucet Repair/Replacement', description: 'Fix or replace leaky faucets', duration: '1-2 hours', price: '₹45' },
      { title: 'Drain Cleaning', description: 'Clear clogged drains and pipes', duration: '1-2 hours', price: '₹60' },
      { title: 'Toilet Repair', description: 'Fix running toilets and leaks', duration: '1-2 hours', price: '₹55' },
      { title: 'Pipe Repair', description: 'Fix burst or leaking pipes', duration: '2-4 hours', price: '₹75' },
      { title: 'Water Heater Installation', description: 'Install new water heater systems', duration: '3-5 hours', price: '₹250' },
      { title: 'Sewer Line Repair', description: 'Repair or replace sewer lines', duration: '1-2 days', price: '₹400' },
      { title: 'Garbage Disposal Installation', description: 'Install or replace garbage disposal', duration: '1-2 hours', price: '₹85' },
      { title: 'Shower/Bathtub Installation', description: 'Install new shower or bathtub', duration: '1-2 days', price: '₹350' },
    ],
    'Electrical': [
      { title: 'Outlet Installation', description: 'Install new electrical outlets', duration: '1-2 hours', price: '₹65' },
      { title: 'Light Fixture Replacement', description: 'Replace or install light fixtures', duration: '1-2 hours', price: '₹65' },
      { title: 'Circuit Breaker Repair', description: 'Fix tripping circuit breakers', duration: '2-3 hours', price: '₹85' },
      { title: 'Wiring Repair', description: 'Fix faulty electrical wiring', duration: '3-4 hours', price: '₹120' },
      { title: 'Ceiling Fan Installation', description: 'Install ceiling fans with lights', duration: '2-3 hours', price: '₹90' },
      { title: 'Electrical Panel Upgrade', description: 'Upgrade electrical service panel', duration: '4-6 hours', price: '₹300' },
      { title: 'Smart Home Wiring', description: 'Install smart home electrical systems', duration: '3-5 hours', price: '₹180' },
      { title: 'Outdoor Lighting Installation', description: 'Install exterior lighting systems', duration: '2-4 hours', price: '₹150' },
    ],
    'Cleaning': [
      { title: 'Deep House Cleaning', description: 'Complete home deep cleaning', duration: '4-6 hours', price: '₹120' },
      { title: 'Carpet Cleaning', description: 'Professional carpet steam cleaning', duration: '2-3 hours', price: '₹90' },
      { title: 'Pest Control', description: 'Eliminate pests and insects', duration: '1-2 hours', price: '₹80' },
      { title: 'Window Cleaning', description: 'Interior and exterior window cleaning', duration: '2-3 hours', price: '₹70' },
      { title: 'Move-In/Move-Out Cleaning', description: 'Thorough cleaning for moving', duration: '5-7 hours', price: '₹200' },
      { title: 'Upholstery Cleaning', description: 'Clean sofas and furniture', duration: '2-3 hours', price: '₹100' },
      { title: 'Pressure Washing', description: 'Exterior surface pressure washing', duration: '2-4 hours', price: '₹120' },
      { title: 'Gutter Cleaning', description: 'Clean and clear gutters', duration: '1-2 hours', price: '₹65' },
    ],
    'Painting': [
      { title: 'Interior Wall Painting', description: 'Paint interior walls and ceilings', duration: '1-2 days', price: '₹300' },
      { title: 'Exterior Painting', description: 'Paint exterior walls and surfaces', duration: '2-3 days', price: '₹300' },
      { title: 'Waterproofing', description: 'Waterproof walls and roofs', duration: '1-2 days', price: '₹250' },
      { title: 'Texture Painting', description: 'Decorative texture painting', duration: '2-3 days', price: '₹350' },
      { title: 'Cabinet Painting', description: 'Refinish kitchen cabinets', duration: '2-3 days', price: '₹250' },
      { title: 'Deck Staining', description: 'Stain and seal wooden decks', duration: '1-2 days', price: '₹220' },
      { title: 'Wallpaper Installation', description: 'Install decorative wallpaper', duration: '1-2 days', price: '₹200' },
      { title: 'Drywall Repair & Painting', description: 'Repair and paint damaged drywall', duration: '1-2 days', price: '₹180' },
    ],
    'Carpentry': [
      { title: 'Furniture Assembly', description: 'Assemble furniture and fixtures', duration: '2-3 hours', price: '₹60' },
      { title: 'Door Installation', description: 'Install or repair doors', duration: '3-4 hours', price: '₹95' },
      { title: 'Cabinet Installation', description: 'Install kitchen or bathroom cabinets', duration: '4-6 hours', price: '₹150' },
      { title: 'Custom Woodwork', description: 'Custom carpentry and woodwork', duration: '1-2 days', price: '₹200' },
      { title: 'Deck Building', description: 'Build outdoor wooden decks', duration: '3-5 days', price: '₹800' },
      { title: 'Crown Molding Installation', description: 'Install decorative crown molding', duration: '1-2 days', price: '₹180' },
      { title: 'Closet Organization System', description: 'Install custom closet systems', duration: '1-2 days', price: '₹250' },
      { title: 'Trim & Baseboard Installation', description: 'Install trim and baseboards', duration: '1-2 days', price: '₹160' },
    ],
    'Appliance Repair': [
      { title: 'Refrigerator Repair', description: 'Fix cooling and other issues', duration: '1-2 hours', price: '₹85' },
      { title: 'Washing Machine Repair', description: 'Fix washing machine problems', duration: '1-2 hours', price: '₹75' },
      { title: 'Microwave Repair', description: 'Repair microwave ovens', duration: '1 hour', price: '₹55' },
      { title: 'Dishwasher Repair', description: 'Fix dishwasher issues', duration: '1-2 hours', price: '₹70' },
      { title: 'Dryer Repair', description: 'Fix clothes dryer problems', duration: '1-2 hours', price: '₹80' },
      { title: 'Oven/Stove Repair', description: 'Repair cooking appliances', duration: '1-2 hours', price: '₹90' },
      { title: 'Garbage Disposal Repair', description: 'Fix disposal unit issues', duration: '1 hour', price: '₹60' },
      { title: 'Ice Maker Repair', description: 'Fix refrigerator ice makers', duration: '1-2 hours', price: '₹65' },
    ],
    'HVAC': [
      { title: 'AC Installation', description: 'Install new air conditioning unit', duration: '3-4 hours', price: '₹200' },
      { title: 'AC Repair & Service', description: 'Repair and service air conditioners', duration: '1-2 hours', price: '₹80' },
      { title: 'Heater Repair', description: 'Fix heating system issues', duration: '2-3 hours', price: '₹90' },
      { title: 'Duct Cleaning', description: 'Clean HVAC ducts and vents', duration: '2-3 hours', price: '₹120' },
      { title: 'Furnace Installation', description: 'Install new furnace system', duration: '4-6 hours', price: '₹350' },
      { title: 'Thermostat Installation', description: 'Install smart thermostats', duration: '1-2 hours', price: '₹75' },
      { title: 'Air Quality Testing', description: 'Test and improve indoor air quality', duration: '2-3 hours', price: '₹100' },
      { title: 'Heat Pump Service', description: 'Service and maintain heat pumps', duration: '2-3 hours', price: '₹110' },
    ],
    'Landscaping': [
      { title: 'Lawn Mowing', description: 'Regular lawn maintenance and mowing', duration: '1-2 hours', price: '₹40' },
      { title: 'Garden Design', description: 'Professional garden planning and design', duration: '1-2 days', price: '₹150' },
      { title: 'Tree Trimming', description: 'Trim and prune trees safely', duration: '2-3 hours', price: '₹100' },
      { title: 'Irrigation System', description: 'Install or repair irrigation systems', duration: '4-6 hours', price: '₹180' },
      { title: 'Mulching & Edging', description: 'Add mulch and edge garden beds', duration: '2-3 hours', price: '₹80' },
      { title: 'Sod Installation', description: 'Install new grass sod', duration: '1-2 days', price: '₹300' },
      { title: 'Hedge Trimming', description: 'Trim and shape hedges', duration: '1-2 hours', price: '₹70' },
      { title: 'Leaf Removal', description: 'Seasonal leaf cleanup', duration: '2-3 hours', price: '₹60' },
    ],
    'Handyman': [
      { title: 'General Repairs', description: 'Fix various household issues', duration: '1-3 hours', price: '₹60' },
      { title: 'TV Mounting', description: 'Mount TVs on walls securely', duration: '1-2 hours', price: '₹70' },
      { title: 'Shelf Installation', description: 'Install shelves and brackets', duration: '1-2 hours', price: '₹50' },
      { title: 'Picture Hanging', description: 'Hang pictures and artwork', duration: '30 min - 1 hour', price: '₹40' },
      { title: 'Drywall Patching', description: 'Patch holes and cracks in walls', duration: '1-2 hours', price: '₹55' },
      { title: 'Door Lock Installation', description: 'Install or replace door locks', duration: '1 hour', price: '₹65' },
      { title: 'Caulking & Sealing', description: 'Seal gaps and cracks', duration: '1-2 hours', price: '₹45' },
      { title: 'Minor Plumbing Fixes', description: 'Small plumbing repairs', duration: '1-2 hours', price: '₹60' },
    ],
    'Other': [
      { title: 'Moving Service', description: 'Professional moving and packing', duration: 'Full day', price: '₹300' },
      { title: 'Furniture Moving', description: 'Move heavy furniture safely', duration: '2-4 hours', price: '₹120' },
      { title: 'Packing Service', description: 'Professional packing assistance', duration: '4-6 hours', price: '₹150' },
      { title: 'Storage Solutions', description: 'Organize and optimize storage', duration: '3-5 hours', price: '₹100' },
      { title: 'Junk Removal', description: 'Remove unwanted items and debris', duration: '2-4 hours', price: '₹140' },
      { title: 'Furniture Delivery', description: 'Deliver and place furniture', duration: '1-3 hours', price: '₹90' },
      { title: 'Home Organization', description: 'Organize and declutter spaces', duration: '3-5 hours', price: '₹110' },
      { title: 'Assembly Service', description: 'Assemble various items', duration: '1-3 hours', price: '₹70' },
    ],
  };

  const activeCategory = selectedCategory || 'Plumbing';
  const services = servicesByCategory[activeCategory] || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">{service.title}</CardTitle>
            <CardDescription className="text-sm">{service.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{service.duration}</span>
              </div>
              <div className="text-2xl font-bold text-primary">{service.price}</div>
            </div>
            <Button 
              className="w-full"
              onClick={() => onBookService({...service, category: activeCategory})}
            >
              Book This Service
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ServiceCards;
