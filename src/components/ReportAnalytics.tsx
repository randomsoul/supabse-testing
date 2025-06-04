
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { FileText, Calendar as CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const ReportAnalytics = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Fetch statistics data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['donation-stats'],
    queryFn: async () => {
      const [totalDonations, activeDonations, pendingDonations] = await Promise.all([
        supabase.from('book_donations').select('id', { count: 'exact' }),
        supabase.from('book_donations').select('id', { count: 'exact' }).eq('status', 'approved'),
        supabase.from('book_donations').select('id', { count: 'exact' }).eq('status', 'pending')
      ]);
      
      return {
        total: totalDonations.count || 0,
        active: activeDonations.count || 0,
        pending: pendingDonations.count || 0
      };
    }
  });
  
  // Fetch users count
  const { data: usersStats, isLoading: usersLoading } = useQuery({
    queryKey: ['users-stats'],
    queryFn: async () => {
      const { count } = await supabase.from('users').select('id', { count: 'exact' });
      return count || 0;
    }
  });
  
  // Fetch donations by month
  const { data: donationsByMonth = [], isLoading: chartLoading } = useQuery({
    queryKey: ['donations-by-month'],
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      const months = [];
      
      // For demo purposes, we'll generate sample data based on the real counts
      // In a real application, this would be a more complex SQL query using date functions
      for (let month = 0; month < 12; month++) {
        const startDate = new Date(currentYear, month, 1).toISOString();
        const endDate = new Date(currentYear, month + 1, 0).toISOString();
        
        const { count } = await supabase
          .from('book_donations')
          .select('id', { count: 'exact' })
          .gte('created_at', startDate)
          .lte('created_at', endDate);
        
        months.push({
          name: format(new Date(currentYear, month, 1), 'MMM'),
          count: count || 0
        });
      }
      
      return months;
    }
  });
  
  // Fetch donations by category
  const { data: categoryData = [], isLoading: categoryLoading } = useQuery({
    queryKey: ['donations-by-category'],
    queryFn: async () => {
      const { data: curriculumCount } = await supabase
        .from('book_donations')
        .select('id', { count: 'exact' })
        .eq('category', 'CURRICULUM');
      
      const { data: nonCurriculumCount } = await supabase
        .from('book_donations')
        .select('id', { count: 'exact' })
        .eq('category', 'NON_CURRICULUM');
      
      return [
        { name: 'Curriculum', value: curriculumCount?.length || 0 },
        { name: 'Non-Curriculum', value: nonCurriculumCount?.length || 0 }
      ];
    }
  });
  
  // Fetch donations by subject
  const { data: subjectData = [], isLoading: subjectLoading } = useQuery({
    queryKey: ['donations-by-subject'],
    queryFn: async () => {
      const { data } = await supabase
        .from('book_donations')
        .select('subject')
        .eq('category', 'CURRICULUM')
        .not('subject', 'is', null);
      
      if (!data || data.length === 0) return [];
      
      // Count subjects
      const subjects = data.reduce((acc: Record<string, number>, curr) => {
        const subject = curr.subject || 'Unknown';
        acc[subject] = (acc[subject] || 0) + 1;
        return acc;
      }, {});
      
      // Convert to array format for chart
      return Object.entries(subjects).map(([name, count]) => ({ name, count }));
    }
  });
  
  // Fetch donations for selected date
  const { data: selectedDateDonations = [], isLoading: calendarLoading } = useQuery({
    queryKey: ['donations-by-date', date ? date.toISOString() : ''],
    queryFn: async () => {
      if (!date) return [];
      
      const startDate = new Date(date.setHours(0, 0, 0, 0)).toISOString();
      const endDate = new Date(date.setHours(23, 59, 59, 999)).toISOString();
      
      const { data } = await supabase
        .from('book_donations')
        .select('title, donor_name, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      return data || [];
    },
    enabled: !!date
  });
  
  const isLoading = statsLoading || usersLoading || chartLoading || categoryLoading || subjectLoading;
  
  if (isLoading) {
    return <div className="flex justify-center p-8">Loading analytics data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.pending} pending approvals
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersStats}</div>
            <p className="text-xs text-muted-foreground">
              Platform users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Donations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active}</div>
            <p className="text-xs text-muted-foreground">
              Successfully distributed
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="category">By Category</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Donations</CardTitle>
              <CardDescription>Number of books donated per month</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={donationsByMonth}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Donations" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Donation by Category</CardTitle>
                <CardDescription>Distribution of curriculum vs non-curriculum books</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Donations by Subject</CardTitle>
                <CardDescription>Most popular subjects in curriculum books</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={subjectData}
                      margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#82ca9d" name="Books" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="category">
          <Card>
            <CardHeader>
              <CardTitle>Books by Category and Type</CardTitle>
              <CardDescription>Detailed breakdown of book categories</CardDescription>
            </CardHeader>
            <CardContent>
              {/* More detailed category breakdown would go here */}
              <p className="text-center py-8 text-muted-foreground">
                Detailed category reports would be shown here with filtering options
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>View donations by date</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-medium">
                    Activity for {date?.toLocaleDateString()}
                  </h3>
                  {calendarLoading ? (
                    <div className="mt-4">Loading...</div>
                  ) : selectedDateDonations.length === 0 ? (
                    <div className="mt-4 text-muted-foreground">No donations on this date</div>
                  ) : (
                    <ul className="mt-4 space-y-2">
                      {selectedDateDonations.map((donation, idx) => (
                        <li key={idx} className="border rounded p-3">
                          <div className="font-medium">{donation.title}</div>
                          <div className="text-sm text-muted-foreground">
                            Donated by {donation.donor_name}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportAnalytics;
