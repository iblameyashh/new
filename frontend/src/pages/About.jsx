import { siteConfig } from '../config/siteConfig';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">About {siteConfig.name}</h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
        We are on a mission to democratize premium level coaching and connect passionate students with experienced educators around the world.
      </p>
      <div className="bg-primary/10 dark:bg-gray-800 p-8 rounded-2xl">
        <h2 className="text-2xl font-bold mb-4 text-primary dark:text-blue-400">Our Vision</h2>
        <p className="text-gray-700 dark:text-gray-300">
          To become the most trusted and effective personalized digital education platform. We believe in practical, effective, and direct communication between mentors and learners.
        </p>
      </div>
    </div>
  );
}
