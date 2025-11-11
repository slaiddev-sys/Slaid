"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Immediately redirect to editor after successful payment
    router.push('/editor');
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002903]"></div>
      </div>
    </div>
  );
}
