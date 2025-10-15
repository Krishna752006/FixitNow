import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { Settings, Key, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface RazorpayConfigProps {
  trigger?: React.ReactNode;
}
const RazorpayConfig: React.FC<RazorpayConfigProps> = ({ trigger }) => {
  const [open, setOpen] = useState(false);
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [configStatus, setConfigStatus] = useState<{
    configured: boolean;
    keyId: string | null;
  } | null>(null);
  const { toast } = useToast();
  useEffect(() => {
    if (open) {
      loadConfigStatus();
    }
  }, [open]);

  const loadConfigStatus = async () => {
    try {
      const response = await api.getConfigStatus();
      if (response.success) {
        setConfigStatus(response.data.razorpay);
      }
    } catch (error) {
      console.error('Failed to load config status:', error);
    }
  };

  const handleSave = async () => {
    if (!keyId.trim() || !keySecret.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide both Key ID and Key Secret",
        variant: "destructive",
      });
      return;
    }

    if (!keyId.startsWith('rzp_')) {
      toast({
        title: "Invalid Key ID",
        description: "Razorpay Key ID should start with 'rzp_'",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.setRazorpayCredentials(keyId, keySecret);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Razorpay credentials configured successfully!",
        });
        
        // Refresh status
        await loadConfigStatus();
        
        // Clear form
        setKeyId('');
        setKeySecret('');
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to configure credentials",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Config error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to configure Razorpay credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      const response = await api.resetRazorpayConfig();
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Razorpay configuration reset successfully",
        });
        
        await loadConfigStatus();
      } else {
        toast({
          title: "Error",
          description: "Failed to reset configuration",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Reset error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reset configuration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure Razorpay
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Razorpay Configuration
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm">Razorpay</span>
                {configStatus?.configured ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Configured
                    </Badge>
                  </div>
                ) : (
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Not Configured
                  </Badge>
                )}
              </div>
              {configStatus?.keyId && (
                <p className="text-xs text-muted-foreground mt-2">
                  Key ID: {configStatus.keyId}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Configuration Form */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="keyId">Razorpay Key ID</Label>
              <Input
                id="keyId"
                placeholder="rzp_test_..."
                value={keyId}
                onChange={(e) => setKeyId(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="keySecret">Razorpay Key Secret</Label>
              <Input
                id="keySecret"
                type="password"
                placeholder="Enter your key secret"
                value={keySecret}
                onChange={(e) => setKeySecret(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {configStatus?.configured && (
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <AlertCircle className="h-4 w-4 mr-2" />
                )}
                Reset
              </Button>
            )}
            
            <Button
              onClick={handleSave}
              disabled={isLoading || (!keyId.trim() || !keySecret.trim())}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Get your Razorpay credentials from the Razorpay Dashboard</p>
            <p>• Use test credentials (rzp_test_...) for development</p>
            <p>• Credentials are stored securely and can be updated anytime</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RazorpayConfig;
