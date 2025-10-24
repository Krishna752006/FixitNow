import { Button } from "@/components/ui/button";
import { CheckCircle, DollarSign, Calendar, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfessionalInvitationSection = () => {
  const navigate = useNavigate();
  const benefits = [
    {
      icon: DollarSign,
      title: "Earn More",
      description: "Keep 90% of every job payment"
    },
    {
      icon: Calendar,
      title: "Flexible Schedule",
      description: "Work when you want, where you want"
    },
    {
      icon: Users,
      title: "Ready Customers",
      description: "Access to thousands of verified customers"
    },
    {
      icon: CheckCircle,
      title: "Secure Payments",
      description: "Guaranteed payment after job completion"
    }
  ];

  return (
    <section id="for-pros" className="py-24 bg-gradient-to-br from-white via-gray-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/8"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-accent/8"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-secondary/8"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-6 py-3 mb-8 border border-primary/20">
              <span className="text-primary font-semibold text-sm uppercase tracking-wide">For Professionals</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Join the{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                FixItNow Network
              </span>
            </h2>

            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Build your business with a platform designed for professionals. Get access to a steady stream of customers, secure payments, and tools to grow your service business.
            </p>

            {/* Benefits List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div key={index} className="flex items-start space-x-4 group p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 transition-all transform hover:scale-105 hover:shadow-lg border border-primary/10">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-110">
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-1 text-lg">{benefit.title}</h3>
                      <p className="text-gray-600 text-sm font-medium leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="group font-semibold shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 px-8" onClick={() => navigate('/signup/professional')}>
                Become a Pro
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="border-2 border-primary hover:bg-primary hover:text-white font-semibold transition-all transform hover:scale-105">
                Learn More
              </Button>
            </div>
          </div>

          {/* Right Content - Professional Dashboard Preview */}
          <div className="relative">
            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-shadow">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-foreground">Professional Dashboard</h3>
                <div className="w-3 h-3 rounded-full bg-secondary animate-pulse"></div>
              </div>

              {/* Earnings Card */}
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 mb-8 border border-primary/20">
                <div className="text-sm text-gray-600 font-medium mb-2">This Week's Earnings</div>
                <div className="text-4xl font-bold text-foreground mb-2">$1,247</div>
                <div className="text-sm text-secondary font-semibold">+23% from last week</div>
              </div>

              {/* Job Requests */}
              <div className="space-y-3 mb-8">
                <div className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">New Job Requests</div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-primary/50 transition-colors">
                  <div>
                    <div className="font-semibold text-foreground text-sm">Kitchen Faucet Installation</div>
                    <div className="text-xs text-gray-600 font-medium">Downtown • $150</div>
                  </div>
                  <Button size="sm" className="font-semibold">Accept</Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-primary/50 transition-colors">
                  <div>
                    <div className="font-semibold text-foreground text-sm">Electrical Outlet Repair</div>
                    <div className="text-xs text-gray-600 font-medium">Midtown • $85</div>
                  </div>
                  <Button size="sm" className="font-semibold">Accept</Button>
                </div>
              </div>

              {/* Calendar Preview */}
              <div className="border-t border-gray-200 pt-6">
                <div className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">Today's Schedule</div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-gray-700 font-medium">10:00 AM - Plumbing Repair</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                    <span className="text-gray-700 font-medium">2:30 PM - Light Installation</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-primary/20 animate-bounce"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 rounded-full bg-accent/20 animate-bounce" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfessionalInvitationSection;