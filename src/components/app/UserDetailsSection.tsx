
"use client";

import { useState } from 'react';
import { useUserDetails } from '@/contexts/UserDetailsContext';
import { Button } from '@/components/ui/button';
import { UserDetailsForm } from './UserDetailsForm'; // Assuming this will be created
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Edit, UserCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function UserDetailsSection() {
  const { userDetails, loading } = useUserDetails();
  const [isFormOpen, setIsFormOpen] = useState(false);

  if (loading) {
    return (
      <Card className="shadow-lg mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div>
                    <Skeleton className="h-6 w-32 mb-1" />
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>
            <Skeleton className="h-9 w-24" />
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-5 w-3/4" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-lg mb-8 border border-border/70">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <UserCircle className="h-8 w-8 text-primary flex-shrink-0" />
            <div>
              <CardTitle className="text-xl leading-tight">User Profile</CardTitle>
              <CardDescription className="text-xs">Manage your personal information.</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsFormOpen(true)} className="whitespace-nowrap">
            <Edit className="mr-1.5 h-3.5 w-3.5" /> {userDetails ? 'Edit Details' : 'Add Details'}
          </Button>
        </CardHeader>
        {userDetails && (
          <CardContent className="space-y-1.5 pt-2 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5">
                <p><strong>Name:</strong> {userDetails.name}</p>
                <p><strong>Age:</strong> {userDetails.age}</p>
                <p><strong>State:</strong> {userDetails.state}</p>
                <p><strong>Country:</strong> {userDetails.country}</p>
                <p><strong>Citizenship:</strong> {userDetails.citizen_of}</p>
                <p><strong>Tax Filing Status:</strong> {userDetails.tax_filing_status}</p>
                <p><strong>Tax Resident:</strong> {userDetails.is_tax_resident ? 'Yes' : 'No'}</p>
            </div>
          </CardContent>
        )}
        {!userDetails && !loading && (
          <CardContent className="pt-2">
            <p className="text-sm text-muted-foreground">
              No user details provided yet. Click "{userDetails ? 'Edit Details' : 'Add Details'}" to get started.
            </p>
          </CardContent>
        )}
      </Card>
      <UserDetailsForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        currentUserDetails={userDetails}
      />
    </>
  );
}
