
import { Header } from '@/components/app/Header';
import { AccountDashboard } from '@/components/app/AccountDashboard';
import { Chatbot } from '@/components/app/Chatbot';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AccountDashboard />
          </div>
          <div className="lg:col-span-1 lg:sticky lg:top-24 self-start h-auto"> {/* Sticky chatbot column */}
            <Chatbot />
          </div>
        </div>
      </main>
      <footer className="text-center py-4 border-t text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} FinView. All rights reserved.</p>
      </footer>
    </div>
  );
}
