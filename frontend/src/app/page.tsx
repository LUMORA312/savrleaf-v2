import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PublicHomepage from '@/components/PublicHomepage';
import { AuthProvider } from '@/context/AuthContext';

export default function Home() {
  return (
    <AuthProvider>
      <Header />
      <main>
        <PublicHomepage />
      </main>
      <Footer />
    </AuthProvider>
  );
}
