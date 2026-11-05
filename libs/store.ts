// lib/store.ts

export interface Customer {
    id: string;
    name: string;
    code: string;
    points: number;
    plasticSavedKg: number;
    noBagCount: number;
    avatar: string;
  }
  
  export interface Transaction {
    id: string;
    time: string;
    mall: string;
    customerCode: string;
    customerName: string;
    actionsDetail: string;
    plasticSaved: number;
    ecoPointsEarned: number;
    subtotal: number;
  }
  
  // Dữ liệu mẫu ban đầu
  export const INITIAL_CUSTOMERS: Customer[] = [
    {
      id: 'CUST1',
      name: 'Nguyễn Văn A',
      code: 'AEON-889922',
      points: 1250,
      plasticSavedKg: 14.5,
      noBagCount: 12,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'CUST2',
      name: 'Trần Thị B',
      code: 'AEON-112233',
      points: 450,
      plasticSavedKg: 3.2,
      noBagCount: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
  ];
  
  export const INITIAL_TRANSACTIONS: Transaction[] = [
    {
      id: 'HD-88490',
      time: '14:20 - Hôm nay',
      mall: 'AEON Mall Tân Phú Celadon',
      customerCode: 'AEON-889922',
      customerName: 'Nguyễn Văn A',
      actionsDetail: 'Không túi nilon (+10pt), Ống hút tre x1 (+5pt)',
      plasticSaved: 0.05,
      ecoPointsEarned: 15,
      subtotal: 43000,
    },
  ];
  
  // Helper Đọc dữ liệu từ localStorage
  export const getStoredCustomers = (): Customer[] => {
    if (typeof window === 'undefined') return INITIAL_CUSTOMERS;
    const data = localStorage.getItem('aeon_customers');
    return data ? JSON.parse(data) : INITIAL_CUSTOMERS;
  };
  
  export const getStoredTransactions = (): Transaction[] => {
    if (typeof window === 'undefined') return INITIAL_TRANSACTIONS;
    const data = localStorage.getItem('aeon_transactions');
    return data ? JSON.parse(data) : INITIAL_TRANSACTIONS;
  };
  
  // Helper Thêm hóa đơn mới & Cập nhật điểm cho Khách hàng
  export const saveNewTransaction = (newTx: Transaction) => {
    // 1. Lưu Giao Dịch
    const txs = getStoredTransactions();
    const updatedTxs = [newTx, ...txs];
    localStorage.setItem('aeon_transactions', JSON.stringify(updatedTxs));
  
    // 2. Cập nhật Điểm & Nhựa giảm cho Khách Hàng
    const customers = getStoredCustomers();
    const updatedCustomers = customers.map((c) => {
      if (c.code.toLowerCase() === newTx.customerCode.toLowerCase()) {
        return {
          ...c,
          points: c.points + newTx.ecoPointsEarned,
          plasticSavedKg: c.plasticSavedKg + newTx.plasticSaved,
        };
      }
      return c;
    });
    localStorage.setItem('aeon_customers', JSON.stringify(updatedCustomers));
  
    // 3. Phát sự kiện cho các tab/trang đang mở tự động làm mới UI
    window.dispatchEvent(new Event('aeon_data_updated'));
    window.dispatchEvent(new Event('storage'));
  };