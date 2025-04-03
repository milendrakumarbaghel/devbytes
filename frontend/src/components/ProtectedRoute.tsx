import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/signup" replace />;
  }

  return children;
};

export default ProtectedRoute;
