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
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6">
        {/* Trust Bar */}
        <div className="text-center mb-20">
          <p className="text-gray-600 mb-10 font-medium">Featured in</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {companies.map((company, index) => (
              <div key={index} className="flex items-center space-x-2 opacity-60 hover:opacity-100 transition-opacity group">
                <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <span className="font-bold text-gray-700 text-sm">{company.logo}</span>
                </div>
                <span className="font-semibold text-gray-700 hidden sm:block text-sm">{company.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-widest mb-4">Customer Reviews</span>
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Loved by{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Homeowners
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Join thousands of satisfied customers who trust FixItNow for all their home service needs.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="relative p-8 rounded-2xl bg-white border border-gray-200 hover:border-primary/50 hover:shadow-xl transition-all duration-300 group overflow-hidden"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="w-10 h-10 text-primary" />
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-800 leading-relaxed mb-6 text-base font-medium">
                "{testimonial.text}"
              </p>

              {/* Service Badge */}
              <div className="inline-block bg-gradient-to-r from-primary/10 to-accent/10 text-primary text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-primary/20">
                {testimonial.service}
              </div>

              {/* Author */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                />
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 rounded-3xl p-12 border border-primary/10">
          <div className="p-6">
            <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">10,000+</div>
            <div className="text-gray-600 font-medium">Happy Customers</div>
          </div>
          <div className="p-6">
            <div className="text-4xl font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent mb-2">50+</div>
            <div className="text-gray-600 font-medium">Service Categories</div>
          </div>
          <div className="p-6">
            <div className="text-4xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-2">2,500+</div>
            <div className="text-gray-600 font-medium">Verified Professionals</div>
          </div>
          <div className="p-6">
            <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">4.9★</div>
            <div className="text-gray-600 font-medium">Average Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;