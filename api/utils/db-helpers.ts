// api/utils/db-helpers.ts

// Converts 'dd/mm/yyyy' from frontend to 'YYYY-MM-DD' for Postgres DATE type
export const formatDateForDB = (dateString: string): string => {
    if (!dateString || dateString.split('/').length !== 3) return new Date().toISOString().split('T')[0]; // fallback
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
};

// Converts a Date object or string from Postgres to 'dd/mm/yyyy' for frontend
export const formatDateFromDB = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Maps frontend payment status (uppercase) to DB status (PascalCase)
export const mapPaymentStatusToDB = (status: 'UNPAID' | 'DEPOSIT' | 'PAID'): 'Unpaid' | 'Deposit' | 'Paid' => {
    switch (status) {
        case 'PAID': return 'Paid';
        case 'DEPOSIT': return 'Deposit';
        case 'UNPAID': return 'Unpaid';
        default: return 'Unpaid';
    }
};

// Maps DB payment status (PascalCase) to frontend status (uppercase)
export const mapPaymentStatusFromDB = (status: string): 'UNPAID' | 'DEPOSIT' | 'PAID' => {
    switch (status) {
        case 'Paid': return 'PAID';
        case 'Deposit': return 'DEPOSIT';
        case 'Unpaid': return 'UNPAID';
        default: return 'UNPAID';
    }
};

// Maps frontend cleaning status to DB status
export const mapCleaningStatusToDB = (status: 'CLEAN' | 'DIRTY'): 'Clean' | 'Needs Cleaning' => {
    return status === 'CLEAN' ? 'Clean' : 'Needs Cleaning';
}

// Maps DB cleaning status to frontend status
export const mapCleaningStatusFromDB = (status: string): 'CLEAN' | 'DIRTY' => {
    return status === 'Clean' ? 'CLEAN' : 'DIRTY';
}
