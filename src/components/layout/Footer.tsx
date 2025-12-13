import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center">
                <span className="font-serif text-deep-blue font-bold">AB</span>
              </div>
              <span className="font-serif text-xl font-semibold">Aloys Bigirumwami</span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Preserving and sharing the literary legacy of Rwanda's first native Catholic bishop, 
              a pioneer of inculturation and defender of Rwandan traditions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4 text-gold">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-primary-foreground/70 hover:text-gold transition-colors text-sm">
                  Biography
                </Link>
              </li>
              <li>
                <Link to="/books" className="text-primary-foreground/70 hover:text-gold transition-colors text-sm">
                  Books & Publications
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary-foreground/70 hover:text-gold transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-primary-foreground/70 hover:text-gold transition-colors text-sm">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4 text-gold">Get in Touch</h4>
            <div className="space-y-3">
              <a 
                href="mailto:info@bigirumwami.rw" 
                className="flex items-center gap-2 text-primary-foreground/70 hover:text-gold transition-colors text-sm"
              >
                <Mail className="h-4 w-4" />
                info@bigirumwami.rw
              </a>
              <div className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                <BookOpen className="h-4 w-4" />
                Diocese of Nyundo, Rwanda
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/50">
            <p>© {new Date().getFullYear()} Aloys Bigirumwami Legacy. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
