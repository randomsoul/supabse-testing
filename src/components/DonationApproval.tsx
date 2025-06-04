
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { BookDonation } from "@/types/books";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface DatabaseDonation {
  id: string;
  title: string;
  category: string;
  subject: string | null;
  grade: number | null;
  board: string | null;
  condition: string;
  donor_name: string;
  donor_email: string;
  donor_phone: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'pending' | 'approved' | 'declined';
  created_at: string;
}

const DonationApproval = () => {
  const [selectedDonation, setSelectedDonation] = useState<DatabaseDonation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch donations from Supabase
  const { data: donations = [], isLoading, error } = useQuery({
    queryKey: ['donations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('book_donations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching donations:', error);
        toast.error('Failed to load donations');
        throw error;
      }
      
      // Convert the Supabase data to match our DatabaseDonation interface
      return (data || []).map(item => ({
        ...item,
        location: typeof item.location === 'string' 
          ? JSON.parse(item.location) 
          : item.location as unknown as { lat: number; lng: number; address: string }
      })) as DatabaseDonation[];
    },
    // Add retry and stale time options to improve reliability
    retry: 2,
    staleTime: 30000
  });

  // Update donation status mutation
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'approved' | 'declined' }) => {
      const { error } = await supabase
        .from('book_donations')
        .update({ status })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating donation status:', error);
        throw error;
      }
      
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
    }
  });

  const handleView = (donation: DatabaseDonation) => {
    setSelectedDonation(donation);
    setIsDialogOpen(true);
  };

  const handleApprove = (id: string) => {
    updateStatus.mutate(
      { id, status: 'approved' },
      {
        onSuccess: () => {
          toast.success("Donation approved successfully");
          setIsDialogOpen(false);
        },
        onError: () => {
          toast.error("Failed to approve donation");
        }
      }
    );
  };

  const handleDecline = (id: string) => {
    updateStatus.mutate(
      { id, status: 'declined' },
      {
        onSuccess: () => {
          toast.success("Donation declined");
          setIsDialogOpen(false);
        },
        onError: () => {
          toast.error("Failed to decline donation");
        }
      }
    );
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading donations...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8">Error loading donations. Please try again.</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Book Donations</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-yellow-50">
            {donations.filter(d => d.status === 'pending').length} Pending
          </Badge>
          <Badge variant="outline" className="bg-green-50">
            {donations.filter(d => d.status === 'approved').length} Approved
          </Badge>
          <Badge variant="outline" className="bg-red-50">
            {donations.filter(d => d.status === 'declined').length} Declined
          </Badge>
        </div>
      </div>

      {donations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No donations found. Donations will appear here when users submit them.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Donor</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {donations.map((donation) => (
              <TableRow key={donation.id}>
                <TableCell className="font-medium">{donation.title}</TableCell>
                <TableCell>
                  {donation.category === 'CURRICULUM' ? 
                    `${donation.subject || 'N/A'} ${donation.grade ? `(Grade ${donation.grade})` : ''}` : 
                    donation.subject || donation.category}
                </TableCell>
                <TableCell>{donation.condition}</TableCell>
                <TableCell>{donation.donor_name}</TableCell>
                <TableCell>{new Date(donation.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      donation.status === 'approved' ? 'default' : 
                      donation.status === 'declined' ? 'destructive' : 
                      'outline'
                    }
                  >
                    {donation.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleView(donation)}>
                      View
                    </Button>
                    {donation.status === 'pending' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-green-600" 
                          onClick={() => handleApprove(donation.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600" 
                          onClick={() => handleDecline(donation.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedDonation && (
            <>
              <DialogHeader>
                <DialogTitle>Donation Details</DialogTitle>
                <DialogDescription>
                  Review the book donation information
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <h4 className="font-medium">Book Information</h4>
                  <div className="space-y-2 mt-2">
                    <p><span className="text-muted-foreground">Title:</span> {selectedDonation.title}</p>
                    <p><span className="text-muted-foreground">Category:</span> {selectedDonation.category}</p>
                    {selectedDonation.category === 'CURRICULUM' && (
                      <>
                        <p><span className="text-muted-foreground">Subject:</span> {selectedDonation.subject}</p>
                        <p><span className="text-muted-foreground">Grade:</span> {selectedDonation.grade}</p>
                        <p><span className="text-muted-foreground">Board:</span> {selectedDonation.board}</p>
                      </>
                    )}
                    <p><span className="text-muted-foreground">Condition:</span> {selectedDonation.condition}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">Donor Information</h4>
                  <div className="space-y-2 mt-2">
                    <p><span className="text-muted-foreground">Name:</span> {selectedDonation.donor_name}</p>
                    <p><span className="text-muted-foreground">Email:</span> {selectedDonation.donor_email}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {selectedDonation.donor_phone || 'N/A'}</p>
                    <p><span className="text-muted-foreground">Location:</span> {selectedDonation.location.address}</p>
                    <p><span className="text-muted-foreground">Date:</span> {new Date(selectedDonation.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              {selectedDonation.status === 'pending' && (
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    className="border-red-200 text-red-600 hover:bg-red-50" 
                    onClick={() => handleDecline(selectedDonation.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700" 
                    onClick={() => handleApprove(selectedDonation.id)}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DonationApproval;
