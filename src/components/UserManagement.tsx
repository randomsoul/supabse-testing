
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Check, X, Search, Users, Edit } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  location: string | null;
  status: 'active' | 'blocked';
  donations_count: number;
  requests_count: number;
  created_at: string;
}

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<User | null>(null);
  const queryClient = useQueryClient();

  // Fetch users from Supabase
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
        throw error;
      }
      
      return data as User[];
    }
  });

  // Update user mutation
  const updateUser = useMutation({
    mutationFn: async (userData: User) => {
      const { data, error } = await supabase
        .from('users')
        .update({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          location: userData.location,
          status: userData.status
        })
        .eq('id', userData.id);
      
      if (error) {
        console.error('Error updating user:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) {
        console.error('Error deleting user:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.phone && user.phone.includes(searchQuery))
  );

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({ ...user });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (editFormData) {
      updateUser.mutate(editFormData, {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast.success("User information updated successfully");
        },
        onError: () => {
          toast.error("Failed to update user information");
        }
      });
    }
  };

  const handleToggleBlockUser = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    
    updateUser.mutate(
      { ...users.find(u => u.id === userId)!, status: newStatus as 'active' | 'blocked' },
      {
        onSuccess: () => {
          toast.success(`User ${newStatus === 'active' ? 'unblocked' : 'blocked'} successfully`);
        },
        onError: () => {
          toast.error(`Failed to ${newStatus === 'active' ? 'unblock' : 'block'} user`);
        }
      }
    );
  };

  const handleDeleteUser = (userId: string) => {
    deleteUser.mutate(userId, {
      onSuccess: () => {
        setIsDialogOpen(false);
        toast.success("User deleted successfully");
      },
      onError: () => {
        toast.error("Failed to delete user");
      }
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading users...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8">Error loading users. Please try again.</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[250px] pl-8"
            />
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="text-muted-foreground">{users.length} Users</span>
          </div>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No users found. Users will appear here when they register.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{user.email}</span>
                    <span className="text-muted-foreground text-xs">{user.phone}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    user.role === 'donor' ? 'bg-blue-50' : 
                    user.role === 'seeker' ? 'bg-purple-50' : 'bg-green-50'
                  }>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user.location || 'No location'}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>Donations: {user.donations_count}</p>
                    <p>Requests: {user.requests_count}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewUser(user)}>
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleBlockUser(user.id, user.status)}
                      className={user.status === 'blocked' ? 'text-green-600' : 'text-red-600'}
                    >
                      {user.status === 'blocked' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedUser && !isEditMode && (
            <>
              <DialogHeader>
                <DialogTitle>User Information</DialogTitle>
                <DialogDescription>View detailed user information</DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <h4 className="font-medium">Personal Information</h4>
                  <div className="space-y-2 mt-2">
                    <p><span className="text-muted-foreground">Name:</span> {selectedUser.name}</p>
                    <p><span className="text-muted-foreground">Email:</span> {selectedUser.email}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {selectedUser.phone || 'Not provided'}</p>
                    <p><span className="text-muted-foreground">Location:</span> {selectedUser.location || 'Not provided'}</p>
                    <p><span className="text-muted-foreground">Joined:</span> {new Date(selectedUser.created_at).toLocaleDateString()}</p>
                    <p>
                      <span className="text-muted-foreground">Status:</span>{' '}
                      <Badge variant={selectedUser.status === 'active' ? 'default' : 'destructive'}>
                        {selectedUser.status}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">Activity</h4>
                  <div className="space-y-2 mt-2">
                    <p><span className="text-muted-foreground">Role:</span> {selectedUser.role}</p>
                    <p><span className="text-muted-foreground">Donations:</span> {selectedUser.donations_count}</p>
                    <p><span className="text-muted-foreground">Requests:</span> {selectedUser.requests_count}</p>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => handleEditUser(selectedUser)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit User
                </Button>
                <Button 
                  variant={selectedUser.status === 'blocked' ? 'default' : 'destructive'}
                  onClick={() => {
                    handleToggleBlockUser(selectedUser.id, selectedUser.status);
                    setIsDialogOpen(false);
                  }}
                >
                  {selectedUser.status === 'blocked' ? 'Unblock User' : 'Block User'}
                </Button>
              </DialogFooter>
            </>
          )}
          
          {selectedUser && isEditMode && editFormData && (
            <>
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>Update user information</DialogDescription>
              </DialogHeader>
              
              <form className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormLabel htmlFor="name">Name</FormLabel>
                    <Input 
                      id="name" 
                      value={editFormData.name || ''}
                      onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <Input 
                      id="email" 
                      type="email"
                      value={editFormData.email || ''}
                      onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormLabel htmlFor="phone">Phone</FormLabel>
                    <Input 
                      id="phone" 
                      value={editFormData.phone || ''}
                      onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormLabel htmlFor="location">Location</FormLabel>
                    <Input 
                      id="location" 
                      value={editFormData.location || ''}
                      onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                    />
                  </div>
                </div>
              </form>
              
              <DialogFooter>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteUser(selectedUser.id)}
                >
                  Delete User
                </Button>
                <Button onClick={handleSaveUser}>Save Changes</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
