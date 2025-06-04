
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Book, Search, GraduationCap, Shield, UserPlus, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UserProfile from "@/components/auth/UserProfile";

// Import the logo
import logo from "/public/lovable-uploads/b2144384-426a-463f-8359-98bbd50ff78d.png";

const Index = () => {
  const { user, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      {/* Header with auth controls */}
      <header className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Book Donation Connect" className="h-10 w-auto" />
          <span className="text-xl font-bold text-purple-600">Book Donation Connect</span>
        </Link>
        
        <div>
          {isLoading ? (
            <div className="h-10 w-20 bg-gray-200 animate-pulse rounded"></div>
          ) : user ? (
            <UserProfile />
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/auth?mode=signup">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-grow container mx-auto px-4 flex items-center justify-center">
        <div className="text-center space-y-8">
          <div className="flex flex-col items-center">
            <img src={logo} alt="Book Donation Connect" className="h-40 w-auto mb-4" />
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
              Book Donation Connect
            </h1>
          </div>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect students with the books they need. Donate your used textbooks, find books for your studies, or support underprivileged education.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
              <Link to="/donate">
                <Book className="mr-2 h-5 w-5" />
                Donate Books
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/search">
                <Search className="mr-2 h-5 w-5" />
                Find Books
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link to="/education-support">
                <GraduationCap className="mr-2 h-5 w-5" />
                Support Education
              </Link>
            </Button>
          </div>
          
          <div className="mt-12 opacity-70 hover:opacity-100 transition-opacity">
            <Button asChild size="sm" variant="outline" className="border-dashed">
              <Link to="/admin">
                <Shield className="mr-2 h-4 w-4" />
                Admin Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
