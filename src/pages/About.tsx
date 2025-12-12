import React from 'react';
import { motion } from 'framer-motion';
import { Cross, BookOpen, Church, Users, Award, Calendar } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

const timelineEvents = [
  {
    year: '1903',
    title: 'Birth',
    description: 'Born in Zaza, Rwanda, into a family that would later embrace Christianity.',
    icon: Calendar,
  },
  {
    year: '1917',
    title: 'Baptism',
    description: 'Received baptism and began his journey in the Catholic faith.',
    icon: Cross,
  },
  {
    year: '1929',
    title: 'Ordination',
    description: 'Ordained as a priest, becoming one of the first Rwandan priests.',
    icon: Church,
  },
  {
    year: '1952',
    title: 'Episcopal Consecration',
    description: 'Consecrated as the first native Rwandan Catholic bishop, appointed to lead the Diocese of Nyundo.',
    icon: Award,
  },
  {
    year: '1964',
    title: 'Major Publication',
    description: 'Published "Imihango n\'Imigenzo n\'Imiziririzo mu Rwanda", documenting Rwandan traditions.',
    icon: BookOpen,
  },
  {
    year: '1973',
    title: 'Retirement',
    description: 'Retired from active episcopal ministry after decades of faithful service.',
    icon: Users,
  },
  {
    year: '1986',
    title: 'Return to God',
    description: 'Passed away, leaving behind a rich legacy of faith, scholarship, and service.',
    icon: Cross,
  },
];

const About: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-gold/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="font-serif text-4xl md:text-5xl text-white mb-4">
              About <span className="text-gold">Monseigneur Bigirumwami</span>
            </h1>
            <p className="text-white/80 text-lg">
              The life and legacy of Rwanda's first native Catholic bishop
            </p>
          </motion.div>
        </div>
      </section>

      {/* Biography Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 space-y-6"
            >
              <div>
                <h2 className="font-serif text-2xl text-foreground mb-4 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                    <Cross className="w-5 h-5 text-gold" />
                  </span>
                  Early Life & Calling
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Aloys Bigirumwami was born in 1903 in Zaza, one of the first mission stations in Rwanda. 
                  Growing up in an environment where traditional Rwandan culture met the newly arrived Christian faith, 
                  young Aloys developed a deep appreciation for both worlds that would define his life's work.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  His family's conversion to Christianity opened doors to education at the mission school, 
                  where he excelled academically and spiritually. His teachers recognized his exceptional 
                  qualities and encouraged him to pursue the priesthood.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-2xl text-foreground mb-4 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                    <Church className="w-5 h-5 text-gold" />
                  </span>
                  Priesthood & Ministry
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Ordained in 1929, Father Bigirumwami became one of the pioneering Rwandan priests. 
                  His ministry was characterized by a deep commitment to education, evangelization, 
                  and the documentation of Rwandan cultural heritage.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  He served in various parishes, gaining the respect of both his fellow clergy and the 
                  faithful through his pastoral care and intellectual contributions. His sermons and 
                  teachings reflected a unique ability to present the Gospel in ways that resonated 
                  with Rwandan sensibilities.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-2xl text-foreground mb-4 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-gold" />
                  </span>
                  Episcopal Ministry
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  In 1952, Aloys Bigirumwami made history when he was consecrated as the first native 
                  Rwandan Catholic bishop. Appointed to lead the Diocese of Nyundo in the western region 
                  of Rwanda, he worked tirelessly to build up the local Church.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  As bishop, he focused on forming local clergy, establishing schools and healthcare 
                  facilities, and promoting the inculturation of Christian worship. He believed strongly 
                  that the Gospel should be expressed through African cultures rather than replacing them.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-2xl text-foreground mb-4 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-gold" />
                  </span>
                  Literary Contributions
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Bishop Bigirumwami's most enduring legacy may be his written works. Recognizing that 
                  traditional Rwandan knowledge was primarily oral, he dedicated himself to documenting 
                  customs, traditions, and wisdom for future generations.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  His masterwork, "Imihango n'Imigenzo n'Imiziririzo mu Rwanda" (Customs, Traditions, 
                  and Taboos of Rwanda), remains an essential reference for understanding pre-colonial 
                  Rwandan society. He also composed hymns, wrote pastoral letters, and produced 
                  numerous other works on faith and culture.
                </p>
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-card rounded-lg p-6 shadow-elegant sticky top-24">
                <div className="aspect-square bg-gradient-to-br from-primary to-deep-blue-light rounded-lg flex items-center justify-center mb-6">
                  <div className="text-center">
                    <Cross className="w-12 h-12 text-gold mx-auto mb-2" />
                    <p className="font-serif text-white">Bishop's Portrait</p>
                  </div>
                </div>
                
                <h3 className="font-serif text-xl text-foreground mb-4">Key Facts</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border">
                    <dt className="text-muted-foreground">Born</dt>
                    <dd className="font-medium">1903, Zaza</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <dt className="text-muted-foreground">Ordained</dt>
                    <dd className="font-medium">1929</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <dt className="text-muted-foreground">Consecrated</dt>
                    <dd className="font-medium">1952</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <dt className="text-muted-foreground">Diocese</dt>
                    <dd className="font-medium">Nyundo</dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-muted-foreground">Died</dt>
                    <dd className="font-medium">1986</dd>
                  </div>
                </dl>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
              Life <span className="text-gold">Timeline</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Key moments in the life of Bishop Bigirumwami
            </p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            {/* Timeline Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gold/30 -translate-x-1/2" />

            {timelineEvents.map((event, index) => (
              <motion.div
                key={event.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex items-start gap-8 mb-8 ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-gold rounded-full -translate-x-1/2 border-4 border-background z-10" />

                {/* Content */}
                <div className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] ${
                  index % 2 === 0 ? 'md:text-right' : ''
                }`}>
                  <div className={`bg-card p-6 rounded-lg shadow-elegant ${
                    index % 2 === 0 ? 'md:ml-auto' : ''
                  }`}>
                    <div className={`flex items-center gap-3 mb-2 ${
                      index % 2 === 0 ? 'md:flex-row-reverse' : ''
                    }`}>
                      <span className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                        <event.icon className="w-4 h-4 text-gold" />
                      </span>
                      <span className="text-gold font-serif text-xl">{event.year}</span>
                    </div>
                    <h3 className="font-serif text-lg text-foreground mb-2">{event.title}</h3>
                    <p className="text-muted-foreground text-sm">{event.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
