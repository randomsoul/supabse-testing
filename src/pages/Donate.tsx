import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Map from "@/components/Map";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  title: z.string().min(2, "Book title must be at least 2 characters"),
  category: z.enum(["CURRICULUM", "NON_CURRICULUM"]),
  subject: z.enum([
    "MATHEMATICS", "PHYSICS", "CHEMISTRY", "BIOLOGY", "SCIENCE",
    "EVS", "ARTS", "COMPUTERS", "PSYCHOLOGY", "ACCOUNTS"
  ]).optional(),
  nonCurriculumType: z.enum([
    "STORY", "AUTOBIOGRAPHY", "BIOGRAPHY", "FICTION", "NOVEL", "COMICS"
  ]).optional(),
  grade: z.number().min(1).max(12).optional(),
  board: z.enum(["CBSE", "ICSE", "STATE", "IGCSE"]).optional(),
  medium: z.enum(["ENGLISH", "HINDI", "MARATHI"]),
  condition: z.enum(["NEW", "GOOD", "FAIR"]),
  schoolName: z.string().min(2, "School name must be at least 2 characters").optional(),
  donor_name: z.string().min(2, "Name must be at least 2 characters"),
  donor_email: z.string().email("Invalid email address"),
  donor_phone: z.string().optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string()
  }).optional()
});

const DonateForm = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      condition: "GOOD",
      board: "CBSE",
      medium: "ENGLISH",
      donor_name: userProfile?.name || "",
      donor_email: userProfile?.email || user?.email || "",
      donor_phone: userProfile?.phone || "",
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!location) {
      toast.error("Please select a location on the map");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create donation in Supabase - remove medium field as it doesn't exist in DB schema
      const { data, error } = await supabase
        .from('book_donations')
        .insert({
          title: values.title,
          category: values.category,
          subject: values.category === "CURRICULUM" ? values.subject : values.nonCurriculumType,
          condition: values.condition,
          grade: values.grade,
          board: values.board,
          // Medium is not sent to the database as it doesn't exist in the schema
          donor_name: values.donor_name,
          donor_email: values.donor_email, 
          donor_phone: values.donor_phone || "",
          location: location
        });
      
      if (error) {
        throw error;
      }
      
      toast.success("Donation submitted successfully!");
      form.reset();
      setLocation(null);
      
      // Navigate to search page after successful submission
      setTimeout(() => {
        navigate('/search');
      }, 2000);
      
    } catch (error: any) {
      console.error('Error submitting donation:', error);
      toast.error(error.message || "Failed to submit donation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container max-w-2xl py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Donate Books</h1>
        <p className="text-muted-foreground">Fill in the details about the books you want to donate</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Book Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter book title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CURRICULUM">Curriculum</SelectItem>
                    <SelectItem value="NON_CURRICULUM">Non-Curriculum</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("category") === "CURRICULUM" ? (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MATHEMATICS">Mathematics</SelectItem>
                        <SelectItem value="PHYSICS">Physics</SelectItem>
                        <SelectItem value="CHEMISTRY">Chemistry</SelectItem>
                        <SelectItem value="BIOLOGY">Biology</SelectItem>
                        <SelectItem value="SCIENCE">Science</SelectItem>
                        <SelectItem value="EVS">EVS</SelectItem>
                        <SelectItem value="ARTS">Arts</SelectItem>
                        <SelectItem value="COMPUTERS">Computers</SelectItem>
                        <SelectItem value="PSYCHOLOGY">Psychology</SelectItem>
                        <SelectItem value="ACCOUNTS">Accounts</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        max={12} 
                        placeholder="Enter grade" 
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="board"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Board</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select board" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CBSE">CBSE</SelectItem>
                        <SelectItem value="ICSE">ICSE</SelectItem>
                        <SelectItem value="STATE">State Board</SelectItem>
                        <SelectItem value="IGCSE">IGCSE</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="medium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medium</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select medium" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ENGLISH">English</SelectItem>
                        <SelectItem value="HINDI">Hindi</SelectItem>
                        <SelectItem value="MARATHI">Marathi</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : (
            <FormField
              control={form.control}
              name="nonCurriculumType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Book Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select book type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="STORY">Story</SelectItem>
                      <SelectItem value="AUTOBIOGRAPHY">Autobiography</SelectItem>
                      <SelectItem value="BIOGRAPHY">Biography</SelectItem>
                      <SelectItem value="FICTION">Fiction</SelectItem>
                      <SelectItem value="NOVEL">Novel</SelectItem>
                      <SelectItem value="COMICS">Comics</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="schoolName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>School Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter school name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormLabel>Location</FormLabel>
            <Map onLocationSelect={setLocation} />
            {location && (
              <div className="p-2 bg-gray-50 rounded text-sm">
                Selected location: {location.address}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="donor_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="donor_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="donor_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (Optional)</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="Enter your phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Donation"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default DonateForm;
