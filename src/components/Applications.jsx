// components/Applications.jsx
import { useState, useEffect } from 'react';
import { auth, getApplicationsForRecruiter, updateApplicationStatus } from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Download, Check, X } from 'lucide-react';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const apps = await getApplicationsForRecruiter(user.uid);
        setApplications(apps);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleUpdateStatus = async (applicationId, status) => {
    try {
      await updateApplicationStatus(applicationId, status);
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status } : app
      ));
    } catch (err) {
      console.error("Error updating application status:", err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-600 p-4 rounded-md">
        <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">Error</h2>
        <p className="text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Applications</h2>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No applications found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map(application => (
            <Card key={application.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {application.job?.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={application.candidate?.photoURL} />
                      <AvatarFallback>{application.candidate?.fullName?.charAt(0) || 'C'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{application.candidate?.fullName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {application.candidate?.headline}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Applied on: {new Date(application.appliedAt?.seconds * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant={application.status === 'pending' ? 'secondary' : 
                                       application.status === 'accepted' ? 'default' : 'destructive'}>
                        {application.status}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <a 
                        href={application.resumeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                      >
                        <Download className="h-4 w-4" />
                        Download Resume
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:items-end">
                    {application.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => handleUpdateStatus(application.id, 'accepted')}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => handleUpdateStatus(application.id, 'rejected')}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;