import { Navigate, useLocation } from 'react-router-dom';
import { auth } from '../lib/firebase';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  if (!auth.currentUser && !sessionStorage.getItem('isGuest')) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

export default ProtectedRoute;