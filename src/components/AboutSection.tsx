import { Button } from "@/components/ui/button";
import { Shield, Users, Clock, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AboutSection = () => {
  const navigate = useNavigate();
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
    <section id="about" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-widest mb-4">About Us</span>
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            About{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              FixItNow
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're revolutionizing home services by connecting homeowners with trusted, verified professionals. 
            Our platform ensures quality, reliability, and peace of mind for every job.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6 group-hover:from-primary/20 group-hover:to-accent/20 transition-colors shadow-lg">
                  <IconComponent className="w-9 h-9 text-primary" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mission Statement */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 rounded-3xl p-12 md:p-16 border border-primary/20 shadow-lg">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-center leading-tight">
              Our Mission
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-10 text-center font-medium">
              To make home maintenance and repairs stress-free by providing a trusted platform where 
              homeowners can easily find qualified professionals, and service providers can grow their 
              businesses with dignity and fair compensation.
            </p>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-5">
                <h4 className="text-2xl font-bold text-foreground">For Homeowners</h4>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">Verified, background-checked professionals</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">Transparent pricing and reviews</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">Secure payments and insurance coverage</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">24/7 customer support</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-5">
                <h4 className="text-2xl font-bold text-foreground">For Professionals</h4>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">Keep 90% of your earnings</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">Flexible scheduling and job selection</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">Marketing and business tools</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">Guaranteed payments</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            Ready to Experience the Difference?
          </h3>
          <p className="text-gray-600 mb-10 max-w-2xl mx-auto text-lg">
            Join thousands of satisfied customers and professionals who trust FixItNow 
            for all their home service needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="font-semibold shadow-lg hover:shadow-xl transition-shadow" onClick={() => navigate('/login/user')}>
              Find a Professional
            </Button>
            <Button variant="outline" size="lg" className="border-gray-300 hover:border-primary hover:text-primary font-semibold" onClick={() => navigate('/signup/professional')}>
              Become a Pro
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
