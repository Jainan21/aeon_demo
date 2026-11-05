'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PieChart as PieChartIcon, Recycle, Coins, Receipt, Users, 
  TrendingUp, FileSpreadsheet, Store, Filter, LogOut 
} from 'lucide-react';

import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, 
  LineElement, Title, Tooltip, Legend, ArcElement
);

interface Transaction {
  id: string;
  time: string;
  mall: string;
  customerName: string;
  actionsDetail: string;
  plasticSaved: number;
  ecoPointsEarned: number;
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  { 
    id: 'HD-88490', 
    time: '14:20 - Hôm nay', 
    mall: 'AEON Mall Tân Phú Celadon', 
    customerName: 'Nguyễn Văn A', 
    actionsDetail: 'Không túi nilon (+10pt), Ống hút tre x1 (+5pt)', 
    plasticSaved: 0.05, 
    ecoPointsEarned: 15 
  },
  { 
    id: 'HD-88489', 
    time: '12:15 - Hôm nay', 
    mall: 'AEON Mall Bình Tân', 
    customerName: 'Trần Thị B', 
    actionsDetail: 'Nước rửa chén sinh học x2 (+10pt)', 
    plasticSaved: 0.16, 
    ecoPointsEarned: 10 
  }
];

export default function DashboardPage() {
  const router = useRouter();

  // State Bộ lọc & Dữ liệu
  const [mallFilter, setMallFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [transactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  // Xử lý Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/');
  };

  // Lọc dữ liệu bảng
  const filteredTransactions = transactions.filter(t => {
    if (mallFilter !== 'ALL' && t.mall !== mallFilter) return false;
    if (actionFilter === 'noBag' && !t.actionsDetail.includes('Không túi nilon')) return false;
    if (actionFilter === 'bringContainer' && !t.actionsDetail.includes('Hộp/ly cá nhân')) return false;
    if (actionFilter === 'ecoLabelItem' && !t.actionsDetail.includes('+5pt')) return false;
    return true;
  });

  const totalPlastic = transactions.reduce((a, b) => a + b.plasticSaved, 0) + 128.4;
  const totalPoints = transactions.reduce((a, b) => a + b.ecoPointsEarned, 0) + 45210;

  // Dữ liệu biểu đồ Line Chart
  const lineChartData = {
    labels: ['Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10 (Hôm nay)'],
    datasets: [{
      label: 'Lượng Nhựa Giảm Thải (Kg)',
      data: [45.2, 62.8, 85.0, 98.4, 112.5, totalPlastic],
      borderColor: '#009a44',
      backgroundColor: 'rgba(0, 154, 68, 0.1)',
      fill: true,
      tension: 0.35,
      borderWidth: 3,
      pointBackgroundColor: '#009a44'
    }]
  };

  // Dữ liệu biểu đồ Doughnut Chart
  const doughnutData = {
    labels: ['Không lấy túi nilon', 'Sản phẩm sinh học', 'Mang hộp/ly cá nhân'],
    datasets: [{
      data: [52, 31, 17],
      backgroundColor: ['#009a44', '#14b8a6', '#ad1982'],
      borderWidth: 0
    }]
  };

  // Xuất file CSV
  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Ma_Hoa_Don,Thoi_Gian,TTTM_AEON,Khach_Hang,Hanh_Vi_Xanh,Nhua_Giam_Kg,Eco_Point\n";
    transactions.forEach(t => {
      csvContent += `${t.id},"${t.time}","${t.mall}","${t.customerName}","${t.actionsDetail}",${t.plasticSaved.toFixed(2)},${t.ecoPointsEarned}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AEON_ESG_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 font-sans text-slate-800 space-y-6">
      
      {/* CONTROL BAR PHÍA TRÊN */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold flex items-center gap-2 text-slate-900">
            <PieChartIcon className="w-5 h-5 text-emerald-600" /> Báo Cáo Tiêu Dùng Bền Vững & ESG AEON Mall
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Theo dõi chỉ số giảm rác thải nhựa, điểm thưởng Eco & xu hướng tiêu dùng toàn hệ thống</p>
        </div>

        {/* Cụm Bộ lọc & Nút bấm */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          
          {/* Lọc TTTM AEON */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <Store className="w-4 h-4 text-slate-400 ml-1" />
            <select 
              value={mallFilter} 
              onChange={e => setMallFilter(e.target.value)} 
              className="bg-transparent pr-2 py-1 outline-none text-slate-700"
            >
              <option value="ALL">Tất cả TTTM AEON</option>
              <option value="AEON Mall Tân Phú Celadon">AEON Tân Phú Celadon</option>
              <option value="AEON Mall Bình Tân">AEON Bình Tân</option>
              <option value="AEON Mall Long Biên">AEON Long Biên</option>
              <option value="AEON Mall Hà Đông">AEON Hà Đông</option>
              <option value="AEON Mall Hải Phòng">AEON Hải Phòng</option>
            </select>
          </div>

          {/* Lọc Loại Hành Vi */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <Filter className="w-4 h-4 text-slate-400 ml-1" />
            <select 
              value={actionFilter} 
              onChange={e => setActionFilter(e.target.value)} 
              className="bg-transparent pr-2 py-1 outline-none text-slate-700"
            >
              <option value="ALL">Tất cả Loại Hành Vi</option>
              <option value="noBag">Không lấy túi nilon</option>
              <option value="bringContainer">Dùng hộp/ly cá nhân</option>
              <option value="ecoLabelItem">Mua sp Sinh học</option>
            </select>
          </div>

          {/* Nút Xuất CSV */}
          <button 
            onClick={exportCSV} 
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow flex items-center gap-1.5 text-xs transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Xuất File Báo Cáo (CSV)
          </button>

          {/* NÚT ĐĂNG XUẤT (LOGOUT) */}
          <button 
            onClick={handleLogout}
            title="Đăng xuất tài khoản"
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow flex items-center gap-1.5 text-xs transition active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>

        </div>
      </div>

      {/* KPI CARDS THỐNG KÊ HÀNG TRÊN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">LƯỢNG NHỰA GIẢM THẢI</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{totalPlastic.toFixed(1)} kg</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Recycle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Tương đương ~{Math.round(totalPlastic * 50).toLocaleString()} túi nilon
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">TỔNG ECO-POINT CẤP</p>
              <h3 className="text-2xl font-black text-amber-500 mt-1">{totalPoints.toLocaleString()} pt</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl">
              <Coins className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-3 text-[11px] font-medium text-slate-500">Cộng điểm thưởng tự động từ POS</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">GIAO DỊCH XANH GHI NHẬN</p>
              <h3 className="text-2xl font-black text-teal-600 mt-1">{transactions.length + 198} đơn</h3>
            </div>
            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
              <Receipt className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-3 text-[11px] font-bold text-teal-600">Realtime đồng bộ từ POS</p>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">THÀNH VIÊN THAM GIA</p>
              <h3 className="text-2xl font-black text-[#ad1982] mt-1">1,840 người</h3>
            </div>
            <div className="p-3 bg-fuchsia-50 text-[#ad1982] rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-3 text-[11px] font-medium text-slate-500">Tỷ lệ khách hàng xanh đạt 38.5%</p>
        </div>

      </div>

      {/* KHU VỰC BIỂU ĐỒ CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-emerald-600" /> Xu Hướng Giảm Rác Thải Nhựa Theo Thời Gian (Kg)
            </h3>
            <span className="text-xs font-semibold text-slate-400">Tự động cập nhật</span>
          </div>
          <div className="h-64 relative">
            <Line 
              data={lineChartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } } 
              }} 
            />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-[#ad1982]" /> Cơ Cấu Các Hành Vi Xanh Realtime
          </h3>
          <div className="h-64 relative">
            <Doughnut 
              data={doughnutData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } } 
              }} 
            />
          </div>
        </div>

      </div>

      {/* BẢNG NHẬT KÝ GIAO DỊCH REALTIME */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Nhật Ký Ghi Nhận Tiêu Dùng Xanh Real-time
          </h3>
          <span className="text-xs text-slate-400 font-medium">Cập nhật ngay lập tức từ POS</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider">
                <th className="p-3">MÃ HÓA ĐƠN</th>
                <th className="p-3">THỜI GIAN</th>
                <th className="p-3">TTTM AEON</th>
                <th className="p-3">KHÁCH HÀNG</th>
                <th className="p-3">CHI TIẾT HÀNH VI XANH</th>
                <th className="p-3 text-right">NHỰA GIẢM (KG)</th>
                <th className="p-3 text-right">ECO-POINT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTransactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono font-bold text-slate-800">{t.id}</td>
                  <td className="p-3 text-slate-500">{t.time}</td>
                  <td className="p-3 font-semibold text-slate-700">{t.mall}</td>
                  <td className="p-3 font-bold text-slate-900">{t.customerName}</td>
                  <td className="p-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      {t.actionsDetail}
                    </span>
                  </td>
                  <td className="p-3 text-right font-black text-emerald-600">+{t.plasticSaved.toFixed(2)} kg</td>
                  <td className="p-3 text-right font-black text-amber-500">+{t.ecoPointsEarned} pt</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}