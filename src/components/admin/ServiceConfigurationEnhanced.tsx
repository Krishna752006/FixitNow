import React, { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronUp, Wrench, Clock, DollarSign, Save, X, Edit2 } from 'lucide-react';
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

interface EditingPrice {
  serviceName: string;
  subServiceTitle: string;
  newPrice: number;
}

const ServiceConfigurationEnhanced: React.FC = () => {
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<EditingPrice | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchServicePrices();
  }, []);

  const fetchServicePrices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/services/pricing');
      if (response.success) {
        // Merge with default services structure
        const updatedServices = defaultServices.map(service => ({
          ...service,
          subServices: service.subServices.map(subService => {
            const dbPrice = response.data.find(
              (p: any) => p.serviceName === service.name && p.subServiceTitle === subService.title
            );
            return {
              ...subService,
              price: dbPrice?.basePrice || subService.price,
            };
          }),
        }));
        setAllServices(updatedServices);
      }
    } catch (error) {
      console.error('Error fetching service prices:', error);
      setAllServices(defaultServices);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrice = async () => {
    if (!editingPrice) return;

    try {
      setLoading(true);
      const response = await api.post('/admin/services/update-price', {
        serviceName: editingPrice.serviceName,
        subServiceTitle: editingPrice.subServiceTitle,
        newPrice: editingPrice.newPrice,
      });

      if (response.success) {
        setMessage({ type: 'success', text: 'Price updated successfully!' });
        setEditingPrice(null);
        fetchServicePrices();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update price' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPrice = (serviceName: string, subServiceTitle: string, currentPrice: number) => {
    setEditingPrice({
      serviceName,
      subServiceTitle,
      newPrice: currentPrice,
    });
  };

  const defaultServices: Service[] = [
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
    // Add other services similarly...
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Service Configuration</h2>
          <p className="text-gray-600 text-sm mt-1">Manage all services and update pricing in real-time</p>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Edit Price Modal */}
      {editingPrice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Edit Price</h3>
              <button
                onClick={() => setEditingPrice(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 text-sm mb-2">Service: {editingPrice.serviceName}</p>
              <p className="text-gray-600 text-sm mb-4">Sub-service: {editingPrice.subServiceTitle}</p>

              <label className="block text-sm font-medium text-gray-700 mb-2">New Price (₹)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={editingPrice.newPrice}
                onChange={(e) => setEditingPrice({
                  ...editingPrice,
                  newPrice: Math.max(0, parseInt(e.target.value) || 0),
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSavePrice}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Save size={18} />
                <span>Save</span>
              </button>
              <button
                onClick={() => setEditingPrice(null)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services List */}
      <div className="space-y-4">
        {(loading ? defaultServices : allServices).map((service) => (
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
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 text-blue-600 font-bold">
                            <DollarSign size={16} />
                            <span>₹{subService.price.toLocaleString()}</span>
                          </div>
                          <button
                            onClick={() => handleEditPrice(service.name, subService.title, subService.price)}
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Edit price"
                          >
                            <Edit2 size={16} />
                          </button>
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
              FixItNow provides <span className="font-bold text-blue-600">{(loading ? defaultServices : allServices).length} main services</span> with <span className="font-bold text-blue-600">{(loading ? defaultServices : allServices).reduce((sum, s) => sum + s.subServices.length, 0)} detailed sub-categories</span> to meet all your home and office maintenance needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceConfigurationEnhanced;
