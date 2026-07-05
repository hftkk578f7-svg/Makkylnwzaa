import React from 'react';
import { motion } from 'motion/react';
import { Transaction, CategoryBudget } from '../types';
import { formatThaiCurrency, ALL_CATEGORIES } from '../utils';
import LucideIcon from './LucideIcon';

interface DashboardTabProps {
  transactions: Transaction[];
  budgets: CategoryBudget[];
  selectedMonth: string; // YYYY-MM
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onAddClick: () => void;
  onEditClick: (transaction: Transaction) => void;
  onDeleteClick: (id: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  transactions,
  budgets,
  selectedMonth,
  onPrevMonth,
  onNextMonth,
  onAddClick,
  onEditClick,
  onDeleteClick
}) => {
  // Filter transactions for the selected month
  const currentMonthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));

  // Calculations
  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Budget calculations
  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const budgetPercentage = totalBudgetLimit > 0 ? Math.min((totalExpense / totalBudgetLimit) * 100, 100) : 0;

  // Format Thai month name
  const getThaiMonthName = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    const thaiYear = parseInt(year, 10) + 543;
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    return `${months[parseInt(month, 10) - 1]} ${thaiYear}`;
  };

  return (
    <div className="space-y-6">
      {/* Date Navigator Header */}
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm">
        <button
          onClick={onPrevMonth}
          className="p-1.5 hover:bg-slate-50 text-slate-600 rounded-lg active:scale-95 transition-all"
        >
          <LucideIcon name="ChevronLeft" size={20} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">สรุปยอดประจำเดือน</span>
          <span className="font-bold text-slate-800 text-sm md:text-base">{getThaiMonthName(selectedMonth)}</span>
        </div>
        <button
          onClick={onNextMonth}
          className="p-1.5 hover:bg-slate-50 text-slate-600 rounded-lg active:scale-95 transition-all"
        >
          <LucideIcon name="ChevronRight" size={20} />
        </button>
      </div>

      {/* Hero Financial Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-slate-900 text-white rounded-3xl p-6 shadow-xl shadow-slate-900/10 overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium tracking-wide">ยอดเงินคงเหลือประจำเดือน</span>
            <div className="text-3xl font-extrabold tracking-tight">
              {formatThaiCurrency(balance)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                รายรับรวม
              </span>
              <span className="font-bold text-emerald-400 text-sm md:text-base">{formatThaiCurrency(totalIncome)}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                รายจ่ายรวม
              </span>
              <span className="font-bold text-red-400 text-sm md:text-base">{formatThaiCurrency(totalExpense)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Budget Progress Indicator Card */}
      {totalBudgetLimit > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3"
        >
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-600 flex items-center gap-1.5">
              <LucideIcon name="Target" size={14} className="text-emerald-600" />
              การใช้จ่ายเทียบกับงบประมาณรวม
            </span>
            <span className="font-bold text-slate-900">{budgetPercentage.toFixed(0)}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetPercentage > 90
                  ? 'bg-red-500'
                  : budgetPercentage > 75
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              }`}
              style={{ width: `${budgetPercentage}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold uppercase">
            <span>ใช้ไป {formatThaiCurrency(totalExpense)}</span>
            <span>งบทั้งหมด {formatThaiCurrency(totalBudgetLimit)}</span>
          </div>
        </motion.div>
      )}

      {/* Quick Action Circle Buttons for mobile */}
      <div className="flex gap-3">
        <button
          onClick={onAddClick}
          className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 active:scale-95 transition-all text-sm"
        >
          <LucideIcon name="Plus" size={18} />
          <span>บันทึกธุรกรรม</span>
        </button>
      </div>

      {/* Recent Transactions Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-1.5">
            <LucideIcon name="ReceiptText" size={16} className="text-slate-500" />
            รายการล่าสุดในเดือนนี้
          </h3>
          <span className="text-xs font-semibold text-slate-400">({currentMonthTransactions.length} รายการ)</span>
        </div>

        {currentMonthTransactions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <LucideIcon name="ReceiptText" size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-500">ยังไม่มีรายการบันทึกในเดือนนี้</p>
            <p className="text-xs text-slate-400 mt-1">กดปุ่ม บันทึกธุรกรรม เพื่อเริ่มจดบันทึกรายรับรายจ่าย</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {currentMonthTransactions.slice(0, 5).map((t) => {
              const categoryDetails = ALL_CATEGORIES[t.category] || { icon: 'CircleEllipsis', color: '#6b7280' };
              const isExpense = t.type === 'expense';
              
              // Format transaction date to Thai day-month
              const formattedDayMonth = () => {
                const parts = t.date.split('-');
                const day = parseInt(parts[2], 10);
                const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
                return `${day} ${months[parseInt(parts[1], 10) - 1]}`;
              };

              return (
                <div
                  key={t.id}
                  className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${categoryDetails.color}12`, color: categoryDetails.color }}
                    >
                      <LucideIcon name={categoryDetails.icon} size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 text-sm truncate">{t.category}</span>
                        <span className="text-[9px] font-bold text-slate-400 shrink-0 bg-slate-100 px-1.5 py-0.5 rounded">
                          {formattedDayMonth()}
                        </span>
                      </div>
                      {t.note ? (
                        <p className="text-xs text-slate-500 truncate mt-0.5">{t.note}</p>
                      ) : (
                        <p className="text-xs text-slate-400 italic mt-0.5">ไม่มีบันทึก</p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions & Amount */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`font-bold text-sm ${isExpense ? 'text-red-500' : 'text-emerald-600'}`}>
                      {isExpense ? '-' : '+'}
                      {formatThaiCurrency(t.amount).replace('฿', '')}
                    </span>

                    {/* Simple Edit / Delete controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditClick(t)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-50"
                        title="แก้ไข"
                      >
                        <LucideIcon name="Edit3" size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteClick(t.id)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50"
                        title="ลบ"
                      >
                        <LucideIcon name="Trash2" size={14} />
                      </button>
                    </div>
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
