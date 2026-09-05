/**
 * ==============================================================================
 * FACULTY DATA CONFIGURATION (src/data/faculty.js)
 * ==============================================================================
 * 
 * How to add/edit faculty members:
 * 1. Simply edit the fields in the array below.
 * 2. To add a faculty photo:
 *    - Place the image file in: frontend/public/images/faculty/ (e.g. bhanu-sir.jpg)
 *    - Set the image field to: "/images/faculty/bhanu-sir.jpg"
 *    - If no image is provided, a clean monogram badge with their initials will be shown automatically.
 * 3. Leave any field as "" (empty string) if not applicable — the UI will hide it gracefully.
 */

export const facultySectionConfig = {
  eyebrow: "WORLD-CLASS EDUCATORS",
  titlePart1: "Faculty that has ",
  titleHighlight: "already taught",
  titlePart2: " the toppers you read about.",
  description: "No franchise model. No part-time trainers. The same mentor takes your child from chapter one to AIR.",
};

const facultyData = [
  {
    id: 1,
    name: "Jawahar Sir", // e.g. "Bhanu Sir"
    post: "Co-Founder & Mathematics Faculty", // e.g. "Co-Founder & Chemistry Faculty"
    experience: "6+ Yrs Exp", // e.g. "10+ Yrs Exp" or "Senior Faculty"
    subject: "Mathematics", // e.g. "Chemistry"
    image: "/images/faculty/mohit-sir.jpeg", // e.g. "/images/faculty/bhanu-sir.jpg" or leave "" for initials fallback
    description: "With more than 6 years of teaching experience, Mohit has mentored and guided students preparing for competitive examinations and academic success.",
    expertise: [
      "", // e.g. "Concept Simplification"
      "", // e.g. "Student-Centered Mentorship"
      "", // e.g. "Fundamentals Builder"
    ],
    ctaText: "", // e.g. "BOOK DEMO" (defaults to "BOOK DEMO" if empty)
    ctaLink: "", // e.g. "/courses" or "/teachers" (defaults to "/teachers" if empty)
    sitInClassText: "", // e.g. "Sit in their Mathematics class" (defaults to "Sit in their class" if empty)
  },

  {
    id: 2,
    name: "Yashpal Dagar", // e.g. "Tanu Ma'am"
    post: "Chairman", // e.g. "Co-Founder & Chemistry Faculty"
    experience: "Chairman", // e.g. "Senior Faculty"
    subject: "", // e.g. "Chemistry"
    image: "/images/faculty/uncleji.jpeg", // e.g. "/images/faculty/tanu-maam.jpg"
    description: "At Learnique, our vision is to provide quality education that builds not only academic excellence but also confidence, discipline, and strong values. We aim to create an environment where every student is guided to discover their potential and achieve their dreams.", // e.g. "Tanu previously served as a Chemistry faculty member at various institutions, where she worked closely with students preparing for competitive exams."
    expertise: [
      "", // e.g. "Conceptual Clarity"
      "", // e.g. "Interactive Learning"
      "", // e.g. "Academic Support & Growth"
    ],
    ctaText: "",
    ctaLink: "",
    sitInClassText: "",
  },
];

export default facultyData;
