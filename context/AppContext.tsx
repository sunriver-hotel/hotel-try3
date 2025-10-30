
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Language, Booking, RoomCleaningStatus, CleaningStatus, Room, AppContextType } from '../types';
import { translations } from '../constants';

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cleaningStatus, setCleaningStatus] = useState<RoomCleaningStatus>({});
  const [rooms, setRooms] = useState<Room[]>([]);
  const [customLogo, setCustomLogoState] = useState<string | null>(() => localStorage.getItem('customLogo'));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [roomsRes, bookingsRes, cleaningStatusRes] = await Promise.all([
          fetch('/api/rooms'),
          fetch('/api/bookings'),
          fetch('/api/cleaning-status')
        ]);

        if (!roomsRes.ok || !bookingsRes.ok || !cleaningStatusRes.ok) {
            throw new Error('Failed to fetch initial data');
        }

        const roomsData = await roomsRes.json();
        const bookingsData = await bookingsRes.json();
        const cleaningStatusData = await cleaningStatusRes.json();

        setRooms(roomsData);
        setBookings(bookingsData);
        setCleaningStatus(cleaningStatusData);

      } catch (error) {
        console.error("Error fetching data:", error);
        // Here you could set an error state to show a message to the user
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
        fetchData();
    } else {
        // Clear data on logout
        setRooms([]);
        setBookings([]);
        setCleaningStatus({});
        setIsLoading(false);
    }
  }, [isAuthenticated]);


  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const login = async (user: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        return { success: true };
      }
      
      // If response is not OK, parse the error message from the API
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'An unknown error occurred.' };

    } catch (error) {
      console.error('Login API error:', error);
      // Handle network errors or other fetch-related issues
      return { success: false, error: 'Failed to connect to the server. Please check your connection.' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setActivePage('home');
  };
  
  const addBooking = async (bookingData: Omit<Booking, 'id' | 'timestamp'>) => {
    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
        if (response.ok) {
            const newBooking = await response.json();
            setBookings(prev => [...prev, newBooking].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        } else {
            console.error("Failed to add booking");
        }
    } catch (error) {
        console.error("Error adding booking:", error);
    }
  };

  const updateBooking = async (updatedBooking: Booking) => {
    try {
        const response = await fetch(`/api/bookings/${updatedBooking.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedBooking)
        });
        if (response.ok) {
             const newUpdatedBooking = await response.json();
             setBookings(prev => prev.map(b => b.id === newUpdatedBooking.id ? newUpdatedBooking : b));
        } else {
            console.error("Failed to update booking");
        }
    } catch (error) {
        console.error("Error updating booking:", error);
    }
  };
  
  const updateCleaningStatus = async (roomId: string, status: CleaningStatus) => {
    try {
        const response = await fetch(`/api/cleaning-status/${roomId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (response.ok) {
            setCleaningStatus(prev => ({ ...prev, [roomId]: status }));
        } else {
            console.error("Failed to update cleaning status");
        }
    } catch (error) {
        console.error("Error updating cleaning status:", error);
    }
  };
  
  const setCustomLogo = (logo: string | null) => {
    if (logo) {
      localStorage.setItem('customLogo', logo);
    } else {
      localStorage.removeItem('customLogo');
    }
    setCustomLogoState(logo);
  };

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      t,
      isAuthenticated,
      login,
      logout,
      activePage,
      setActivePage,
      bookings,
      addBooking,
      updateBooking,
      cleaningStatus,
      updateCleaningStatus,
      customLogo,
      setCustomLogo,
      rooms,
      totalRooms: rooms.length,
      isLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};