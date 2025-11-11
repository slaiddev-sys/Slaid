import { redirect } from 'next/navigation';

export default function SuccessPage() {
  // Server-side redirect (more reliable than client-side)
  redirect('/editor');
}
