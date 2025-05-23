
import { APP_NAME } from '@/lib/constants';
import { Gem } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <>
      {/* Removed the top announcement bar as per previous "Coinsetters" design alignment */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-40">
        {/* Changed justify-between to justify-center to center the title */}
        <div className="container mx-auto px-4 h-16 flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2">
            <Gem className="h-8 w-8 text-primary" /> {/* Slightly larger icon for prominence */}
            <span className="text-3xl font-extrabold text-foreground tracking-tight"> {/* Bolder and larger font */}
              {APP_NAME}
            </span>
          </Link>
          
          {/* Removed navigation and action buttons */}
        </div>
      </header>
    </>
  );
}
