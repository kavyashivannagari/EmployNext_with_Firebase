import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { auth } from '../lib/firebase';
import PostJobModal from '../components/PostModal';

const PostJob = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const navigate = useNavigate();

  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate('/recruiter-dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={auth.currentUser} userRole="recruiter" />
      <main className="flex-grow py-6 px-4 bg-gray-50 dark:bg-gray-900">
        <PostJobModal isOpen={isModalOpen} onClose={handleCloseModal} />
      </main>
      <Footer />
    </div>
  );
};

export default PostJob;