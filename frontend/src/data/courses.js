/**
 * ==============================================================================
 * COURSES & PROGRAMS DATA CONFIGURATION (src/data/courses.js)
 * ==============================================================================
 * 
 * How to add/edit courses/programs:
 * 1. Simply edit the fields in the array below.
 * 2. To add a course image/thumbnail:
 *    - Place the image file in: frontend/public/images/courses/ (e.g. jee-advanced.jpg)
 *    - Set the image field to: "/images/courses/jee-advanced.jpg"
 * 3. Icon choices for badge: "atom", "math", "book", "trophy", "flame", "calculator", "award" (or leave "" for default)
 * 4. Leave any field as "" (empty string) if not applicable — the UI will hide it gracefully.
 */

export const courseSectionConfig = {
  eyebrow: "TARGETED LEARNING PATHWAYS",
  titlePart1: "Programs Built For ",
  titleHighlight: "Your Goals",
  titlePart2: ".",
  description: "Comprehensive classroom and structured interactive programs engineered for competitive exams and board excellence.",
};

const coursesData = [
  {
    id: 1,
    title: "Class 10-12 Boards", // e.g. "JEE Main + Advanced"
    category: "", // e.g. "Class 11–12 · Droppers"
    classLevel: "Class 10-12", // e.g. "Class 11–12"
    duration: "10 months", // e.g. "2-Year Program"
    image: "", // e.g. "/images/courses/jee.jpg" (optional header/background image)
    icon: "atom", // "atom" | "math" | "book" | "trophy" | "flame" | "calculator" | "award"
    description: "A comprehensive CBSE Board preparation program designed to help students build strong concepts, master the NCERT curriculum, and achieve their academic goals. The program combines expert classroom teaching, structured study plans.", // e.g. "Two-year + one-year intensive programs designed to crack JEE Advanced with deep concept building and IIT-style problem solving."
    features: [
      "", // e.g. "750+ hrs of live teaching"
      "", // e.g. "Weekly tests + AIR ranks"
      "", // e.g. "Personal IIT-mentor"
    ],
    ctaText: "", // e.g. "Explore curriculum" (defaults to "Explore curriculum" if empty)
    ctaLink: "", // e.g. "/courses" (defaults to "/courses" if empty)
  },

  {
    id: 2,
    title: "CBSE Foundation Program", // e.g. "NEET UG"
    category: "", // e.g. "Class 11–12 · Droppers"
    classLevel: "Classes 6–10", // e.g. "Class 11–12"
    duration: "", // e.g. "2-Year Program"
    image: "",
    icon: "award",
    description: "Strong conceptual foundation in Mathematics & Science, school exam preparation, NCERT mastery, regular tests and doubt sessions.", // e.g. "Biology-led, NCERT-anchored program with the most detailed assertion-reason and image-based practice."
    features: [
      "", // e.g. "NCERT mastery cycles"
      "", // e.g. "Image & assertion drills"
      "", // e.g. "Counsellor-guided choice filling"
    ],
    ctaText: "",
    ctaLink: "",
  },

  {
    id: 3,
    title: "CBSE Board Excellence Program", // e.g. "Foundation Program"
    category: "", // e.g. "Class 8–10"
    classLevel: "Classes 11–12", // e.g. "Class 8–10"
    duration: "", // e.g. "1-Year / 2-Year Program"
    image: "",
    icon: "book",
    description: "Complete Board-focused preparation with NCERT, advanced problem solving, chapter-wise tests, sample papers and revision programs.", // e.g. "Build the right scientific temperament 3 years before the actual race. NTSE / Olympiad / Boards in one curriculum."
    features: [
      "", // e.g. "Olympiad coaching"
      "", // e.g. "Strong Boards score"
      "", // e.g. "Aptitude + reasoning"
    ],
    ctaText: "",
    ctaLink: "",
  },

  {
    id: 4,
    title: "EE Excellence Program — JEE Main & Advanced", // e.g. "Dropper Batch"
    category: "", // e.g. "12-month intensive"
    classLevel: "", // e.g. "Dropper / Repeaters"
    duration: "", // e.g. "1-Year Intensive"
    image: "",
    icon: "flame",
    description: "Comprehensive preparation for Physics, Chemistry & Mathematics, including concept building, problem solving, PYQs, mock tests and advanced-level practice.", // e.g. "A reset-year program with separate seating, accountability circles, daily mentoring and weekly parent updates."
    features: [
      "", // e.g. "Daily 9-hour structure"
      "", // e.g. "Weekly mentor 1:1"
      "", // e.g. "Resilience workshops"
    ],
    ctaText: "",
    ctaLink: "",
  },

  {
    id: 5,
    title: "NEET Excellence Program — NEET-UG", // e.g. "Class 11–12 Boards"
    category: "", // e.g. "CBSE · Hr.Sec"
    classLevel: "", // e.g. "Class 11–12"
    duration: "", // e.g. "Board Master Program"
    image: "",
    icon: "calculator",
    description: "Focused preparation for Physics, Chemistry & Biology with NCERT mastery, PYQs, regular assessments, doubt solving and full-length mock tests.", // e.g. "For students who want a strong Boards score without compromising on JEE/NEET prep — twin-track curriculum."
    features: [
      "", // e.g. "Sample paper marathons"
      "", // e.g. "Subjective answer training"
      "", // e.g. "Board-pattern revision"
    ],
    ctaText: "",
    ctaLink: "",
  },

  {
    id: 6,
    title: "Olympiad & Competitive Foundation Program", // e.g. "Olympiad & KVPY"
    category: "", // e.g. "Add-on"
    classLevel: "", // e.g. "All Classes"
    duration: "", // e.g. "Weekend Cohort"
    image: "",
    icon: "trophy",
    description: "Specialized preparation for Mathematics & Science Olympiads, logical reasoning, analytical thinking and challenging problem-solving.", // e.g. "Cohort-based prep for IOQM, RMO, IChO, IBO and KVPY — taught by past Olympiad medalists from IITs."
    features: [
      "", // e.g. "Past Olympiad mentors"
      "", // e.g. "Saturday cohorts"
      "", // e.g. "Free for top BST scorers"
    ],
    ctaText: "",
    ctaLink: "",
  },
];

export default coursesData;
