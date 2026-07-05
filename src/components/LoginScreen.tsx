import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import LucideIcon from './LucideIcon';

interface LoginScreenProps {
  onLogin: (user: UserProfile) => void;
  userEmail?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, userEmail = 'katik.sakila@gmail.com' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<'google' | 'guest' | null>(null);
  const [customName, setCustomName] = useState('คุณ สกิลา');
  const [customEmail, setCustomEmail] = useState(userEmail);
  const [showConfig, setShowConfig] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setLoginType('google');
    
    // Simulate beautiful Google sign-in transition
    setTimeout(() => {
      onLogin({
        email: customEmail,
        name: customName || 'ผู้ใช้ Google',
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(customEmail)}`,
        isGuest: false
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleGuestLogin = () => {
    setIsLoading(true);
    setLoginType('guest');
    
    setTimeout(() => {
      onLogin({
        email: 'guest@example.com',
        name: 'ผู้ใช้งานทดลอง',
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=guest`,
        isGuest: true
      });
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800 p-6 md:p-12 relative overflow-hidden font-sans">
      {/* Aesthetic Background Accents */}
      <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] rounded-full bg-emerald-100/40 blur-3xl -z-10" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[80vw] h-[80vw] rounded-full bg-blue-100/40 blur-3xl -z-10" />

      {/* Top Header */}
      <div className="flex justify-between items-center w-full max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-md shadow-emerald-600/20">
            <LucideIcon name="Wallet" size={24} />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">แอปรายรับรายจ่าย</span>
        </div>
        <span className="text-xs bg-slate-200/60 text-slate-600 px-2.5 py-1 rounded-full font-mono">v1.0.0</span>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <AnimatePresence mode="wait">
          {!isLoading ? (
            <motion.div
              key="login-choices"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="space-y-8"
            >
              <div className="text-center space-y-3">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  บันทึกง่าย <br/>
                  <span className="text-emerald-600 bg-clip-text">วิเคราะห์การเงินฉับไว</span>
                </h1>
                <p className="text-sm text-slate-500 max-w-[280px] mx-auto">
                  จัดการรายรับรายจ่ายรายเดือน วางแผนงบประมาณ และวิเคราะห์พฤติกรรมของคุณแบบเจาะลึก
                </p>
              </div>

              {/* Login Options */}
              <div className="space-y-4">
                {/* Google Login Button */}
                <button
                  id="btn-login-google"
                  onClick={handleGoogleLogin}
                  className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                >
                  {/* Mock Google Logo using SVG inside Lucide format or beautiful icon */}
                  <div className="w-5 h-5 flex items-center justify-center bg-red-500 rounded-full text-white text-[10px] font-bold">G</div>
                  <span>เข้าสู่ระบบด้วย Google</span>
                </button>

                {/* Guest Account Button */}
                <button
                  id="btn-login-guest"
                  onClick={handleGuestLogin}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-600/15 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                >
                  <LucideIcon name="UserCheck" size={20} />
                  <span>ใช้งานบัญชีทดลอง (ไม่ต้องล็อกอิน)</span>
                </button>

                {/* Simulated Settings Toggle */}
                <div className="text-center">
                  <button
                    onClick={() => setShowConfig(!showConfig)}
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors inline-flex items-center gap-1"
                  >
                    <LucideIcon name="Settings" size={12} />
                    <span>กำหนดข้อมูลทดสอบล็อกอิน</span>
                  </button>
                </div>

                {/* Config panel */}
                {showConfig && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-slate-100 rounded-xl border border-slate-200 space-y-3 text-left"
                  >
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">อีเมลจำลองสำหรับ Google</label>
                      <input
                        type="email"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">ชื่อจำลองสำหรับ Google</label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                        placeholder="ชื่อของคุณ"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="loading-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-6 py-12 text-center"
            >
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                <div className="absolute text-emerald-600">
                  <LucideIcon name="Sparkles" size={24} />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-slate-900">
                  {loginType === 'google' ? 'กำลังเชื่อมต่อกับ Google...' : 'กำลังเตรียมบัญชีทดลอง...'}
                </h3>
                <p className="text-xs text-slate-400">ข้อมูลของคุณจะถูกเก็บบนอุปกรณ์นี้ (Local Storage)</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-sm mx-auto text-center space-y-2 text-xs text-slate-400">
        <div className="flex justify-center gap-1.5 items-center">
          <LucideIcon name="Lock" size={12} className="text-slate-400" />
          <span>ระบบเก็บข้อมูลออฟไลน์ ปลอดภัย 100%</span>
        </div>
        <p className="leading-relaxed">
          เนื่องจากไม่มีการเชื่อมต่อกับฐานข้อมูลภายนอก ข้อมูลธุรกรรมทั้งหมดจะถูกเก็บบันทึกอย่างปลอดภัยในบราวเซอร์ของคุณเอง
        </p>
      </div>
    </div>
  );
};
