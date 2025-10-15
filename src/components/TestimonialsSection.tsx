import { Star, Quote } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Homeowner",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b29c?w=400&h=400&fit=crop&crop=face",
      rating: 5,
      text: "FixItNow saved my weekend! My kitchen sink was completely clogged and I found an amazing plumber within 15 minutes. Professional, quick, and reasonably priced.",
      service: "Plumbing"
    },
    {
      name: "Mike Chen",
      role: "Property Manager",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      rating: 5,
      text: "I manage 12 rental properties and FixItNow has become my go-to platform. The professionals are vetted, reliable, and the payment system makes everything seamless.",
      service: "Multiple Services"
    },
    {
      name: "Lisa Rodriguez",
      role: "First-time Homeowner",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      rating: 5,
      text: "As a new homeowner, I was overwhelmed by maintenance needs. FixItNow's professionals walked me through everything and provided excellent service at fair prices.",
      service: "Electrical & HVAC"
    }
  ];

  const companies = [
    { name: "TechCrunch", logo: "TC" },
    { name: "Forbes", logo: "FB" },
    { name: "WSJ", logo: "WSJ" },
    { name: "CNN", logo: "CNN" },
    { name: "NBC", logo: "NBC" }
  ];

  return (
    <section className="py-24 bg-muted/20">
      <div className="container mx-auto px-6">
        {/* Trust Bar */}
        <div className="text-center mb-16">
          <p className="text-muted-foreground mb-8">Featured in</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {companies.map((company, index) => (
              <div key={index} className="flex items-center space-x-2 opacity-60 hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-lg bg-foreground/10 flex items-center justify-center">
                  <span className="font-bold text-foreground text-sm">{company.logo}</span>
                </div>
                <span className="font-medium text-foreground hidden sm:block">{company.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Loved by{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Homeowners
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust FixItNow for all their home service needs.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="relative p-8 rounded-2xl bg-card border border-border hover-lift group overflow-hidden"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-30 transition-opacity">
                <Quote className="w-8 h-8 text-primary" />
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-foreground leading-relaxed mb-6 text-lg">
                "{testimonial.text}"
              </p>

              {/* Service Badge */}
              <div className="inline-block bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full mb-6">
                {testimonial.service}
              </div>

              {/* Author */}
              <div className="flex items-center space-x-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                />
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-muted-foreground text-sm">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="p-6">
            <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
            <div className="text-muted-foreground">Happy Customers</div>
          </div>
          <div className="p-6">
            <div className="text-4xl font-bold text-secondary mb-2">50+</div>
            <div className="text-muted-foreground">Service Categories</div>
          </div>
          <div className="p-6">
            <div className="text-4xl font-bold text-accent mb-2">2,500+</div>
            <div className="text-muted-foreground">Verified Professionals</div>
          </div>
          <div className="p-6">
            <div className="text-4xl font-bold text-primary mb-2">4.9★</div>
            <div className="text-muted-foreground">Average Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;