'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, AlertCircle, Sparkles, Smartphone, LayoutDashboard } from 'lucide-react';
import { MOCK_USERS, UserAccount } from '@/libs/userData';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setUsername('');
        setPassword('');
        setIsLoading(false);
    }, [])

  // Xử lý Đăng nhập chính
  const handleLogin = (userToLogin?: UserAccount) => {
    setError('');
    setIsLoading(true);

    const inputUser = userToLogin?.username || username.trim();
    const inputPass = userToLogin?.password || password.trim();

    setTimeout(() => {
      // Tìm tài khoản phù hợp trong Mockup Data
      const foundUser = MOCK_USERS.find(
        (u) => u.username.toLowerCase() === inputUser.toLowerCase() && u.password === inputPass
      );

      if (foundUser) {
        // Lưu thông tin user đăng nhập vào localStorage / Session
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        
        // Điều hướng đến giao diện tương ứng
        router.push(foundUser.redirectUrl);
      } else {
        setError('Tài khoản hoặc mật khẩu không chính xác!');
        setIsLoading(false);
      }
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };


  return (
    <div className="min-h-screen w-full bg-[#1e2330] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-105 bg-white rounded-[28px] p-8 shadow-2xl flex flex-col items-center relative overflow-hidden">
        
        {/* Logo AEON */}
        <div className="w-20 h-20 bg-[#ad1982] rounded-[22px] flex items-center justify-center shadow-lg shadow-pink-900/30 mb-4">
          <span className="text-white font-extrabold text-2xl tracking-tighter italic">
            AEON
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-[#1b233a] mb-1 text-center">
          AEON Việt Nam
        </h1>
        <p className="text-slate-500 text-xs mb-6 text-center">
          Vui lòng đăng nhập tài khoản hệ thống
        </p>

        {/* Thông báo lỗi (nếu có) */}
        {error && (
          <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Đăng Nhập */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          
          {/* Ô Tài Khoản */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-[#2b354f]">
              Tài khoản
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Nhập pos, app hoặc admin..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          {/* Ô Mật Khẩu */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-[#2b354f]">
              Mật khẩu
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="password"
                placeholder="Nhập 123..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          {/* Nút Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#009b66] hover:bg-[#008658] active:scale-[0.99] text-white font-bold py-3 rounded-xl text-xs tracking-wider uppercase shadow-lg shadow-emerald-900/20 transition-all mt-2 disabled:opacity-50"
          >
            {isLoading ? 'ĐĂNG NHẬP...' : 'ĐĂNG NHẬP HỆ THỐNG'}
          </button>
        </form>
      </div>
    </div>
  );
}