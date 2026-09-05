import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AiChatbot from '../components/AiChatbot';

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <AiChatbot />
    </div>
  );
}
