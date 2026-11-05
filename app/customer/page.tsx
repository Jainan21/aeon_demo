'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Leaf, QrCode, Gift, Ticket, History, Home,
    Receipt, LogOut, UserCheck, ShoppingBag, PlusCircle
} from 'lucide-react';
import {
    getStoredCustomers,
    getStoredTransactions,
    Customer,
    Transaction
} from '@/libs/store';

// 4 Sản phẩm sinh học đại diện (không cần scroll)
const FEATURED_ECO_PRODUCTS = [
    { id: 'ECO_STRAW', name: 'Ống hút tre cao cấp', price: 25000, pts: '+5 pt', icon: '🌱' },
    { id: 'ECO_BOTTLE', name: 'Bình nước Eco 750ml', price: 120000, pts: '+5 pt', icon: '🥛' },
    { id: 'ECO_BAG_TRASH', name: 'Túi rác tự phân hủy', price: 35000, pts: '+5 pt', icon: '🛍️' },
    { id: 'ECO_DISH', name: 'Nước rửa chén Hữu cơ', price: 65000, pts: '+5 pt', icon: '🧴' },
];

const VOUCHERS = [
    { id: 'VCH20K', name: 'Voucher AEON 20.000đ', pointsCost: 100, desc: 'Giảm 20k trực tiếp cho hóa đơn siêu thị AEON' },
    { id: 'VCH_BAG', name: 'Túi Vải AEON Eco-Bag', pointsCost: 150, desc: 'Túi vải không dệt tái sử dụng nhiều lần cao cấp...' },
];

export default function CustomerAppPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustCode, setSelectedCustCode] = useState<string>('AEON-889922');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [activeTab, setActiveTab] = useState<'rewards' | 'history' | 'qr' | 'home'>('home');
    const [myVouchers, setMyVouchers] = useState<string[]>([]);
    const [showQrModal, setShowQrModal] = useState(false);

    // Tải dữ liệu & Lắng nghe đồng bộ từ POS real-time
    const loadData = () => {
        const custs = getStoredCustomers();
        const txs = getStoredTransactions();
        setCustomers(custs);
        setTransactions(txs);
    };

    useEffect(() => {
        loadData();

        const handleUpdate = () => loadData();
        window.addEventListener('aeon_data_updated', handleUpdate);
        window.addEventListener('storage', handleUpdate);

        return () => {
            window.removeEventListener('aeon_data_updated', handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, []);

    const currentCustomer = customers.find(c => c.code === selectedCustCode) || customers[0] || {
        name: 'Nguyễn Văn A',
        code: 'AEON-889922',
        points: 1250,
        plasticSavedKg: 14.5,
        noBagCount: 12,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    };

    const customerTxList = transactions.filter(
        t => t.customerCode.toLowerCase() === currentCustomer.code.toLowerCase()
    );

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        router.push('/');
    };

    const handleRedeemVoucher = (vName: string, cost: number) => {
        if (currentCustomer.points < cost) {
            alert(`Bạn không đủ Eco-Point! Cần ${cost} pt.`);
            return;
        }
        const updated = customers.map(c => c.code === currentCustomer.code ? { ...c, points: c.points - cost } : c);
        setCustomers(updated);
        localStorage.setItem('aeon_customers', JSON.stringify(updated));
        setMyVouchers(prev => [...prev, vName]);
        alert(`Đổi thành công "${vName}"!`);
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-sans text-slate-800">

            {/* Khung Giả Lập Điện Thoại */}
            <div className="w-full max-w-[380px] h-[750px] bg-slate-950 rounded-[45px] p-3 border-4 border-slate-800 shadow-2xl relative flex flex-col">

                {/* Notch Camera */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-20 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-950 ml-auto mr-3"></div>
                </div>

                {/* Màn hình App */}
                <div className="w-full h-full bg-slate-50 rounded-[35px] overflow-hidden flex flex-col pt-6 relative">

                    {/* Header & Thẻ Thành Viên */}
                    <div className="bg-[#111827] text-white p-3.5 pt-4 shrink-0">

                        {/* Thanh Chọn Đổi Tài Khoản */}
                        <div className="mb-2 flex justify-between items-center bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 text-[10px]">
                            <span className="text-slate-400 font-bold flex items-center gap-1">
                                <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Đổi tài khoản App:
                            </span>
                            <select
                                value={selectedCustCode}
                                onChange={e => setSelectedCustCode(e.target.value)}
                                className="bg-slate-900 text-emerald-400 font-bold border border-slate-700 rounded-lg p-1 outline-none text-[10px]"
                            >
                                {customers.map(c => (
                                    <option key={c.id} value={c.code}>{c.name} ({c.points}pt)</option>
                                ))}
                            </select>
                        </div>

                        {/* Thông tin Profile */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <img src={currentCustomer.avatar} alt="Avatar" className="w-9 h-9 rounded-full border-2 border-emerald-400 object-cover shadow-md" />
                                <div>
                                    <h3 className="font-bold text-xs text-white leading-tight">{currentCustomer.name}</h3>
                                    <span className="text-[9px] text-slate-400 font-mono">{currentCustomer.code}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <button onClick={() => setShowQrModal(true)} className="w-7 h-7 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                                    <QrCode className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={handleLogout} title="Đăng xuất" className="w-7 h-7 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                                    <LogOut className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Thẻ Thẻ Điểm AEON ECO-MEMBER */}
                        <div className="mt-2.5 bg-gradient-to-br from-slate-900 to-[#004d22] rounded-2xl p-3 border border-emerald-500/30 shadow-xl">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                                        <Leaf className="w-3 h-3" /> AEON ECO-MEMBER
                                    </div>
                                    <div className="text-xl font-black text-amber-300 mt-0.5">
                                        {currentCustomer.points.toLocaleString()} <span className="text-xs text-white font-normal">Eco-Point</span>
                                    </div>
                                </div>
                                <span className="bg-[#ad1982] text-white font-extrabold text-[8px] px-2 py-0.5 rounded uppercase tracking-wider">
                                    HẠNG VÀNG
                                </span>
                            </div>

                            {/* Tiến trình giảm nhựa */}
                            <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                                <div className="flex justify-between text-[9px] font-semibold text-slate-200">
                                    <span>Tiến trình giảm rác nhựa:</span>
                                    <span className="text-emerald-300 font-bold">{currentCustomer.plasticSavedKg.toFixed(1)} / 20.0 kg</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden p-0.5 border border-white/10">
                                    <div
                                        className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-700"
                                        style={{ width: `${Math.min(100, (currentCustomer.plasticSavedKg / 20) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Sub Navigation Bar */}
                    <div className="bg-slate-200 p-1 flex border-b border-slate-300 text-[10px] font-bold shrink-0">
                        <button
                            onClick={() => setActiveTab('rewards')}
                            className={`flex-1 py-1 rounded-lg text-center transition ${activeTab === 'rewards' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'}`}
                        >
                            Voucher & Sản Phẩm
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 py-1 rounded-lg text-center transition ${activeTab === 'history' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'}`}
                        >
                            Lịch Sử POS ({customerTxList.length})
                        </button>
                    </div>

                    {/* Nội dung chính màn hình App */}
                    <div className="flex-1 overflow-hidden p-3 space-y-3 flex flex-col justify-between">
                        {activeTab === 'home' ? (
                            <>
                                {/* 1. BỘ 4 SẢN PHẨM SINH HỌC GỢI Ý (KHÔNG SCROLL - GRID 2x2) */}
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1">
                                            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" /> Sản Phẩm Sinh Học Gợi Ý
                                        </h4>
                                        <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                            Tích +5pt/món
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        {FEATURED_ECO_PRODUCTS.map((prod) => (
                                            <div key={prod.id} className="bg-white p-2 rounded-xl border border-slate-200 flex flex-col justify-between shadow-sm">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <span className="text-sm">{prod.icon}</span>
                                                    <span className="font-bold text-[10px] text-slate-800 line-clamp-1 leading-tight">{prod.name}</span>
                                                </div>
                                                <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                                                    <span className="text-[10px] font-extrabold text-slate-900">{prod.price.toLocaleString()}đ</span>
                                                    <span className="text-[9px] font-bold text-amber-500 bg-amber-50 px-1 py-0.2 rounded">{prod.pts}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : activeTab === "rewards" ? (
                            <>

                                {/* 2. KHO VOUCHER THƯỞNG */}
                                <div>
                                    <div className="flex justify-between items-center mb-1 text-slate-900">
                                        <h4 className="font-bold text-xs flex items-center gap-1">
                                            <Gift className="w-3.5 h-3.5 text-[#ad1982]" /> Kho Voucher Eco
                                        </h4>
                                        <span className="text-[9px] text-slate-400">Đổi điểm nhận ưu đãi</span>
                                    </div>

                                    <div className="space-y-1.5">
                                        {VOUCHERS.map(v => (
                                            <div key={v.id} className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                                                <div className="pr-2">
                                                    <div className="font-bold text-[11px] text-slate-900 leading-tight">{v.name}</div>
                                                    <div className="text-[8px] text-slate-400 line-clamp-1">{v.desc}</div>
                                                </div>
                                                <button
                                                    onClick={() => handleRedeemVoucher(v.name, v.pointsCost)}
                                                    className="px-2 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold rounded-lg text-[9px] shrink-0"
                                                >
                                                    {v.pointsCost} pt
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 3. TỦ VOUCHER CỦA TÔI */}
                                <div className="pt-1 border-t border-slate-200">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                                        <span className="flex items-center gap-1"><Ticket className="w-3 h-3 text-emerald-600" /> Tủ Voucher Của Tôi:</span>
                                        <span className="text-emerald-700 font-extrabold">{myVouchers.length} voucher</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* TAB LỊCH SỬ HÓA ĐƠN POS */
                            <div className="space-y-2 flex-1 overflow-y-auto">
                                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                    <Receipt className="w-3.5 h-3.5 text-emerald-600" /> Lịch Sử Hóa Đơn Tích Điểm POS
                                </h4>

                                {customerTxList.length === 0 ? (
                                    <div className="p-4 text-center bg-slate-100 rounded-2xl text-xs text-slate-400">
                                        Chưa có hóa đơn nào từ POS.
                                    </div>
                                ) : (
                                    customerTxList.map((tx) => (
                                        <div key={tx.id} className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm space-y-1 text-xs">
                                            <div className="flex justify-between items-center font-bold">
                                                <span>{tx.id}</span>
                                                <span className="text-emerald-600">+{tx.ecoPointsEarned} pt</span>
                                            </div>
                                            <div className="text-[10px] text-slate-500">{tx.actionsDetail}</div>
                                            <div className="flex justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-100">
                                                <span>{tx.time}</span>
                                                <span className="text-emerald-700 font-bold">-{tx.plasticSaved.toFixed(2)} kg nhựa</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Nav Bottom Bar */}
                    <div className="bg-white border-t border-slate-200 px-6 py-2 flex justify-between items-center text-slate-400 text-[10px] font-bold shrink-0">
                        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center ${activeTab === 'home' ? 'text-emerald-600' : 'hover:text-slate-600'}`}>
                            <Home className="w-4 h-4 mb-0.5" />
                            <span>Trang chủ</span>
                        </button>
                        <button onClick={() => setActiveTab('rewards')} className={`flex flex-col items-center ${activeTab === 'rewards' ? 'text-emerald-600' : 'hover:text-slate-600'}`}>
                            <Ticket className="w-4 h-4 mb-0.5" />
                            <span>Voucher</span>
                        </button>
                        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center ${activeTab === 'history' ? 'text-emerald-600' : 'hover:text-slate-600'}`}>
                            <History className="w-4 h-4 mb-0.5" />
                            <span>Lịch sử</span>
                        </button>
                        <button onClick={() => { setActiveTab('qr'), setShowQrModal(true) }} className={`flex flex-col items-center ${activeTab === 'qr' ? 'text-emerald-600' : 'hover:text-slate-600'}`}>
                            <QrCode className="w-4 h-4 mb-0.5" />
                            <span>Mã QR</span>
                        </button>
                    </div>

                </div>
            </div>

            {/* QR Code Modal */}
            {showQrModal && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white max-w-xs w-full rounded-3xl p-6 text-center space-y-4 shadow-2xl">
                        <h3 className="font-bold text-sm text-slate-900">Mã QR Thành Viên AEON Eco</h3>
                        <div className="bg-white p-3 inline-block rounded-2xl border-2 border-dashed border-emerald-500">
                            <svg width="250" height="250" viewBox="0 0 500 500">
                                <defs>
                                    <clipPath id="qr-clip-path-background-color-18">
                                        <rect x="0" y="0" width="500" height="500"></rect>
                                    </clipPath>
                                    <clipPath id="qr-clip-path-dot-color-18">
                                        <path d="M 146 18L 162 18L 162 34L 146 34ZM 178 18L 194 18L 194 34L 178 34ZM 258 18L 274 18L 274 34L 258 34ZM 274 18L 290 18L 290 34L 274 34ZM 290 18L 306 18L 306 34L 290 34ZM 306 18L 322 18L 322 34L 306 34ZM 322 18L 338 18L 338 34L 322 34ZM 146 34L 162 34L 162 50L 146 50ZM 194 34L 210 34L 210 50L 194 50ZM 210 34L 226 34L 226 50L 210 50ZM 242 34L 258 34L 258 50L 242 50ZM 258 34L 274 34L 274 50L 258 50ZM 306 34L 322 34L 322 50L 306 50ZM 338 34L 354 34L 354 50L 338 50ZM 226 50L 242 50L 242 66L 226 66ZM 242 50L 258 50L 258 66L 242 66ZM 258 50L 274 50L 274 66L 258 66ZM 306 50L 322 50L 322 66L 306 66ZM 322 50L 338 50L 338 66L 322 66ZM 146 66L 162 66L 162 82L 146 82ZM 178 66L 194 66L 194 82L 178 82ZM 194 66L 210 66L 210 82L 194 82ZM 274 66L 290 66L 290 82L 274 82ZM 290 66L 306 66L 306 82L 290 82ZM 306 66L 322 66L 322 82L 306 82ZM 338 66L 354 66L 354 82L 338 82ZM 162 82L 178 82L 178 98L 162 98ZM 210 82L 226 82L 226 98L 210 98ZM 226 82L 242 82L 242 98L 226 98ZM 290 82L 306 82L 306 98L 290 98ZM 306 82L 322 82L 322 98L 306 98ZM 322 82L 338 82L 338 98L 322 98ZM 162 98L 178 98L 178 114L 162 114ZM 178 98L 194 98L 194 114L 178 114ZM 194 98L 210 98L 210 114L 194 114ZM 210 98L 226 98L 226 114L 210 114ZM 242 98L 258 98L 258 114L 242 114ZM 290 98L 306 98L 306 114L 290 114ZM 322 98L 338 98L 338 114L 322 114ZM 338 98L 354 98L 354 114L 338 114ZM 146 114L 162 114L 162 130L 146 130ZM 178 114L 194 114L 194 130L 178 130ZM 210 114L 226 114L 226 130L 210 130ZM 242 114L 258 114L 258 130L 242 130ZM 274 114L 290 114L 290 130L 274 130ZM 306 114L 322 114L 322 130L 306 130ZM 338 114L 354 114L 354 130L 338 130ZM 146 130L 162 130L 162 146L 146 146ZM 162 130L 178 130L 178 146L 162 146ZM 194 130L 210 130L 210 146L 194 146ZM 210 130L 226 130L 226 146L 210 146ZM 226 130L 242 130L 242 146L 226 146ZM 242 130L 258 130L 258 146L 242 146ZM 290 130L 306 130L 306 146L 290 146ZM 322 130L 338 130L 338 146L 322 146ZM 18 146L 34 146L 34 162L 18 162ZM 50 146L 66 146L 66 162L 50 162ZM 66 146L 82 146L 82 162L 66 162ZM 98 146L 114 146L 114 162L 98 162ZM 114 146L 130 146L 130 162L 114 162ZM 130 146L 146 146L 146 162L 130 162ZM 162 146L 178 146L 178 162L 162 162ZM 226 146L 242 146L 242 162L 226 162ZM 242 146L 258 146L 258 162L 242 162ZM 274 146L 290 146L 290 162L 274 162ZM 306 146L 322 146L 322 162L 306 162ZM 370 146L 386 146L 386 162L 370 162ZM 418 146L 434 146L 434 162L 418 162ZM 450 146L 466 146L 466 162L 450 162ZM 466 146L 482 146L 482 162L 466 162ZM 18 162L 34 162L 34 178L 18 178ZM 34 162L 50 162L 50 178L 34 178ZM 50 162L 66 162L 66 178L 50 178ZM 66 162L 82 162L 82 178L 66 178ZM 98 162L 114 162L 114 178L 98 178ZM 130 162L 146 162L 146 178L 130 178ZM 162 162L 178 162L 178 178L 162 178ZM 210 162L 226 162L 226 178L 210 178ZM 258 162L 274 162L 274 178L 258 178ZM 274 162L 290 162L 290 178L 274 178ZM 306 162L 322 162L 322 178L 306 178ZM 322 162L 338 162L 338 178L 322 178ZM 354 162L 370 162L 370 178L 354 178ZM 370 162L 386 162L 386 178L 370 178ZM 386 162L 402 162L 402 178L 386 178ZM 402 162L 418 162L 418 178L 402 178ZM 466 162L 482 162L 482 178L 466 178ZM 34 178L 50 178L 50 194L 34 194ZM 50 178L 66 178L 66 194L 50 194ZM 66 178L 82 178L 82 194L 66 194ZM 114 178L 130 178L 130 194L 114 194ZM 146 178L 162 178L 162 194L 146 194ZM 194 178L 210 178L 210 194L 194 194ZM 242 178L 258 178L 258 194L 242 194ZM 258 178L 274 178L 274 194L 258 194ZM 354 178L 370 178L 370 194L 354 194ZM 370 178L 386 178L 386 194L 370 194ZM 386 178L 402 178L 402 194L 386 194ZM 402 178L 418 178L 418 194L 402 194ZM 434 178L 450 178L 450 194L 434 194ZM 450 178L 466 178L 466 194L 450 194ZM 18 194L 34 194L 34 210L 18 210ZM 66 194L 82 194L 82 210L 66 210ZM 82 194L 98 194L 98 210L 82 210ZM 130 194L 146 194L 146 210L 130 210ZM 162 194L 178 194L 178 210L 162 210ZM 194 194L 210 194L 210 210L 194 210ZM 210 194L 226 194L 226 210L 210 210ZM 226 194L 242 194L 242 210L 226 210ZM 242 194L 258 194L 258 210L 242 210ZM 258 194L 274 194L 274 210L 258 210ZM 306 194L 322 194L 322 210L 306 210ZM 322 194L 338 194L 338 210L 322 210ZM 338 194L 354 194L 354 210L 338 210ZM 386 194L 402 194L 402 210L 386 210ZM 402 194L 418 194L 418 210L 402 210ZM 466 194L 482 194L 482 210L 466 210ZM 50 210L 66 210L 66 226L 50 226ZM 98 210L 114 210L 114 226L 98 226ZM 114 210L 130 210L 130 226L 114 226ZM 146 210L 162 210L 162 226L 146 226ZM 162 210L 178 210L 178 226L 162 226ZM 178 210L 194 210L 194 226L 178 226ZM 210 210L 226 210L 226 226L 210 226ZM 274 210L 290 210L 290 226L 274 226ZM 290 210L 306 210L 306 226L 290 226ZM 418 210L 434 210L 434 226L 418 226ZM 434 210L 450 210L 450 226L 434 226ZM 34 226L 50 226L 50 242L 34 242ZM 50 226L 66 226L 66 242L 50 242ZM 82 226L 98 226L 98 242L 82 242ZM 146 226L 162 226L 162 242L 146 242ZM 162 226L 178 226L 178 242L 162 242ZM 210 226L 226 226L 226 242L 210 242ZM 226 226L 242 226L 242 242L 226 242ZM 290 226L 306 226L 306 242L 290 242ZM 306 226L 322 226L 322 242L 306 242ZM 322 226L 338 226L 338 242L 322 242ZM 370 226L 386 226L 386 242L 370 242ZM 434 226L 450 226L 450 242L 434 242ZM 450 226L 466 226L 466 242L 450 242ZM 466 226L 482 226L 482 242L 466 242ZM 50 242L 66 242L 66 258L 50 258ZM 66 242L 82 242L 82 258L 66 258ZM 114 242L 130 242L 130 258L 114 258ZM 130 242L 146 242L 146 258L 130 258ZM 210 242L 226 242L 226 258L 210 258ZM 242 242L 258 242L 258 258L 242 258ZM 322 242L 338 242L 338 258L 322 258ZM 338 242L 354 242L 354 258L 338 258ZM 354 242L 370 242L 370 258L 354 258ZM 370 242L 386 242L 386 258L 370 258ZM 386 242L 402 242L 402 258L 386 258ZM 434 242L 450 242L 450 258L 434 258ZM 450 242L 466 242L 466 258L 450 258ZM 466 242L 482 242L 482 258L 466 258ZM 18 258L 34 258L 34 274L 18 274ZM 34 258L 50 258L 50 274L 34 274ZM 82 258L 98 258L 98 274L 82 274ZM 98 258L 114 258L 114 274L 98 274ZM 210 258L 226 258L 226 274L 210 274ZM 226 258L 242 258L 242 274L 226 274ZM 258 258L 274 258L 274 274L 258 274ZM 306 258L 322 258L 322 274L 306 274ZM 322 258L 338 258L 338 274L 322 274ZM 338 258L 354 258L 354 274L 338 274ZM 402 258L 418 258L 418 274L 402 274ZM 450 258L 466 258L 466 274L 450 274ZM 34 274L 50 274L 50 290L 34 290ZM 66 274L 82 274L 82 290L 66 290ZM 82 274L 98 274L 98 290L 82 290ZM 98 274L 114 274L 114 290L 98 290ZM 114 274L 130 274L 130 290L 114 290ZM 130 274L 146 274L 146 290L 130 290ZM 290 274L 306 274L 306 290L 290 290ZM 306 274L 322 274L 322 290L 306 290ZM 338 274L 354 274L 354 290L 338 290ZM 354 274L 370 274L 370 290L 354 290ZM 386 274L 402 274L 402 290L 386 290ZM 402 274L 418 274L 418 290L 402 290ZM 418 274L 434 274L 434 290L 418 290ZM 450 274L 466 274L 466 290L 450 290ZM 82 290L 98 290L 98 306L 82 306ZM 130 290L 146 290L 146 306L 130 306ZM 146 290L 162 290L 162 306L 146 306ZM 178 290L 194 290L 194 306L 178 306ZM 194 290L 210 290L 210 306L 194 306ZM 210 290L 226 290L 226 306L 210 306ZM 226 290L 242 290L 242 306L 226 306ZM 290 290L 306 290L 306 306L 290 306ZM 338 290L 354 290L 354 306L 338 306ZM 386 290L 402 290L 402 306L 386 306ZM 418 290L 434 290L 434 306L 418 306ZM 434 290L 450 290L 450 306L 434 306ZM 450 290L 466 290L 466 306L 450 306ZM 18 306L 34 306L 34 322L 18 322ZM 50 306L 66 306L 66 322L 50 322ZM 82 306L 98 306L 98 322L 82 322ZM 98 306L 114 306L 114 322L 98 322ZM 114 306L 130 306L 130 322L 114 322ZM 146 306L 162 306L 162 322L 146 322ZM 162 306L 178 306L 178 322L 162 322ZM 178 306L 194 306L 194 322L 178 322ZM 306 306L 322 306L 322 322L 306 322ZM 338 306L 354 306L 354 322L 338 322ZM 386 306L 402 306L 402 322L 386 322ZM 434 306L 450 306L 450 322L 434 322ZM 98 322L 114 322L 114 338L 98 338ZM 162 322L 178 322L 178 338L 162 338ZM 194 322L 210 322L 210 338L 194 338ZM 258 322L 274 322L 274 338L 258 338ZM 274 322L 290 322L 290 338L 274 338ZM 290 322L 306 322L 306 338L 290 338ZM 306 322L 322 322L 322 338L 306 338ZM 338 322L 354 322L 354 338L 338 338ZM 386 322L 402 322L 402 338L 386 338ZM 434 322L 450 322L 450 338L 434 338ZM 34 338L 50 338L 50 354L 34 354ZM 66 338L 82 338L 82 354L 66 354ZM 114 338L 130 338L 130 354L 114 354ZM 146 338L 162 338L 162 354L 146 354ZM 162 338L 178 338L 178 354L 162 354ZM 194 338L 210 338L 210 354L 194 354ZM 210 338L 226 338L 226 354L 210 354ZM 226 338L 242 338L 242 354L 226 354ZM 258 338L 274 338L 274 354L 258 354ZM 290 338L 306 338L 306 354L 290 354ZM 306 338L 322 338L 322 354L 306 354ZM 322 338L 338 338L 338 354L 322 354ZM 338 338L 354 338L 354 354L 338 354ZM 354 338L 370 338L 370 354L 354 354ZM 370 338L 386 338L 386 354L 370 354ZM 386 338L 402 338L 402 354L 386 354ZM 402 338L 418 338L 418 354L 402 354ZM 418 338L 434 338L 434 354L 418 354ZM 434 338L 450 338L 450 354L 434 354ZM 146 354L 162 354L 162 370L 146 370ZM 178 354L 194 354L 194 370L 178 370ZM 194 354L 210 354L 210 370L 194 370ZM 226 354L 242 354L 242 370L 226 370ZM 242 354L 258 354L 258 370L 242 370ZM 258 354L 274 354L 274 370L 258 370ZM 338 354L 354 354L 354 370L 338 370ZM 402 354L 418 354L 418 370L 402 370ZM 418 354L 434 354L 434 370L 418 370ZM 434 354L 450 354L 450 370L 434 370ZM 450 354L 466 354L 466 370L 450 370ZM 466 354L 482 354L 482 370L 466 370ZM 146 370L 162 370L 162 386L 146 386ZM 194 370L 210 370L 210 386L 194 386ZM 226 370L 242 370L 242 386L 226 386ZM 274 370L 290 370L 290 386L 274 386ZM 322 370L 338 370L 338 386L 322 386ZM 338 370L 354 370L 354 386L 338 386ZM 370 370L 386 370L 386 386L 370 386ZM 402 370L 418 370L 418 386L 402 386ZM 418 370L 434 370L 434 386L 418 386ZM 450 370L 466 370L 466 386L 450 386ZM 146 386L 162 386L 162 402L 146 402ZM 194 386L 210 386L 210 402L 194 402ZM 274 386L 290 386L 290 402L 274 402ZM 306 386L 322 386L 322 402L 306 402ZM 338 386L 354 386L 354 402L 338 402ZM 402 386L 418 386L 418 402L 402 402ZM 418 386L 434 386L 434 402L 418 402ZM 450 386L 466 386L 466 402L 450 402ZM 466 386L 482 386L 482 402L 466 402ZM 162 402L 178 402L 178 418L 162 418ZM 194 402L 210 402L 210 418L 194 418ZM 210 402L 226 402L 226 418L 210 418ZM 242 402L 258 402L 258 418L 242 418ZM 258 402L 274 402L 274 418L 258 418ZM 290 402L 306 402L 306 418L 290 418ZM 338 402L 354 402L 354 418L 338 418ZM 354 402L 370 402L 370 418L 354 418ZM 370 402L 386 402L 386 418L 370 418ZM 386 402L 402 402L 402 418L 386 418ZM 402 402L 418 402L 418 418L 402 418ZM 434 402L 450 402L 450 418L 434 418ZM 466 402L 482 402L 482 418L 466 418ZM 146 418L 162 418L 162 434L 146 434ZM 162 418L 178 418L 178 434L 162 434ZM 178 418L 194 418L 194 434L 178 434ZM 210 418L 226 418L 226 434L 210 434ZM 226 418L 242 418L 242 434L 226 434ZM 242 418L 258 418L 258 434L 242 434ZM 274 418L 290 418L 290 434L 274 434ZM 290 418L 306 418L 306 434L 290 434ZM 306 418L 322 418L 322 434L 306 434ZM 338 418L 354 418L 354 434L 338 434ZM 386 418L 402 418L 402 434L 386 434ZM 402 418L 418 418L 418 434L 402 434ZM 418 418L 434 418L 434 434L 418 434ZM 450 418L 466 418L 466 434L 450 434ZM 146 434L 162 434L 162 450L 146 450ZM 242 434L 258 434L 258 450L 242 450ZM 258 434L 274 434L 274 450L 258 450ZM 274 434L 290 434L 290 450L 274 450ZM 322 434L 338 434L 338 450L 322 450ZM 386 434L 402 434L 402 450L 386 450ZM 434 434L 450 434L 450 450L 434 450ZM 466 434L 482 434L 482 450L 466 450ZM 162 450L 178 450L 178 466L 162 466ZM 194 450L 210 450L 210 466L 194 466ZM 274 450L 290 450L 290 466L 274 466ZM 306 450L 322 450L 322 466L 306 466ZM 322 450L 338 450L 338 466L 322 466ZM 338 450L 354 450L 354 466L 338 466ZM 370 450L 386 450L 386 466L 370 466ZM 386 450L 402 450L 402 466L 386 466ZM 418 450L 434 450L 434 466L 418 466ZM 450 450L 466 450L 466 466L 450 466ZM 146 466L 162 466L 162 482L 146 482ZM 210 466L 226 466L 226 482L 210 482ZM 242 466L 258 466L 258 482L 242 482ZM 258 466L 274 466L 274 482L 258 482ZM 290 466L 306 466L 306 482L 290 482ZM 322 466L 338 466L 338 482L 322 482ZM 338 466L 354 466L 354 482L 338 482ZM 370 466L 386 466L 386 482L 370 482ZM 386 466L 402 466L 402 482L 386 482ZM 418 466L 434 466L 434 482L 418 482ZM 450 466L 466 466L 466 482L 450 482Z"></path></clipPath><clipPath id="qr-clip-path-corners-square-color-0-0-18"><path clip-rule="evenodd" d="M 18 18v 112h 112v -112zM 34 34h 80v 80h -80z" transform="rotate(0,74,74)"></path>
                                    </clipPath>
                                    <clipPath id="qr-clip-path-corners-dot-color-0-0-18">
                                        <rect x="50" y="50" width="48" height="48" transform="rotate(0,74,74)"></rect>
                                    </clipPath>
                                    <clipPath id="qr-clip-path-corners-square-color-1-0-18">
                                        <path clip-rule="evenodd" d="M 370 18v 112h 112v -112zM 386 34h 80v 80h -80z" transform="rotate(90,426,74)"></path>
                                    </clipPath>
                                    <clipPath id="qr-clip-path-corners-dot-color-1-0-18">
                                        <rect x="402" y="50" width="48" height="48" transform="rotate(90,426,74)"></rect>
                                    </clipPath>
                                    <clipPath id="qr-clip-path-corners-square-color-0-1-18">
                                        <path clip-rule="evenodd" d="M 18 370v 112h 112v -112zM 34 386h 80v 80h -80z" transform="rotate(-90,74,426)"></path>
                                    </clipPath>
                                    <clipPath id="qr-clip-path-corners-dot-color-0-1-18">
                                        <rect x="50" y="402" width="48" height="48" transform="rotate(-90,74,426)"></rect>
                                    </clipPath>
                                </defs>
                                <rect x="0" y="0" height="500" width="500" clip-path="url('#qr-clip-path-background-color-18')" fill="#FFFFFF"></rect>
                                <rect x="0" y="0" height="500" width="500" clip-path="url('#qr-clip-path-dot-color-18')" fill="#000000"></rect>
                                <rect x="18" y="18" height="112" width="112" clip-path="url('#qr-clip-path-corners-square-color-0-0-18')" fill="#000000"></rect>
                                <rect x="50" y="50" height="48" width="48" clip-path="url('#qr-clip-path-corners-dot-color-0-0-18')" fill="#000000"></rect>
                                <rect x="370" y="18" height="112" width="112" clip-path="url('#qr-clip-path-corners-square-color-1-0-18')" fill="#000000"></rect>
                                <rect x="402" y="50" height="48" width="48" clip-path="url('#qr-clip-path-corners-dot-color-1-0-18')" fill="#000000"></rect>
                                <rect x="18" y="370" height="112" width="112" clip-path="url('#qr-clip-path-corners-square-color-0-1-18')" fill="#000000"></rect>
                                <rect x="50" y="402" height="48" width="48" clip-path="url('#qr-clip-path-corners-dot-color-0-1-18')" fill="#000000"></rect>
                            </svg>
                        </div>
                        <div className="text-xs font-mono font-bold text-slate-700 bg-slate-100 py-1.5 rounded-lg">
                            {currentCustomer.code}
                        </div>
                        <button onClick={() => setShowQrModal(false)} className="w-full py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs">
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}