import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, BookOpen, ArrowRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/lib/supabase';
import { Book } from '@/contexts/CartContext';

const Books: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'price' | 'year'>('year');

  const fetchBooks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .gt('stock', 0)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedBooks: Book[] = (data || []).map(book => ({
        id: book.id,
        title: book.title,
        description: book.description,
        shortDescription: book.short_description,
        price: book.price,
        coverImage: book.cover_image || '/placeholder.svg',
        year: book.year,
        pages: book.pages,
        language: book.language,
      }));

      setBooks(formattedBooks);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const filteredAndSortedBooks = useMemo(() => {
    let result = [...books];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        book =>
          book.title.toLowerCase().includes(query) ||
          book.description.toLowerCase().includes(query) ||
          book.shortDescription.toLowerCase().includes(query)
      );
    }
    
    result.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'price':
          return a.price - b.price;
        case 'year':
          return b.year - a.year;
        default:
          return 0;
      }
    });
    
    return result;
  }, [books, searchQuery, sortBy]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading books...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 w-48 h-48 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="font-serif text-4xl md:text-5xl text-white mb-4">
              Books & <span className="text-gold">Publications</span>
            </h1>
            <p className="text-white/80 text-lg mb-8">
              Explore the literary works of Bishop Bigirumwami
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Search books by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-gold transition-colors"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {/* Sort Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <p className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredAndSortedBooks.length}</span> books
            </p>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground text-sm">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'title' | 'price' | 'year')}
                className="bg-card border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <option value="year">Newest First</option>
                <option value="title">Title A-Z</option>
                <option value="price">Price: Low to High</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {filteredAndSortedBooks.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/books/${book.id}`} className="block group h-full">
                    <div className="bg-card rounded-lg overflow-hidden shadow-elegant hover:shadow-gold transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                      {/* Book Cover */}
                      <div className="h-96 bg-gradient-to-br from-primary to-deep-blue-light flex items-center justify-center relative overflow-hidden">
                        {book.coverImage && book.coverImage !== '/placeholder.svg' ? (
                          <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="w-20 h-20 text-gold/50 group-hover:scale-110 transition-transform duration-300" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <span className="inline-block px-3 py-1 bg-gold/20 backdrop-blur-sm rounded-full text-gold text-sm">
                            {book.year}
                          </span>
                        </div>
                      </div>
                      
                      {/* Book Info */}
                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="font-serif text-lg text-foreground mb-2 group-hover:text-gold transition-colors line-clamp-2">
                          {book.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow">
                          {book.shortDescription}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div>
                            <span className="font-serif text-2xl text-burgundy">{book.price.toLocaleString()} RWF</span>
                            {book.language && (
                              <span className="block text-xs text-muted-foreground">{book.language}</span>
                            )}
                          </div>
                          <span className="text-gold text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                            View Details <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <BookOpen className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-serif text-xl text-foreground mb-2">No books found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search query
              </p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            </motion.div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Books;
