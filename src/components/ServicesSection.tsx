import { Button } from "@/components/ui/button";
import { 
  Wrench, 
  Zap, 
  Paintbrush, 
  Hammer, 
  Droplets, 
  ShieldCheck,
  Thermometer,
  Camera,
  ArrowRight
} from "lucide-react";
import servicesHeroImage from "@/assets/services-hero.jpg";

const ServicesSection = () => {
  const services = [
    {
      icon: Droplets,
      title: "Plumbing",
      description: "Leaks, installations, repairs",
      popular: true
    },
    {
      icon: Zap,
      title: "Electrical",
      description: "Wiring, outlets, fixtures",
      popular: true
    },
    {
      icon: Paintbrush,
      title: "Painting",
      description: "Interior & exterior painting",
      popular: false
    },
    {
      icon: Hammer,
      title: "Carpentry",
      description: "Repairs, installations, custom work",
      popular: false
    },
    {
      icon: Wrench,
      title: "Appliance Repair",
      description: "Kitchen & laundry appliances",
      popular: true
    },
    {
      icon: Thermometer,
      title: "HVAC",
      description: "Heating & cooling systems",
      popular: false
    },
    {
      icon: ShieldCheck,
      title: "Security",
      description: "Cameras, alarms, smart locks",
      popular: false
    },
    {
      icon: Camera,
      title: "Smart Home",
      description: "Automation & tech setup",
      popular: false
    }
  ];

  return (
    <section id="services" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            All Services at{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              One Place
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From emergency repairs to planned installations, our network of verified professionals covers every home service need with expertise and reliability.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div 
                key={index} 
                className="group relative p-6 rounded-2xl border border-border hover-lift hover-glow cursor-pointer bg-card/50 backdrop-blur-sm overflow-hidden"
              >
                {/* Popular Badge */}
                {service.popular && (
                  <div className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-full">
                    Popular
                  </div>
                )}

                {/* Background Gradient */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 service-gradient"></div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                    <IconComponent className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-white transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm group-hover:text-white/90 transition-colors">
                    {service.description}
                  </p>
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Featured Service Banner */}
        <div className="relative rounded-3xl overflow-hidden p-8 md:p-12 hero-gradient">
          <div className="absolute inset-0 opacity-20">
            <img 
              src={servicesHeroImage} 
              alt="Home services" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="relative z-10 text-center text-white">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Emergency Services Available 24/7
            </h3>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Burst pipe? Power outage? We've got emergency professionals ready to help, any time of day or night.
            </p>
            <Button variant="accent" size="lg" className="bg-white text-primary hover:bg-white/90">
              Get Emergency Help
            </Button>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-6">Can't find the service you need?</p>
          <Button variant="outline" size="lg">
            Request Custom Service
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;