import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth, getUserProfile, getUserApplications, getUserRole } from '../lib/firebase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, GraduationCap } from 'lucide-react';

const ApplicationItem = ({ application }) => {
  const job = application.job || {};
  const appliedDate = application.appliedAt?.seconds ? 
    new Date(application.appliedAt.seconds * 1000).toLocaleDateString() : 
    'Unknown date';
  
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <h3 className="text-lg font-semibold">{job.title || 'Job Unavailable'}</h3>
            <p className="text-sm text-gray-500">{job.company || 'Unknown'}</p>
            <p className="text-sm text-gray-500">{job.location || 'Remote'}</p>
          </div>
          <div className="mt-2 md:mt-0">
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
              application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              application.status === 'rejected' ? 'bg-red-100 text-red-800' :
              application.status === 'interview' ? 'bg-green-100 text-green-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {application.status?.charAt(0).toUpperCase() + application.status?.slice(1) || 'Status Unknown'}
            </span>
            <p className="text-xs text-gray-500 mt-1">Applied: {appliedDate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const educationLabels = {
  'highschool': 'High School',
  'associates': 'Associate\'s Degree',
  'bachelors': 'Bachelor\'s Degree',
  'masters': 'Master\'s Degree',
  'phd': 'PhD/Doctorate',
  'other': 'Other'
};

const CandidateDashboard = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('candidate');
  const navigate = useNavigate();
  const location = useLocation();
  const isGuest = location.state?.isGuest || sessionStorage.getItem('isGuest') === 'candidate';

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (isGuest) {
          // Load demo data for guest candidates
          setUserProfile({
            fullName: "Guest Candidate",
            title: "Software Developer",
            location: "San Francisco, CA",
            skills: ["JavaScript", "React", "Node.js"], // Changed to array
            education: "bachelors",
            bio: "Guest account for demo purposes",
            experience: "3 years of experience in web development",
            resumeUrl: "",
            resumeName: ""
          });
          
          setApplications([
            {
              id: 'demo1',
              status: 'pending',
              appliedAt: { seconds: Date.now() / 1000 - 86400 },
              job: {
                title: 'Frontend Developer',
                company: 'Tech Corp',
                location: 'Remote',
                type: 'Full-time',
                minSalary: 80000,
                maxSalary: 100000
              }
            },
            {
              id: 'demo2',
              status: 'interview',
              appliedAt: { seconds: Date.now() / 1000 - 172800 },
              job: {
                title: 'UI/UX Designer',
                company: 'Design Studio',
                location: 'New York, NY',
                type: 'Contract',
                minSalary: 70000,
                maxSalary: 90000
              }
            }
          ]);
          setLoading(false);
          return;
        }
        
        const user = auth.currentUser;
        if (!user) {
          navigate('/login');
          return;
        }

        const [profileData, applicationsData, role] = await Promise.all([
          getUserProfile(user.uid).catch(() => null),
          getUserApplications(user.uid).catch(() => []),
          getUserRole(user.uid).catch(() => 'candidate')
        ]);
        
        setUserProfile(profileData || {});
        setApplications(applicationsData || []);
        setUserRole(role);
        setLoading(false);
        
      } catch (error) {
        console.error('Error loading user data:', error);
        setError(error.message.includes('permission') 
          ? "You don't have permission to access this data. Please contact support."
          : "Failed to load data. Please try again later.");
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate, isGuest]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header user={auth.currentUser} userRole={userRole} />
        <div className="flex-grow flex justify-center items-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-600 p-6 rounded-md max-w-md mx-4">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">Error</h2>
            <p className="text-red-700 dark:text-red-300 mt-2">{error}</p>
            <div className="mt-4 flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={auth.currentUser} userRole={userRole} />
      
      {isGuest && (
        <Alert className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400">
          <AlertDescription className="text-yellow-800 dark:text-yellow-300">
            You are using a guest account. Some features are limited. {' '}
            <Link to="/signup" className="font-semibold hover:underline">
              Sign up
            </Link> for full access.
          </AlertDescription>
        </Alert>
      )}
      
      <main className="flex-grow py-6 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Section */}
            <div className="md:w-1/3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>My Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-300">
                      {userProfile?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{userProfile?.fullName || 'User'}</h2>
                      <p className="text-gray-600 dark:text-gray-400">{userProfile?.title || 'Professional Title'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500">Location</h3>
                      <p>{userProfile?.location || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500">Skills</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {userProfile?.skills ? (
                          Array.isArray(userProfile.skills) ? (
                            userProfile.skills.map((skill, index) => (
                              <span key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded">
                                {skill.trim()}
                              </span>
                            ))
                          ) : typeof userProfile.skills === 'string' ? (
                            userProfile.skills.split(',').map((skill, index) => (
                              <span key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded">
                                {skill.trim()}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500">No skills listed</span>
                          )
                        ) : (
                          <span className="text-gray-500">No skills listed</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500">Education</h3>
                      <div className="flex items-center mt-1">
                        <GraduationCap className="w-4 h-4 mr-2 text-blue-600" />
                        <span>{educationLabels[userProfile?.education] || 'Not specified'}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500">Bio</h3>
                      <p className="text-sm">{userProfile?.bio || 'No bio provided'}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-500">Experience</h3>
                      <p className="text-sm">{userProfile?.experience || 'No experience listed'}</p>
                    </div>

                    {userProfile?.resumeUrl && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500">Resume</h3>
                        <div className="flex items-center mt-1">
                          <FileText className="w-4 h-4 mr-2 text-blue-600" />
                          <a 
                            href={userProfile.resumeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            {userProfile.resumeName || 'View Resume'}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <Link to="/candidate-profile" className="text-blue-600 text-sm hover:underline">
                      Edit Profile
                    </Link>
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <Link to="/jobs" className="bg-blue-600 text-white p-4 rounded text-center hover:bg-blue-700 transition-colors">
                  Browse Jobs
                </Link>
                <Link to="/savedjobs" className="bg-green-600 text-white p-4 rounded text-center hover:bg-green-700 transition-colors">
                  Saved Jobs
                </Link>
              </div>
            </div>
            
            {/* Dashboard Content */}
            <div className="md:w-2/3">
              <Card>
                <CardHeader>
                  <CardTitle>Job Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all">
                    <TabsList className="mb-4">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="pending">Pending</TabsTrigger>
                      <TabsTrigger value="interview">Interviews</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all">
                      {applications.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">You haven't applied to any jobs yet.</p>
                          <Link to="/jobs" className="text-blue-600 hover:underline mt-2 inline-block">
                            Browse Jobs
                          </Link>
                        </div>
                      ) : (
                        <div>
                          {applications.map((application) => (
                            <ApplicationItem key={application.id} application={application} />
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="pending">
                      {applications.filter(app => app.status === 'pending').length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No pending applications.</p>
                        </div>
                      ) : (
                        <div>
                          {applications
                            .filter(app => app.status === 'pending')
                            .map((application) => (
                              <ApplicationItem key={application.id} application={application} />
                            ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="interview">
                      {applications.filter(app => app.status === 'interview').length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No interview invitations yet.</p>
                        </div>
                      ) : (
                        <div>
                          {applications
                            .filter(app => app.status === 'interview')
                            .map((application) => (
                              <ApplicationItem key={application.id} application={application} />
                            ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CandidateDashboard;