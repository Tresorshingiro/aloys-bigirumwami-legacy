import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, BookOpen, Calendar, FileText, Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { getBookById, books } from '@/data/books';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const book = id ? getBookById(id) : undefined;

  if (!book) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h1 className="font-serif text-2xl text-foreground mb-2">Book Not Found</h1>
            <p className="text-muted-foreground mb-6">The book you're looking for doesn't exist.</p>
            <Link to="/books">
              <Button variant="burgundy">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Books
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    addToCart(book);
    toast({
      title: "Added to Cart",
      description: `${book.title} has been added to your cart.`,
    });
  };

  const relatedBooks = books.filter(b => b.id !== book.id).slice(0, 3);

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-muted py-4">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link to="/books" className="text-muted-foreground hover:text-foreground transition-colors">
              Books
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">{book.title}</span>
          </nav>
        </div>
      </div>

      {/* Book Details */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Book Cover */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="aspect-[3/4] bg-gradient-to-br from-primary to-deep-blue-light rounded-lg flex items-center justify-center relative overflow-hidden shadow-elegant">
                <BookOpen className="w-32 h-32 text-gold/50" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="font-serif text-2xl text-white mb-2">{book.title}</h2>
                  <p className="text-gold">By Bishop Aloys Bigirumwami</p>
                </div>
              </div>
            </motion.div>

            {/* Book Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <Link to="/books" className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors mb-4">
                <ArrowLeft className="w-4 h-4" />
                Back to all books
              </Link>

              <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
                {book.title}
              </h1>

              <p className="text-lg text-muted-foreground mb-6">
                {book.shortDescription}
              </p>

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Calendar className="w-5 h-5 text-gold" />
                  <div>
                    <p className="text-xs text-muted-foreground">Published</p>
                    <p className="font-medium">{book.year}</p>
                  </div>
                </div>
                {book.pages && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <FileText className="w-5 h-5 text-gold" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pages</p>
                      <p className="font-medium">{book.pages}</p>
                    </div>
                  </div>
                )}
                {book.language && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg col-span-2">
                    <Globe className="w-5 h-5 text-gold" />
                    <div>
                      <p className="text-xs text-muted-foreground">Language</p>
                      <p className="font-medium">{book.language}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Price & Add to Cart */}
              <div className="bg-card p-6 rounded-lg shadow-elegant mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Price</p>
                    <p className="font-serif text-4xl text-burgundy">${book.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">In Stock</span>
                  </div>
                </div>
                
                <Button variant="hero" size="xl" className="w-full" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
              </div>

              {/* Description */}
              <div className="flex-grow">
                <h3 className="font-serif text-xl text-foreground mb-3">About This Book</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {book.description}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="font-serif text-2xl text-foreground mb-8">
              More Books by <span className="text-gold">Bishop Bigirumwami</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {relatedBooks.map((relatedBook) => (
                <Link key={relatedBook.id} to={`/books/${relatedBook.id}`} className="block group">
                  <div className="bg-card rounded-lg overflow-hidden shadow-elegant hover:shadow-gold transition-all duration-300 hover:-translate-y-1">
                    <div className="aspect-[3/4] bg-gradient-to-br from-primary to-deep-blue-light flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-gold/50 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif text-lg text-foreground mb-1 group-hover:text-gold transition-colors line-clamp-1">
                        {relatedBook.title}
                      </h3>
                      <p className="font-semibold text-burgundy">${relatedBook.price.toFixed(2)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default BookDetails;
