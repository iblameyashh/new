import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Search, BookOpen, Clock, Award, ArrowRight } from 'lucide-react';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    api.get('/courses/')
      .then(res => setCourses(Array.isArray(res.data) ? res.data : (res.data?.results || [])))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { id: 'ALL', label: 'All Programs' },
    { id: 'JEE', label: 'JEE Main & Adv' },
    { id: 'NEET', label: 'NEET Medical' },
    { id: 'FOUNDATION', label: 'Class 8–10' },
    { id: 'BOARDS', label: 'Boards & 12th' },
  ];

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const title = (c.title || '').toLowerCase();
      const desc = (c.description || '').toLowerCase();
      const subject = (c.subject?.name || '').toLowerCase();
      const classLvl = (c.class_level?.name || '').toLowerCase();
      const term = search.toLowerCase().trim();

      const matchesSearch = !term || title.includes(term) || desc.includes(term) || subject.includes(term) || classLvl.includes(term);

      if (!matchesSearch) return false;

      if (selectedCategory === 'ALL') return true;
      if (selectedCategory === 'JEE') return title.includes('jee') || desc.includes('jee') || classLvl.includes('11') || classLvl.includes('12');
      if (selectedCategory === 'NEET') return title.includes('neet') || desc.includes('neet') || subject.includes('biology') || subject.includes('chem');
      if (selectedCategory === 'FOUNDATION') return title.includes('foundation') || classLvl.includes('8') || classLvl.includes('9') || classLvl.includes('10');
      if (selectedCategory === 'BOARDS') return title.includes('board') || title.includes('cbse') || classLvl.includes('12');

      return true;
    });
  }, [courses, search, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#fcfbf7] dark:bg-gray-900 text-gray-900 dark:text-white py-12 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Banner */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-block mb-3 px-3.5 py-1 rounded-full bg-amber-100/70 dark:bg-amber-900/30 border border-amber-300/60 dark:border-amber-700/40 text-amber-800 dark:text-amber-300 text-xs font-bold tracking-widest uppercase">
            EXPLORE CURRICULUM
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif tracking-tight mb-4 text-gray-900 dark:text-white">
            Academic Programs & Batches
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
            Targeted coaching programs built by master teachers with structured live classes, comprehensive test series, and dedicated 1:1 guidance.
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="mb-10 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800/80 p-3 sm:p-4 rounded-2xl border border-[#eceae3] dark:border-gray-700 shadow-sm">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses, subjects..."
                className="w-full pl-10 pr-4 py-2 bg-[#f8f7f2] dark:bg-gray-900/60 border border-transparent focus:border-primary rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none transition"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-amber-400 text-gray-950 shadow-sm font-bold'
                      : 'bg-[#f4f3ef] dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-[#eceae3] dark:border-gray-700 animate-pulse space-y-4">
                <div className="h-44 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 bg-white dark:bg-gray-800/60 rounded-3xl border border-[#eceae3] dark:border-gray-700 max-w-lg mx-auto p-8 shadow-xs">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-xl font-bold font-serif text-gray-900 dark:text-white mb-2">No Courses Found</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              No programs matched your search query. Try clearing filters or searching for another term.
            </p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory('ALL'); }}
              className="px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-full shadow hover:bg-primary-hover transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Grid of Courses */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="group bg-white dark:bg-gray-800/90 rounded-3xl p-6 sm:p-8 border border-[#e8e6df] dark:border-gray-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Category Badge & Price */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-[#f3f2ec] dark:bg-gray-700/80 text-gray-700 dark:text-gray-200 text-xs font-semibold tracking-wide">
                      {course.class_level?.name || course.subject?.name || 'Academic Batch'}
                    </span>
                    <span className="text-lg font-bold font-serif text-amber-700 dark:text-amber-400">
                      ${course.price}
                    </span>
                  </div>

                  {/* Course Image or Fallback Header */}
                  {course.image ? (
                    <div className="h-44 -mx-6 sm:-mx-8 mb-6 overflow-hidden relative border-y border-gray-100 dark:border-gray-700">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="h-28 -mx-6 sm:-mx-8 mb-6 bg-gradient-to-br from-amber-50/60 to-primary/5 dark:from-gray-800 dark:to-gray-900 border-y border-gray-100 dark:border-gray-700 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-amber-500/40 dark:text-amber-400/20" />
                    </div>
                  )}

                  {/* Course Title */}
                  <h3 className="text-xl sm:text-2xl font-bold font-serif text-gray-900 dark:text-white tracking-tight mb-2.5 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>

                  {/* Course Description */}
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 line-clamp-3">
                    {course.description}
                  </p>

                  {/* Meta Chips */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-6">
                    {course.duration && (
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{course.duration}</span>
                      </span>
                    )}
                    {course.teacher && (
                      <span className="flex items-center space-x-1 font-medium text-gray-700 dark:text-gray-300">
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>{course.teacher.user?.first_name ? `${course.teacher.user.first_name} ${course.teacher.user.last_name || ''}` : 'Faculty Mentor'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700/80">
                  <Link
                    to={`/courses/${course.id}`}
                    className="w-full inline-flex items-center justify-center space-x-2 py-3 bg-gray-950 hover:bg-primary dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-gray-950 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow transition-all group/btn"
                  >
                    <span>View Curriculum & Enroll</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
