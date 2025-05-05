import { Navigate } from 'react-router-dom';

const RoleBasedRoute = ({ allowedRoles, userRole, children }) => {
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default RoleBasedRoute;