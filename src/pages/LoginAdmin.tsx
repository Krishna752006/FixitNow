import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, ArrowLeft, Home, Loader2, Shield } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const LoginAdmin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email or phone number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const success = await login(formData, 'user');
    if (success) {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600/10 via-background to-red-500/5 flex items-center justify-center p-6">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-red-600/10 animate-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-red-500/10 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-red-400/10 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back to Home */}
        <Link to="/" className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-3 pb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-red-600/20 mx-auto">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
              <CardDescription className="text-base">
                Secure access for administrators only
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email/Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-sm font-medium">
                  Email or Phone Number
                </Label>
                <Input
                  id="identifier"
                  name="identifier"
                  type="text"
                  placeholder="admin@fixitnow.com or +919876543210"
                  value={formData.identifier}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`h-11 ${errors.identifier ? 'border-red-500' : ''}`}
                />
                {errors.identifier && (
                  <p className="text-sm text-red-500 mt-1">{errors.identifier}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`h-11 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-medium transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Sign In as Admin
                  </>
                )}
              </Button>

              {/* Admin Info */}
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-xs text-red-700 dark:text-red-400 font-medium mb-2">
                  ⚠️ Admin Access Only
                </p>
                <p className="text-xs text-red-600 dark:text-red-500">
                  This portal is restricted to authorized administrators. Unauthorized access attempts are logged.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Not an admin?{' '}
            <Link to="/login/user" className="text-primary hover:underline font-medium">
              User Login
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            <Link to="/" className="inline-flex items-center space-x-1 hover:text-foreground transition-colors">
              <Home className="w-3 h-3" />
              <span>Back to Home</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;
