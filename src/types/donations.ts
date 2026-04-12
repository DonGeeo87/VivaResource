export type DonationStatus = 'completed' | 'pending' | 'failed' | 'refunded';
export type DonationType = 'one-time' | 'monthly';

export interface Donation {
  id: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: string;
  type: DonationType;
  status: DonationStatus;
  paypalOrderId?: string;
  paypalPayerId?: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface DonationStats {
  totalDonations: number;
  totalAmount: number;
  averageDonation: number;
  monthlyRecurring: number;
  topDonors: Donation[];
  donationsByMonth: { month: string; amount: number; count: number }[];
}
