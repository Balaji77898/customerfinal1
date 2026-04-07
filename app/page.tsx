import { redirect } from 'next/navigation';

export default function Home() {
  // Safe redirect to the landing page to preserve existing QR URL structure.
  redirect('/customer/scan-qr');
}
