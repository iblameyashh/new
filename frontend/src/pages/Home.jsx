import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, MessageSquare, ArrowRight } from 'lucide-react';
import { homeContent } from '../data/homeData';
import FacultySection from '../components/FacultySection';
import CourseSection from '../components/CourseSection';

const iconMap = {
  BookOpen: <BookOpen className="w-6 h-6" />,
  CheckCircle: <CheckCircle className="w-6 h-6" />,
  MessageSquare: <MessageSquare className="w-6 h-6" />
};

export default function Home() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

  return (
    <div className="bg-[#fcfbf7] dark:bg-gray-900 transition-colors duration-500 font-sans text-gray-900 dark:text-white">
      
      {/* Editorial Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 pb-32">
        <motion.div 
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 max-w-5xl mx-auto px-4 text-center"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-block mb-6 px-4 py-1.5 rounded-full border border-amber-300/70 bg-amber-50/70 dark:bg-amber-900/20 dark:border-amber-700/40 text-xs font-bold tracking-widest text-amber-900 dark:text-amber-300 uppercase shadow-sm"
          >
            {homeContent.hero.eyebrow}
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-bold font-serif tracking-tight mb-8 leading-none">
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
              {homeContent.hero.titleBefore}
            </motion.span>
            <motion.span 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }}
              className="italic text-primary relative inline-block mx-1"
            >
              <span className="relative z-10">{homeContent.hero.titleHighlight}</span>
            </motion.span>
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <br className="hidden md:block"/>{homeContent.hero.titleAfter}
            </motion.span>
          </h1>
          
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {homeContent.hero.description}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <Link to="/courses" className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-semibold text-lg hover:scale-105 transition-transform flex items-center shadow-xl">
              {homeContent.hero.primaryCTA} <ArrowRight className="ml-2 w-5 h-5"/>
            </Link>
            <Link to="/register" className="px-8 py-4 bg-white/80 dark:bg-transparent border border-gray-300 dark:border-white text-gray-900 dark:text-white rounded-full font-semibold text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-sm">
              {homeContent.hero.secondaryCTA}
            </Link>
          </motion.div>
        </motion.div>

        {/* Ambient background blur */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-200/30 dark:bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-300/20 dark:bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
      </section>

      {/* Courses / Programs Section */}
      <CourseSection />

      {/* Dark Transition Stats Section */}
      <section className="bg-gray-900 text-white py-24 relative z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center divide-x divide-gray-800">
            {homeContent.stats.map((stat, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                className="px-4"
              >
                <div className="text-4xl md:text-5xl font-light mb-2">{stat.value}</div>
                <div className="text-sm font-semibold tracking-wider text-gray-400 uppercase">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Narrative Features Section */}
      <section className="py-32 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-20 max-w-3xl">
            <h3 className="text-sm font-semibold tracking-widest text-primary uppercase mb-4">{homeContent.features.eyebrow}</h3>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">{homeContent.features.title}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">{homeContent.features.description}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            {homeContent.features.items.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ delay: idx * 0.15 }}
                className="p-8 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                  {iconMap[feature.icon]}
                </div>
                <h4 className="text-2xl font-bold mb-4">{feature.title}</h4>
                <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Closing CTA */}
      <section className="py-32 bg-gray-100 dark:bg-gray-800 text-center rounded-[3rem] mx-4 md:mx-10 mb-20 overflow-hidden relative">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative z-10 max-w-2xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{homeContent.ctaSection.title}</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10">{homeContent.ctaSection.description}</p>
          <Link to="/register" className="inline-block px-10 py-5 bg-primary text-white rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-transform">
            {homeContent.ctaSection.buttonText}
          </Link>
        </motion.div>
      </section>

      {/* Leadership / Faculty Section — intentionally kept immediately before the site footer */}
      <FacultySection />

    </div>
  );
}
