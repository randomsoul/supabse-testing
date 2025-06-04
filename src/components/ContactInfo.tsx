
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

interface ContactInfoProps {
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  address: string;
  showContactInfo: boolean;
}

const ContactInfo = ({ donorName, donorEmail, donorPhone, address, showContactInfo }: ContactInfoProps) => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  
  const handleSignIn = () => {
    setIsLoadingAuth(true);
    navigate('/auth');
  };
  
  // Only show contact info if explicitly requested AND user is authenticated
  // AND user is a seeker or has both roles
  const canViewContactInfo = showContactInfo && 
    user && 
    (userRole === 'seeker' || userRole === 'both' || userRole === 'admin');
  
  if (!canViewContactInfo) {
    return (
      <div className="mt-4 border-t pt-4">
        <Button 
          onClick={handleSignIn}
          className="w-full"
          variant="outline"
          disabled={isLoadingAuth}
        >
          {isLoadingAuth ? "Redirecting..." : 
           user ? "Register as seeker to view contact info" : "Sign in to view contact info"}
        </Button>
      </div>
    );
  }
  
  return (
    <div className="mt-4 border-t pt-4">
      <h3 className="font-semibold mb-2">Contact Info:</h3>
      <div className="space-y-2 text-sm">
        <p className="text-gray-700">{donorName}</p>
        
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-blue-500" />
          <a 
            href={`mailto:${donorEmail}`} 
            className="text-blue-500 hover:underline"
          >
            {donorEmail}
          </a>
        </div>
        
        {donorPhone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-green-500" />
            <a 
              href={`tel:${donorPhone}`} 
              className="text-green-500 hover:underline"
            >
              {donorPhone}
            </a>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-orange-500 flex-shrink-0" />
          <span className="text-gray-600 break-words">{address}</span>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
