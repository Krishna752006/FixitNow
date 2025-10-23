import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronUp, Wrench, Clock, DollarSign } from 'lucide-react';
import { api } from '../../services/api';

interface SubService {
  title: string;
  description: string;
  duration: string;
  price: number;
}

interface Service {
  name: string;
  icon: string;
  basePrice: number;
  description: string;
  subServices: SubService[];
}

const ServiceConfiguration: React.FC = () => {
  const allServices: Service[] = [
    {
      name: 'Plumbing',
      icon: '🚰',
      basePrice: 500,
      description: 'Professional plumbing services',
      subServices: [
        { title: 'Faucet Repair/Replacement', description: 'Fix or replace leaky faucets', duration: '1-2 hours', price: 45 },
        { title: 'Drain Cleaning', description: 'Clear clogged drains and pipes', duration: '1-2 hours', price: 60 },
        { title: 'Toilet Repair', description: 'Fix running toilets and leaks', duration: '1-2 hours', price: 55 },
        { title: 'Pipe Repair', description: 'Fix burst or leaking pipes', duration: '2-4 hours', price: 75 },
        { title: 'Water Heater Installation', description: 'Install new water heater systems', duration: '3-5 hours', price: 250 },
        { title: 'Sewer Line Repair', description: 'Repair or replace sewer lines', duration: '1-2 days', price: 400 },
        { title: 'Garbage Disposal Installation', description: 'Install or replace garbage disposal', duration: '1-2 hours', price: 85 },
        { title: 'Shower/Bathtub Installation', description: 'Install new shower or bathtub', duration: '1-2 days', price: 350 },
      ],
    },
    {
      name: 'Electrical',
      icon: '⚡',
      basePrice: 600,
      description: 'Expert electrical work',
      subServices: [
        { title: 'Outlet Installation', description: 'Install new electrical outlets', duration: '1-2 hours', price: 65 },
        { title: 'Light Fixture Replacement', description: 'Replace or install light fixtures', duration: '1-2 hours', price: 65 },
        { title: 'Circuit Breaker Repair', description: 'Fix tripping circuit breakers', duration: '2-3 hours', price: 85 },
        { title: 'Wiring Repair', description: 'Fix faulty electrical wiring', duration: '3-4 hours', price: 120 },
        { title: 'Ceiling Fan Installation', description: 'Install ceiling fans with lights', duration: '2-3 hours', price: 90 },
        { title: 'Electrical Panel Upgrade', description: 'Upgrade electrical service panel', duration: '4-6 hours', price: 300 },
        { title: 'Smart Home Wiring', description: 'Install smart home electrical systems', duration: '3-5 hours', price: 180 },
        { title: 'Outdoor Lighting Installation', description: 'Install exterior lighting systems', duration: '2-4 hours', price: 150 },
      ],
    },
    {
      name: 'Carpentry',
      icon: '🪵',
      basePrice: 700,
      description: 'Custom carpentry services',
      subServices: [
        { title: 'Furniture Assembly', description: 'Assemble furniture and fixtures', duration: '2-3 hours', price: 60 },
        { title: 'Door Installation', description: 'Install or repair doors', duration: '3-4 hours', price: 95 },
        { title: 'Cabinet Installation', description: 'Install kitchen or bathroom cabinets', duration: '4-6 hours', price: 150 },
        { title: 'Custom Woodwork', description: 'Custom carpentry and woodwork', duration: '1-2 days', price: 200 },
        { title: 'Deck Building', description: 'Build outdoor wooden decks', duration: '3-5 days', price: 800 },
        { title: 'Crown Molding Installation', description: 'Install decorative crown molding', duration: '1-2 days', price: 180 },
        { title: 'Closet Organization System', description: 'Install custom closet systems', duration: '1-2 days', price: 250 },
        { title: 'Trim & Baseboard Installation', description: 'Install trim and baseboards', duration: '1-2 days', price: 160 },
      ],
    },
    {
      name: 'Painting',
      icon: '🎨',
      basePrice: 400,
      description: 'Interior and exterior painting',
      subServices: [
        { title: 'Interior Wall Painting', description: 'Paint interior walls and ceilings', duration: '1-2 days', price: 300 },
        { title: 'Exterior Painting', description: 'Paint exterior walls and surfaces', duration: '2-3 days', price: 300 },
        { title: 'Waterproofing', description: 'Waterproof walls and roofs', duration: '1-2 days', price: 250 },
        { title: 'Texture Painting', description: 'Decorative texture painting', duration: '2-3 days', price: 350 },
        { title: 'Cabinet Painting', description: 'Refinish kitchen cabinets', duration: '2-3 days', price: 250 },
        { title: 'Deck Staining', description: 'Stain and seal wooden decks', duration: '1-2 days', price: 220 },
        { title: 'Wallpaper Installation', description: 'Install decorative wallpaper', duration: '1-2 days', price: 200 },
        { title: 'Drywall Repair & Painting', description: 'Repair and paint damaged drywall', duration: '1-2 days', price: 180 },
      ],
    },
    {
      name: 'Cleaning',
      icon: '🧹',
      basePrice: 300,
      description: 'Comprehensive cleaning services',
      subServices: [
        { title: 'Deep House Cleaning', description: 'Complete home deep cleaning', duration: '4-6 hours', price: 120 },
        { title: 'Carpet Cleaning', description: 'Professional carpet steam cleaning', duration: '2-3 hours', price: 90 },
        { title: 'Pest Control', description: 'Eliminate pests and insects', duration: '1-2 hours', price: 80 },
        { title: 'Window Cleaning', description: 'Interior and exterior window cleaning', duration: '2-3 hours', price: 70 },
        { title: 'Move-In/Move-Out Cleaning', description: 'Thorough cleaning for moving', duration: '5-7 hours', price: 200 },
        { title: 'Upholstery Cleaning', description: 'Clean sofas and furniture', duration: '2-3 hours', price: 100 },
        { title: 'Pressure Washing', description: 'Exterior surface pressure washing', duration: '2-4 hours', price: 120 },
        { title: 'Gutter Cleaning', description: 'Clean and clear gutters', duration: '1-2 hours', price: 65 },
      ],
    },
    {
      name: 'Appliance Repair',
      icon: '🔧',
      basePrice: 550,
      description: 'Repair and maintenance services',
      subServices: [
        { title: 'Refrigerator Repair', description: 'Fix cooling and other issues', duration: '1-2 hours', price: 85 },
        { title: 'Washing Machine Repair', description: 'Fix washing machine problems', duration: '1-2 hours', price: 75 },
        { title: 'Microwave Repair', description: 'Repair microwave ovens', duration: '1 hour', price: 55 },
        { title: 'Dishwasher Repair', description: 'Fix dishwasher issues', duration: '1-2 hours', price: 70 },
        { title: 'Dryer Repair', description: 'Fix clothes dryer problems', duration: '1-2 hours', price: 80 },
        { title: 'Oven/Stove Repair', description: 'Repair cooking appliances', duration: '1-2 hours', price: 90 },
        { title: 'Garbage Disposal Repair', description: 'Fix disposal unit issues', duration: '1 hour', price: 60 },
        { title: 'Ice Maker Repair', description: 'Fix refrigerator ice makers', duration: '1-2 hours', price: 65 },
      ],
    },
    {
      name: 'HVAC',
      icon: '❄️',
      basePrice: 800,
      description: 'Heating and cooling services',
      subServices: [
        { title: 'AC Installation', description: 'Install new air conditioning unit', duration: '3-4 hours', price: 200 },
        { title: 'AC Repair & Service', description: 'Repair and service air conditioners', duration: '1-2 hours', price: 80 },
        { title: 'Heater Repair', description: 'Fix heating system issues', duration: '2-3 hours', price: 90 },
        { title: 'Duct Cleaning', description: 'Clean HVAC ducts and vents', duration: '2-3 hours', price: 120 },
        { title: 'Furnace Installation', description: 'Install new furnace system', duration: '4-6 hours', price: 350 },
        { title: 'Thermostat Installation', description: 'Install smart thermostats', duration: '1-2 hours', price: 75 },
        { title: 'Air Quality Testing', description: 'Test and improve indoor air quality', duration: '2-3 hours', price: 100 },
        { title: 'Heat Pump Service', description: 'Service and maintain heat pumps', duration: '2-3 hours', price: 110 },
      ],
    },
    {
      name: 'Landscaping',
      icon: '🌿',
      basePrice: 650,
      description: 'Outdoor landscaping services',
      subServices: [
        { title: 'Lawn Mowing', description: 'Regular lawn maintenance and mowing', duration: '1-2 hours', price: 40 },
        { title: 'Garden Design', description: 'Professional garden planning and design', duration: '1-2 days', price: 150 },
        { title: 'Tree Trimming', description: 'Trim and prune trees safely', duration: '2-3 hours', price: 100 },
        { title: 'Irrigation System', description: 'Install or repair irrigation systems', duration: '4-6 hours', price: 180 },
        { title: 'Mulching & Edging', description: 'Add mulch and edge garden beds', duration: '2-3 hours', price: 80 },
        { title: 'Sod Installation', description: 'Install new grass sod', duration: '1-2 days', price: 300 },
        { title: 'Hedge Trimming', description: 'Trim and shape hedges', duration: '1-2 hours', price: 70 },
        { title: 'Leaf Removal', description: 'Seasonal leaf cleanup', duration: '2-3 hours', price: 60 },
      ],
    },
    {
      name: 'Handyman',
      icon: '🛠️',
      basePrice: 450,
      description: 'General handyman services',
      subServices: [
        { title: 'General Repairs', description: 'Fix various household issues', duration: '1-3 hours', price: 60 },
        { title: 'TV Mounting', description: 'Mount TVs on walls securely', duration: '1-2 hours', price: 70 },
        { title: 'Shelf Installation', description: 'Install shelves and brackets', duration: '1-2 hours', price: 50 },
        { title: 'Picture Hanging', description: 'Hang pictures and artwork', duration: '30 min - 1 hour', price: 40 },
        { title: 'Drywall Patching', description: 'Patch holes and cracks in walls', duration: '1-2 hours', price: 55 },
        { title: 'Door Lock Installation', description: 'Install or replace door locks', duration: '1 hour', price: 65 },
        { title: 'Caulking & Sealing', description: 'Seal gaps and cracks', duration: '1-2 hours', price: 45 },
        { title: 'Minor Plumbing Fixes', description: 'Small plumbing repairs', duration: '1-2 hours', price: 60 },
      ],
    },
    {
      name: 'Other',
      icon: '📋',
      basePrice: 500,
      description: 'Miscellaneous services',
      subServices: [
        { title: 'Moving Service', description: 'Professional moving and packing', duration: 'Full day', price: 300 },
        { title: 'Furniture Moving', description: 'Move heavy furniture safely', duration: '2-4 hours', price: 120 },
        { title: 'Packing Service', description: 'Professional packing assistance', duration: '4-6 hours', price: 150 },
        { title: 'Storage Solutions', description: 'Organize and optimize storage', duration: '3-5 hours', price: 100 },
        { title: 'Junk Removal', description: 'Remove unwanted items and debris', duration: '2-4 hours', price: 140 },
        { title: 'Furniture Delivery', description: 'Deliver and place furniture', duration: '1-3 hours', price: 90 },
        { title: 'Home Organization', description: 'Organize and declutter spaces', duration: '3-5 hours', price: 110 },
        { title: 'Assembly Service', description: 'Assemble various items', duration: '1-3 hours', price: 70 },
      ],
    },
  ];

  const [expandedService, setExpandedService] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Service Configuration</h2>
          <p className="text-gray-600 text-sm mt-1">Manage all services and sub-categories provided by FixItNow</p>
        </div>
      </div>

      {/* Services with Sub-categories */}
      <div className="space-y-4">
        {allServices.map((service) => (
          <div key={service.name} className="bg-white rounded-lg shadow overflow-hidden">
            {/* Main Service Header */}
            <div
              onClick={() => setExpandedService(expandedService === service.name ? null : service.name)}
              className="p-6 cursor-pointer hover:bg-gray-50 transition flex items-center justify-between"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="text-4xl">{service.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                  <p className="text-gray-600 text-sm">{service.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Base Price</p>
                  <p className="text-2xl font-bold text-blue-600">₹{service.basePrice.toLocaleString()}</p>
                </div>
                {expandedService === service.name ? (
                  <ChevronUp className="text-gray-400" size={24} />
                ) : (
                  <ChevronDown className="text-gray-400" size={24} />
                )}
              </div>
            </div>

            {/* Sub-services */}
            {expandedService === service.name && (
              <div className="border-t border-gray-200 bg-gray-50 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Available Sub-Services ({service.subServices.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.subServices.map((subService, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-500 hover:shadow-md transition">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-semibold text-gray-900 flex-1">{subService.title}</h5>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{subService.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-gray-600 text-sm">
                          <Clock size={16} />
                          <span>{subService.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-blue-600 font-bold">
                          <DollarSign size={16} />
                          <span>₹{subService.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Service Statistics */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <Wrench size={32} className="text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Service Overview</h3>
            <p className="text-gray-600">
              FixItNow provides <span className="font-bold text-blue-600">{allServices.length} main services</span> with <span className="font-bold text-blue-600">{allServices.reduce((sum, s) => sum + s.subServices.length, 0)} detailed sub-categories</span> to meet all your home and office maintenance needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceConfiguration;
