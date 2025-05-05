import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile as updateAuthProfile,
  GoogleAuthProvider,
  signInWithPopup,
  // fetchSignInMethodsForEmail,
  signInAnonymously
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  collection,
  addDoc,
  updateDoc,
  // deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  increment,
  runTransaction,
  writeBatch
} from "firebase/firestore";
import axios from 'axios';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsmnfX9sCFDmbXwj9F2J_3VDQ6BvHe8sQ",
  authDomain: "employnext-8bbd8.firebaseapp.com",
  projectId: "employnext-8bbd8",
  storageBucket: "employnext-8bbd8.appspot.com",
  messagingSenderId: "407213440123",
  appId: "1:407213440123:web:e876314164acedaefb36de"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Cloudinary configuration
export const cloudinaryConfig = {
  cloudName: "dmjnyha0e",
  apiKey: "228262763351283",
  uploadPreset: "resumes_preset"
};

// Cloudinary Resume Upload Function
export const uploadResume = async (userId, resumeFile) => {
  try {
    const validTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!validTypes.includes(resumeFile.type)) {
      throw new Error('Only PDF, DOC, and DOCX files are allowed');
    }

    const maxSize = 10 * 1024 * 1024;
    if (resumeFile.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    const formData = new FormData();
    formData.append('file', resumeFile);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('cloud_name', cloudinaryConfig.cloudName);
    formData.append('public_id', `resumes/${userId}_${Date.now()}`);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      }
    );

    if (response.data && response.data.secure_url) {
      await updateUserProfile(userId, { 
        resumeUrl: response.data.secure_url,
        resumeName: resumeFile.name 
      });
      return response.data.secure_url;
    }

    throw new Error('Failed to upload resume to Cloudinary');
  } catch (error) {
    console.error('Error uploading resume:', error);
    throw error;
  }
};

// Auth Helper Function
export const checkUserAuth = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }
  return user;
};

// Role Management Helper
export const setUserRole = async (uid, role) => {
  try {
    await setDoc(doc(db, "users", uid), {
      role,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error setting user role:", error);
    throw error;
  }
};

// Authentication Functions
export const registerWithEmailAndPassword = async (name, email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateAuthProfile(user, { displayName: name });
    return user;
  } catch (error) {
    console.error("Error in registration:", error);
    throw error;
  }
};

export const registerWithEmailAndPasswordWithRole = async (name, email, password, role) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateAuthProfile(user, { displayName: name });
    await setUserRole(user.uid, role);
    
    await createUserProfile(user.uid, {
      fullName: name,
      companyName: '',
      position: '',
      location: '',
      industry: '',
      companyWebsite: '',
      companyDescription: '',
      resumeUrl: ''
    });
    
    return user;
  } catch (error) {
    console.error("Error in registration with role:", error);
    throw error;
  }
};

export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (!userCredential || !userCredential.user) {
      throw new Error("Authentication failed - no user received");
    }
    return userCredential; // Return the full credential object
  } catch (error) {
    console.error("Error in login:", error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    try {
      await getUserProfile(user.uid);
    } catch {
      await createUserProfile(user.uid, {
        fullName: user.displayName || '',
        companyName: '',
        position: '',
        location: '',
        industry: '',
        companyWebsite: '',
        companyDescription: '',
        resumeUrl: ''
      });
    }
    
    return user;
  } catch (error) {
    console.error("Error in Google sign-in:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    sessionStorage.removeItem('isGuest');
    return true;
  } catch (error) {
    console.error("Error in logout:", error);
    throw error;
  }
};

// Guest User Functions
export const loginAsGuestCandidate = async () => {
  try {
    const { user } = await signInAnonymously(auth);
    sessionStorage.setItem('isGuest', 'candidate');
    
    // Create minimal guest profile
    await setDoc(doc(db, "userProfiles", user.uid), {
      isGuest: true,
      fullName: "Guest Candidate",
      title: "Software Developer",
      location: "San Francisco, CA",
      skills: "JavaScript, React, Node.js",
      education: "bachelors",
      bio: "Guest account for demo purposes",
      experience: "3 years of experience in web development",
      createdAt: serverTimestamp()
    });
    
    await setDoc(doc(db, "users", user.uid), {
      role: "candidate",
      isGuest: true,
      createdAt: serverTimestamp()
    });
    
    return user;
  } catch (error) {
    console.error("Guest candidate login failed:", error);
    throw new Error("Unable to access guest account. Please try again later.");
  }
};

export const loginAsGuestRecruiter = async () => {
  try {
    if (auth.currentUser) {
      await signOut(auth);
    }
    
    const { user } = await signInAnonymously(auth);
    
    sessionStorage.setItem('isGuest', 'recruiter');
    
    await setDoc(doc(db, "userProfiles", user.uid), {
      isGuest: true,
      fullName: "Guest Recruiter",
      companyName: "Demo Company",
      position: "HR Manager",
      location: "Remote",
      industry: "Technology",
      companyWebsite: "",
      companyDescription: "Guest account for demo purposes",
      createdAt: serverTimestamp()
    });
    
    // Set user role
    await setDoc(doc(db, "users", user.uid), {
      role: "recruiter",
      isGuest: true,
      createdAt: serverTimestamp()
    });
    
    // Create demo jobs
    await createDemoJobsForGuest(user.uid);
    
    return user;
  } catch (error) {
    console.error("Guest recruiter login failed:", error);
    sessionStorage.removeItem('isGuest');
    throw new Error("Unable to access guest account. Please try again later.");
  }
};

async function createDemoJobsForGuest(recruiterId) {
  try {
    const demoJobs = [
      {
        title: "Senior Frontend Developer",
        companyName: "Demo Company",
        location: "Remote",
        type: "Full-time",
        minSalary: 90000,
        maxSalary: 120000,
        description: "We are looking for an experienced frontend developer to join our team.",
        requirements: "5+ years of experience with React and TypeScript",
        recruiterId: recruiterId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        applicationCount: 0,
        status: "active"
      },
      {
        title: "UX Designer",
        companyName: "Demo Company",
        location: "Hybrid",
        type: "Contract",
        minSalary: 70000,
        maxSalary: 90000,
        description: "Join our design team to create beautiful user experiences.",
        requirements: "Portfolio required, 3+ years of UX design experience",
        recruiterId: recruiterId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        applicationCount: 0,
        status: "active"
      }
    ];

    const batch = writeBatch(db);
    demoJobs.forEach(job => {
      const jobRef = doc(collection(db, "jobs"));
      batch.set(jobRef, job);
    });
    await batch.commit();
  } catch (error) {
    console.error("Error creating demo jobs:", error);
  }
}

// User Profile Functions
export const createUserProfile = async (uid, data) => {
  try {
    await setDoc(doc(db, "userProfiles", uid), {
      ...data,
      isGuest: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { uid, ...data };
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const getUserProfile = async (uid) => {
  try {
    const docRef = doc(db, "userProfiles", uid);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error("Profile not found");
    }
    
    return {
      isGuest: docSnap.data().isGuest || false,
      ...docSnap.data()
    };
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (uid, data) => {
  try {
    const user = checkUserAuth();
    if (user.uid !== uid) {
      throw new Error("You can only update your own profile");
    }

    const profile = await getUserProfile(uid);
    if (profile.isGuest) {
      throw new Error("Guest profiles cannot be updated");
    }

    const userRef = doc(db, "userProfiles", uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    return { uid, ...data };
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Job Functions
export const createJob = async (jobData) => {
  try {
    const user = checkUserAuth();
    const profile = await getUserProfile(user.uid);
    
    if (profile.isGuest) {
      throw new Error("Guest accounts cannot create jobs");
    }

    const userRole = await getUserRole(user.uid);
    if (userRole !== "recruiter") {
      throw new Error("Only recruiters can create jobs");
    }
    
    const jobRef = await addDoc(collection(db, "jobs"), {
      ...jobData,
      recruiterId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      applicationCount: 0,
      status: "active"
    });
    return { id: jobRef.id, ...jobData };
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
};

export const getJobs = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Authentication required");
    
    const jobSnapshot = await getDocs(collection(db, "jobs"));
    return jobSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting jobs:", error);
    if (error.code === 'permission-denied') {
      throw new Error("You don't have permission to view jobs. Please check your account status.");
    }
    throw error;
  }
};

export const getJobById = async (jobId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Authentication required");
    
    const docRef = doc(db, "jobs", jobId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error("Error getting job by ID:", error);
    if (error.code === 'permission-denied') {
      throw new Error("You don't have permission to view this job. Please check your account status.");
    }
    throw error;
  }
};

export const deleteJob = async (jobId) => {
  try {
    const user = checkUserAuth();
    
    const jobRef = doc(db, "jobs", jobId);
    const jobSnap = await getDoc(jobRef);
    
    if (!jobSnap.exists()) {
      throw new Error("Job not found");
    }
    
    if (jobSnap.data().recruiterId !== user.uid) {
      throw new Error("You can only delete your own job postings");
    }
    
    // Get all applications for this job first
    const applicationsQuery = query(
      collection(db, "applications"),
      where("jobId", "==", jobId)
    );
    const applicationsSnapshot = await getDocs(applicationsQuery);
    
    const batch = writeBatch(db);
    
    // Delete all applications
    applicationsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete the job
    batch.delete(jobRef);
    
    // Commit the batch
    await batch.commit();
    
    return true;
  } catch (error) {
    console.error('Error deleting job:', error);
    
    // Provide more user-friendly error messages
    if (error.code === 'permission-denied') {
      throw new Error("You don't have permission to delete this job. Please make sure you're the job poster.");
    }
    throw error;
  }
};

export const getJobsByRecruiter = async (recruiterId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Authentication required");
    
    const q = query(collection(db, "jobs"), where("recruiterId", "==", recruiterId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting recruiter jobs:", error);
    if (error.code === 'permission-denied') {
      throw new Error("You don't have permission to view these jobs. Please check your account status.");
    }
    throw error;
  }
};

// Saved Jobs Functions
export const saveJob = async (userId, jobId) => {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== userId) {
      throw new Error("Authentication failed or user mismatch");
    }

    const savedJobRef = doc(db, "savedJobs", userId);
    const savedJobDoc = await getDoc(savedJobRef);
    
    let savedJobs = [];
    if (savedJobDoc.exists()) {
      savedJobs = savedJobDoc.data().jobs || [];
      if (savedJobs.includes(jobId)) {
        return; // already saved
      }
    }
    
    savedJobs.push(jobId);
    await setDoc(savedJobRef, { jobs: savedJobs }, { merge: true });
    
    return true;
  } catch (error) {
    console.error("Error saving job:", error);
    throw error;
  }
};

export const unsaveJob = async (userId, jobId) => {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== userId) {
      throw new Error("Authentication failed or user mismatch");
    }

    const savedJobRef = doc(db, "savedJobs", userId);
    const savedJobDoc = await getDoc(savedJobRef);
    
    if (savedJobDoc.exists()) {
      let savedJobs = savedJobDoc.data().jobs || [];
      savedJobs = savedJobs.filter(id => id !== jobId);
      await setDoc(savedJobRef, { jobs: savedJobs }, { merge: true });
    }
    
    return true;
  } catch (error) {
    console.error("Error unsaving job:", error);
    throw error;
  }
};

export const isJobSaved = async (userId, jobId) => {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== userId) {
      throw new Error("Authentication failed or user mismatch");
    }

    const savedJobRef = doc(db, "savedJobs", userId);
    const savedJobDoc = await getDoc(savedJobRef);
    
    if (savedJobDoc.exists()) {
      const savedJobs = savedJobDoc.data().jobs || [];
      return savedJobs.includes(jobId);
    }
    
    return false;
  } catch (error) {
    console.error("Error checking saved job status:", error);
    throw error;
  }
};

export const getSavedJobs = async (userId) => {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== userId) {
      throw new Error("Authentication failed or user mismatch");
    }

    const savedJobRef = doc(db, "savedJobs", userId);
    const savedJobDoc = await getDoc(savedJobRef);
    
    if (!savedJobDoc.exists()) {
      return [];
    }

    const savedJobIds = savedJobDoc.data().jobs || [];
    if (savedJobIds.length === 0) {
      return [];
    }

    const jobsPromises = savedJobIds.map(async (jobId) => {
      const jobDoc = await getDoc(doc(db, "jobs", jobId));
      if (!jobDoc.exists()) {
        return null;
      }

      let applicationId = null;
      const applicationsQuery = query(
        collection(db, "applications"),
        where("userId", "==", userId),
        where("jobId", "==", jobId)
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);
      if (!applicationsSnapshot.empty) {
        applicationId = applicationsSnapshot.docs[0].id;
      }

      return {
        id: jobId,
        job: { id: jobDoc.id, ...jobDoc.data() },
        applicationId
      };
    });

    const jobs = await Promise.all(jobsPromises);
    return jobs.filter(job => job !== null);
  } catch (error) {
    console.error("Error getting saved jobs:", error);
    throw error;
  }
};

// Application Functions
export const getUserApplications = async (userId) => {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== userId) {
      throw new Error("Authentication failed or user mismatch");
    }
    
    const q = query(collection(db, "applications"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting user applications:", error);
    if (error.code === 'permission-denied') {
      throw new Error("You don't have permission to view applications. Please check your account status.");
    }
    throw error;
  }
};

export const applyToJob = async (userId, jobId, applicationData = {}) => {
  try {
    // 1. Verify authentication
    const user = checkUserAuth();
    if (user.uid !== userId) {
      throw new Error("Authentication mismatch - you can only apply as yourself");
    }

    // 2. Check if user is guest
    const profile = await getUserProfile(userId);
    if (profile?.isGuest) {
      throw new Error("Guest accounts cannot apply to jobs. Please sign up for a full account.");
    }

    // 3. Verify user role
    const userRole = await getUserRole(userId);
    if (userRole !== "candidate") {
      throw new Error("Only candidates can apply to jobs");
    }

    // 4. Get the job document
    const jobRef = doc(db, "jobs", jobId);
    const jobSnap = await getDoc(jobRef);
    
    if (!jobSnap.exists()) {
      throw new Error("Job not found or has been removed");
    }

    const jobData = jobSnap.data();
    
    // 5. Check if job is active
    if (jobData.status !== "active") {
      throw new Error("This job is no longer accepting applications");
    }

    // 6. Check if user already applied
    const applicationsQuery = query(
      collection(db, "applications"),
      where("userId", "==", userId),
      where("jobId", "==", jobId)
    );
    const querySnapshot = await getDocs(applicationsQuery);
    
    if (!querySnapshot.empty) {
      throw new Error("You have already applied to this job");
    }

    // 7. Validate required application data
    if (!applicationData.resumeUrl && !profile?.resumeUrl) {
      throw new Error("A resume is required to apply for this job");
    }

    // 8. Prepare application data
    const applicationPayload = {
      userId,
      jobId,
      recruiterId: jobData.recruiterId,
      status: "pending",
      appliedAt: serverTimestamp(),
      candidateName: applicationData.candidateName || profile?.fullName || user.displayName || "Applicant",
      resumeUrl: applicationData.resumeUrl || profile?.resumeUrl || "",
      coverLetter: applicationData.coverLetter || "",
      ...applicationData
    };

    // 9. Create the application in a transaction
    let applicationId;
   // In your applyToJob function
await runTransaction(db, async (transaction) => {
  // Verify job still exists
  const jobRef = doc(db, "jobs", jobId);
  const jobSnap = await transaction.get(jobRef);
  
  if (!jobSnap.exists()) {
    throw new Error("Job no longer exists");
  }

  // Validate recruiter ID exists
  const recruiterRef = doc(db, "users", jobSnap.data().recruiterId);
  const recruiterSnap = await transaction.get(recruiterRef);
  if (!recruiterSnap.exists()) {
    throw new Error("Recruiter account not found");
  }

  // Create application
  const applicationRef = doc(collection(db, "applications"));
  transaction.set(applicationRef, {
    ...applicationPayload,
    jobId,
    recruiterId: jobSnap.data().recruiterId
  });

  // Update application count
  transaction.update(jobRef, {
    applicationCount: increment(1),
    updatedAt: serverTimestamp()
  });
});

    // 10. Return success
    return {
      id: applicationId,
      ...applicationPayload,
      jobTitle: jobData.title,
      companyName: jobData.companyName
    };

  } catch (error) {
    console.error("Error applying to job:", {
      error: error.message,
      userId,
      jobId,
      applicationData
    });

    // Enhanced error messages
    let userMessage = error.message;
    if (error.code === 'permission-denied') {
      userMessage = "You don't have permission to apply for this job. Please ensure you're signed in as a candidate.";
    } else if (error.message.includes('already applied')) {
      userMessage = "You've already applied to this position.";
    } else if (error.message.includes('resume is required')) {
      userMessage = "Please upload a resume before applying.";
    }

    throw new Error(userMessage);
  }
};


export const cancelApplication = async (applicationId) => {
  try {
    const user = checkUserAuth();
    
    const applicationRef = doc(db, "applications", applicationId);
    const applicationSnap = await getDoc(applicationRef);
    
    if (!applicationSnap.exists()) {
      throw new Error("Application not found");
    }
    
    const applicationData = applicationSnap.data();
    
    if (applicationData.userId !== user.uid) {
      throw new Error("You can only cancel your own applications");
    }
    
    const jobId = applicationData.jobId;
    const jobRef = doc(db, "jobs", jobId);
    
    await runTransaction(db, async (transaction) => {
      const jobDoc = await transaction.get(jobRef);
      if (!jobDoc.exists()) {
        throw new Error("Job not found");
      }
      
      const currentCount = jobDoc.data().applicationCount || 0;
      const newCount = Math.max(0, currentCount - 1);
      
      transaction.update(jobRef, { applicationCount: newCount });
      transaction.delete(applicationRef);
    });
    
    return true;
  } catch (error) {
    console.error('Error cancelling application:', error);
    throw error;
  }
};

// Role Management
export const getUserRole = async (uid) => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().role || null;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching user role for UID ${uid}:`, error);
    return null;
  }
};

export { auth, db, googleProvider };