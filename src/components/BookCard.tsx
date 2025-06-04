
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookDonation } from "@/types/books";
import { MapPin, Book, School } from "lucide-react";
import ContactInfo from "./ContactInfo";

interface BookCardProps {
  donation: BookDonation;
  showContactInfo: boolean;
  onClick?: () => void;
}

const BookCard = ({ donation, showContactInfo, onClick }: BookCardProps) => {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{donation.title}</span>
          <Badge variant={donation.condition === 'NEW' ? 'default' : 'secondary'}>
            {donation.condition}
          </Badge>
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <School className="w-4 h-4" />
          {donation.subject || donation.category}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            {donation.grade && donation.board && donation.medium && (
              <div className="flex items-center gap-2">
                <Book className="w-4 h-4" />
                <span>Grade {donation.grade} • {donation.board} • {donation.medium}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{donation.location?.address || "Location not available"}</span>
            </div>
          </div>
          
          <ContactInfo 
            donorName={donation.donor_name}
            donorEmail={donation.donor_email}
            donorPhone={donation.donor_phone}
            address={donation.location?.address || "Location not available"}
            showContactInfo={showContactInfo}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BookCard;
