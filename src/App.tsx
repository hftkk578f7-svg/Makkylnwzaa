import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Transaction, CategoryBudget } from './types';
import { SEED_TRANSACTIONS } from './utils';
import { LoginScreen } from './components/LoginScreen';
import { DashboardTab } from './components/DashboardTab';
import { TransactionsTab } from './components/TransactionsTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { BudgetsTab } from './components/BudgetsTab';
import { ProfileTab } from './components/ProfileTab';
import { AddTransactionModal } from './components/AddTransactionModal';
import LucideIcon from './components/LucideIcon';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'transactions' | 'analytics' | 'budgets' | 'profile'>('home');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-07'); // Current local time is July 2026
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  // 1. Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('wealth_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as UserProfile;
        setUser(parsedUser);
        loadUserData(parsedUser.email);
      } catch (e) {
        localStorage.removeItem('wealth_user');
      }
    }
  }, []);

  // 2. Load user-specific transactions and budgets
  const loadUserData = (email: string) => {
    const savedTrans = localStorage.getItem(`wealth_trans_${email}`);
    const savedBudgets = localStorage.getItem(`wealth_budgets_${email}`);

    if (savedTrans) {
      try {
        setTransactions(JSON.parse(savedTrans));
      } catch (e) {
        setTransactions([]);
      }
    } else {
      // Auto seed on first sign-in to show beautiful mock charts
      setTransactions(SEED_TRANSACTIONS);
      localStorage.setItem(`wealth_trans_${email}`, JSON.stringify(SEED_TRANSACTIONS));
    }

    if (savedBudgets) {
      try {
        setBudgets(JSON.parse(savedBudgets));
      } catch (e) {
        setBudgets([
          { category: 'อาหาร', limit: 8000 },
          { category: 'การเดินทาง', limit: 2500 },
          { category: 'ช้อปปิ้ง', limit: 4000 }
        ]);
      }
    } else {
      // Default budgets
      const defaultBudgets = [
        { category: 'อาหาร', limit: 8000 },
        { category: 'การเดินทาง', limit: 2500 },
        { category: 'ช้อปปิ้ง', limit: 4000 }
      ];
      setBudgets(defaultBudgets);
      localStorage.setItem(`wealth_budgets_${email}`, JSON.stringify(defaultBudgets));
    }
  };

  // 3. Save user states helper
  const saveTransactions = (newTrans: Transaction[]) => {
    setTransactions(newTrans);
    if (user) {
      localStorage.setItem(`wealth_trans_${user.email}`, JSON.stringify(newTrans));
    }
  };

  const saveBudgets = (newBudgets: CategoryBudget[]) => {
    setBudgets(newBudgets);
    if (user) {
      localStorage.setItem(`wealth_budgets_${user.email}`, JSON.stringify(newBudgets));
    }
  };

  // Login handler
  const handleLogin = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem('wealth_user', JSON.stringify(profile));
    loadUserData(profile.email);
    setActiveTab('home');
  };

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    setTransactions([]);
    setBudgets([]);
    localStorage.removeItem('wealth_user');
  };

  // Save Transaction (Add / Edit)
  const handleSaveTransaction = (data: Omit<Transaction, 'id'> & { id?: string }) => {
    if (data.id) {
      // Edit
      const updated = transactions.map((t) => (t.id === data.id ? (data as Transaction) : t));
      saveTransactions(updated);
    } else {
      // Add
      const newTrans: Transaction = {
        ...data,
        id: 't_' + Date.now() + Math.random().toString(36).substr(2, 5)
      };
      saveTransactions([newTrans, ...transactions]);
    }
    setTransactionToEdit(null);
  };

  // Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('คุณต้องการลบรายการธุรกรรมนี้ใช่หรือไม่?')) {
      const updated = transactions.filter((t) => t.id !== id);
      saveTransactions(updated);
    }
  };

  // Save Category Budget Limit
  const handleSaveBudget = (budget: CategoryBudget) => {
    const exists = budgets.find((b) => b.category === budget.category);
    let updated: CategoryBudget[];
    if (exists) {
      updated = budgets.map((b) => (b.category === budget.category ? budget : b));
    } else {
      updated = [...budgets, budget];
    }
    saveBudgets(updated);
  };

  // Delete Category Budget Limit
  const handleDeleteBudget = (category: string) => {
    if (window.confirm(`คุณต้องการลบงบประมาณของหมวดหมู่ "${category}" ใช่หรือไม่?`)) {
      const updated = budgets.filter((b) => b.category !== category);
      saveBudgets(updated);
    }
  };

  // Clear data handler
  const handleClearData = () => {
    if (window.confirm('คุณต้องการล้างข้อมูลทั้งหมดในอุปกรณ์นี้ใช่หรือไม่? ข้อมูลนี้จะไม่สามารถกู้คืนได้')) {
      saveTransactions([]);
      saveBudgets([]);
      alert('ล้างข้อมูลเรียบร้อยแล้ว');
    }
  };

  // Seed sample transactions
  const handleSeedData = () => {
    if (window.confirm('คุณต้องการโหลดข้อมูลสาธิตใหม่ใช่หรือไม่? ข้อมูลเดิมของคุณจะถูกแทนที่ด้วยข้อมูลตัวอย่าง')) {
      saveTransactions(SEED_TRANSACTIONS);
      const defaultBudgets = [
        { category: 'อาหาร', limit: 8000 },
        { category: 'การเดินทาง', limit: 2500 },
        { category: 'ช้อปปิ้ง', limit: 4000 }
      ];
      saveBudgets(defaultBudgets);
      alert('โหลดชุดข้อมูลสาธิตเรียบร้อยแล้ว!');
    }
  };

  // Import data handler
  const handleImportData = (importedTrans: Transaction[], importedBudgets: CategoryBudget[]) => {
    saveTransactions(importedTrans);
    saveBudgets(importedBudgets);
  };

  // Date Navigations
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let prevYear = year;
    let prevMonth = month - 1;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }
    setSelectedMonth(`${prevYear}-${String(prevMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let nextYear = year;
    let nextMonth = month + 1;
    if (nextMonth === 13) {
      nextMonth = 1;
      nextYear = year + 1;
    }
    setSelectedMonth(`${nextYear}-${String(nextMonth).padStart(2, '0')}`);
  };

  // If user is not logged in, render the gorgeous Login splash screen
  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Active view content mapper
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <DashboardTab
            transactions={transactions}
            budgets={budgets}
            selectedMonth={selectedMonth}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onAddClick={() => {
              setTransactionToEdit(null);
              setIsAddModalOpen(true);
            }}
            onEditClick={(t) => {
              setTransactionToEdit(t);
              setIsAddModalOpen(true);
            }}
            onDeleteClick={handleDeleteTransaction}
          />
        );
      case 'transactions':
        return (
          <TransactionsTab
            transactions={transactions}
            selectedMonth={selectedMonth}
            onEditClick={(t) => {
              setTransactionToEdit(t);
              setIsAddModalOpen(true);
            }}
            onDeleteClick={handleDeleteTransaction}
            onAddClick={() => {
              setTransactionToEdit(null);
              setIsAddModalOpen(true);
            }}
          />
        );
      case 'analytics':
        return <AnalyticsTab transactions={transactions} selectedMonth={selectedMonth} />;
      case 'budgets':
        return (
          <BudgetsTab
            budgets={budgets}
            transactions={transactions}
            selectedMonth={selectedMonth}
            onSaveBudget={handleSaveBudget}
            onDeleteBudget={handleDeleteBudget}
          />
        );
      case 'profile':
        return (
          <ProfileTab
            user={user}
            transactions={transactions}
            budgets={budgets}
            onLogout={handleLogout}
            onClearData={handleClearData}
            onSeedData={handleSeedData}
            onImportData={handleImportData}
          />
        );
    }
  };

  // Nav metadata
  const navigationItems = [
    { id: 'home', label: 'หน้าหลัก', icon: 'LayoutDashboard' },
    { id: 'transactions', label: 'ธุรกรรม', icon: 'ReceiptText' },
    { id: 'analytics', label: 'วิเคราะห์', icon: 'ChartBarPie' },
    { id: 'budgets', label: 'งบประมาณ', icon: 'Target' },
    { id: 'profile', label: 'โปรไฟล์', icon: 'User' }
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 font-sans antialiased pb-20 md:pb-0">
      {/* 1. Header Bar for Mobile Devices */}
      <header className="md:hidden sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-100 px-5 py-3.5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-600 rounded-lg text-white">
            <LucideIcon name="Wallet" size={16} />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-slate-900">แอปรายรับรายจ่าย</span>
        </div>
        
        {/* User profile avatar on header */}
        <div className="flex items-center gap-2" onClick={() => setActiveTab('profile')}>
          <span className="text-[10px] font-bold text-slate-500 hidden sm:inline">{user.name}</span>
          <img
            src={user.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=default'}
            alt={user.name}
            referrerPolicy="no-referrer"
            className="w-7.5 h-7.5 rounded-full border border-slate-200 cursor-pointer"
          />
        </div>
      </header>

      {/* 2. Side navigation for Desktop screens */}
      <aside className="hidden md:flex flex-col justify-between w-64 shrink-0 bg-white border-r border-slate-100 p-6 min-h-screen sticky top-0">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-md shadow-emerald-600/10">
              <LucideIcon name="Wallet" size={20} />
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">แอปรายรับรายจ่าย</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navigationItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center gap-3.5 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <LucideIcon name={item.icon} size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profile Card / Signout at sidebar footer */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-3">
            <img
              src={user.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=default'}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full border border-slate-200"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate leading-snug">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-100"
          >
            <LucideIcon name="LogOut" size={14} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* 3. Main content viewport area */}
      <main className="flex-1 max-w-2xl mx-auto w-full p-4.5 md:p-8 space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderActiveTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 4. Sticky Bottom Tab Bar for Mobile screens */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-t border-slate-100 px-3 py-1 flex justify-around items-center shadow-lg">
        {navigationItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="py-1.5 flex flex-col items-center justify-center min-w-[56px] select-none text-slate-400 relative active:scale-95 transition-transform"
            >
              <div
                className={`p-1 rounded-full transition-colors ${
                  isActive ? 'text-slate-900 bg-slate-100' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <LucideIcon name={item.icon} size={20} />
              </div>
              <span
                className={`text-[9px] font-bold tracking-tight mt-0.5 transition-colors ${
                  isActive ? 'text-slate-950' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* 5. Add / Edit Transaction popup modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setTransactionToEdit(null);
        }}
        onSave={handleSaveTransaction}
        transactionToEdit={transactionToEdit}
      />
    </div>
  );
}
