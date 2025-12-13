import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, Cross, Feather, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/lib/supabase';
import { Book } from '@/contexts/CartContext';

const Home: React.FC = () => {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);

  const fetchFeaturedBooks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .gt('stock', 0)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;

      if (data) {
        const formattedBooks: Book[] = data.map(book => ({
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
        setFeaturedBooks(formattedBooks);
      }
    } catch (error) {
      console.error('Error fetching featured books:', error);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedBooks();
  }, [fetchFeaturedBooks]);
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] bg-gradient-hero flex items-center overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-gold/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-gold/5 rounded-full" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-gold/20 mb-6"
              >
                <Cross className="w-4 h-4 text-gold" />
                <span className="text-gold text-sm font-medium">First Rwandan Catholic Bishop</span>
              </motion.div>

              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
                <span className="block">Monseigneur</span>
                <span className="text-gold">Aloys Bigirumwami</span>
              </h1>

              <p className="text-lg md:text-xl text-white/80 mb-4 max-w-xl mx-auto lg:mx-0">
                Pioneer of African Christianity, defender of Rwandan traditions, and author of foundational works on culture and faith.
              </p>

              <blockquote className="relative my-8 pl-6 border-l-4 border-gold text-white/70 italic max-w-lg mx-auto lg:mx-0">
                <Feather className="absolute -left-3 -top-2 w-6 h-6 text-gold" />
                "The Gospel does not destroy culture, but purifies and elevates it."
              </blockquote>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/books">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Shop Books
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline-light" size="xl" className="w-full sm:w-auto">
                    Learn His Story
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Portrait */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-[400px] h-[500px] mx-auto">
                <div className="absolute inset-0 bg-gradient-to-b from-gold/20 to-transparent rounded-lg" />
                <div className="absolute -inset-4 border-2 border-gold/30 rounded-lg" />
                <div className="w-full h-full rounded-lg overflow-hidden shadow-2xl">
                  <img 
                    src="/aloys.png" 
                    alt="Monseigneur Aloys Bigirumwami in full episcopal vestments"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
              Literary <span className="text-gold">Legacy</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover the written works of Bishop Bigirumwami, documenting Rwandan traditions and Christian faith.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/books/${book.id}`} className="block group">
                  <div className="bg-card rounded-lg overflow-hidden shadow-elegant hover:shadow-gold transition-all duration-300 hover:-translate-y-1">
                    <div className="h-96 bg-gradient-to-br from-primary to-deep-blue-light flex items-center justify-center relative overflow-hidden">
                      {book.coverImage && book.coverImage !== '/placeholder.svg' ? (
                        <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-20 h-20 text-gold/50" />
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <span className="text-gold text-sm">{book.year}</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-serif text-lg text-foreground mb-2 group-hover:text-gold transition-colors line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {book.shortDescription}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-burgundy">{book.price.toLocaleString()} RWF</span>
                        <span className="text-gold text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          View <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/books">
              <Button variant="burgundy" size="lg">
                View All Books
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-6">
                A Life of <span className="text-gold">Faith & Service</span>
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Born in 1903 in Zaza, Rwanda, Aloys Bigirumwami would become one of the most influential figures in Rwandan religious and cultural history.
                </p>
                <p>
                  As the first Rwandan Catholic bishop, he dedicated his life to building the local Church while preserving and documenting the rich traditions of his people.
                </p>
                <p>
                  His writings remain essential resources for understanding Rwandan culture and the inculturation of Christian faith in Africa.
                </p>
              </div>
              <Link to="/about" className="inline-block mt-6">
                <Button variant="gold" size="lg">
                  Read Full Biography
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { label: 'Years of Service', value: '40+' },
                { label: 'Books Written', value: '10+' },
                { label: 'Diocese Built', value: 'Nyundo' },
                { label: 'Legacy Lives On', value: '∞' },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-card p-6 rounded-lg shadow-elegant text-center"
                >
                  <div className="font-serif text-3xl text-gold mb-2">{stat.value}</div>
                  <div className="text-muted-foreground text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <Heart className="w-10 h-10 text-gold mx-auto mb-4" />
            <h2 className="font-serif text-2xl md:text-3xl text-white mb-4">
              Stay Connected
            </h2>
            <p className="text-white/70 mb-6">
              Subscribe to receive updates about new publications and events honoring Bishop Bigirumwami's legacy.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-gold"
              />
              <Button variant="gold" size="lg">
                Subscribe
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
