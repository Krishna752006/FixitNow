import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Home, Plus, Edit, Trash2, MapPin, Star } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/services/api';
import LocationPicker from './LocationPicker';

interface Address {
  _id?: string;
  label: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isDefault?: boolean;
}

interface AddressManagerProps {
  onAddressSelect?: (address: Address) => void;
  showSelector?: boolean;
}

const AddressManager: React.FC<AddressManagerProps> = ({ onAddressSelect, showSelector = false }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setIsLoading(true);
      const response = await api.getUserAddresses();
      if (response.success) {
        setAddresses(response.data.addresses || []);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowLocationPicker(true);
    setShowAddDialog(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowLocationPicker(true);
    setShowAddDialog(true);
  };

  const handleSaveAddress = async (location: any) => {
    try {
      const addressData: Address = {
        label: editingAddress?.label || 'Home',
        address: location.address,
        city: location.city,
        state: location.state,
        zipCode: location.zipCode,
        coordinates: location.coordinates,
        isDefault: addresses.length === 0 || editingAddress?.isDefault
      };

      let response;
      if (editingAddress?._id) {
        response = await api.updateUserAddress(editingAddress._id, addressData);
      } else {
        response = await api.addUserAddress(addressData);
      }

      if (response.success) {
        toast({
          title: "Success",
          description: editingAddress?._id ? "Address updated successfully" : "Address added successfully",
        });
        await loadAddresses();
        setShowAddDialog(false);
        setShowLocationPicker(false);
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: "Error",
        description: "Failed to save address. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const response = await api.deleteUserAddress(addressId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Address deleted successfully",
        });
        await loadAddresses();
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: "Error",
        description: "Failed to delete address. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await api.setDefaultAddress(addressId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Default address updated",
        });
        await loadAddresses();
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      toast({
        title: "Error",
        description: "Failed to set default address. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Saved Addresses
              </CardTitle>
              <CardDescription>Manage your delivery and service addresses</CardDescription>
            </div>
            <Button onClick={handleAddAddress} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading addresses...</div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-8">
              <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No saved addresses yet</p>
              <Button onClick={handleAddAddress} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Address
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {addresses.map((address) => (
                <div
                  key={address._id}
                  className={`p-4 border rounded-lg transition-all ${
                    showSelector ? 'cursor-pointer hover:border-primary hover:bg-primary/5' : ''
                  } ${address.isDefault ? 'border-primary bg-primary/5' : ''}`}
                  onClick={() => showSelector && onAddressSelect?.(address)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Home className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{address.label}</span>
                          {address.isDefault && (
                            <Badge variant="default" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{address.address}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {address.city}, {address.state} - {address.zipCode}
                        </p>
                      </div>
                    </div>
                    {!showSelector && (
                      <div className="flex gap-2">
                        {!address.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefault(address._id!)}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAddress(address)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAddress(address._id!)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Address Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingAddress?._id ? 'Edit Address' : 'Add New Address'}</DialogTitle>
            <DialogDescription>
              {editingAddress?._id ? 'Update your address details' : 'Add a new address to your account'}
            </DialogDescription>
          </DialogHeader>
          {showLocationPicker && (
            <LocationPicker
              onLocationSelect={handleSaveAddress}
              initialAddress={editingAddress?.address}
              initialCoordinates={editingAddress?.coordinates}
              title={editingAddress?._id ? 'Update Address' : 'Add Address'}
              description="Search for an address or enter manually"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddressManager;
