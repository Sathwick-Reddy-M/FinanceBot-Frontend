
"use client";

import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="py-20 md:py-32 text-center bg-gradient-to-t from-secondary/30 to-background">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
          Take Control of Your Finances, <span className="text-primary">Effortlessly</span>.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
          Finance Planner helps you understand your spending, track investments, and reach
          your financial goals with an AI-powered assistant.
        </p>
        {/* Buttons removed as per request */}
        {/* 
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button asChild size="lg" className="shadow-lg hover:shadow-primary/30 transition-shadow">
            <Link href="/#dashboard">
              View Dashboard <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="shadow-lg hover:shadow-md transition-shadow">
            <Link href="/#features">
              Learn More <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
        */}
        
        {/* Feature tiles removed as per request */}
        {/*
        <div id="features" className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-card p-6 rounded-xl shadow-lg border border-border/50">
            <TrendingUp className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Track Investments</h3>
            <p className="text-muted-foreground text-sm">
              Monitor your portfolio performance and asset allocation all in one place.
            </p>
          </div>
          <div className="bg-card p-6 rounded-xl shadow-lg border border-border/50">
            <MessageCircle className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">AI Financial Assistant</h3>
            <p className="text-muted-foreground text-sm">
              Get personalized insights and answers to your financial questions from our smart AI.
            </p>
          </div>
          <div className="bg-card p-6 rounded-xl shadow-lg border border-border/50">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-primary mb-4 lucide lucide-layout-grid"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
            <h3 className="text-xl font-semibold text-foreground mb-2">Unified Dashboard</h3>
            <p className="text-muted-foreground text-sm">
              See all your accounts—banking, credit cards, loans, and more—at a glance.
            </p>
          </div>
        </div>
        */}
      </div>
    </section>
  );
}

