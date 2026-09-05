import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Search, Award, ArrowRight, User as UserIcon } from 'lucide-react';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/teachers/')
      .then(res => setTeachers(Array.isArray(res.data) ? res.data : (res.data?.results || [])))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getInitials = (userObj) => {
    if (!userObj) return 'LQ';
    const first = (userObj.first_name || userObj.username || '').charAt(0);
    const last = (userObj.last_name || '').charAt(0);
    return (first + last).toUpperCase() || 'LQ';
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const name = `${t.user?.first_name || ''} ${t.user?.last_name || ''} ${t.user?.username || ''}`.toLowerCase();
      const qual = (t.qualification || '').toLowerCase();
      const bio = (t.bio || '').toLowerCase();
      const term = search.toLowerCase().trim();
      return !term || name.includes(term) || qual.includes(term) || bio.includes(term);
    });
  }, [teachers, search]);

  return (
    <div className="min-h-screen bg-[#fcfbf7] dark:bg-gray-900 text-gray-900 dark:text-white py-12 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Banner */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-block mb-3 px-3.5 py-1 rounded-full bg-amber-100/70 dark:bg-amber-900/30 border border-amber-300/60 dark:border-amber-700/40 text-amber-800 dark:text-amber-300 text-xs font-bold tracking-widest uppercase">
            MASTER EDUCATORS
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif tracking-tight mb-4 text-gray-900 dark:text-white">
            Meet Our Distinguished Faculty
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
            Learn from seasoned subject experts, top competitive mentors, and dedicated educators committed to unlocking every student's full potential.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search faculty by name, qualification..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800/90 border border-[#eceae3] dark:border-gray-700 rounded-full text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm transition"
            />
          </div>
        </div>

        {/* Skeletons Loading */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-[#eceae3] dark:border-gray-700 animate-pulse space-y-4">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-2/3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full" />
              </div>
            ))}
          </div>
        ) : filteredTeachers.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 bg-white dark:bg-gray-800/60 rounded-3xl border border-[#eceae3] dark:border-gray-700 max-w-lg mx-auto p-8 shadow-xs">
            <UserIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-xl font-bold font-serif text-gray-900 dark:text-white mb-2">No Faculty Members Found</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              No faculty matched your search criteria.
            </p>
            <button
              onClick={() => setSearch('')}
              className="px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-full shadow hover:bg-primary-hover transition"
            >
              Clear Search
            </button>
          </div>
        ) : (
          /* Grid of Faculty */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTeachers.map((teacher) => {
              const fullName = teacher.user?.first_name 
                ? `${teacher.user.first_name} ${teacher.user.last_name || ''}`.trim()
                : (teacher.user?.username || 'Faculty Member');
              const initials = getInitials(teacher.user);

              return (
                <div
                  key={teacher.id}
                  className="group bg-white dark:bg-gray-800/90 rounded-3xl p-7 sm:p-8 border border-[#e8e6df] dark:border-gray-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Avatar & Experience Badge */}
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div className="relative">
                        {teacher.user?.profile_image ? (
                          <img
                            src={teacher.user.profile_image}
                            alt={fullName}
                            className="w-18 h-18 rounded-full object-cover border-2 border-amber-400/40 shadow-sm"
                          />
                        ) : (
                          <div className="w-18 h-18 rounded-full bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-900 text-amber-300 flex items-center justify-center font-serif font-bold text-xl shadow-inner border border-amber-400/30">
                            {initials}
                          </div>
                        )}
                        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-800" />
                      </div>

                      {teacher.experience > 0 && (
                        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-700/50 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                          <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>{teacher.experience}+ Yrs Exp</span>
                        </div>
                      )}
                    </div>

                    {/* Faculty Name */}
                    <h3 className="text-2xl font-bold font-serif text-gray-900 dark:text-white tracking-tight mb-1 group-hover:text-primary transition-colors">
                      {fullName}
                    </h3>

                    {/* Qualification */}
                    {teacher.qualification && (
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-4">
                        {teacher.qualification}
                      </p>
                    )}

                    {/* Bio */}
                    {teacher.bio && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 line-clamp-3">
                        {teacher.bio}
                      </p>
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700/80 flex items-center justify-between">
                    <Link
                      to={`/teacher/${teacher.id}`}
                      className="inline-flex items-center space-x-1.5 font-bold text-gray-900 dark:text-amber-400 hover:text-primary dark:hover:text-amber-300 uppercase tracking-wider text-xs whitespace-nowrap transition-colors ml-auto group-hover:translate-x-0.5"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
