import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { X, UploadCloud, FileText } from 'lucide-react';

const ApplyModal = ({ 
  isOpen, 
  onClose, 
  profile, 
  onApply,
  currentResumeUrl
}) => {
  const [resumeFile, setResumeFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type === 'application/pdf' || 
          file.type === 'application/msword' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setResumeFile(file);
        setError(null);
      } else {
        setError('Please upload a PDF or Word document');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  const handleRemoveFile = () => {
    setResumeFile(null);
    setUploadProgress(0);
  };

  const handleSubmit = async () => {
    if (!resumeFile && !currentResumeUrl) {
      setError('Please upload a resume');
      return;
    }

    setIsUploading(true);
    setError(null);
    
    try {
      await onApply(resumeFile);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to upload resume');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Apply for this position</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Your Profile Details</h3>
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.photoURL} />
                <AvatarFallback>{profile?.fullName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold">{profile?.fullName || 'Not provided'}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{profile?.headline || 'No headline'}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{profile?.location || 'No location'}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Resume</h3>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>
            )}
            
            {resumeFile ? (
              <div className="space-y-2">
                <div className="border rounded-md p-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <span>{resumeFile.name}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleRemoveFile}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {isUploading && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ) : currentResumeUrl ? (
              <div className="border rounded-md p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span>Current Resume (click to view)</span>
                </div>
                <a 
                  href={currentResumeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View
                </a>
              </div>
            ) : (
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer ${
                  isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <input {...getInputProps()} />
                <UploadCloud className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isDragActive ? (
                    'Drop your resume here'
                  ) : (
                    <>
                      Drag and drop your resume here, or click to select files<br />
                      (PDF, DOC, DOCX)
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isUploading || (!resumeFile && !currentResumeUrl)}
            >
              {isUploading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyModal;