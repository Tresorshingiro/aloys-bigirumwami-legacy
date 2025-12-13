import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, BookOpen, Home, User, Mail, Search, LogIn, LogOut, Shield, ChevronDown, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navLinks = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/about', label: 'About', icon: User },
  { path: '/books', label: 'Books', icon: BookOpen },
  { path: '/contact', label: 'Contact', icon: Mail },
];

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const { totalItems } = useCart();
  const { user, isAdmin, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md shadow-elegant">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
              <span className="font-serif text-deep-blue font-bold text-lg">AB</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-serif text-lg md:text-xl text-primary-foreground font-semibold tracking-wide group-hover:text-gold transition-colors">
                Aloys Bigirumwami
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-4 py-2 rounded-md font-medium transition-all duration-200",
                  location.pathname === link.path
                    ? "text-gold bg-white/10"
                    : "text-primary-foreground/80 hover:text-gold hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Link to="/books">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:text-gold hover:bg-white/10">
                <Search className="h-5 w-5" />
              </Button>
            </Link>
            
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:text-gold hover:bg-white/10">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-burgundy text-white text-xs rounded-full flex items-center justify-center font-semibold"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </Button>
            </Link>

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary-foreground hover:text-gold hover:bg-white/10"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Account
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-elegant border border-border overflow-hidden z-50"
                        onMouseLeave={() => setIsDropdownOpen(false)}
                      >
                        <Link
                          to="/profile"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                        >
                          <User className="h-4 w-4 text-gold" />
                          <span className="text-sm font-medium">Profile</span>
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                        >
                          <Package className="h-4 w-4 text-gold" />
                          <span className="text-sm font-medium">My Orders</span>
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors border-t border-border"
                          >
                            <Shield className="h-4 w-4 text-gold" />
                            <span className="text-sm font-medium">Admin Panel</span>
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            signOut();
                            setIsDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors border-t border-border text-left"
                        >
                          <LogOut className="h-4 w-4 text-gold" />
                          <span className="text-sm font-medium">Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-gold hover:bg-white/10">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-primary-foreground hover:text-gold hover:bg-white/10"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </nav>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-primary border-t border-white/10"
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all",
                    location.pathname === link.path
                      ? "text-gold bg-white/10"
                      : "text-primary-foreground/80 hover:text-gold hover:bg-white/5"
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
              
              {/* Mobile Auth Buttons */}
              <div className="pt-2 border-t border-white/10 space-y-1">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-primary-foreground/80 hover:text-gold hover:bg-white/5"
                    >
                      <User className="h-5 w-5" />
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-primary-foreground/80 hover:text-gold hover:bg-white/5"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-primary-foreground/80 hover:text-gold hover:bg-white/5"
                      >
                        <Shield className="h-5 w-5" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-primary-foreground/80 hover:text-gold hover:bg-white/5"
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-primary-foreground/80 hover:text-gold hover:bg-white/5"
                  >
                    <LogIn className="h-5 w-5" />
                    Login
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
