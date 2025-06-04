
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import BookCard from "@/components/BookCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BookDonation } from "@/types/books";
import { parseLocationFromJson } from "@/lib/auth-utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Map from "@/components/Map";
import { Search as SearchIcon, MapPin } from "lucide-react";

const SearchBooks = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("title");
  const [donations, setDonations] = useState<BookDonation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchLocation, setSearchLocation] = useState("");
  const { user } = useAuth();

  const searchBooks = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("book_donations")
        .select("*")
        .eq("status", "approved");
      
      // Apply text search filter if provided
      if (searchTerm) {
        query = query.ilike(searchCategory, `%${searchTerm}%`);
      }
      
      // Apply location search if provided
      if (searchLocation) {
        query = query.textSearch('location', searchLocation, {
          config: 'english',
          type: 'websearch'
        });
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching books:", error);
        return;
      }

      if (data) {
        // Parse location JSON for each donation and map database fields to our type
        const parsedData: BookDonation[] = data.map(item => ({
          id: item.id,
          title: item.title,
          category: item.category,
          subject: item.subject,
          condition: item.condition,
          grade: item.grade,
          board: item.board,
          // The medium field might not exist in the database schema, so provide a default
          medium: "ENGLISH", // Default to English since medium isn't in the database
          donor_name: item.donor_name,
          donor_email: item.donor_email,
          donor_phone: item.donor_phone,
          status: item.status,
          created_at: item.created_at,
          updated_at: item.updated_at,
          location: item.location ? parseLocationFromJson(item.location) : { 
            lat: 0, 
            lng: 0, 
            address: 'Unknown location' 
          }
        }));

        setDonations(parsedData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch all donations on initial load
    const fetchInitialDonations = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("book_donations")
          .select("*")
          .eq("status", "approved");

        if (error) {
          console.error("Error fetching initial donations:", error);
          return;
        }

        if (data) {
          // Parse location JSON for each donation and map database fields to our type
          const parsedData: BookDonation[] = data.map(item => ({
            id: item.id,
            title: item.title,
            category: item.category,
            subject: item.subject,
            condition: item.condition,
            grade: item.grade,
            board: item.board,
            // The medium field might not exist in the database schema, so provide a default
            medium: "ENGLISH", // Default to English since medium isn't in the database
            donor_name: item.donor_name,
            donor_email: item.donor_email,
            donor_phone: item.donor_phone,
            status: item.status,
            created_at: item.created_at,
            updated_at: item.updated_at,
            location: item.location ? parseLocationFromJson(item.location) : { 
              lat: 0, 
              lng: 0, 
              address: 'Unknown location' 
            }
          }));

          setDonations(parsedData);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialDonations();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchBooks();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Find Books</h1>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>
        
        {/* Search Form */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700">
                Search
              </Label>
              <Input
                type="text"
                id="searchTerm"
                placeholder="Enter search term"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex-shrink-0">
              <Label htmlFor="searchCategory" className="block text-sm font-medium text-gray-700">
                Category
              </Label>
              <Select onValueChange={setSearchCategory} defaultValue={searchCategory}>
                <SelectTrigger className="w-full md:w-[200px] mt-1">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="subject">Subject</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="searchLocation" className="block text-sm font-medium text-gray-700">
                Location
              </Label>
              <div className="flex mt-1 gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    id="searchLocation"
                    placeholder="Enter location"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" className="flex-shrink-0">
                  <SearchIcon className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </form>
        </div>
        
        <TabsContent value="list">
          {/* Results Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">
              {isLoading ? "Searching..." : `${donations.length} Books Found`}
            </h2>
            
            {isLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : donations.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No books found matching your search criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {donations.map((donation) => (
                  <BookCard
                    key={donation.id}
                    donation={donation}
                    showContactInfo={!!user}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="map">
          <div className="mt-4 h-[600px] border rounded-lg overflow-hidden">
            <Map donations={donations} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SearchBooks;
