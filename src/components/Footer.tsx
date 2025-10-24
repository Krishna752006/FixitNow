import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  // Map footer links to their routes
  const getLinkRoute = (category: string, link: string): string => {
    const linkMap: { [key: string]: { [key: string]: string } } = {
      "For Customers": {
        "How It Works": "/#how-it-works",
        "Browse Services": "/login/user",
        "Book a Service": "/login/user",
        "Emergency Services": "/login/user",
        "Customer Support": "/#contact"
      },
      "For Professionals": {
        "Join FixItNow": "/signup/professional",
        "Professional Resources": "/login/professional",
        "Earning Calculator": "/login/professional",
        "Pro Dashboard": "/login/professional",
        "Support Center": "/#contact"
      },
      "Company": {
        "About Us": "/#about",
        "Careers": "/#contact",
        "Press": "/#contact",
        "Blog": "/#contact",
        "Contact": "/#contact"
      },
      "Legal": {
        "Terms of Service": "/#contact",
        "Privacy Policy": "/#contact",
        "Cookie Policy": "/#contact",
        "Insurance": "/#contact",
        "Safety": "/#contact"
      }
    };
    return linkMap[category]?.[link] || "#";
  };

  const handleLinkClick = (route: string) => {
    if (route.startsWith("/#")) {
      // Handle anchor links
      const sectionId = route.substring(2);
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      // Handle route navigation
      navigate(route);
    }
  };

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
    <footer className="bg-slate-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg">
                <Wrench className="text-white w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">FixItNow</span>
                <span className="text-xs text-slate-400 font-medium">Professional Services</span>
              </div>
            </div>
            
            <p className="text-slate-300 mb-8 leading-relaxed text-sm">
              The trusted platform connecting homeowners with verified professionals for all home service needs. Quick, reliable, and secure.
            </p>

            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-slate-300 hover:text-white transition-colors">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm">1-800-FIXIT-NOW</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300 hover:text-white transition-colors">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm">service.fixitnow@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300 hover:text-white transition-colors">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm">Available in 50+ cities</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-white mb-6 text-sm uppercase tracking-wide">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => {
                  const route = getLinkRoute(category, link);
                  return (
                    <li key={link}>
                      <button
                        onClick={() => handleLinkClick(route)}
                        className="text-slate-400 hover:text-primary transition-colors text-sm font-medium text-left"
                      >
                        {link}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-slate-700 mt-16 pt-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-3">
              Stay Updated with FixItNow
            </h3>
            <p className="text-slate-300 mb-8 text-sm">
              Get tips, special offers, and updates delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <Button size="lg" className="font-medium shadow-lg hover:shadow-xl transition-shadow">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-slate-400 text-sm">
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
                    className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors group"
                  >
                    <IconComponent className="w-5 h-5 text-slate-300 group-hover:text-white" />
                  </a>
                );
              })}
            </div>

            {/* App Downloads */}
            <div className="flex items-center space-x-3">
              <span className="text-slate-400 text-sm hidden sm:block">Download our app:</span>
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">
                iOS
              </Button>
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">
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