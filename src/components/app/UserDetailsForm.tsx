
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { UserDetails } from '@/lib/types';
import { useUserDetails } from '@/contexts/UserDetailsContext';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useMemo } from 'react';

export const userDetailsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.coerce.number().int().min(0, 'Age must be a non-negative integer'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  citizen_of: z.string().min(1, 'Citizenship is required'),
  tax_filing_status: z.string().min(1, 'Tax filing status is required'),
  is_tax_resident: z.boolean(),
});

export type UserDetailsFormData = z.infer<typeof userDetailsSchema>;

interface UserDetailsFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentUserDetails?: UserDetails | null;
}

const getDefaultValues = (details?: UserDetails | null): UserDetailsFormData => {
  return {
    name: details?.name || '',
    age: details?.age || 0,
    state: details?.state || '',
    country: details?.country || '',
    citizen_of: details?.citizen_of || '',
    tax_filing_status: details?.tax_filing_status || '',
    is_tax_resident: details?.is_tax_resident || false,
  };
};

export function UserDetailsForm({ isOpen, onOpenChange, currentUserDetails }: UserDetailsFormProps) {
  const { updateUserDetails } = useUserDetails();
  const { toast } = useToast();
  const [inputType, setInputType] = useState<'form' | 'json'>('form');
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const memoizedDefaultValues = useMemo(() => {
    return getDefaultValues(currentUserDetails);
  }, [currentUserDetails]);

  const form = useForm<UserDetailsFormData>({
    resolver: zodResolver(userDetailsSchema),
    defaultValues: memoizedDefaultValues,
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(memoizedDefaultValues);
      if (inputType === 'json') {
        if (currentUserDetails) {
          setJsonInput(JSON.stringify(currentUserDetails, null, 2));
        } else {
          setJsonInput(''); // Clear for new JSON entry
        }
      }
    }
  }, [isOpen, memoizedDefaultValues, inputType, form]);


  const onSubmit = (data: UserDetailsFormData) => {
    try {
      updateUserDetails(data);
      toast({ title: "Success", description: "User details updated successfully." });
      onOpenChange(false); // Close dialog on successful submission
    } catch (error) {
      console.error("Submission error", error);
      toast({ title: "Error", description: `Failed to save user details. ${error instanceof Error ? error.message : ''}`, variant: "destructive" });
    }
  };

  const handleJsonSubmit = () => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      const validationResult = userDetailsSchema.safeParse(parsedJson);
      if (validationResult.success) {
        setJsonError(null);
        onSubmit(validationResult.data);
      } else {
        const errorMsg = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        setJsonError(errorMsg);
        toast({ title: "JSON Validation Error", description: errorMsg, variant: "destructive" });
      }
    } catch (e) {
      setJsonError('Invalid JSON format.');
      toast({ title: "JSON Parse Error", description: "Invalid JSON format.", variant: "destructive" });
    }
  };
  
  const handleDialogClose = (openState: boolean) => {
    onOpenChange(openState); // Update parent state
    if (!openState) { // If dialog is closing
        setJsonInput('');
        setJsonError(null);
        // Optionally reset inputType, though it might be better to persist user choice or default on open
        // setInputType('form'); 
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{currentUserDetails ? 'Edit User Details' : 'Add User Details'}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center my-4">
          <Button variant={inputType === 'form' ? 'default' : 'outline'} onClick={() => setInputType('form')} className="mr-2">Form Input</Button>
          <Button variant={inputType === 'json' ? 'default' : 'outline'} onClick={() => setInputType('json')}>JSON Input</Button>
        </div>

        {inputType === 'form' ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Jhon Doe" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="age" render={({ field }) => (
                <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" placeholder="25" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="state" render={({ field }) => (
                <FormItem><FormLabel>State</FormLabel><FormControl><Input placeholder="California" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="country" render={({ field }) => (
                <FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="USA" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="citizen_of" render={({ field }) => (
                <FormItem><FormLabel>Country of Citizenship</FormLabel><FormControl><Input placeholder="USA" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="tax_filing_status" render={({ field }) => (
                <FormItem><FormLabel>Tax Filing Status</FormLabel><FormControl><Input placeholder="Single" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="is_tax_resident" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Is Tax Resident?</FormLabel>
                    <FormMessage />
                  </div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
              <DialogFooter className="pt-6">
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit">{currentUserDetails ? 'Save Changes' : 'Save Details'}</Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <Label htmlFor="json-input-user-details">Paste JSON data for user details</Label>
            <Textarea
              id="json-input-user-details"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={12}
              placeholder='{\n  "name": "Jhon Doe",\n  "age": 25,\n  "state": "California",\n  "country": "USA",\n  "citizen_of": "USA",\n  "tax_filing_status": "Single",\n  "is_tax_resident": true\n}'
            />
            {jsonError && <p className="text-sm text-destructive">{jsonError}</p>}
            <DialogFooter className="pt-6">
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button onClick={handleJsonSubmit}>{currentUserDetails ? 'Save Changes via JSON' : 'Save Details via JSON'}</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

