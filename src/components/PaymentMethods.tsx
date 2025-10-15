import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Plus, Trash2, Edit, Check } from "lucide-react";
import { api, PaymentMethod } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const PaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingMethod, setEditingMethod] = useState<string | null>(null);
  const { toast } = useToast();

  const [newMethod, setNewMethod] = useState({
    type: 'card' as 'card' | 'bank' | 'digital_wallet',
    name: '',
    details: {},
    isDefault: false,
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await api.getPaymentMethods();
      if (response.success) {
        setPaymentMethods(response.data.paymentMethods);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = async () => {
    try {
      const response = await api.addPaymentMethod(newMethod);
      if (response.success) {
        setPaymentMethods(prev => [...prev, response.data.paymentMethod]);
        setNewMethod({
          type: 'card',
          name: '',
          details: {},
          isDefault: false,
        });
        setIsAddingNew(false);
        toast({
          title: "Success",
          description: "Payment method added successfully",
        });
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast({
        title: "Error",
        description: "Failed to add payment method",
        variant: "destructive",
      });
    }
  };

  const updatePaymentMethod = async (methodId: string, updates: Partial<PaymentMethod>) => {
    try {
      const response = await api.updatePaymentMethod(methodId, updates);
      if (response.success) {
        setPaymentMethods(prev =>
          prev.map(method =>
            method._id === methodId ? { ...method, ...updates } : method
          )
        );
        setEditingMethod(null);
        toast({
          title: "Success",
          description: "Payment method updated successfully",
        });
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast({
        title: "Error",
        description: "Failed to update payment method",
        variant: "destructive",
      });
    }
  };

  const deletePaymentMethod = async (methodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      const response = await api.deletePaymentMethod(methodId);
      if (response.success) {
        setPaymentMethods(prev => prev.filter(method => method._id !== methodId));
        toast({
          title: "Success",
          description: "Payment method deleted successfully",
        });
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast({
        title: "Error",
        description: "Failed to delete payment method",
        variant: "destructive",
      });
    }
  };

  const renderPaymentMethodDetails = (method: PaymentMethod) => {
    switch (method.type) {
      case 'card':
        return (
          <div className="text-sm text-muted-foreground">
            <p>•••• •••• •••• {method.details.lastFour}</p>
            <p>{method.details.cardType} • Expires {method.details.expiryMonth}/{method.details.expiryYear}</p>
          </div>
        );
      case 'bank':
        return (
          <div className="text-sm text-muted-foreground">
            <p>{method.details.bankName}</p>
            <p>•••••{method.details.accountNumber?.slice(-4)}</p>
          </div>
        );
      case 'digital_wallet':
        return (
          <div className="text-sm text-muted-foreground">
            <p>{method.details.walletType}</p>
            <p>{method.details.walletId}</p>
          </div>
        );
      default:
        return null;
    }
  };

  const renderAddMethodForm = () => {
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="method-type">Payment Method Type</Label>
          <Select 
            value={newMethod.type} 
            onValueChange={(value) => setNewMethod(prev => ({ 
              ...prev, 
              type: value as typeof newMethod.type,
              details: {} 
            }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="card">Credit/Debit Card</SelectItem>
              <SelectItem value="bank">Bank Account</SelectItem>
              <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="method-name">Method Name</Label>
          <Input
            id="method-name"
            placeholder="e.g., Personal Visa"
            value={newMethod.name}
            onChange={(e) => setNewMethod(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>

        {newMethod.type === 'card' && (
          <>
            <div>
              <Label htmlFor="card-number">Card Number</Label>
              <Input
                id="card-number"
                placeholder="1234 5678 9012 3456"
                value={newMethod.details.cardNumber || ''}
                onChange={(e) => setNewMethod(prev => ({
                  ...prev,
                  details: { ...prev.details, cardNumber: e.target.value }
                }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="expiry-month">Month</Label>
                <Input
                  id="expiry-month"
                  placeholder="MM"
                  type="number"
                  min="1"
                  max="12"
                  value={newMethod.details.expiryMonth || ''}
                  onChange={(e) => setNewMethod(prev => ({
                    ...prev,
                    details: { ...prev.details, expiryMonth: parseInt(e.target.value) }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="expiry-year">Year</Label>
                <Input
                  id="expiry-year"
                  placeholder="YYYY"
                  type="number"
                  min={new Date().getFullYear()}
                  value={newMethod.details.expiryYear || ''}
                  onChange={(e) => setNewMethod(prev => ({
                    ...prev,
                    details: { ...prev.details, expiryYear: parseInt(e.target.value) }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="card-type">Card Type</Label>
                <Select 
                  value={newMethod.details.cardType || ''}
                  onValueChange={(value) => setNewMethod(prev => ({
                    ...prev,
                    details: { ...prev.details, cardType: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visa">Visa</SelectItem>
                    <SelectItem value="mastercard">MasterCard</SelectItem>
                    <SelectItem value="amex">American Express</SelectItem>
                    <SelectItem value="discover">Discover</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {newMethod.type === 'bank' && (
          <>
            <div>
              <Label htmlFor="bank-name">Bank Name</Label>
              <Input
                id="bank-name"
                placeholder="Bank of America"
                value={newMethod.details.bankName || ''}
                onChange={(e) => setNewMethod(prev => ({
                  ...prev,
                  details: { ...prev.details, bankName: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="account-number">Account Number</Label>
              <Input
                id="account-number"
                placeholder="123456789"
                value={newMethod.details.accountNumber || ''}
                onChange={(e) => setNewMethod(prev => ({
                  ...prev,
                  details: { ...prev.details, accountNumber: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="routing-number">Routing Number</Label>
              <Input
                id="routing-number"
                placeholder="021000021"
                value={newMethod.details.routingNumber || ''}
                onChange={(e) => setNewMethod(prev => ({
                  ...prev,
                  details: { ...prev.details, routingNumber: e.target.value }
                }))}
              />
            </div>
          </>
        )}

        {newMethod.type === 'digital_wallet' && (
          <>
            <div>
              <Label htmlFor="wallet-type">Wallet Type</Label>
              <Select 
                value={newMethod.details.walletType || ''}
                onValueChange={(value) => setNewMethod(prev => ({
                  ...prev,
                  details: { ...prev.details, walletType: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select wallet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="venmo">Venmo</SelectItem>
                  <SelectItem value="apple_pay">Apple Pay</SelectItem>
                  <SelectItem value="google_pay">Google Pay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="wallet-id">Wallet ID/Email</Label>
              <Input
                id="wallet-id"
                placeholder="user@example.com"
                value={newMethod.details.walletId || ''}
                onChange={(e) => setNewMethod(prev => ({
                  ...prev,
                  details: { ...prev.details, walletId: e.target.value }
                }))}
              />
            </div>
          </>
        )}

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is-default"
            checked={newMethod.isDefault}
            onChange={(e) => setNewMethod(prev => ({ ...prev, isDefault: e.target.checked }))}
          />
          <Label htmlFor="is-default">Set as default payment method</Label>
        </div>

        <div className="flex space-x-2">
          <Button onClick={addPaymentMethod} disabled={!newMethod.name.trim()}>
            Add Payment Method
          </Button>
          <Button variant="outline" onClick={() => setIsAddingNew(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Payment Methods</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingNew(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isAddingNew && (
          <div className="mb-6 p-4 border rounded-lg">
            <h3 className="font-medium mb-4">Add New Payment Method</h3>
            {renderAddMethodForm()}
          </div>
        )}

        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No payment methods added yet</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsAddingNew(true)}
            >
              Add Your First Payment Method
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method._id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium">{method.name}</h4>
                    {method.isDefault && (
                      <Badge variant="default" className="text-xs">
                        Default
                      </Badge>
                    )}
                    {!method.isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  {renderPaymentMethodDetails(method)}
                </div>
                <div className="flex items-center space-x-2">
                  {!method.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updatePaymentMethod(method._id, { isDefault: true })}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingMethod(method._id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePaymentMethod(method._id)}
                    disabled={method.isDefault}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentMethods;
