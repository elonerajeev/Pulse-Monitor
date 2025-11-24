import { Bone } from 'lucide-react';
import Navbar from '@/components/ui/navbar';

const ComingSoon = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar isAuthenticated={isAuthenticated} />
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block p-6 bg-yellow-400 rounded-full">
            <Bone className="h-12 w-12 text-white" />
          </div>
          <h1 className="mt-8 text-4xl font-bold text-gray-800 dark:text-gray-200">Coming Soon!</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">We're working hard to bring you this feature. Stay tuned!</p>
        </div>
      </main>
    </div>
  );
};

export default ComingSoon;
