
export type Language = 'en' | 'th';

export interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

export type RoomType = 'River view' | 'Standard view' | 'Cottage';
export type BedType = 'Double bed' | 'Twin bed';
export type CleaningStatus = 'CLEAN' | 'DIRTY';

export interface Room {
  id: string;
  type: RoomType;
  bed: BedType;
  floor: number;
}

export type PaymentStatus = 'PAID' | 'DEPOSIT' | 'UNPAID';

export interface Booking {
  id: string; // Auto-generated booking ID
  timestamp: string; // ISO string
  customerName: string;
  phone: string;
  checkIn: string; // date string (dd/mm/yyyy)
  checkOut: string; // date string (dd/mm/yyyy)
  roomIds: string[]; // Changed from roomId: string
  paymentStatus: PaymentStatus;
  depositAmount?: number;
  email?: string;
  address?: string;
  taxId?: string;
  pricePerNight: number;
}

export interface RoomCleaningStatus {
  [roomId: string]: CleaningStatus;
}

export interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isAuthenticated: boolean;
  login: (user: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'timestamp'>) => Promise<void>;
  updateBooking: (booking: Booking) => Promise<void>;
  cleaningStatus: RoomCleaningStatus;
  updateCleaningStatus: (roomId: string, status: CleaningStatus) => Promise<void>;
  customLogo: string | null;
  setCustomLogo: (logo: string | null) => void;
  rooms: Room[];
  totalRooms: number;
  isLoading: boolean;
}