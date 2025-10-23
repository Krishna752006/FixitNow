import { useState } from 'react';
import { Menu, X, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <Wrench className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">FixItNow</span>
              <span className="text-xs text-gray-500 font-medium">Professional Services</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <button 
              onClick={() => scrollToSection('services')} 
              className="px-4 py-2 text-gray-700 hover:text-primary font-medium transition-colors rounded-lg hover:bg-primary/5"
            >
              Services
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')} 
              className="px-4 py-2 text-gray-700 hover:text-primary font-medium transition-colors rounded-lg hover:bg-primary/5"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('for-pros')} 
              className="px-4 py-2 text-gray-700 hover:text-primary font-medium transition-colors rounded-lg hover:bg-primary/5"
            >
              For Professionals
            </button>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link to="/login/admin">
              <Button variant="ghost" size="sm" className="font-medium text-red-600 hover:text-red-700 hover:bg-red-50">
                Admin
              </Button>
            </Link>
            <Link to="/login/user">
              <Button variant="ghost" size="sm" className="font-medium">
                Sign In
              </Button>
            </Link>
            <Link to="/signup/user">
              <Button size="sm" className="font-medium shadow-md hover:shadow-lg transition-shadow">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4 space-y-3">
            <button 
              onClick={() => scrollToSection('services')} 
              className="block w-full text-left px-4 py-2 text-gray-700 hover:text-primary font-medium transition-colors rounded-lg hover:bg-primary/5"
            >
              Services
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')} 
              className="block w-full text-left px-4 py-2 text-gray-700 hover:text-primary font-medium transition-colors rounded-lg hover:bg-primary/5"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('for-pros')} 
              className="block w-full text-left px-4 py-2 text-gray-700 hover:text-primary font-medium transition-colors rounded-lg hover:bg-primary/5"
            >
              For Professionals
            </button>
            <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200">
              <Link to="/login/admin" className="w-full">
                <Button variant="ghost" size="sm" className="w-full font-medium text-red-600 hover:text-red-700 hover:bg-red-50">
                  Admin Portal
                </Button>
              </Link>
              <Link to="/login/user" className="w-full">
                <Button variant="ghost" size="sm" className="w-full font-medium">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup/user" className="w-full">
                <Button size="sm" className="w-full font-medium">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;