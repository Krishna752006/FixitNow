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
        <div className="text-center mb-20">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-widest mb-4">Our Services</span>
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            All Services at{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              One Place
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From emergency repairs to planned installations, our network of verified professionals covers every home service need with expertise and reliability.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div 
                key={index} 
                className="group relative p-8 rounded-2xl border border-gray-200 hover:border-primary/50 hover:shadow-xl cursor-pointer bg-white transition-all duration-300 overflow-hidden"
              >
                {/* Popular Badge */}
                {service.popular && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    Popular
                  </div>
                )}

                {/* Background Gradient on Hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br from-primary to-accent"></div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6 group-hover:from-primary/20 group-hover:to-accent/20 transition-colors">
                    <IconComponent className="w-7 h-7 text-primary group-hover:text-accent transition-colors" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Featured Service Banner */}
        <div className="relative rounded-3xl overflow-hidden p-12 md:p-16 bg-gradient-to-br from-primary via-primary-dark to-accent shadow-2xl">
          <div className="absolute inset-0 opacity-10">
            <img 
              src={servicesHeroImage} 
              alt="Home services" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="relative z-10 text-center text-white">
            <h3 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Emergency Services Available 24/7
            </h3>
            <p className="text-lg mb-10 text-white/90 max-w-2xl mx-auto leading-relaxed">
              Burst pipe? Power outage? We've got emergency professionals ready to help, any time of day or night.
            </p>
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold shadow-xl hover:shadow-2xl transition-all">
              Get Emergency Help
            </Button>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <p className="text-gray-600 mb-6 text-lg">Can't find the service you need?</p>
          <Button variant="outline" size="lg" className="border-gray-300 hover:border-primary hover:text-primary font-semibold">
            Request Custom Service
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;