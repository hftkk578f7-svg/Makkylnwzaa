import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction, TransactionType } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils';
import LucideIcon from './LucideIcon';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'> & { id?: string }) => void;
  transactionToEdit?: Transaction | null;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  transactionToEdit
}) => {
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (transactionToEdit) {
      setAmount(transactionToEdit.amount.toString());
      setType(transactionToEdit.type);
      setCategory(transactionToEdit.category);
      setDate(transactionToEdit.date);
      setNote(transactionToEdit.note || '');
    } else {
      // Reset to defaults
      setAmount('');
      setType('expense');
      setCategory('อาหาร'); // default expense category
      // Get local current date in YYYY-MM-DD format
      const today = new Date();
      const offset = today.getTimezoneOffset();
      const localDate = new Date(today.getTime() - (offset * 60 * 1000));
      setDate(localDate.toISOString().split('T')[0]);
      setNote('');
    }
    setError('');
  }, [transactionToEdit, isOpen]);

  // When type changes, auto-select first category of that type if previous is invalid
  useEffect(() => {
    if (!transactionToEdit) {
      if (type === 'expense') {
        setCategory('อาหาร');
      } else {
        setCategory('เงินเดือน');
      }
    }
  }, [type, transactionToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('กรุณากรอกจำนวนเงินให้ถูกต้อง (มากกว่า 0)');
      return;
    }

    if (!category) {
      setError('กรุณาเลือกหมวดหมู่');
      return;
    }

    if (!date) {
      setError('กรุณาเลือกวันที่');
      return;
    }

    onSave({
      ...(transactionToEdit ? { id: transactionToEdit.id } : {}),
      amount: parsedAmount,
      type,
      category,
      date,
      note: note.trim() || undefined
    });
    
    onClose();
  };

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden z-10 max-h-[92vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">
                {transactionToEdit ? 'แก้ไขรายการธุรกรรม' : 'เพิ่มรายการธุรกรรมใหม่'}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
              >
                <LucideIcon name="X" size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Error message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2">
                  <LucideIcon name="ShieldAlert" size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Type Switcher Tab */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-1.5 ${
                    type === 'expense'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LucideIcon name="TrendingDown" size={16} />
                  <span>รายจ่าย</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-1.5 ${
                    type === 'income'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LucideIcon name="TrendingUp" size={16} />
                  <span>รายรับ</span>
                </button>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 tracking-wide uppercase block">จำนวนเงิน (บาท)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-lg font-bold text-slate-400">฿</div>
                  <input
                    type="number"
                    step="any"
                    inputMode="decimal"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl font-bold text-xl transition-all focus:outline-none"
                  />
                </div>
              </div>

              {/* Category Grid selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 tracking-wide uppercase block">เลือกหมวดหมู่</label>
                <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                  {Object.values(categories).map((cat) => {
                    const isSelected = category === cat.name;
                    return (
                      <button
                        type="button"
                        key={cat.name}
                        onClick={() => setCategory(cat.name)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-all ${
                          isSelected
                            ? 'bg-slate-900 border-slate-900 text-white shadow-sm scale-102'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: isSelected ? 'rgba(255,255,255,0.15)' : `${cat.color}15`,
                            color: isSelected ? '#ffffff' : cat.color
                          }}
                        >
                          <LucideIcon name={cat.icon} size={18} />
                        </div>
                        <span className="text-[10px] font-semibold truncate w-full">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 tracking-wide uppercase block">วันที่</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <LucideIcon name="Calendar" size={16} />
                  </div>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none"
                  />
                </div>
              </div>

              {/* Note input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 tracking-wide uppercase block">บันทึกช่วยจำ (ไม่บังคับ)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <LucideIcon name="Edit3" size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="เช่น ค่าข้าวกะเพราหมูกรอบ, ซื้อเสื้อยืด"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none"
                  />
                </div>
              </div>

              {/* Save/Submit Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                >
                  <LucideIcon name="FileDown" size={18} />
                  <span>{transactionToEdit ? 'บันทึกการแก้ไข' : 'เพิ่มบันทึกการเงิน'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
