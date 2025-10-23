import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Wrench } from 'lucide-react';
import { api } from '../../services/api';

interface Service {
  name: string;
  description: string;
  icon: string;
  basePrice: number;
}

const ServiceConfiguration: React.FC = () => {
  // All services provided by FixItNow
  const allServices: Service[] = [
    {
      name: 'Plumbing',
      description: 'Professional plumbing services including pipe repairs, installations, and maintenance',
      icon: '🚰',
      basePrice: 500,
    },
    {
      name: 'Electrical',
      description: 'Expert electrical work including wiring, installations, and troubleshooting',
      icon: '⚡',
      basePrice: 600,
    },
    {
      name: 'Carpentry',
      description: 'Custom carpentry services including furniture, shelves, and structural work',
      icon: '🪵',
      basePrice: 700,
    },
    {
      name: 'Painting',
      description: 'Interior and exterior painting services with professional finishing',
      icon: '🎨',
      basePrice: 400,
    },
    {
      name: 'Cleaning',
      description: 'Comprehensive cleaning services for homes and offices',
      icon: '🧹',
      basePrice: 300,
    },
    {
      name: 'Appliance Repair',
      description: 'Repair and maintenance for all major household appliances',
      icon: '🔧',
      basePrice: 550,
    },
    {
      name: 'HVAC',
      description: 'Heating, ventilation, and air conditioning services and maintenance',
      icon: '❄️',
      basePrice: 800,
    },
    {
      name: 'Landscaping',
      description: 'Outdoor landscaping and garden maintenance services',
      icon: '🌿',
      basePrice: 650,
    },
    {
      name: 'Handyman',
      description: 'General handyman services for various home repair needs',
      icon: '🛠️',
      basePrice: 450,
    },
    {
      name: 'Other',
      description: 'Miscellaneous services and custom requests',
      icon: '📋',
      basePrice: 500,
    },
  ];

  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    serviceName: '',
    basePrice: '',
    description: '',
  });

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/admin/services/categories', {
        categoryName: formData.serviceName,
        basePrice: parseFloat(formData.basePrice),
        description: formData.description,
      });
      if (response.success) {
        setFormData({ serviceName: '', basePrice: '', description: '' });
        setShowForm(false);
        alert('Service added successfully!');
      }
    } catch (error) {
      console.error('Error adding service:', error);
      alert('Error adding service');
    }
  };

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setFormData({
      serviceName: service.name,
      basePrice: service.basePrice.toString(),
      description: service.description,
    });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Service Configuration</h2>
          <p className="text-gray-600 text-sm mt-1">Manage all services provided by FixItNow</p>
        </div>
        <button
          onClick={() => {
            setSelectedService(null);
            setFormData({ serviceName: '', basePrice: '', description: '' });
            setShowForm(!showForm);
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          <span>Add Custom Service</span>
        </button>
      </div>

      {/* Add Service Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedService ? `Configure ${selectedService.name}` : 'Add Custom Service'}
          </h3>
          <form onSubmit={handleAddService} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name
                </label>
                <input
                  type="text"
                  value={formData.serviceName}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Price (₹)
                </label>
                <input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, basePrice: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                {selectedService ? 'Update Service' : 'Add Service'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setSelectedService(null);
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Services Grid */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">All FixItNow Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {allServices.map((service, index) => (
            <div
              key={index}
              onClick={() => handleSelectService(service)}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition cursor-pointer border-2 border-transparent hover:border-blue-500"
            >
              <div className="text-4xl mb-3">{service.icon}</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h4>
              <p className="text-gray-600 text-xs mb-3 line-clamp-2">{service.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-blue-600">
                  ₹{service.basePrice.toLocaleString()}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectService(service);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <Wrench size={32} className="text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Service Overview</h3>
            <p className="text-gray-600">
              FixItNow provides <span className="font-bold text-blue-600">{allServices.length} professional services</span> to meet all your home and office maintenance needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceConfiguration;
