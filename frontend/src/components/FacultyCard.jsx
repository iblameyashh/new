import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, BookOpen, ArrowRight, Sparkles } from 'lucide-react';

export default function FacultyCard({ faculty }) {
  const [imageError, setImageError] = useState(false);

  if (!faculty) return null;

  // Extract initials for fallback avatar
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'LQ';
    const clean = name.replace(/(sir|ma'am|dr\.|prof\.|mr\.|mrs\.|ms\.)/gi, '').trim();
    const parts = (clean || name).trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (name.slice(0, 2)).toUpperCase();
  };

  const hasName = Boolean(faculty.name && faculty.name.trim());
  const hasPost = Boolean(faculty.post && faculty.post.trim());
  const hasExp = Boolean(faculty.experience && faculty.experience.trim());
  const hasDesc = Boolean(faculty.description && faculty.description.trim());
  const hasSubject = Boolean(faculty.subject && faculty.subject.trim());
  const validExpertise = Array.isArray(faculty.expertise) 
    ? faculty.expertise.filter(item => typeof item === 'string' && item.trim().length > 0)
    : [];

  const displayName = hasName ? faculty.name : 'Senior Faculty Member';
  const displayPost = hasPost ? faculty.post : (hasSubject ? `${faculty.subject} Specialist` : 'Faculty Mentor');
  const initials = getInitials(displayName);
  const ctaLabel = faculty.ctaText && faculty.ctaText.trim() ? faculty.ctaText : 'BOOK DEMO';
  const ctaUrl = faculty.ctaLink && faculty.ctaLink.trim() ? faculty.ctaLink : '/teachers';
  const classText = faculty.sitInClassText && faculty.sitInClassText.trim() 
    ? faculty.sitInClassText 
    : (hasSubject ? `Sit in their ${faculty.subject} class` : 'Explore mentorship session');

  return (
    <div className="group relative bg-white dark:bg-gray-800/90 rounded-3xl p-6 sm:p-8 border border-[#e8e6df] dark:border-gray-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      
      {/* Top Section: Avatar & Experience Badge */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-6">
          {/* Avatar / Photo */}
          <div className="relative">
            {faculty.image && !imageError ? (
              <img
                src={faculty.image}
                alt={displayName}
                onError={() => setImageError(true)}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-amber-400/40 shadow-md group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-900 text-amber-300 flex items-center justify-center font-serif font-bold text-xl sm:text-2xl shadow-inner border border-amber-400/30 group-hover:border-amber-400 transition-colors">
                {initials}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-800" title="Active Faculty" />
          </div>

          {/* Experience / Status Badge */}
          {hasExp ? (
            <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-700/50 text-amber-800 dark:text-amber-300 text-xs font-semibold tracking-wide">
              <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{faculty.experience}</span>
            </div>
          ) : (
            <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Faculty</span>
            </div>
          )}
        </div>

        {/* Post / Designation Tag */}
        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-1.5">
          {displayPost}
        </p>

        {/* Faculty Name */}
        <h3 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900 dark:text-white tracking-tight mb-3 group-hover:text-primary transition-colors">
          {displayName}
        </h3>

        {/* Short Biography */}
        {hasDesc && (
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
            {faculty.description}
          </p>
        )}

        {/* Expertise Pills */}
        {validExpertise.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {validExpertise.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-[#f4f3ef] dark:bg-gray-700/80 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-medium border border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-700/80 flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 truncate">
          <BookOpen className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
          <span className="truncate font-medium">{classText}</span>
        </div>

        <Link
          to={ctaUrl}
          className="inline-flex items-center space-x-1.5 font-bold text-gray-900 dark:text-amber-400 hover:text-primary dark:hover:text-amber-300 uppercase tracking-wider text-xs whitespace-nowrap transition-colors group-hover:translate-x-0.5"
        >
          <span>{ctaLabel}</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

    </div>
  );
}
