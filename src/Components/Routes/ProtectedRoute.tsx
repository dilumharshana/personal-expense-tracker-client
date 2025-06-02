import React from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    // TOTO:implement auth to function protected route 
    return <>{children}</>;
};

export default ProtectedRoute;