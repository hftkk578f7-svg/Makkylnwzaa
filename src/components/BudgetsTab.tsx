import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CategoryBudget, Transaction } from '../types';
import { formatThaiCurrency, EXPENSE_CATEGORIES } from '../utils';
import LucideIcon from './LucideIcon';

interface BudgetsTabProps {
  budgets: CategoryBudget[];
  transactions: Transaction[];
  selectedMonth: string; // YYYY-MM
  onSaveBudget: (budget: CategoryBudget) => void;
  onDeleteBudget: (category: string) => void;
}

export const BudgetsTab: React.FC<BudgetsTabProps> = ({
  budgets,
  transactions,
  selectedMonth,
  onSaveBudget,
  onDeleteBudget
}) => {
  const [selectedCategory, setSelectedCategory] = useState('อาหาร');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Filter current month transactions that are expenses
  const currentMonthExpenses = transactions.filter(
    (t) => t.date.startsWith(selectedMonth) && t.type === 'expense'
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedLimit = parseFloat(budgetLimit);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      setError('กรุณากรอกงบประมาณให้ถูกต้อง (มากกว่า 0)');
      return;
    }

    onSaveBudget({
      category: selectedCategory,
      limit: parsedLimit
    });

    setBudgetLimit('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Set Budget CTA button */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 px-4 bg-slate-900 text-white font-bold rounded-xl shadow-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
        >
          <LucideIcon name="Target" size={18} />
          <span>ตั้งค่างบประมาณรายหมวดหมู่</span>
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 text-left"
        >
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <span className="font-bold text-slate-800 text-sm">ตั้งค่างบประมาณประจำเดือน</span>
            <button
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <LucideIcon name="X" size={16} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {error && (
              <p className="text-xs font-bold text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>
            )}

            <div className="grid grid-cols-2 gap-3">
              {/* Category selector */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">หมวดหมู่</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:border-emerald-500"
                >
                  {Object.keys(EXPENSE_CATEGORIES).map((catName) => (
                    <option key={catName} value={catName}>
                      {catName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount limit */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">งบจำกัดสูงสุด (บาท)</label>
                <input
                  type="number"
                  placeholder="เช่น 5000"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-[0.98]"
            >
              ยืนยันการกำหนดงบประมาณ
            </button>
          </form>
        </motion.div>
      )}

      {/* List budgets and their progress */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-1.5">
          <LucideIcon name="Target" size={16} className="text-slate-500" />
          เป้าหมายงบประมาณที่กำหนดไว้
        </h3>

        {budgets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <LucideIcon name="Target" size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-500">ยังไม่ได้กำหนดงบประมาณใดๆ</p>
            <p className="text-xs text-slate-400 mt-1">กำหนดงบประมาณเพื่อควบคุมรายจ่ายให้เป็นระบบ!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {budgets.map((b) => {
              const spent = currentMonthExpenses
                .filter((t) => t.category === b.category)
                .reduce((sum, t) => sum + t.amount, 0);

              const meta = EXPENSE_CATEGORIES[b.category] || { icon: 'CircleEllipsis', color: '#6b7280' };
              const remaining = b.limit - spent;
              const percent = Math.min((spent / b.limit) * 100, 100);

              return (
                <div
                  key={b.category}
                  className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${meta.color}12`, color: meta.color }}
                      >
                        <LucideIcon name={meta.icon} size={16} />
                      </div>
                      <span className="font-bold text-slate-800 text-sm">{b.category}</span>
                    </div>

                    <button
                      onClick={() => onDeleteBudget(b.category)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded-lg active:scale-95 transition-all"
                      title="ลบงบประมาณ"
                    >
                      <LucideIcon name="Trash2" size={14} />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-350"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: percent > 90 ? '#ef4444' : percent > 70 ? '#f59e0b' : meta.color
                        }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold uppercase">
                      <span>ใช้ไป {formatThaiCurrency(spent)}</span>
                      <span>ทั้งหมด {formatThaiCurrency(b.limit)}</span>
                    </div>
                  </div>

                  {/* Status alert text */}
                  <div className="pt-1.5 border-t border-slate-50 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">คงเหลือใช้ได้อีก</span>
                    <span
                      className={`font-bold ${
                        remaining >= 0 ? 'text-emerald-600' : 'text-red-500'
                      }`}
                    >
                      {remaining >= 0
                        ? formatThaiCurrency(remaining)
                        : `ใช้เกินงบไปแล้ว ${formatThaiCurrency(Math.abs(remaining))}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
