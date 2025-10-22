import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, DollarSign, AlertCircle, Plus, Home, Star, User, UserCheck, UserPlus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { api, CreateJobData } from '@/services/api';
import { getCategoryPricing, DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '@/config/pricing';

interface ScheduleJobModalProps {
  onJobScheduled?: () => void;
  category: string;
  serviceName?: string;
  servicePrice?: number;
  serviceDuration?: string;
  user?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professionalId?: string;
}

const ScheduleJobModal: React.FC<ScheduleJobModalProps> = ({
  onJobScheduled,
  category,
  serviceName,
  servicePrice,
  serviceDuration,
  user,
  open,
  onOpenChange,
  professionalId
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [showAddressSelector, setShowAddressSelector] = useState(true);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  
  // Get pricing - use service-specific price if provided, otherwise fall back to category pricing
  const categoryPricing = getCategoryPricing(category);
  const fixedPrice = servicePrice || categoryPricing?.basePrice || 500;
  
  // Parse duration string (e.g., "1-2 hours" -> 1.5)
  const parseDuration = (durationStr?: string): number => {
    if (!durationStr) return categoryPricing?.estimatedDuration || 2;
    const match = durationStr.match(/(\d+)(?:-(\d+))?/);
    if (match) {
      const min = parseInt(match[1]);
      const max = match[2] ? parseInt(match[2]) : min;
      return (min + max) / 2;
    }
    return categoryPricing?.estimatedDuration || 2;
  };
  
  const estimatedDuration = parseDuration(serviceDuration);
  
  const [formData, setFormData] = useState<CreateJobData>({
    title: serviceName || `${category} Service`,
    description: '',
    category: category,
    priority: 'medium',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      coordinates: undefined
    },
    scheduledDate: '',
    scheduledTime: '',
    estimatedDuration: estimatedDuration,
    budget: {
      min: fixedPrice,
      max: fixedPrice
    }
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const priorityOptions = [
    { value: 'low', label: 'Low Priority', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High Priority', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ];

  const fetchSavedAddresses = async () => {
    try {
      // For now, we'll use the user's current address as a saved address
      // In a real app, this would fetch from the backend
      const userAddress = {
        id: 'current',
        label: 'Current Address',
        address: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
        coordinates: user?.address?.coordinates || null
      };

      setSavedAddresses([userAddress]);
    } catch (error) {
      console.error('Error fetching saved addresses:', error);
    }
  };

  // Load saved addresses when modal opens
  useEffect(() => {
    if (open && user) {
      fetchSavedAddresses();
      // Auto-select current address if available
      if (user.address?.street) {
        setSelectedAddress('current');
        setFormData(prev => ({
          ...prev,
          location: {
            address: user.address.street,
            city: user.address.city || '',
            state: user.address.state || '',
            zipCode: user.address.zipCode || '',
            coordinates: user.address.coordinates
          }
        }));
      }
    }
  }, [open, user]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof formData] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.location.address.trim()) {
      newErrors['location.address'] = 'Address is required';
    }

    if (!formData.location.city.trim()) {
      newErrors['location.city'] = 'City is required';
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Scheduled date is required';
    }

    if (!formData.scheduledTime) {
      newErrors.scheduledTime = 'Scheduled time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      const jobData = {
        ...formData,
        ...(professionalId && { professionalId })
      };

      const response = await api.scheduleJob(jobData);

      if (response.success) {
        const notificationMsg = professionalId 
          ? `Job has been sent to the selected professional.`
          : `Professionals in ${formData.location.city} will be notified. They can accept your job request.`;
        
        toast({
          title: "Job Posted Successfully!",
          description: notificationMsg,
        });
        onJobScheduled?.();

        // Reset form
        setFormData({
          title: serviceName || `${category} Service`,
          description: '',
          category: category,
          priority: 'medium',
          location: {
            address: '',
            city: '',
            state: '',
            zipCode: '',
            coordinates: undefined
          },
          scheduledDate: '',
          scheduledTime: '',
          estimatedDuration: estimatedDuration,
          budget: {
            min: fixedPrice,
            max: fixedPrice
          }
        });
        setSelectedAddress(null);
        setShowLocationPicker(false);
      } else {
        toast({
          title: "Failed to Schedule Job",
          description: response.message || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error scheduling job:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule {serviceName || category + ' Service'}</DialogTitle>
          <DialogDescription>
            Enter your job details. Professionals in your area will be automatically notified and can accept your request.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Job Location
              </CardTitle>
              <CardDescription>
                Choose from saved addresses or add a new one
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Address Selector */}
              {!showLocationPicker && savedAddresses.length > 0 && (
                <div className="space-y-3">
                  <Label>Select Address</Label>
                  <div className="grid gap-2">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => {
                          setSelectedAddress(addr.id);
                          setFormData(prev => ({
                            ...prev,
                            location: {
                              address: addr.address,
                              city: addr.city,
                              state: addr.state,
                              zipCode: addr.zipCode,
                              coordinates: addr.coordinates
                            }
                          }));
                          toast({
                            title: "Address Selected",
                            description: addr.label
                          });
                        }}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/5 ${
                          selectedAddress === addr.id ? 'border-primary bg-primary/10' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Home className="h-5 w-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium">{addr.label}</div>
                            <div className="text-sm text-muted-foreground">{addr.address}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {addr.city}, {addr.state} - {addr.zipCode}
                            </div>
                          </div>
                          {selectedAddress === addr.id && (
                            <Badge variant="default">Selected</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setShowAddressSelector(false);
                      setShowLocationPicker(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Address
                  </Button>
                </div>
              )}

              {/* Simple Address Form */}
              {(showLocationPicker || savedAddresses.length === 0) && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      placeholder="Enter street address"
                      value={formData.location.address}
                      onChange={(e) => handleInputChange('location.address', e.target.value)}
                      className={errors['location.address'] ? 'border-red-500' : ''}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="Enter city"
                        value={formData.location.city}
                        onChange={(e) => handleInputChange('location.city', e.target.value)}
                        className={errors['location.city'] ? 'border-red-500' : ''}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        placeholder="Enter state"
                        value={formData.location.state}
                        onChange={(e) => handleInputChange('location.state', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      placeholder="Enter ZIP code"
                      value={formData.location.zipCode}
                      onChange={(e) => handleInputChange('location.zipCode', e.target.value)}
                    />
                  </div>

                  {savedAddresses.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setShowLocationPicker(false);
                        setShowAddressSelector(true);
                      }}
                    >
                      Back to Saved Addresses
                    </Button>
                  )}
                </div>
              )}

              {errors['location.address'] && (
                <p className="text-sm text-red-500">{errors['location.address']}</p>
              )}
              {errors['location.city'] && (
                <p className="text-sm text-red-500">{errors['location.city']}</p>
              )}
            </CardContent>
          </Card>

          {/* Scheduling & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Scheduling & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduledDate">Preferred Date</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                    className={errors.scheduledDate ? 'border-red-500' : ''}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.scheduledDate && <p className="text-sm text-red-500 mt-1">{errors.scheduledDate}</p>}
                </div>

                <div>
                  <Label htmlFor="scheduledTime">Preferred Time</Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                    className={errors.scheduledTime ? 'border-red-500' : ''}
                  />
                  {errors.scheduledTime && <p className="text-sm text-muted-foreground mt-1">{errors.scheduledTime}</p>}
                </div>
              </div>

              {/* Pricing Information */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <Label className="text-base font-semibold">Service Pricing</Label>
                  </div>
                  {categoryPricing && (
                    <Badge className={DIFFICULTY_COLORS[categoryPricing.difficulty]}>
                      {DIFFICULTY_LABELS[categoryPricing.difficulty]}
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Fixed Rate</Label>
                    <div className="mt-1">
                      <p className="text-2xl font-bold text-primary">₹{fixedPrice}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {categoryPricing?.description || 'Standard service rate'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Estimated Duration</Label>
                    <div className="mt-1">
                      <p className="text-2xl font-bold">{estimatedDuration} hrs</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Approximate time needed
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-2 bg-white/50 rounded text-xs text-muted-foreground">
                  <strong>Note:</strong> This is the estimated price for {serviceName || category + ' services'}. Final price may vary based on actual work completed.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Scheduling Job...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Job
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleJobModal;