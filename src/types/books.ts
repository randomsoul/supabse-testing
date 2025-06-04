
export interface BookDonation {
  id: string;
  title: string;
  category: string;
  subject: string | null;
  condition: string;
  grade: number | null;
  board: string | null;
  medium?: string; // Made optional since it doesn't exist in the database
  donor_name: string;
  donor_email: string;
  donor_phone: string;
  status: string;
  created_at: string;
  updated_at: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}
