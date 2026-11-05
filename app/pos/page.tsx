'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  QrCode, User, Barcode, PlusCircle, ShoppingBag, Box, Trash2, 
  MapPin, CheckCircle2, Leaf, Globe, LogOut, Edit3, ListFilter
} from 'lucide-react';
import { saveNewTransaction } from '@/libs/store';

interface CatalogItem {
  id: string;
  code: string;
  name: string;
  price: number;
  isEco: boolean;
  ecoPoints: number;
  plasticSaved: number;
}

interface CartItem {
  product: CatalogItem;
  qty: number;
}

const CATALOG_PRODUCTS: CatalogItem[] = [
  { id: 'ECO_STRAW', code: 'ECO-OHT-01', name: 'Ống hút tre cao cấp (Bộ 5 ống)', price: 25000, isEco: true, ecoPoints: 5, plasticSaved: 0.03 },
  { id: 'ECO_BOTTLE', code: 'ECO-BNT-02', name: 'Bình nước tái sử dụng Eco-Bottle 750ml', price: 120000, isEco: true, ecoPoints: 5, plasticSaved: 0.12 },
  { id: 'ECO_BAG_TRASH', code: 'ECO-TRT-03', name: 'Túi rác tự phân hủy sinh học (Cuộn 1kg)', price: 35000, isEco: true, ecoPoints: 5, plasticSaved: 0.05 },
  { id: 'ECO_DISH', code: 'ECO-NRC-04', name: 'Nước rửa chén sinh học Hữu cơ 800ml', price: 65000, isEco: true, ecoPoints: 5, plasticSaved: 0.08 },
  { id: 'ECO_TRAY', code: 'ECO-KBM-05', name: 'Khay thực phẩm bã mía sinh học (Hộp 10 khay)', price: 45000, isEco: true, ecoPoints: 5, plasticSaved: 0.06 },
  { id: 'ECO_APPLE', code: 'ECO-TAO-06', name: 'Táo Envy AEON Eco Organic 1kg', price: 55000, isEco: true, ecoPoints: 5, plasticSaved: 0.02 },
  { id: 'STD_MILK', code: 'STD-SUA-07', name: 'Sữa tươi tiệt trùng AEON TopValu 1L', price: 32000, isEco: false, ecoPoints: 0, plasticSaved: 0.00 },
  { id: 'STD_BREAD', code: 'STD-BMT-08', name: 'Bánh mì Baguette AEON Bakery', price: 18000, isEco: false, ecoPoints: 0, plasticSaved: 0.00 }
];

const PRESET_CUSTOMERS = [
  { id: 'CUST1', name: 'Nguyễn Văn A', code: 'AEON-889922', points: 1250, noBagCount: 12 },
  { id: 'CUST2', name: 'Trần Thị B', code: 'AEON-112233', points: 450, noBagCount: 5 },
];

export default function PosPage() {
  const router = useRouter();

  // State Khách hàng
  const [memberCode, setMemberCode] = useState('');
  const [memberName, setMemberName] = useState('');
  const [activeCustomer, setActiveCustomer] = useState({
    name: 'Khách chưa nhập tên',
    code: 'CHƯA CÓ MÃ KH',
    points: 0,
    noBagCount: 0
  });

  // State Form Sản phẩm
  const [selectedProdId, setSelectedProdId] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState<number | ''>('');
  const [customQty, setCustomQty] = useState<number | ''>('');
  const [isEcoCheck, setIsEcoCheck] = useState<boolean>(true);

  // State Tùy chọn Eco & Giỏ hàng
  const [noBag, setNoBag] = useState(false);
  const [containerCheck, setContainerCheck] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [location, setLocation] = useState('AEON Mall Tân Phú Celadon');

  // Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastTxInfo, setLastTxInfo] = useState<any>(null);

  // Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/');
  };

  // Đổi khách hàng chọn sẵn
  const handleSelectPresetCustomer = (custVal: string) => {
    if (custVal === 'CUSTOM' || !custVal) {
      setMemberCode('');
      setMemberName('');
      setActiveCustomer({
        name: 'Khách chưa nhập tên',
        code: 'CHƯA CÓ MÃ KH',
        points: 0,
        noBagCount: 0
      });
      return;
    }
    const found = PRESET_CUSTOMERS.find(c => c.id === custVal);
    if (found) {
      setMemberCode(found.code);
      setMemberName(found.name);
      setActiveCustomer({
        name: found.name,
        code: found.code,
        points: found.points,
        noBagCount: found.noBagCount
      });
    }
  };

  // Tự động điền sản phẩm
  const handleSelectPresetProduct = (prodId: string) => {
    setSelectedProdId(prodId);
    const item = CATALOG_PRODUCTS.find(p => p.id === prodId);
    if (item) {
      setCustomCode(item.code);
      setCustomName(item.name);
      setCustomPrice(item.price);
      setIsEcoCheck(item.isEco);
      setCustomQty(1);
    }
  };

  // Thêm vào giỏ
  const handleAddToCart = () => {
    if (!customName) {
      alert("Vui lòng chọn hoặc nhập tên sản phẩm!");
      return;
    }
    const priceVal = Number(customPrice) || 0;
    const qtyVal = Number(customQty) || 1;

    const newItem: CatalogItem = {
      id: 'PROD_' + Date.now(),
      code: customCode || 'SP-CUSTOM',
      name: customName,
      price: priceVal,
      isEco: isEcoCheck,
      ecoPoints: isEcoCheck ? 5 : 0,
      plasticSaved: isEcoCheck ? 0.05 : 0
    };

    setCart(prev => {
      const idx = prev.findIndex(i => i.product.name.toLowerCase() === customName.toLowerCase() && i.product.isEco === isEcoCheck);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].qty += qtyVal;
        return updated;
      }
      return [...prev, { product: newItem, qty: qtyVal }];
    });
  };

  const handleCheckout = () => {
    if (cart.length === 0 && !noBag && !containerCheck) {
      alert("Vui lòng chọn sản phẩm vào giỏ hàng hoặc tick chọn hành vi tiêu dùng xanh!");
      return;
    }
  
    const txCode = 'HD-' + Math.floor(80000 + Math.random() * 10000);
    const custCode = activeCustomer.code !== 'CHƯA CÓ MÃ KH' ? activeCustomer.code : 'AEON-889922';
  
    // Lưu và phát sự kiện đồng bộ toàn hệ thống
    saveNewTransaction({
      id: txCode,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - Hôm nay',
      mall: location,
      customerCode: custCode,
      customerName: activeCustomer.name,
      actionsDetail: noBag ? 'Không túi nilon (+10pt)' : 'Mua hàng tiêu chuẩn',
      plasticSaved: plasticSaved,
      ecoPointsEarned: grandTotalPts,
      subtotal: subtotal,
    });
  
    setShowSuccessModal(true);
    setCart([]);
    setNoBag(false);
    setContainerCheck(false);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  // Tính toán số liệu
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const standardPoints = Math.floor(subtotal / 10000);
  const ecoProductPts = cart.reduce((sum, item) => sum + (item.product.isEco ? item.qty * 5 : 0), 0);
  const ecoBehaviorPts = (noBag ? 10 : 0) + (containerCheck ? 10 : 0);
  const totalEcoPts = ecoProductPts + ecoBehaviorPts;
  const grandTotalPts = standardPoints + totalEcoPts;

  let plasticSaved = cart.reduce((sum, item) => sum + (item.product.isEco ? item.qty * item.product.plasticSaved : 0), 0);
  if (noBag) plasticSaved += 0.02;
  if (containerCheck) plasticSaved += 0.05;
  const co2Saved = plasticSaved * 2.5;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-100 font-sans text-slate-800 overflow-hidden">
      
      {/* CỘT TRÁI: QUẢN LÝ THÔNG TIN KHÁCH HÀNG & CHỌN SẢN PHẨM */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 md:p-6 bg-slate-50 border-r border-slate-200 space-y-4">
        
        {/* 1. THÔNG TIN KHÁCH HÀNG THÀNH VIÊN */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#ad1982]" /> 1. THÔNG TIN KHÁCH HÀNG THÀNH VIÊN
            </h2>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <Edit3 className="w-3 h-3" /> Nhập Tay Hoặc Chọn Mẫu
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-4">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">MÃ THÀNH VIÊN</label>
              <div className="relative">
                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Mã KH (VD: AEON-889922)"
                  value={memberCode}
                  onChange={e => {
                    setMemberCode(e.target.value);
                    setActiveCustomer(prev => ({ ...prev, code: e.target.value || 'CHƯA CÓ MÃ KH' }));
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-4">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">TÊN KHÁCH HÀNG</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Họ và tên khách hàng..."
                  value={memberName}
                  onChange={e => {
                    setMemberName(e.target.value);
                    setActiveCustomer(prev => ({ ...prev, name: e.target.value || 'Khách chưa nhập tên' }));
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-4">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">MENU CHỌN KHÁCH HÀNG SỔ XUỐNG</label>
              <select
                onChange={e => handleSelectPresetCustomer(e.target.value)}
                className="w-full bg-white border border-slate-300 text-xs font-bold text-slate-700 rounded-xl p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="CUSTOM">-- Tự nhập tay thông tin KH --</option>
                {PRESET_CUSTOMERS.map(c => (
                  <option key={c.id} value={c.id}>{c.code} - {c.name} ({c.points}pt)</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Member Dark Card */}
          <div className="p-3 bg-[#1e2330] text-white rounded-xl flex items-center justify-between text-xs mt-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full border border-emerald-400 bg-slate-700 flex items-center justify-center font-bold text-white text-xs">
                {activeCustomer.name.charAt(0)}
              </div>
              <div>
                <div className="font-extrabold text-white">{activeCustomer.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{activeCustomer.code}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-extrabold text-amber-400 text-sm">{activeCustomer.points} Eco-Point</div>
              <div className="text-[10px] text-emerald-400 font-semibold">Tự mang túi {activeCustomer.noBagCount} lần</div>
            </div>
          </div>
        </div>

        {/* 2. CHỌN HOẶC NHẬP SẢN PHẨM SINH HỌC / TIÊU CHUẨN */}
        <div className="space-y-4 flex-1 flex flex-col">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" /> 2. CHỌN HOẶC NHẬP SẢN PHẨM SINH HỌC / TIÊU CHUẨN
            </h2>
            <span className="text-xs text-slate-500 font-medium">Sp Sinh học: +5 pt | Hành vi xanh: +10 pt</span>
          </div>

          {/* Form thêm sản phẩm */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-emerald-800 uppercase mb-1 flex items-center gap-1">
                <ListFilter className="w-3.5 h-3.5 text-emerald-600" /> DANH MỤC SẢN PHẨM SỔ XUỐNG (TỰ ĐỘNG ĐIỀN GIÁ & MÃ)
              </label>
              <select
                value={selectedProdId}
                onChange={e => handleSelectPresetProduct(e.target.value)}
                className="w-full bg-emerald-50/60 border border-emerald-300 text-xs font-extrabold text-slate-800 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">-- Chọn sản phẩm có sẵn từ menu --</option>
                {CATALOG_PRODUCTS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.isEco ? '🌱 [Sinh Học]' : '📦 [Tiêu Chuẩn]'} {p.name} ({p.code}) - {p.price.toLocaleString()}đ
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">MÃ SẢN PHẨM</label>
                <input
                  type="text"
                  placeholder="Mã SP..."
                  value={customCode}
                  onChange={e => setCustomCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-800 rounded-xl p-2 outline-none"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">TÊN SẢN PHẨM</label>
                <input
                  type="text"
                  placeholder="Tên sản phẩm..."
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 rounded-xl p-2 outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">ĐƠN GIÁ (VNĐ)</label>
                <input
                  type="number"
                  placeholder="Nhập đơn giá..."
                  value={customPrice}
                  onChange={e => setCustomPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 rounded-xl p-2 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">SỐ LƯỢNG</label>
                <input
                  type="number"
                  placeholder=""
                  min={1}
                  value={customQty}
                  onChange={e => setCustomQty(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 rounded-xl p-2 outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <label className="inline-flex items-center cursor-pointer gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <input
                  type="checkbox"
                  checked={isEcoCheck}
                  onChange={e => setIsEcoCheck(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="text-xs font-extrabold text-emerald-800 flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" /> Nhãn Sản Phẩm Sinh Học Thưởng Eco (+5 pt/món)
                </span>
              </label>

              <button
                onClick={handleAddToCart}
                className="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" /> Thêm Vào Giỏ Hàng
              </button>
            </div>
          </div>

          {/* 2 Tùy chọn Eco (Switch Toggle Button) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-emerald-50/80 p-3 rounded-2xl border-2 border-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-emerald-950">Không Lấy Túi Nilon</h3>
                  <p className="text-[10px] text-emerald-700">Tự mang túi vải cá nhân</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={noBag}
                  onChange={e => setNoBag(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-1.5 text-xs font-extrabold text-emerald-800">+10pt</span>
              </label>
            </div>

            <div className="bg-emerald-50/80 p-3 rounded-2xl border-2 border-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
                  <Box className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-emerald-950">Mang Hộp / Ly Cá Nhân</h3>
                  <p className="text-[10px] text-emerald-700">Đựng thức ăn/đồ uống</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={containerCheck}
                  onChange={e => setContainerCheck(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                <span className="ml-1.5 text-xs font-extrabold text-teal-800">+10pt</span>
              </label>
            </div>
          </div>

          {/* Bảng Giỏ hàng thu ngân */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[160px]">
            <div className="p-3 bg-slate-100 border-b border-slate-200 font-bold text-xs text-slate-700 flex justify-between items-center">
              <span>Giỏ hàng thu ngân ({cart.reduce((a, b) => a + b.qty, 0)} món)</span>
              <button onClick={() => setCart([])} className="text-[11px] text-red-500 hover:underline">
                Xóa giỏ hàng
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-400 border-b text-[10px] uppercase font-bold">
                    <th className="p-2">SẢN PHẨM</th>
                    <th className="p-2 text-center">ĐƠN GIÁ</th>
                    <th className="p-2 text-center">SỐ LƯỢNG</th>
                    <th className="p-2 text-center">ECO PT</th>
                    <th className="p-2 text-right">THÀNH TIỀN</th>
                    <th className="p-2 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400 italic">
                        Giỏ hàng rỗng. Hãy chọn sản phẩm ở menu trên và bấm Thêm.
                      </td>
                    </tr>
                  ) : (
                    cart.map(i => (
                      <tr key={i.product.id} className="hover:bg-slate-50 transition">
                        <td className="p-2">
                          <div className="font-bold text-slate-900 text-xs">{i.product.name}</div>
                          <div className="text-[9px] text-slate-400 font-mono">{i.product.code}</div>
                        </td>
                        <td className="p-2 text-center text-slate-600 text-xs">{i.product.price.toLocaleString()}đ</td>
                        <td className="p-2 text-center">
                          <div className="inline-flex items-center bg-slate-100 rounded-lg p-0.5 border">
                            <button onClick={() => updateCartQty(i.product.id, -1)} className="w-4 h-4 bg-white rounded font-bold hover:bg-slate-200 text-slate-700 text-[10px]">-</button>
                            <span className="w-5 text-center font-bold text-emerald-700 text-xs">{i.qty}</span>
                            <button onClick={() => updateCartQty(i.product.id, 1)} className="w-4 h-4 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700 text-[10px]">+</button>
                          </div>
                        </td>
                        <td className="p-2 text-center font-bold text-xs text-amber-500">
                          {i.product.isEco ? `+${i.qty * 5} pt` : '0 pt'}
                        </td>
                        <td className="p-2 text-right font-bold text-slate-900 text-xs">{(i.product.price * i.qty).toLocaleString()}đ</td>
                        <td className="p-2 text-center">
                          <button onClick={() => updateCartQty(i.product.id, -i.qty)} className="text-slate-400 hover:text-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* CỘT PHẢI: HÓA ĐƠN THU NGÂN & NÚT ĐĂNG XUẤT */}
      <div className="w-full lg:w-[380px] bg-white flex flex-col h-full border-l border-slate-200 shrink-0 shadow-2xl">
        
        {/* Header Hóa đơn & Nút Đăng xuất */}
        <div className="p-4 bg-[#1e2330] text-white shrink-0 border-b border-slate-800">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">HÓA ĐƠN THU NGÂN AEON</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-amber-400">HD-88492</span>
              {/* NÚT ĐĂNG XUẤT */}
              <button
                onClick={handleLogout}
                title="Đăng xuất tài khoản"
                className="p-1 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white transition flex items-center justify-center"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#ad1982]" /> {location}
            </span>
            <select
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="bg-slate-800 text-white border border-slate-700 rounded-lg text-[10px] p-1 font-bold"
            >
              <option value="AEON Mall Tân Phú Celadon">Tân Phú</option>
              <option value="AEON Mall Bình Tân">Bình Tân</option>
              <option value="AEON Mall Long Biên">Long Biên</option>
            </select>
          </div>
        </div>

        {/* Nội dung Tóm tắt Hóa đơn */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Tổng tiền hàng:</span>
              <span className="font-bold text-slate-900">{subtotal.toLocaleString()} đ</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Thưởng hành vi xanh:</span>
              <span className="font-bold text-emerald-600">+{ecoBehaviorPts} pt</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex justify-between items-center">
              <span>CHI TIẾT ĐIỂM ECO TÍCH LŨY:</span>
              <span className="text-emerald-600 text-[11px]">{totalEcoPts} PT THƯỞNG</span>
            </h4>

            <div className="space-y-2">
              {totalEcoPts === 0 ? (
                <div className="p-3 text-center bg-slate-50 border border-dashed rounded-xl text-xs text-slate-400">
                  Chưa có thưởng Eco-Point nào
                </div>
              ) : (
                <>
                  {noBag && (
                    <div className="flex justify-between items-center text-xs bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      <span className="font-bold text-emerald-900 flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" /> Không lấy túi nilon
                      </span>
                      <span className="font-bold text-emerald-700">+10 pt</span>
                    </div>
                  )}
                  {containerCheck && (
                    <div className="flex justify-between items-center text-xs bg-teal-50 p-2 rounded-lg border border-teal-200">
                      <span className="font-bold text-teal-900 flex items-center gap-1">
                        <Box className="w-3.5 h-3.5 text-teal-600" /> Mang hộp/ly cá nhân
                      </span>
                      <span className="font-bold text-teal-700">+10 pt</span>
                    </div>
                  )}
                  {cart.map(i => i.product.isEco && (
                    <div key={i.product.id} className="flex justify-between items-center text-xs bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      <span className="font-bold text-emerald-900 flex items-center gap-1">
                        <Leaf className="w-3.5 h-3.5 text-emerald-600" /> {i.product.name} (x{i.qty})
                      </span>
                      <span className="font-bold text-emerald-700">+{i.qty * 5} pt</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Badge Tác động Môi trường */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-3.5 rounded-xl shadow-md space-y-1.5">
            <div className="text-[11px] uppercase font-bold text-emerald-100 flex items-center justify-between">
              <span>TÁC ĐỘNG MÔI TRƯỜNG ĐƠN HÀNG</span>
              <Globe className="w-4 h-4 text-emerald-200" />
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs">Lượng nhựa giảm thải:</span>
              <span className="text-lg font-black text-amber-300">{plasticSaved.toFixed(2)} kg</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs">Giảm phát thải CO2 tương đương:</span>
              <span className="text-xs font-bold text-white">{co2Saved.toFixed(2)} kg CO2</span>
            </div>
          </div>
        </div>

        {/* Nút Thanh toán Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 space-y-3">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Điểm tiêu chuẩn (10k = 1 pt):</span>
              <span className="font-bold text-slate-700">+{standardPoints} pt</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold bg-emerald-100/70 p-2 rounded-lg border border-emerald-200">
              <span className="flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-emerald-600" /> Eco-Point Xanh Thưởng:
              </span>
              <span className="text-sm font-extrabold text-emerald-700">+{totalEcoPts} pt</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>TỔNG ECO-POINT NHẬN:</span>
              <span className="text-[#ad1982] font-black text-lg">+{grandTotalPts} pt</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 text-sm transition"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>THANH TOÁN & GHI NHẬN ĐIỂM</span>
          </button>
        </div>

      </div>

      {/* Modal Thông báo thành công */}
      {showSuccessModal && lastTxInfo && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 text-center space-y-4 shadow-2xl border border-slate-100">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
              <Leaf className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Ghi Nhận Hành Vi Xanh Thành Công!</h3>
              <p className="text-xs text-slate-500 mt-1">Đã cộng Eco-Point & đồng bộ dữ liệu Realtime lên App & Dashboard</p>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl text-left text-xs text-slate-700 space-y-1">
              <div className="flex justify-between font-bold border-b pb-1">
                <span>Khách hàng:</span>
                <span className="text-slate-900">{lastTxInfo.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Mã hóa đơn:</span>
                <span className="font-mono font-bold">{lastTxInfo.id}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t">
                <span>Lượng nhựa giảm:</span>
                <span>+{lastTxInfo.plasticSaved.toFixed(2)} kg</span>
              </div>
              <div className="flex justify-between text-[#ad1982] font-black text-sm pt-1 border-t">
                <span>Tổng Eco-Point cộng:</span>
                <span>+{lastTxInfo.totalPts} pt</span>
              </div>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg transition text-xs"
            >
              Hoàn Tất & Tiếp Tục Thu Ngân
            </button>
          </div>
        </div>
      )}

    </div>
  );
}