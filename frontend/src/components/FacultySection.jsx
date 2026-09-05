import { motion } from 'framer-motion';
import facultyData, { facultySectionConfig } from '../data/faculty';
import FacultyCard from './FacultyCard';

export default function FacultySection() {
  const config = facultySectionConfig || {
    eyebrow: "WORLD-CLASS EDUCATORS",
    titlePart1: "Faculty that has ",
    titleHighlight: "already taught",
    titlePart2: " the toppers you read about.",
    description: "No franchise model. No part-time trainers. The same mentor takes your child from chapter one to AIR.",
  };

  const list = Array.isArray(facultyData) ? facultyData : [];

  return (
    <section className="py-24 sm:py-32 bg-[#faf9f5] dark:bg-gray-900 border-b border-[#eceae3] dark:border-gray-800 relative overflow-hidden transition-colors duration-500">
      
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-200/20 dark:bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-primary/10 dark:bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          {config.eyebrow && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block mb-3.5 px-3.5 py-1 rounded-full bg-amber-100/70 dark:bg-amber-900/30 border border-amber-300/60 dark:border-amber-700/40 text-amber-800 dark:text-amber-300 text-xs font-bold tracking-widest uppercase"
            >
              {config.eyebrow}
            </motion.div>
          )}

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-gray-900 dark:text-white tracking-tight leading-tight mb-5"
          >
            {config.titlePart1}
            {config.titleHighlight && (
              <span className="relative inline-block mx-1">
                <span className="relative z-10 bg-amber-200 dark:bg-amber-400/20 text-gray-950 dark:text-amber-200 px-2.5 py-0.5 rounded-md shadow-sm">
                  {config.titleHighlight}
                </span>
              </span>
            )}
            {config.titlePart2}
          </motion.h2>

          {config.description && (
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed"
            >
              {config.description}
            </motion.p>
          )}
        </div>

        {/* 2-Column Responsive Faculty Cards Grid */}
        {list.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {list.map((faculty, idx) => (
              <motion.div
                key={faculty.id || idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
              >
                <FacultyCard faculty={faculty} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-6 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 max-w-md mx-auto">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Faculty members will be displayed here once configured in <code className="text-primary font-mono font-semibold">src/data/faculty.js</code>.
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
