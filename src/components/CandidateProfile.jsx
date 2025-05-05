import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, getUserProfile, updateUserProfile } from '../lib/firebase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CandidateProfile = () => {
  const navigate = useNavigate();
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [education, setEducation] = useState('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  
  // Status
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/login');
          return;
        }

        const profile = await getUserProfile(user.uid);
        
        if (profile) {
          setFullName(profile.fullName || '');
          setTitle(profile.title || '');
          setLocation(profile.location || '');
          // Handle both array and string formats for skills
          if (Array.isArray(profile.skills)) {
            setSkills(profile.skills.join(', ') || '');
          } else if (typeof profile.skills === 'string') {
            setSkills(profile.skills);
          } else {
            setSkills('');
          }
          setEducation(profile.education || '');
          setBio(profile.bio || '');
          setExperience(profile.experience || '');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Failed to load your profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
  
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }
  
      // Prepare skills data
      const skillsData = skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);
  
      const profileData = {
        fullName: fullName.trim(),
        title: title.trim(),
        location: location.trim(),
        skills: skillsData,
        education,
        bio: bio.trim(),
        experience: experience.trim()
      };
  
      // Save profile
      const result = await updateUserProfile(user.uid, profileData);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        
        // Optional: Update local state with the exact saved data
        setFullName(result.fullName || '');
        setTitle(result.title || '');
        setLocation(result.location || '');
        setSkills(Array.isArray(result.skills) ? result.skills.join(', ') : result.skills || '');
        setEducation(result.education || '');
        setBio(result.bio || '');
        setExperience(result.experience || '');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      
      // Handle guest account case specifically
      if (error.message.includes('Guest')) {
        setError("Please sign up for a full account to save profile changes");
      } else {
        setError(error.message || "Failed to save profile. Please try again.");
      }
    } finally {
      setSaving(false);
      
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
      <Header user={auth.currentUser} userRole="candidate" />
      
      <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Edit Your Profile</h1>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-600">
              <AlertDescription className="text-green-800 dark:text-green-300">
                Your profile has been saved successfully!
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="title">Professional Title</Label>
                  <Input 
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Front-end Developer"
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, State/Province, Country"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="skills">Skills (comma separated)</Label>
                  <Input 
                    id="skills"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g., JavaScript, React, Node.js"
                  />
                </div>
                
                <div>
                  <Label htmlFor="education">Education Level</Label>
                  <Select value={education} onValueChange={setEducation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your highest education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="highschool">High School</SelectItem>
                      <SelectItem value="associates">Associate's Degree</SelectItem>
                      <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                      <SelectItem value="masters">Master's Degree</SelectItem>
                      <SelectItem value="phd">PhD/Doctorate</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="experience">Professional Experience</Label>
                  <Textarea 
                    id="experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="Briefly describe your work history and relevant experience"
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell employers about yourself"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/candidate-dashboard')} // Updated path to match router
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CandidateProfile;