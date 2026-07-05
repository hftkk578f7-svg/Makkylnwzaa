import React from 'react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { Transaction } from '../types';
import { formatThaiCurrency, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils';
import LucideIcon from './LucideIcon';

interface AnalyticsTabProps {
  transactions: Transaction[];
  selectedMonth: string; // YYYY-MM
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ transactions, selectedMonth }) => {
  // Filter current month transactions
  const currentMonthTrans = transactions.filter(t => t.date.startsWith(selectedMonth));

  // 1. Overall Totals
  const totalIncome = currentMonthTrans
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = currentMonthTrans
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // 2. Category Pie Chart Data
  const expenseByCategory: Record<string, number> = {};
  currentMonthTrans
    .filter(t => t.type === 'expense')
    .forEach((t) => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    });

  const pieData = Object.entries(expenseByCategory).map(([category, amount]) => {
    const meta = EXPENSE_CATEGORIES[category] || { color: '#6b7280' };
    return {
      name: category,
      value: amount,
      color: meta.color
    };
  }).sort((a, b) => b.value - a.value);

  // 3. Last 4 Months Trend Data (including current)
  // Let's deduce last 4 months from current month
  const getPastMonthsList = (startMonthStr: string, count: number): string[] => {
    const list: string[] = [];
    const [year, month] = startMonthStr.split('-').map(Number);
    
    for (let i = count - 1; i >= 0; i--) {
      let d = new Date(year, month - 1 - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      list.push(`${y}-${m}`);
    }
    return list;
  };

  const pastMonths = getPastMonthsList(selectedMonth, 4);

  const barData = pastMonths.map((mStr) => {
    const monthTrans = transactions.filter(t => t.date.startsWith(mStr));
    const inc = monthTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const exp = monthTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    // Short month name
    const [_, m] = mStr.split('-');
    const monthNamesShort = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const thaiYearShort = (parseInt(mStr.split('-')[0], 10) + 543).toString().slice(-2);
    
    return {
      monthLabel: `${monthNamesShort[parseInt(m, 10) - 1]} ${thaiYearShort}`,
      'รายรับ': inc,
      'รายจ่าย': exp,
    };
  });

  // 4. Heuristics Insights Generator
  const generateInsights = () => {
    const insights: Array<{ type: 'success' | 'warning' | 'info'; text: string; icon: string }> = [];

    if (currentMonthTrans.length === 0) {
      return [{
        type: 'info' as const,
        text: 'ยังไม่มีข้อมูลสำหรับสรุปและวิเคราะห์ในเดือนนี้ กรุณาบันทึกรายรับรายจ่ายในเมนู "หน้าหลัก" เพื่อเริ่มต้นการวิเคราะห์',
        icon: 'Sparkles'
      }];
    }

    // Savings rate insight
    if (totalIncome > 0) {
      if (savingsRate > 30) {
        insights.push({
          type: 'success',
          text: `ยอดเยี่ยมมาก! อัตราการออมเงินในเดือนนี้ของคุณสูงถึง ${savingsRate.toFixed(1)}% (ออมเงินได้ ${formatThaiCurrency(netSavings)}) แนะนำให้นำส่วนที่เหลือไปลงทุนต่อยอดเพื่อให้เงินงอกเงย`,
          icon: 'TrendingUp'
        });
      } else if (savingsRate >= 10) {
        insights.push({
          type: 'success',
          text: `สุขภาพการเงินดี! อัตราเงินออมของคุณคือ ${savingsRate.toFixed(1)}% เป็นไปตามเกณฑ์มาตรฐานขั้นต่ำ 10% ควรวางแผนสร้างกองทุนสำรองฉุกเฉินให้ได้ 3-6 เท่าของรายจ่ายรายเดือน`,
          icon: 'ShieldCheck'
        });
      } else if (savingsRate >= 0) {
        insights.push({
          type: 'warning',
          text: `ระมัดระวัง! อัตราการออมต่ำกว่าเกณฑ์มาตรฐาน อยู่ที่ ${savingsRate.toFixed(1)}% ลองพิจารณาปรับลดรายจ่ายที่ไม่จำเป็นเพื่อเพิ่มพื้นที่เงินออม`,
          icon: 'ShieldAlert'
        });
      } else {
        insights.push({
          type: 'warning',
          text: `วิกฤตรายจ่ายเกินรายรับ! เดือนนี้คุณใช้จ่ายเกินรายรับไปเป็นจำนวน ${formatThaiCurrency(Math.abs(netSavings))} แนะนำให้ลดรายจ่ายฟุ่มเฟือย เช่น ช้อปปิ้ง หรือความบันเทิง ทันที!`,
          icon: 'AlertTriangle'
        });
      }
    } else if (totalExpense > 0) {
      insights.push({
        type: 'warning',
        text: 'เดือนนี้มีแต่รายจ่ายที่บันทึกไว้ แต่ยังไม่มีการบันทึกรายรับเลย สุขภาพการเงินอาจติดขัดได้หากไม่มีแหล่งรายรับมาจุนเจือ',
        icon: 'AlertTriangle'
      });
    }

    // Highest expense category insight
    if (pieData.length > 0) {
      const highestExpense = pieData[0];
      const highestPercentage = totalExpense > 0 ? (highestExpense.value / totalExpense) * 100 : 0;
      
      if (highestPercentage > 40) {
        insights.push({
          type: 'info',
          text: `สัดส่วนการใช้จ่ายไปกับหมวดหมู่ "${highestExpense.name}" ค่อนข้างสูง คิดเป็น ${highestPercentage.toFixed(1)}% ของรายจ่ายทั้งหมด (${formatThaiCurrency(highestExpense.value)}) ลองพิจารณาหาทางประหยัดค่าใช้จ่ายกลุ่มนี้ลงดู`,
          icon: 'Utensils'
        });
      } else {
        insights.push({
          type: 'info',
          text: `หมวดหมู่ที่คุณใช้จ่ายมากที่สุดคือ "${highestExpense.name}" คิดเป็น ${highestPercentage.toFixed(1)}% ของรายจ่ายทั้งหมด (${formatThaiCurrency(highestExpense.value)}) รองลงมาคือ ${pieData[1] ? `"${pieData[1].name}"` : 'ไม่มีหมวดหมู่อื่น'}`,
          icon: 'PieChart'
        });
      }
    }

    // Balance health comparison
    if (barData.length >= 2) {
      const currentMonthVal = barData[barData.length - 1];
      const prevMonthVal = barData[barData.length - 2];
      const currentExp = currentMonthVal['รายจ่าย'];
      const prevExp = prevMonthVal['รายจ่าย'];
      
      if (currentExp > prevExp && prevExp > 0) {
        const diff = ((currentExp - prevExp) / prevExp) * 100;
        insights.push({
          type: 'warning',
          text: `รายจ่ายของคุณในเดือนนี้ เพิ่มขึ้นจากเดือนที่แล้วประมาณ ${diff.toFixed(1)}% (${formatThaiCurrency(currentExp - prevExp)}) ควรระวังไม่ให้รายจ่ายบานปลายต่อเนื่อง`,
          icon: 'TrendingUp'
        });
      } else if (currentExp < prevExp && currentExp > 0) {
        const diff = ((prevExp - currentExp) / prevExp) * 100;
        insights.push({
          type: 'success',
          text: `เก่งมาก! รายจ่ายของคุณลดลงจากเดือนก่อนถึง ${diff.toFixed(1)}% (${formatThaiCurrency(prevExp - currentExp)}) คุณสามารถควบคุมพฤติกรรมการจ่ายเงินได้ดียิ่งขึ้น`,
          icon: 'TrendingDown'
        });
      }
    }

    return insights;
  };

  const activeInsights = generateInsights();

  // Custom tooltips for Recharts
  const customTooltipFormat = (value: any) => [`฿${Number(value).toLocaleString()}`];

  return (
    <div className="space-y-6 pb-6">
      {/* 1. Quick stats panel */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">สัดส่วนการออมเงิน</span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl font-extrabold ${savingsRate >= 10 ? 'text-emerald-600' : savingsRate >= 0 ? 'text-amber-500' : 'text-red-500'}`}>
              {savingsRate.toFixed(0)}%
            </span>
            <span className="text-xs text-slate-400 font-semibold">ของรายรับ</span>
          </div>
          {/* Mini bar gauge */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1">
            <div
              className={`h-full rounded-full ${savingsRate >= 10 ? 'bg-emerald-500' : savingsRate >= 0 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${Math.max(0, Math.min(savingsRate, 100))}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">เงินเหลือเก็บสุทธิ</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-extrabold ${netSavings >= 0 ? 'text-slate-800' : 'text-red-500'}`}>
              {formatThaiCurrency(netSavings).replace('THB', '').trim()}
            </span>
            <span className="text-xs text-slate-400 font-semibold">บาท</span>
          </div>
        </div>
      </div>

      {/* 2. Pie Chart Segment Breakdown */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-1.5">
            <LucideIcon name="PieChart" size={16} className="text-emerald-600" />
            วิเคราะห์สัดส่วนรายจ่ายตามหมวดหมู่
          </h3>
          <p className="text-[10px] text-slate-400">สัดส่วนค่าใช้จ่ายทั้งหมดในเดือนปัจจุบัน</p>
        </div>

        {pieData.length === 0 ? (
          <div className="text-center py-10 bg-slate-50/60 rounded-2xl border border-dashed border-slate-150">
            <p className="text-xs text-slate-400 italic">ยังไม่มีข้อมูลรายจ่ายที่สามารถวิเคราะห์ได้ในเดือนนี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Pie render */}
            <div className="h-44 md:col-span-5 flex justify-center items-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={customTooltipFormat} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">รายจ่ายรวม</span>
                <span className="text-sm font-extrabold text-slate-900">{formatThaiCurrency(totalExpense).replace('฿', '').trim()}</span>
              </div>
            </div>

            {/* List labels with color indicators */}
            <div className="space-y-1.5 md:col-span-7">
              {pieData.slice(0, 5).map((entry) => {
                const pct = totalExpense > 0 ? (entry.value / totalExpense) * 100 : 0;
                return (
                  <div key={entry.name} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                      <span className="font-semibold text-slate-600 truncate max-w-[120px]">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-medium">{pct.toFixed(0)}%</span>
                      <span className="font-bold text-slate-800">{formatThaiCurrency(entry.value).replace('฿', '')}</span>
                    </div>
                  </div>
                );
              })}
              {pieData.length > 5 && (
                <p className="text-[10px] text-slate-400 text-center italic mt-1">+ หมวดหมู่อื่นๆ อีก {pieData.length - 5} หมวดหมู่</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Bar Chart Income vs Expenses Trend over time */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-1.5">
            <LucideIcon name="ChartBarPie" size={16} className="text-emerald-600" />
            แนวโน้มการเงินย้อนหลัง (รายรับ - รายจ่าย)
          </h3>
          <p className="text-[10px] text-slate-400">เปรียบเทียบพฤติกรรมการออมและการใช้จ่ายย้อนหลัง 4 เดือน</p>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="monthLabel" tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 9, fontWeight: 600, fill: '#94a3b8' }} />
              <Tooltip formatter={customTooltipFormat} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
              <Bar dataKey="รายรับ" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="รายจ่าย" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Insights Heuristics */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-1.5">
          <LucideIcon name="Sparkles" size={16} className="text-amber-500" />
          บทวิเคราะห์การเงินและคำแนะนำ
        </h3>

        <div className="space-y-2.5">
          {activeInsights.map((insight, idx) => {
            const isSuccess = insight.type === 'success';
            const isWarning = insight.type === 'warning';
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-2xl border flex gap-3 items-start ${
                  isSuccess
                    ? 'bg-emerald-50/60 border-emerald-100 text-emerald-800'
                    : isWarning
                    ? 'bg-amber-50/60 border-amber-100 text-amber-800'
                    : 'bg-blue-50/60 border-blue-100 text-blue-800'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    isSuccess
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : isWarning
                      ? 'bg-amber-500/10 text-amber-600'
                      : 'bg-blue-500/10 text-blue-600'
                  }`}
                >
                  <LucideIcon name={insight.icon} size={16} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wide opacity-70">
                    {isSuccess ? 'วิเคราะห์เชิงบวก' : isWarning ? 'ข้อควรระวัง' : 'ข้อมูลเชิงสถิติ'}
                  </span>
                  <p className="text-xs font-semibold leading-relaxed">{insight.text}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
