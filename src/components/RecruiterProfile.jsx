import { useState, useEffect } from 'react';
import { auth, getUserProfile, updateUserProfile } from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X } from 'lucide-react';

const RecruiterProfileModal = ({ isOpen, onClose, onProfileUpdate }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    position: '',
    location: '',
    companyName: '',
    industry: '',
    companyWebsite: '',
    companyDescription: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadUserProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const profile = await getUserProfile(user.uid);
        
        if (isMounted) {
          setFormData({
            fullName: profile.fullName || '',
            position: profile.position || '',
            location: profile.location || '',
            companyName: profile.companyName || '',
            industry: profile.industry || '',
            companyWebsite: profile.companyWebsite || '',
            companyDescription: profile.companyDescription || ''
          });
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error loading profile:', error);
          setError('Failed to load profile data. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (isOpen) {
      loadUserProfile();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.companyName) {
      setError("Full name and company name are required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("You must be logged in to save your profile");
      }

      await updateUserProfile(user.uid, formData);
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onProfileUpdate) {
          onProfileUpdate(formData);
        }
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError(error.message || "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Company Profile</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update your company information</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-600">
              <AlertDescription className="text-green-800 dark:text-green-300">
                Profile saved successfully!
              </AlertDescription>
            </Alert>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recruiter Information</h3>
                  
                  <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input 
                        id="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Your full name"
                        required
                        disabled={saving}
                        className="mt-2"
                      />
                    </div>
                    
                    <div className="sm:col-span-3">
                      <Label htmlFor="position">Position</Label>
                      <Input 
                        id="position"
                        value={formData.position}
                        onChange={handleChange}
                        placeholder="e.g., HR Manager"
                        disabled={saving}
                        className="mt-2"
                      />
                    </div>
                    
                    <div className="sm:col-span-6">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="City, State/Province, Country"
                        disabled={saving}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Company Information</h3>
                  
                  <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input 
                        id="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Your company name"
                        required
                        disabled={saving}
                        className="mt-2"
                      />
                    </div>
                    
                    <div className="sm:col-span-3">
                      <Label htmlFor="industry">Industry</Label>
                      <Input 
                        id="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        placeholder="e.g., Technology, Healthcare"
                        disabled={saving}
                        className="mt-2"
                      />
                    </div>
                    
                    <div className="sm:col-span-6">
                      <Label htmlFor="companyWebsite">Website</Label>
                      <Input 
                        id="companyWebsite"
                        type="url"
                        value={formData.companyWebsite}
                        onChange={handleChange}
                        placeholder="https://yourcompany.com"
                        disabled={saving}
                        className="mt-2"
                      />
                    </div>
                    
                    <div className="sm:col-span-6">
                      <Label htmlFor="companyDescription">Company Description</Label>
                      <Textarea 
                        id="companyDescription"
                        value={formData.companyDescription}
                        onChange={handleChange}
                        placeholder="Tell candidates about your company"
                        rows={4}
                        disabled={saving}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={onClose}
                  disabled={saving}
                  className="px-6 py-2"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="px-6 py-2"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterProfileModal;