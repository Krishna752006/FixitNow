import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, DollarSign, AlertCircle, Plus, Home } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { api, CreateJobData } from '@/services/api';
import LocationPicker from '@/components/LocationPicker';


interface CreateJobModalProps {
  trigger?: React.ReactNode;
  onJobCreated?: () => void;
  preselectedProfessional?: string;
  preselectedService?: string;
  user?: any; // Add user prop
}

const CreateJobModal: React.FC<CreateJobModalProps> = ({
  trigger,
  onJobCreated,
  preselectedProfessional,
  preselectedService,
  user
}) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [isAddressNew, setIsAddressNew] = useState(false);
  const [formData, setFormData] = useState<CreateJobData>({
    title: '',
    description: '',
    category: preselectedService || '',
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
    budget: {
      min: 0,
      max: 0
    },
    estimatedDuration: 2
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const serviceCategories = [
    'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning',
    'Appliance Repair', 'HVAC', 'Landscaping', 'Handyman', 'Other'
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low Priority', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High Priority', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ];

  const fetchSavedAddresses = async () => {
    try {
      if (user?.addresses) {
        const formattedAddresses = user.addresses.map((addr, index) => ({
          id: addr._id || `new-${index}`,
          label: addr.label || `Address ${index + 1}`,
          address: addr.street,
          city: addr.city,
          state: addr.state,
          zipCode: addr.zipCode,
          coordinates: addr.coordinates, // Assuming coordinates are stored with the address
        }));
        setSavedAddresses(formattedAddresses);
      }
    } catch (error) {
      console.error('Error fetching saved addresses:', error);
    }
  };

  useEffect(() => {
    if (open && user) {
      fetchSavedAddresses();
      // Auto-select the first address if available
      if (user.addresses && user.addresses.length > 0) {
        const firstAddress = user.addresses[0];
        setSelectedAddress(firstAddress._id || 'new-0');
        setFormData(prev => ({
          ...prev,
          location: {
            address: firstAddress.street,
            city: firstAddress.city || '',
            state: firstAddress.state || '',
            zipCode: firstAddress.zipCode || '',
            coordinates: firstAddress.coordinates,
          },
        }));
        setIsAddressNew(false);
      } else {
        // If no addresses, show the new address form
        setSelectedAddress(null);
        setIsAddressNew(true);
      }
    } else if (!open) {
      // Clear selection when modal is closed
      setSelectedAddress(null);
      setIsAddressNew(false);
    }
  }, [open, user]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CreateJobData] as any),
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

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Service category is required';
    }

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

    if (formData.budget.min <= 0) {
      newErrors['budget.min'] = 'Minimum budget must be greater than 0';
    }

    if (formData.budget.max <= formData.budget.min) {
      newErrors['budget.max'] = 'Maximum budget must be greater than minimum';
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

      // Save new address to profile if it's not from saved addresses
      if (isAddressNew && formData.location.address && formData.location.city) {
        await api.addAddress({
          street: formData.location.address,
          city: formData.location.city,
          state: formData.location.state || '',
          zipCode: formData.location.zipCode || '',
          coordinates: formData.location.coordinates,
          label: `${formData.location.address.substring(0, 20)}...`,
        });
      }

      const response = await api.createJob(formData);

      if (response.success) {
        toast({
          title: "Job Created Successfully!",
          description: "Your job has been posted and nearby professionals will be notified.",
        });
        onJobCreated?.();

        // Reset form
        setFormData({
          title: '',
          description: '',
          category: preselectedService || '',
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
          budget: {
            min: 0,
            max: 0
          },
          estimatedDuration: 2
        });
        setSelectedAddress(null);
        setIsAddressNew(false);
      } else {
        toast({
          title: "Failed to Create Job",
          description: response.message || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTrigger = (
    <Button className="w-full">
      <Plus className="h-4 w-4 mr-2" />
      Create New Job
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Describe your service needs and we'll connect you with qualified professionals.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Fix leaky kitchen faucet"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about what needs to be done..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={errors.description ? 'border-red-500' : ''}
                  rows={3}
                />
                {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Service Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={option.color}>{option.label}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

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
              {!isAddressNew && savedAddresses.length > 0 ? (
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
                      setIsAddressNew(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Address
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <LocationPicker
                    onLocationSelect={(location) => {
                      setFormData(prev => ({
                        ...prev,
                        location: {
                          address: location.address,
                          city: location.city,
                          state: location.state,
                          zipCode: location.zipCode,
                          coordinates: location.coordinates
                        }
                      }));
                      setIsAddressNew(false);
                      toast({
                        title: "Address Added",
                        description: "New address has been set for this job"
                      });
                    }}
                    initialAddress={formData.location.address}
                    initialCoordinates={formData.location.coordinates}
                    title="Add New Address"
                    description="Search for an address or enter manually"
                  />
                  
                  {savedAddresses.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsAddressNew(false);
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

          {/* Scheduling & Budget */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Scheduling & Budget
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
                  {errors.scheduledTime && <p className="text-sm text-red-500 mt-1">{errors.scheduledTime}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="budgetMin">Min Budget ($)</Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    placeholder="50"
                    value={formData.budget.min || ''}
                    onChange={(e) => handleInputChange('budget.min', parseInt(e.target.value) || 0)}
                    className={errors['budget.min'] ? 'border-red-500' : ''}
                  />
                  {errors['budget.min'] && <p className="text-sm text-red-500 mt-1">{errors['budget.min']}</p>}
                </div>

                <div>
                  <Label htmlFor="budgetMax">Max Budget ($)</Label>
                  <Input
                    id="budgetMax"
                    type="number"
                    placeholder="200"
                    value={formData.budget.max || ''}
                    onChange={(e) => handleInputChange('budget.max', parseInt(e.target.value) || 0)}
                    className={errors['budget.max'] ? 'border-red-500' : ''}
                  />
                  {errors['budget.max'] && <p className="text-sm text-red-500 mt-1">{errors['budget.max']}</p>}
                </div>

                <div>
                  <Label htmlFor="duration">Est. Duration (hrs)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="2"
                    value={formData.estimatedDuration || ''}
                    onChange={(e) => handleInputChange('estimatedDuration', parseInt(e.target.value) || 2)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={async () => {
                if (formData.location.coordinates && formData.location.city) {
                  try {
                    const response = await api.debugLocation({
                      lat: formData.location.coordinates.lat,
                      lng: formData.location.coordinates.lng,
                      city: formData.location.city,
                      zipCode: formData.location.zipCode
                    });
                    if (response.success) {
                      toast({
                        title: "Location Debug",
                        description: `Found ${response.data.matchingProfessionals} professionals in ${formData.location.city}`,
                      });
                    }
                  } catch (error) {
                    console.error('Debug error:', error);
                  }
                } else {
                  toast({
                    title: "Debug Error",
                    description: "Please set location coordinates first",
                    variant: "destructive",
                  });
                }
              }}
            >
              Debug Location
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Job...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Job
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateJobModal;