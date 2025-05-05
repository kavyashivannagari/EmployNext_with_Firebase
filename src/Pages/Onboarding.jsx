// src/Pages/Onboarding.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, getUserRole } from '../lib/firebase';
import { updateDoc, doc } from 'firebase/firestore';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CandidateForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    title: '',
    bio: '',
    skills: '',
    experience: '',
    education: '',
    location: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-gray-700"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Professional Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Senior Software Engineer"
          className="w-full p-2 border rounded dark:bg-gray-700"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows="3"
          className="w-full p-2 border rounded dark:bg-gray-700"
          required
        ></textarea>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
        <input
          type="text"
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          placeholder="e.g. JavaScript, React, Node.js"
          className="w-full p-2 border rounded dark:bg-gray-700"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Work Experience</label>
        <textarea
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          rows="3"
          placeholder="Brief description of your work experience"
          className="w-full p-2 border rounded dark:bg-gray-700"
          required
        ></textarea>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Education</label>
        <textarea
          name="education"
          value={formData.education}
          onChange={handleChange}
          rows="2"
          placeholder="Your educational background"
          className="w-full p-2 border rounded dark:bg-gray-700"
          required
        ></textarea>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="City, State/Province, Country"
          className="w-full p-2 border rounded dark:bg-gray-700"
          required
        />
      </div>
      
      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Saving..." : "Complete Profile"}
      </button>
    </form>
  );
};

const RecruiterForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    companyWebsite: '',
    position: '',
    companyDescription: '',
    industry: '',
    location: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-gray-700"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Company Name</label>
        <input
          type="text"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-gray-700"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Company Website</label>
        <input
          type="url"
          name="companyWebsite"
          value={formData.companyWebsite}
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-gray-700"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Your Position</label>
        <input
          type="text"
          name="position"
          value={formData.position}
          onChange={handleChange}
          placeholder="e.g. HR Manager, Technical Recruiter"
          className="w-full p-2 border rounded dark:bg-gray-700"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Company Description</label>
        <textarea
          name="companyDescription"
          value={formData.companyDescription}
          onChange={handleChange}
          rows="3"
          className="w-full p-2 border rounded dark:bg-gray-700"
          required
        ></textarea>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Industry</label>
        <input
          type="text"
          name="industry"
          value={formData.industry}
          onChange={handleChange}
          placeholder="e.g. Technology, Healthcare, Finance"
          className="w-full p-2 border rounded dark:bg-gray-700"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="City, State/Province, Country"
          className="w-full p-2 border rounded dark:bg-gray-700"
          required
        />
      </div>
      
      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Saving..." : "Complete Profile"}
      </button>
    </form>
  );
};

const Onboarding = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserAuth = async () => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          try {
            const role = await getUserRole(user.uid);
            setUserRole(role);
          } catch (error) {
            console.error('Error getting user role:', error);
          }
        } else {
          // No user is signed in, redirect to login
          navigate('/login');
        }
        setLoading(false);
      });

      return () => unsubscribe();
    };

    checkUserAuth();
  }, [navigate]);

  const handleProfileSubmit = async (formData) => {
    setSubmitting(true);
    const user = auth.currentUser;

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      // Update the user's profile in Firestore
      await updateDoc(doc(db, "users", user.uid), {
        ...formData,
        profileCompleted: true,
        updatedAt: new Date()
      });

      // Redirect based on user role
      if (userRole === 'candidate') {
        navigate('/candidate-dashboard');
      } else {
        navigate('/recruiter-dashboard');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-10">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6 text-center">Complete Your Profile</h1>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {userRole === 'candidate' ? (
              <CandidateForm onSubmit={handleProfileSubmit} loading={submitting} />
            ) : (
              <RecruiterForm onSubmit={handleProfileSubmit} loading={submitting} />
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Onboarding;