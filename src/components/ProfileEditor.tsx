import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { User, MapPin, Phone, Mail, Edit, Save, X, Home } from "lucide-react";
import { api, User as UserType, Professional } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import MapPicker from '@/components/MapPicker';

import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';

interface ProfileEditorProps {
  isEditing: boolean;
  onToggleEdit: () => void;
}

interface Address {
  _id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  coordinates?: { lat: number; lng: number };
  label?: string;
  isDefault?: boolean;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: 'user' | 'professional';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  addresses?: Address[];
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
    coordinates?: { lat: number; lng: number };
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences?: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      showPhone: boolean;
      showEmail: boolean;
    };
  };
}

interface ProfessionalProfile extends UserType {
  services: string[];
  experience: number;
  city: string;
  bio?: string;
  businessName?: string;
  zipCode?: string;
  serviceArea?: { radius?: number };
  locationPoint?: { type: 'Point'; coordinates: [number, number] };
  verificationStatus: 'pending' | 'in_review' | 'verified' | 'rejected';
  rating: {
    average: number;
    count: number;
  };
  bankAccount?: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branchName?: string;
    accountType: 'savings' | 'current';
    isVerified: boolean;
    addedAt: string;
  };
  hourlyRate?: number;
}

const ProfileEditor = ({ isEditing, onToggleEdit }: ProfileEditorProps) => {
  const { user, userType, updateUserLocal } = useAuth();
  const { isLoaded: mapsLoaded } = useJsApiLoader({
    googleMapsApiKey: (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries: ['places'] as any,
  });
  const autoRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<Partial<UserType | ProfessionalProfile>>({});

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        addresses: user.addresses || [],
        emergencyContact: user.emergencyContact || {
          name: '',
          phone: '',
          relationship: '',
        },
        preferences: user.preferences || {
          notifications: {
            email: true,
            sms: false,
            push: true,
          },
          privacy: {
            showPhone: false,
            showEmail: false,
          },
        },
        // Professional specific fields
        ...(userType === 'professional' && {
          bio: (user as ProfessionalProfile).bio || '',
          services: (user as ProfessionalProfile).services || [],
          experience: (user as ProfessionalProfile).experience || 0,
          hourlyRate: (user as ProfessionalProfile).hourlyRate || 0,
          city: (user as ProfessionalProfile).city || '',
        }),
      });
    }
  }, [user, userType]);

  const handleSave = async () => {
    try {
      setLoading(true);

      let response;
      if (userType === 'professional') {
        response = await api.updateProfessionalProfile(profileData);
      } else {
        response = await api.updateProfile(profileData);
      }

      if (response.success) {
        const updatedUser = userType === 'professional'
          ? response.data?.professional
          : response.data?.user;

        if (updatedUser) {
          updateUserLocal(updatedUser);
        }

        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        onToggleEdit();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (service: string, checked: boolean) => {
    if (userType !== 'professional') return;

    setProfileData(prev => ({
      ...prev,
      services: checked
        ? [...((prev as ProfessionalProfile).services || []), service]
        : ((prev as ProfessionalProfile).services || []).filter(s => s !== service),
    }));
  };

  const availableServices = [
    'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning',
    'Appliance Repair', 'HVAC', 'Landscaping', 'Handyman', 'Other'
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Basic Information</span>
            </CardTitle>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={onToggleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              {isEditing ? (
                <Input
                  id="firstName"
                  value={profileData.firstName || ''}
                  onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              ) : (
                <p className="text-sm font-medium">{user.firstName}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              {isEditing ? (
                <Input
                  id="lastName"
                  value={profileData.lastName || ''}
                  onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              ) : (
                <p className="text-sm font-medium">{user.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={profileData.email || ''}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm">{user.email}</p>
                  {user.isEmailVerified && (
                    <Badge variant="secondary" className="text-xs">Verified</Badge>
                  )}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={profileData.phone || ''}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm">{user.phone}</p>
                  {user.isPhoneVerified && (
                    <Badge variant="secondary" className="text-xs">Verified</Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {userType === 'professional' && (
            <>
              <div>
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    placeholder="Tell potential clients about yourself..."
                    value={(profileData as ProfessionalProfile).bio || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm">{(user as ProfessionalProfile).bio || 'No bio provided'}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="experience">Years of Experience</Label>
                  {isEditing ? (
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      value={(profileData as ProfessionalProfile).experience || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, experience: parseInt(e.target.value) }))}
                    />
                  ) : (
                    <p className="text-sm font-medium">{(user as ProfessionalProfile).experience} years</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  {isEditing ? (
                    <Input
                      id="hourlyRate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={(profileData as ProfessionalProfile).hourlyRate || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) }))}
                    />
                  ) : (
                    <p className="text-sm font-medium">${(user as ProfessionalProfile).hourlyRate}/hr</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  {isEditing ? (
                    <Input
                      id="city"
                      value={(profileData as ProfessionalProfile).city || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm">{(user as ProfessionalProfile).city}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Address Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.addresses?.length > 0 ? (
            <div className="space-y-3">
              <Label>Saved Addresses</Label>
              <div className="grid gap-2">
                {user.addresses.map((addr, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <Home className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium">
                          {addr.label || `Address ${index + 1}`}
                          {addr.isDefault && (
                            <Badge variant="default" className="ml-2">Default</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{addr.street}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {addr.city}, {addr.state} - {addr.zipCode}
                        </div>
                      </div>
                      {isEditing && addr._id && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Set as default address
                            api.setDefaultAddress(addr._id!);
                          }}
                        >
                          Set Default
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <Label htmlFor="street">Street Address</Label>
              {isEditing ? (
                <Input
                  id="street"
                  value={profileData.address?.street || ''}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    address: { ...prev.address, street: e.target.value }
                  }))}
                />
              ) : (
                <p className="text-sm">{user.address?.street || 'Not provided'}</p>
              )}
            </div>
          )}

          {isEditing && user.addresses?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={profileData.addresses?.[0]?.city || ''}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    addresses: [{ ...prev.addresses?.[0], city: e.target.value }]
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={profileData.addresses?.[0]?.state || ''}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    addresses: [{ ...prev.addresses?.[0], state: e.target.value }]
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={profileData.addresses?.[0]?.zipCode || ''}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    addresses: [{ ...prev.addresses?.[0], zipCode: e.target.value }]
                  }))}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Services (Professional only) */}
      {userType === 'professional' && (
        <Card>
          <CardHeader>
            <CardTitle>Services Offered</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {availableServices.map((service) => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={service}
                      checked={((profileData as ProfessionalProfile).services || []).includes(service)}
                      onCheckedChange={(checked) => handleServiceToggle(service, checked as boolean)}
                    />
                    <Label htmlFor={service} className="text-sm">
                      {service}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {((user as ProfessionalProfile).services || []).map((service) => (
                  <Badge key={service} variant="secondary">
                    {service}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="emergencyName">Name</Label>
              {isEditing ? (
                <Input
                  id="emergencyName"
                  value={profileData.emergencyContact?.name || ''}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                  }))}
                />
              ) : (
                <p className="text-sm">{user.emergencyContact?.name || 'Not provided'}</p>
              )}
            </div>
            <div>
              <Label htmlFor="emergencyPhone">Phone</Label>
              {isEditing ? (
                <Input
                  id="emergencyPhone"
                  value={profileData.emergencyContact?.phone || ''}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                  }))}
                />
              ) : (
                <p className="text-sm">{user.emergencyContact?.phone || 'Not provided'}</p>
              )}
            </div>
            <div>
              <Label htmlFor="emergencyRelationship">Relationship</Label>
              {isEditing ? (
                <Input
                  id="emergencyRelationship"
                  value={profileData.emergencyContact?.relationship || ''}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                  }))}
                />
              ) : (
                <p className="text-sm">{user.emergencyContact?.relationship || 'Not provided'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save/Cancel buttons */}
      {isEditing && (
        <div className="flex space-x-4">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onToggleEdit}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileEditor;
