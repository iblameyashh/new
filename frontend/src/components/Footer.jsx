import { Link } from 'react-router-dom';
import { siteConfig } from '../config/siteConfig';
import { Award, BookOpen, Mail, Phone, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#f6f5ef] dark:bg-gray-950 text-gray-800 dark:text-gray-200 border-t border-[#e8e6df] dark:border-gray-800/80 transition-colors duration-300">
      
      {/* Top Value Banner */}
      <div className="border-b border-[#eceae3] dark:border-gray-800/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white">Elite Top Faculty</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">10+ Years average coaching experience</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white">Structured Pathways</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">NCERT & competitive exam mastery</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white">Direct Accountability</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Weekly tests, AIR ranks & 1:1 mentorship</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center space-x-2.5">
              <img
                src="/branding/learnique-logo.jpg"
                alt="LearnIQue logo"
                className="w-10 h-10 object-contain rounded-full bg-white shadow-sm ring-1 ring-amber-200/60"
              />
              <span className="text-2xl font-bold font-serif tracking-tight text-gray-900 dark:text-white">
                {siteConfig.name || 'Learnique'}
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-sm">
              Empowering ambitious learners with premier coaching, top-tier educator mentorship, and interactive digital classrooms.
            </p>
            <div className="pt-2">
              <Link
                to="/register"
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-gray-950 rounded-full text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
              >
                <span>Book a Free Counseling Session</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Programs */}
          <div>
            <h4 className="font-serif font-bold text-gray-900 dark:text-white text-base mb-4">
              Programs
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
              <li><Link to="/courses" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">JEE Main + Advanced</Link></li>
              <li><Link to="/courses" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">NEET UG Medical</Link></li>
              <li><Link to="/courses" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Foundation (Class 8–10)</Link></li>
              <li><Link to="/courses" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">12-Month Dropper Batch</Link></li>
              <li><Link to="/courses" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Olympiad & KVPY</Link></li>
            </ul>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-serif font-bold text-gray-900 dark:text-white text-base mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
              <li><Link to="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Home</Link></li>
              <li><Link to="/courses" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">All Courses</Link></li>
              <li><Link to="/teachers" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Faculty Directory</Link></li>
              <li><Link to="/about" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">About Us</Link></li>
              <li><Link to="/login" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Student Portal</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-serif font-bold text-gray-900 dark:text-white text-base mb-4">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span>{siteConfig.location || 'New Delhi, India'}</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <a href={`tel:${siteConfig.phone || '9555523882'}`} className="hover:underline">
                  {siteConfig.phone || '95555-23882'}
                </a>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <a href={`mailto:${siteConfig.email || 'admissions@learnique.com'}`} className="hover:underline">
                  {siteConfig.email || 'admissions@learnique.com'}
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#eceae3] dark:border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 dark:text-gray-400 gap-4">
          <p>&copy; {new Date().getFullYear()} {siteConfig.name || 'Learnique'}. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <Link to="/about" className="hover:underline">Privacy Policy</Link>
            <Link to="/about" className="hover:underline">Terms of Service</Link>
            <Link to="/about" className="hover:underline">Refund Policy</Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
