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
    <section id="how-it-works" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-widest mb-4">Simple Process</span>
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Getting your home fixed has never been easier. Our streamlined process connects you with the right professional in just three simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto relative">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="text-center group relative">
                {/* Step Number & Icon */}
                <div className="relative mb-10">
                  <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/30 flex items-center justify-center group-hover:scale-110 group-hover:border-primary/60 transition-all duration-300 shadow-lg">
                    <IconComponent className={`w-12 h-12 ${step.color}`} />
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-primary to-accent text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                    {index + 1}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed">
                  {step.description}
                </p>

                {/* Connection Line (except for last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-14 left-1/2 w-full h-1 bg-gradient-to-r from-primary/40 via-accent/40 to-transparent transform translate-x-1/2"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-6 py-3 border border-primary/20">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span className="text-primary font-semibold">Ready to get started?</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;