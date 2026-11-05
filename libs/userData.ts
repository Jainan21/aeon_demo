export interface UserAccount {
    id: string;
    username: string; // Nhập ở ô Tài khoản
    password: string; // Nhập ở ô Mật khẩu
    name: string;
    role: 'pos' | 'customer' | 'dashboard';
    code: string;
    roleName: string;
    avatar: string;
    redirectUrl: string;
}

export const MOCK_USERS: UserAccount[] = [
    {
        id: 'USR_POS',
        username: 'pos',
        password: '123',
        name: 'Thu Ngân Celadon 01',
        role: 'pos',
        code: 'POS1',
        roleName: 'POS Thu Ngân AEON',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
        redirectUrl: '/pos',
    },
    {
        id: 'CUST1',
        username: 'customer1',
        password: '123',
        name: 'Nguyễn Văn A (Khách Hàng)',
        role: 'customer',
        code: 'AEON-889922',
        roleName: 'App AEON Khách Hàng',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        redirectUrl: '/customer',
    },
    {
        id: 'CUST2',
        username: 'customer2',
        password: '123',
        name: 'Trần Thị B (Khách Hàng)',
        role: 'customer',
        code: 'AEON-112233',
        roleName: 'App AEON Khách Hàng',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        redirectUrl: '/customer',
    },
    {
        id: 'USR_DASH',
        username: 'admin',
        password: '123',
        name: 'Quản Trị Viên ESG',
        role: 'dashboard',
        code: "ADMIN-1",
        roleName: 'Dashboard Quản Trị ESG',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        redirectUrl: '/dashboard',
    },
];