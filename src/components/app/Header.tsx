
import { APP_NAME } from '@/lib/constants';
import { Gem, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Header() {
  return (
    <>
      <div className="bg-primary text-primary-foreground py-2 text-center text-sm">
        <p>
          Welcome to {APP_NAME}! Manage your finances with ease.{' '}
          <Link href="/#features" className="underline hover:opacity-80 transition-opacity">
            Learn more
          </Link>
        </p>
      </div>
      <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Gem className="h-7 w-7 text-primary" />
            <span className="text-2xl font-bold text-foreground">
              {APP_NAME}
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/#dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/#reports" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Reports
            </Link>
            <Link href="/#ai-chat" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              AI Chat
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Button size="sm">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
