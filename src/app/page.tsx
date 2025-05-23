

import { Header } from '@/components/app/Header';
import { AccountDashboard } from '@/components/app/AccountDashboard';
import { Chatbot } from '@/components/app/Chatbot';
import { HeroSection } from '@/components/app/HeroSection';
import { UserDetailsSection } from '@/components/app/UserDetailsSection'; // New import

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <HeroSection />
      <main id="dashboard" className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <UserDetailsSection /> {/* Added UserDetailsSection */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8"> {/* Added mt-8 for spacing */}
          <div className="lg:col-span-2">
            <AccountDashboard />
          </div>
          <div id="ai-chat" className="lg:col-span-1 lg:sticky lg:top-24 self-start h-auto">
            <Chatbot />
          </div>
        </div>
      </main>
    </div>
  );
}
