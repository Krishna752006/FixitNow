import { Button } from "@/components/ui/button";
import { Shield, Users, Clock, Star } from "lucide-react";

const AboutSection = () => {
  const stats = [
    {
      icon: Users,
      number: "10,000+",
      label: "Verified Professionals"
    },
    {
      icon: Star,
      number: "50,000+",
      label: "Jobs Completed"
    },
    {
      icon: Clock,
      number: "24/7",
      label: "Customer Support"
    },
    {
      icon: Shield,
      number: "100%",
      label: "Satisfaction Guarantee"
    }
  ];

  return (
    <section id="about" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FixItNow
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're revolutionizing home services by connecting homeowners with trusted, verified professionals. 
            Our platform ensures quality, reliability, and peace of mind for every job.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <IconComponent className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mission Statement */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-border">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
              Our Mission
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
              To make home maintenance and repairs stress-free by providing a trusted platform where 
              homeowners can easily find qualified professionals, and service providers can grow their 
              businesses with dignity and fair compensation.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-foreground">For Homeowners</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>Verified, background-checked professionals</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>Transparent pricing and reviews</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>Secure payments and insurance coverage</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>24/7 customer support</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-foreground">For Professionals</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                    <span>Keep 90% of your earnings</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                    <span>Flexible scheduling and job selection</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                    <span>Marketing and business tools</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                    <span>Guaranteed payments</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Ready to Experience the Difference?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers and professionals who trust FixItNow 
            for all their home service needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg">
              Find a Professional
            </Button>
            <Button variant="outline" size="lg">
              Become a Pro
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
