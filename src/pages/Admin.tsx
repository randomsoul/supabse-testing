
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, FileText } from "lucide-react";
import AdminLogin from "@/components/AdminLogin";
import DonationApproval from "@/components/DonationApproval";
import UserManagement from "@/components/UserManagement";
import ReportAnalytics from "@/components/ReportAnalytics";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a queryClient instance for admin page
const adminQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    }
  }
});

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const handleLogin = (success: boolean) => {
    setIsAuthenticated(success);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <QueryClientProvider client={adminQueryClient}>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <Tabs defaultValue="donations" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="donations">Donation Approvals</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="donations">
            <DonationApproval />
          </TabsContent>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="reports">
            <ReportAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </QueryClientProvider>
  );
};

export default Admin;
