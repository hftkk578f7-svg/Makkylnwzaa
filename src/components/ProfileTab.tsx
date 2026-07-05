import React, { useRef } from 'react';
import { UserProfile, Transaction, CategoryBudget } from '../types';
import LucideIcon from './LucideIcon';

interface ProfileTabProps {
  user: UserProfile | null;
  transactions: Transaction[];
  budgets: CategoryBudget[];
  onLogout: () => void;
  onClearData: () => void;
  onSeedData: () => void;
  onImportData: (transactions: Transaction[], budgets: CategoryBudget[]) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  transactions,
  budgets,
  onLogout,
  onClearData,
  onSeedData,
  onImportData
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export as JSON file download
  const handleExportJSON = () => {
    const dataStr = JSON.stringify({ transactions, budgets, exportDate: new Date().toISOString() }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `wealth-manager-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import JSON handler
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.transactions)) {
          onImportData(parsed.transactions, parsed.budgets || []);
          alert('นำเข้าข้อมูลเรียบร้อยแล้ว!');
        } else {
          alert('รูปแบบไฟล์ไม่ถูกต้อง กรุณาอัปโหลดไฟล์ที่บันทึกจากระบบนี้');
        }
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์ คาดว่าไฟล์เสียหาย');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Account Info Card */}
      {user && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <img
              src={user.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=default'}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-full border-4 border-slate-50 bg-slate-100 shadow-sm"
            />
            <div className="absolute bottom-0 right-0 p-1.5 bg-emerald-500 rounded-full text-white border-2 border-white">
              <LucideIcon name={user.isGuest ? 'Shield' : 'ShieldCheck'} size={12} />
            </div>
          </div>

          <div className="space-y-0.5">
            <h3 className="font-bold text-slate-800 text-lg leading-snug">{user.name}</h3>
            <p className="text-xs text-slate-400 font-medium">{user.email}</p>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
            user.isGuest ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600'
          }`}>
            {user.isGuest ? 'โหมดบัญชีทดลอง (Local Guest)' : 'เข้าสู่ระบบด้วย Google (Simulated)'}
          </span>
        </div>
      )}

      {/* Data Administration actions */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 tracking-wide uppercase px-1">จัดการฐานข้อมูลรายบุคคล</h4>
        
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
          {/* Seed button */}
          <button
            onClick={onSeedData}
            className="w-full p-4 hover:bg-slate-50 text-left flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <LucideIcon name="Sparkles" size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">โหลดชุดข้อมูลสาธิต</p>
                <p className="text-[10px] text-slate-400 font-medium">เติมชุดข้อมูลทดสอบรายรับรายจ่ายในอดีต (ก.ค. - พ.ค.) ทันที</p>
              </div>
            </div>
            <LucideIcon name="ChevronRight" size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>

          {/* Export button */}
          <button
            onClick={handleExportJSON}
            className="w-full p-4 hover:bg-slate-50 text-left flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <LucideIcon name="Download" size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">สำรองข้อมูลออกนอกอุปกรณ์ (Export)</p>
                <p className="text-[10px] text-slate-400 font-medium font-sans">ดาวน์โหลดข้อมูลธุรกรรมและเป้าหมายงบประมาณทั้งหมดเป็นไฟล์ JSON</p>
              </div>
            </div>
            <LucideIcon name="ChevronRight" size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>

          {/* Import trigger */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 hover:bg-slate-50 text-left flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <LucideIcon name="FileUp" size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">นำเข้าชุดข้อมูลเดิม (Import JSON)</p>
                <p className="text-[10px] text-slate-400 font-medium font-sans">เลือกไฟล์สำรองข้อมูล JSON เพื่อบันทึกทับในระบบนี้</p>
              </div>
            </div>
            <LucideIcon name="ChevronRight" size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>

          {/* Clear button */}
          <button
            onClick={onClearData}
            className="w-full p-4 hover:bg-slate-50 text-left flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                <LucideIcon name="Trash2" size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-red-600">ล้างฐานข้อมูลอุปกรณ์นี้</p>
                <p className="text-[10px] text-slate-400 font-medium">ลบรายการธุรกรรมและเป้าหมายงบประมาณทั้งหมด (ไม่สามารถกู้คืนได้)</p>
              </div>
            </div>
            <LucideIcon name="ChevronRight" size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
          </button>
        </div>

        {/* Hidden input for importing file */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportJSON}
          accept=".json"
          className="hidden"
        />
      </div>

      {/* Account control */}
      <button
        onClick={onLogout}
        className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2 active:scale-95"
      >
        <LucideIcon name="LogOut" size={16} />
        <span>ออกจากระบบแอปพลิเคชัน</span>
      </button>

      {/* Info attribution */}
      <div className="text-center text-[10px] text-slate-400 space-y-1">
        <p>© 2026 ระบบสรุปและวิเคราะห์บัญชีรายรับรายจ่ายส่วนบุคคล</p>
        <p className="font-mono">Local Storage Sandbox Mode</p>
      </div>
    </div>
  );
};
