
import { APP_NAME } from '@/lib/constants';
import { Activity } from 'lucide-react'; // Using Activity as a generic financial logo

export function Header() {
  return (
    <header className="bg-background border-b border-border sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center">
        <Activity className="h-8 w-8 text-primary mr-3" />
        <h1 className="text-2xl font-semibold text-foreground">
          {APP_NAME}
        </h1>
      </div>
    </header>
  );
}
