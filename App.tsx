
import React, { useContext } from 'react';
import { AppContext } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import RoomStatusPage from './pages/RoomStatusPage';
import DashboardPage from './pages/DashboardPage';
import CleaningPage from './pages/CleaningPage';
import ReceiptPage from './pages/ReceiptPage';

const App: React.FC = () => {
  const context = useContext(AppContext);

  if (!context) {
    return <div>Loading...</div>;
  }
  
  const { isAuthenticated, activePage, isLoading } = context;

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-stone-50">
        <div className="text-center">
            <p className="text-xl font-semibold text-stone-700">Loading Application Data...</p>
            <p className="text-stone-500">Please wait a moment.</p>
        </div>
      </div>
    );
  }
  
  const renderPage = () => {
    switch(activePage) {
      case 'home':
        return <HomePage />;
      case 'room_status':
        return <RoomStatusPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'cleaning':
        return <CleaningPage />;
      case 'receipt':
        return <ReceiptPage />;
      default:
        return <HomePage />;
    }
  }

  return (
    <Layout>
      {renderPage()}
    </Layout>
  );
};

export default App;
