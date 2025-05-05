import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, createJob, getUserProfile } from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';
import { useEffect } from 'react';

const PostJobModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null); // Fixed state declaration
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    type: 'Full-time',
    minSalary: '',
    maxSalary: '',
    description: '',
    companyUrl: '',
    companyName: '',
    requirements: [''],
    benefits: [''],
  });
console.log(userProfile)
  // Fetch user profile to get company name
  useEffect(() => {
    let isMounted = true;
    
    const fetchUserProfile = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const profile = await getUserProfile(user.uid);
          if (isMounted) {
            setUserProfile(profile);
            
            // Pre-fill company name if available
            if (profile?.companyName) {
              setFormData(prev => ({
                ...prev,
                companyName: profile.companyName
              }));
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    
    fetchUserProfile();
    
    return () => {
      isMounted = false;
    };
  }, [auth.currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRequirementChange = (index, value) => {
    const updatedRequirements = [...formData.requirements];
    updatedRequirements[index] = value;
    setFormData((prev) => ({
      ...prev,
      requirements: updatedRequirements,
    }));
  };

  const handleBenefitChange = (index, value) => {
    const updatedBenefits = [...formData.benefits];
    updatedBenefits[index] = value;
    setFormData((prev) => ({
      ...prev,
      benefits: updatedBenefits,
    }));
  };

  const addRequirement = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: [...prev.requirements, ''],
    }));
  };

  const removeRequirement = (index) => {
    if (formData.requirements.length > 1) {
      const updatedRequirements = [...formData.requirements];
      updatedRequirements.splice(index, 1);
      setFormData((prev) => ({
        ...prev,
        requirements: updatedRequirements,
      }));
    }
  };

  const addBenefit = () => {
    setFormData((prev) => ({
      ...prev,
      benefits: [...prev.benefits, ''],
    }));
  };

  const removeBenefit = (index) => {
    if (formData.benefits.length > 1) {
      const updatedBenefits = [...formData.benefits];
      updatedBenefits.splice(index, 1);
      setFormData((prev) => ({
        ...prev,
        benefits: updatedBenefits,
      }));
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const requiredFields = ['title', 'location', 'type', 'minSalary', 'maxSalary', 'description', 'companyUrl', 'companyName'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`);
        return;
      }
    }

    // Validate URL format
    if (!isValidUrl(formData.companyUrl)) {
      alert('Please enter a valid URL (including http:// or https://)');
      return;
    }

    // Filter out empty requirements and benefits
    const filteredRequirements = formData.requirements.filter(req => req.trim() !== '');
    const filteredBenefits = formData.benefits.filter(ben => ben.trim() !== '');
    
    if (filteredRequirements.length === 0) {
      alert('Please add at least one job requirement');
      return;
    }

    setLoading(true);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const jobData = {
        ...formData,
        requirements: filteredRequirements,
        benefits: filteredBenefits,
        recruiterId: user.uid,
        companyName: formData.companyName,
        postedAt: new Date(),
        applications: [],
        status: 'active'
      };

      await createJob(jobData);
      onClose();
      navigate('/recruiter-dashboard');
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a New Job</DialogTitle>
          <DialogDescription>
            Fill in the details below to post a new job listing
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Software Engineer"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="e.g. Tech Solutions Inc."
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g. New York, NY or Remote"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="companyUrl">Company Application URL *</Label>
              <Input
                id="companyUrl"
                name="companyUrl"
                value={formData.companyUrl}
                onChange={handleInputChange}
                placeholder="e.g. https://company.com/careers/job-123"
                required
              />
              <p className="text-xs text-gray-500">
                Enter the URL where candidates can apply for this position (must include http:// or https://)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Job Type *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="minSalary">Min Salary *</Label>
                  <Input
                    id="minSalary"
                    name="minSalary"
                    value={formData.minSalary}
                    onChange={handleInputChange}
                    type="number"
                    placeholder="ex.2lpa"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maxSalary">Max Salary *</Label>
                  <Input
                    id="maxSalary"
                    name="maxSalary"
                    value={formData.maxSalary}
                    onChange={handleInputChange}
                    type="number"
                    placeholder="ex.7lpa"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the job responsibilities, expectations, and any other important details..."
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Tech Stack*</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={addRequirement}
                  className="h-8 px-2"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              {formData.requirements.map((req, index) => (
                <div key={`req-${index}`} className="flex gap-2">
                  <Input
                    value={req}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    placeholder={`Requirement ${index + 1}`}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeRequirement(index)}
                    disabled={formData.requirements.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Perks</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={addBenefit}
                  className="h-8 px-2"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              {formData.benefits.map((benefit, index) => (
                <div key={`ben-${index}`} className="flex gap-2">
                  <Input
                    value={benefit}
                    onChange={(e) => handleBenefitChange(index, e.target.value)}
                    placeholder={`Benefit ${index + 1}`}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeBenefit(index)}
                    disabled={formData.benefits.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Posting...' : 'Post Job'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PostJobModal;