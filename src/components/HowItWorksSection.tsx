import { Search, Calendar, CheckCircle } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: Search,
      title: "Search",
      description: "Browse verified professionals in your area by service type, ratings, and availability.",
      color: "text-primary"
    },
    {
      icon: Calendar,
      title: "Book",
      description: "Schedule your service at a time that works for you. Pay securely through our platform.",
      color: "text-accent"
    },
    {
      icon: CheckCircle,
      title: "Relax",
      description: "Sit back while our trusted professionals handle your home service needs perfectly.",
      color: "text-secondary"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Getting your home fixed has never been easier. Our streamlined process connects you with the right professional in just three simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="text-center group">
                {/* Step Number & Icon */}
                <div className="relative mb-8">
                  <div className="w-24 h-24 mx-auto rounded-full card-gradient border-2 border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className={`w-10 h-10 ${step.color}`} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {step.description}
                </p>

                {/* Connection Line (except for last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/30 to-accent/30 transform translate-x-12"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-6 py-3">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span className="text-primary font-medium">Ready to get started?</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;