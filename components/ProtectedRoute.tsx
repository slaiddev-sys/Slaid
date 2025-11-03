"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  // TEMPORARY BYPASS FOR DEVELOPMENT
  console.log('🔐 ProtectedRoute: BYPASSED FOR DEVELOPMENT');
  return <>{children}</>;
}
