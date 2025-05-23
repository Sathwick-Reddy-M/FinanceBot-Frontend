

import { Header } from '@/components/app/Header';
import { AccountDashboard } from '@/components/app/AccountDashboard';
import { Chatbot } from '@/components/app/Chatbot';
import { HeroSection } from '@/components/app/HeroSection';
import { UserDetailsSection } from '@/components/app/UserDetailsSection';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <HeroSection />
      <main id="dashboard" className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <UserDetailsSection />
        {/* Removed grid layout, stacking AccountDashboard and Chatbot vertically */}
        <div className="mt-8"> {/* Spacing for UserDetailsSection */}
          <AccountDashboard />
        </div>
        <div id="ai-chat" className="mt-12 w-full"> {/* Added mt-12 for spacing and ensured full width */}
          <Chatbot />
        </div>
      </main>
    </div>
  );
}
