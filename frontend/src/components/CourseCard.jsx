import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Atom, 
  Award, 
  BookOpen, 
  Flame, 
  Calculator, 
  Trophy, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

const iconComponents = {
  atom: Atom,
  award: Award,
  book: BookOpen,
  flame: Flame,
  calculator: Calculator,
  trophy: Trophy,
  sparkles: Sparkles,
};

export default function CourseCard({ course }) {
  const [imageError, setImageError] = useState(false);

  if (!course) return null;

  const hasTitle = Boolean(course.title && course.title.trim());
  const hasCategory = Boolean(course.category && course.category.trim());
  const hasClassLevel = Boolean(course.classLevel && course.classLevel.trim());
  const hasDuration = Boolean(course.duration && course.duration.trim());
  const hasDesc = Boolean(course.description && course.description.trim());
  const validFeatures = Array.isArray(course.features)
    ? course.features.filter(f => typeof f === 'string' && f.trim().length > 0)
    : [];

  const displayTitle = hasTitle ? course.title : 'Comprehensive Learning Program';
  const badgeText = hasCategory ? course.category : (hasClassLevel ? course.classLevel : (hasDuration ? course.duration : 'Core Program'));
  const ctaLabel = course.ctaText && course.ctaText.trim() ? course.ctaText : 'Explore curriculum';
  const ctaUrl = course.ctaLink && course.ctaLink.trim() ? course.ctaLink : '/courses';

  const IconComp = (course.icon && iconComponents[course.icon.toLowerCase()]) || Sparkles;

  return (
    <div className="group relative bg-white dark:bg-gray-800/90 rounded-3xl p-6 sm:p-8 border border-[#e8e6df] dark:border-gray-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      
      {/* Optional Course Image Banner */}
      {course.image && !imageError && (
        <div className="-mx-6 -mt-6 sm:-mx-8 sm:-mt-8 mb-6 h-40 overflow-hidden relative border-b border-gray-100 dark:border-gray-700">
          <img
            src={course.image}
            alt={displayTitle}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
      )}

      {/* Card Content Top */}
      <div>
        {/* Header Row: Badge & Circular Icon */}
        <div className="flex items-center justify-between gap-3 mb-6">
          {/* Category / Class Badge */}
          <span className="inline-block px-3.5 py-1.5 rounded-full bg-[#f3f2ec] dark:bg-gray-700/80 text-gray-700 dark:text-gray-200 text-xs font-semibold tracking-wide">
            {badgeText}
          </span>

          {/* Emblem Icon */}
          <div className="w-10 h-10 rounded-full bg-gray-950 dark:bg-gray-900 text-amber-300 flex items-center justify-center shadow-sm border border-amber-400/20 group-hover:bg-primary group-hover:text-white transition-colors">
            <IconComp className="w-5 h-5" />
          </div>
        </div>

        {/* Course Title */}
        <h3 className="text-xl sm:text-2xl font-bold font-serif text-gray-900 dark:text-white tracking-tight mb-3 group-hover:text-primary transition-colors leading-snug">
          {displayTitle}
        </h3>

        {/* Course Description */}
        {hasDesc && (
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
            {course.description}
          </p>
        )}

        {/* Feature List with Amber Checkmarks */}
        {validFeatures.length > 0 && (
          <ul className="space-y-2.5 mb-8">
            {validFeatures.map((feature, idx) => (
              <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                <span className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-[10px]">
                  ✓
                </span>
                <span className="leading-snug">{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-700/80 flex items-center justify-between">
        {hasDuration && (
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            {course.duration}
          </span>
        )}

        <Link
          to={ctaUrl}
          className="inline-flex items-center space-x-1.5 font-bold text-gray-900 dark:text-amber-400 hover:text-primary dark:hover:text-amber-300 text-xs sm:text-sm tracking-wide transition-colors ml-auto group-hover:translate-x-0.5"
        >
          <span>{ctaLabel}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

    </div>
  );
}
