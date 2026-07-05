import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { formatThaiCurrency, ALL_CATEGORIES, formatThaiDate } from '../utils';
import LucideIcon from './LucideIcon';

interface TransactionsTabProps {
  transactions: Transaction[];
  selectedMonth: string; // YYYY-MM
  onEditClick: (transaction: Transaction) => void;
  onDeleteClick: (id: string) => void;
  onAddClick: () => void;
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({
  transactions,
  selectedMonth,
  onEditClick,
  onDeleteClick,
  onAddClick
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Filter based on search, type, and category, and selected month
  const filteredTransactions = transactions.filter((t) => {
    const matchesMonth = t.date.startsWith(selectedMonth);
    const matchesSearch = t.note?.toLowerCase().includes(search.toLowerCase()) || 
                          t.category.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;

    return matchesMonth && matchesSearch && matchesType && matchesCategory;
  });

  // Get distinct categories present in this month to populate filter
  const monthCategories = Array.from(
    new Set(transactions.filter(t => t.date.startsWith(selectedMonth)).map(t => t.category))
  );

  // Group transactions by date
  const groupedTransactions: Record<string, Transaction[]> = {};
  filteredTransactions.forEach((t) => {
    if (!groupedTransactions[t.date]) {
      groupedTransactions[t.date] = [];
    }
    groupedTransactions[t.date].push(t);
  });

  // Sort dates descending
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        {/* Search bar */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <LucideIcon name="Search" size={16} />
          </span>
          <input
            type="text"
            placeholder="ค้นหารายการ หรือบันทึกช่วยจำ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none"
          />
        </div>

        {/* Filters grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Type filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ประเภท</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">ทั้งหมด</option>
              <option value="income">รายรับ</option>
              <option value="expense">รายจ่าย</option>
            </select>
          </div>

          {/* Category filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">หมวดหมู่</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">ทุกหมวดหมู่</option>
              {monthCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List grouped by Date */}
      <div className="space-y-4">
        {sortedDates.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <LucideIcon name="ReceiptText" size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-500">ไม่พบรายการธุรกรรม</p>
            <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหา หรือกรองประเภทใหม่</p>
            <button
              onClick={onAddClick}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-700 transition-all"
            >
              <LucideIcon name="Plus" size={14} />
              <span>เพิ่มธุรกรรมใหม่</span>
            </button>
          </div>
        ) : (
          sortedDates.map((dateStr) => {
            const dateTransactions = groupedTransactions[dateStr];
            
            // Calculate day's net total
            const dayNet = dateTransactions.reduce((acc, t) => {
              return acc + (t.type === 'income' ? t.amount : -t.amount);
            }, 0);

            return (
              <div key={dateStr} className="space-y-1.5">
                {/* Day Header */}
                <div className="flex justify-between items-center px-2 py-1 sticky top-0 bg-slate-50 z-10">
                  <span className="text-xs font-bold text-slate-500">
                    {formatThaiDate(dateStr)}
                  </span>
                  <span className={`text-[11px] font-extrabold ${dayNet >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {dayNet >= 0 ? '+' : ''}
                    {formatThaiCurrency(dayNet)}
                  </span>
                </div>

                {/* Day Transactions */}
                <div className="space-y-2">
                  {dateTransactions.map((t) => {
                    const categoryDetails = ALL_CATEGORIES[t.category] || { icon: 'CircleEllipsis', color: '#6b7280' };
                    const isExpense = t.type === 'expense';

                    return (
                      <div
                        key={t.id}
                        className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-3 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${categoryDetails.color}12`, color: categoryDetails.color }}
                          >
                            <LucideIcon name={categoryDetails.icon} size={20} />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-800 text-sm block">{t.category}</span>
                            {t.note ? (
                              <p className="text-xs text-slate-500 truncate mt-0.5">{t.note}</p>
                            ) : (
                              <p className="text-xs text-slate-400 italic mt-0.5">ไม่มีบันทึก</p>
                            )}
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`font-bold text-sm ${isExpense ? 'text-red-500' : 'text-emerald-600'}`}>
                            {isExpense ? '-' : '+'}
                            {formatThaiCurrency(t.amount).replace('฿', '')}
                          </span>

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
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
