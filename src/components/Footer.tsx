import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    "For Customers": [
      "How It Works",
      "Browse Services",
      "Book a Service",
      "Emergency Services",
      "Customer Support"
    ],
    "For Professionals": [
      "Join FixItNow",
      "Professional Resources",
      "Earning Calculator",
      "Pro Dashboard",
      "Support Center"
    ],
    "Company": [
      "About Us",
      "Careers",
      "Press",
      "Blog",
      "Contact"
    ],
    "Legal": [
      "Terms of Service",
      "Privacy Policy",
      "Cookie Policy",
      "Insurance",
      "Safety"
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" }
  ];

  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <span className="text-2xl font-bold text-background">FixItNow</span>
            </div>
            
            <p className="text-background/80 mb-6 leading-relaxed">
              The trusted platform connecting homeowners with verified professionals for all home service needs. Quick, reliable, and secure.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-background/90 text-sm">1-800-FIXIT-NOW</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-background/90 text-sm">service.fixitnow@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-background/90 text-sm">Available in 50+ cities</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-background mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a 
                      href="#" 
                      className="text-background/70 hover:text-background transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-background/20 mt-12 pt-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-background mb-4">
              Stay Updated with FixItNow
            </h3>
            <p className="text-background/80 mb-6">
              Get tips, special offers, and updates delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl bg-background/10 border border-background/20 text-background placeholder:text-background/60 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button variant="hero" size="lg">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-background/70 text-sm">
              © 2024 FixItNow. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                  >
                    <IconComponent className="w-4 h-4 text-background" />
                  </a>
                );
              })}
            </div>

            {/* App Downloads */}
            <div className="flex items-center space-x-3">
              <span className="text-background/70 text-sm hidden sm:block">Download our app:</span>
              <Button variant="outline" size="sm" className="border-background/30 text-background hover:bg-background hover:text-foreground">
                iOS
              </Button>
              <Button variant="outline" size="sm" className="border-background/30 text-background hover:bg-background hover:text-foreground">
                Android
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;