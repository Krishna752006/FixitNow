import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-professional.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Professional service worker" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-accent/80"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 z-10">
        <div className="animate-float absolute top-20 right-20 w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm"></div>
        <div className="animate-float absolute bottom-32 left-16 w-12 h-12 bg-accent/20 rounded-full backdrop-blur-sm" style={{ animationDelay: '1s' }}></div>
        <div className="animate-float absolute top-1/3 right-1/3 w-20 h-20 bg-secondary/20 rounded-full backdrop-blur-sm" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Trust Badge */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-xl rounded-full px-6 py-3 mb-8 animate-fade-in border border-white/30 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              ))}
            </div>
            <span className="text-white text-sm font-semibold">Trusted by 10,000+ homeowners</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 animate-slide-up leading-tight drop-shadow-lg">
            Your Home,{" "}
            <span className="bg-gradient-to-r from-yellow-300 via-accent to-secondary bg-clip-text text-transparent animate-pulse">
              Fixed.
            </span>
            <br />
            <span className="text-white">Instantly.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/95 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up font-light" style={{ animationDelay: '0.2s' }}>
            Connect with verified, professional service providers in minutes. From plumbing to electrical work, 
            we've got your home covered with trusted experts.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Button size="xl" className="group font-semibold shadow-xl hover:shadow-2xl transition-all px-8" onClick={() => navigate('/signup/user')}>
              Find a Service
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button variant="outline" size="xl" className="bg-white/10 backdrop-blur-md border-white/40 text-white hover:bg-white/20 font-semibold shadow-lg hover:shadow-xl transition-all px-8">
              <Play className="w-5 h-5" />
              Watch How It Works
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="text-center group">
              <div className="inline-block bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-4 group-hover:bg-white/20 transition-all transform group-hover:scale-110">
                <div className="text-4xl font-bold bg-gradient-to-r from-yellow-300 to-accent bg-clip-text text-transparent">24/7</div>
              </div>
              <div className="text-white/90 font-semibold">Available Support</div>
            </div>
            <div className="text-center group">
              <div className="inline-block bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-4 group-hover:bg-white/20 transition-all transform group-hover:scale-110">
                <div className="text-4xl font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">5 Min</div>
              </div>
              <div className="text-white/90 font-semibold">Average Response</div>
            </div>
            <div className="text-center group">
              <div className="inline-block bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-4 group-hover:bg-white/20 transition-all transform group-hover:scale-110">
                <div className="text-4xl font-bold bg-gradient-to-r from-secondary to-yellow-300 bg-clip-text text-transparent">100%</div>
              </div>
              <div className="text-white/90 font-semibold">Satisfaction Guaranteed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;