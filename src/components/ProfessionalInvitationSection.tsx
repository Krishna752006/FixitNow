import { Button } from "@/components/ui/button";
import { CheckCircle, DollarSign, Calendar, Users, ArrowRight } from "lucide-react";

const ProfessionalInvitationSection = () => {
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
    <section id="for-pros" className="py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/5"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-accent/5"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-secondary/5"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-2 mb-6">
              <span className="text-primary font-medium text-sm">For Professionals</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Join the{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                FixItNow Network
              </span>
            </h2>

            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Build your business with a platform designed for professionals. Get access to a steady stream of customers, secure payments, and tools to grow your service business.
            </p>

            {/* Benefits List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                      <p className="text-muted-foreground text-sm">{benefit.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="group">
                Become a Pro
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>

          {/* Right Content - Professional Dashboard Preview */}
          <div className="relative">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg hover-lift">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">Professional Dashboard</h3>
                <div className="w-3 h-3 rounded-full bg-secondary animate-pulse"></div>
              </div>

              {/* Earnings Card */}
              <div className="bg-primary/5 rounded-xl p-4 mb-6">
                <div className="text-sm text-muted-foreground mb-2">This Week's Earnings</div>
                <div className="text-3xl font-bold text-foreground mb-1">$1,247</div>
                <div className="text-sm text-secondary">+23% from last week</div>
              </div>

              {/* Job Requests */}
              <div className="space-y-3 mb-6">
                <div className="text-sm font-medium text-foreground mb-3">New Job Requests</div>
                
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <div className="font-medium text-foreground text-sm">Kitchen Faucet Installation</div>
                    <div className="text-xs text-muted-foreground">Downtown • $150</div>
                  </div>
                  <Button size="sm" variant="default">Accept</Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <div className="font-medium text-foreground text-sm">Electrical Outlet Repair</div>
                    <div className="text-xs text-muted-foreground">Midtown • $85</div>
                  </div>
                  <Button size="sm" variant="default">Accept</Button>
                </div>
              </div>

              {/* Calendar Preview */}
              <div className="border-t border-border pt-4">
                <div className="text-sm font-medium text-foreground mb-3">Today's Schedule</div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-muted-foreground">10:00 AM - Plumbing Repair</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                    <span className="text-muted-foreground">2:30 PM - Light Installation</span>
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