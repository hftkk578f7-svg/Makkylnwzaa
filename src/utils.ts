import { Transaction, CategoryInfo } from './types';

export const EXPENSE_CATEGORIES: Record<string, CategoryInfo> = {
  'อาหาร': { name: 'อาหาร', icon: 'Utensils', color: '#f97316' }, // orange-500
  'การเดินทาง': { name: 'การเดินทาง', icon: 'Car', color: '#3b82f6' }, // blue-500
  'ช้อปปิ้ง': { name: 'ช้อปปิ้ง', icon: 'ShoppingBag', color: '#ec4899' }, // pink-500
  'ที่อยู่อาศัย/บิล': { name: 'ที่อยู่อาศัย/บิล', icon: 'CreditCard', color: '#ef4444' }, // red-500
  'ความบันเทิง': { name: 'ความบันเทิง', icon: 'Film', color: '#a855f7' }, // purple-500
  'สุขภาพ': { name: 'สุขภาพ', icon: 'HeartPulse', color: '#10b981' }, // emerald-500
  'อื่นๆ': { name: 'อื่นๆ', icon: 'CircleEllipsis', color: '#6b7280' }, // gray-500
};

export const INCOME_CATEGORIES: Record<string, CategoryInfo> = {
  'เงินเดือน': { name: 'เงินเดือน', icon: 'Wallet', color: '#059669' }, // emerald-600
  'ฟรีแลนซ์': { name: 'ฟรีแลนซ์', icon: 'Briefcase', color: '#0d9488' }, // teal-600
  'การลงทุน': { name: 'การลงทุน', icon: 'TrendingUp', color: '#4f46e5' }, // indigo-600
  'อื่นๆ': { name: 'อื่นๆ', icon: 'PiggyBank', color: '#0891b2' }, // cyan-600
};

export const ALL_CATEGORIES = { ...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES };

export function formatThaiCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatThaiDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const months = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear() + 543; // Thai Buddhist Era
  
  return `${day} ${month} ${year}`;
}

export function getThaiMonthYear(yearMonthStr: string): string {
  const [year, month] = yearMonthStr.split('-');
  const monthIndex = parseInt(month, 10) - 1;
  const yearThai = parseInt(year, 10) + 543;
  
  const fullMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  
  return `${fullMonths[monthIndex]} ${yearThai}`;
}

export const SEED_TRANSACTIONS: Transaction[] = [
  // July 2026 (Current Month)
  { id: 't1', amount: 45000, type: 'income', category: 'เงินเดือน', date: '2026-07-01', note: 'เงินเดือนประจำเดือน ก.ค.' },
  { id: 't2', amount: 8500, type: 'income', category: 'ฟรีแลนซ์', date: '2026-07-03', note: 'ทำเว็บให้ลูกค้า' },
  { id: 't3', amount: 12000, type: 'expense', category: 'ที่อยู่อาศัย/บิล', date: '2026-07-01', note: 'ค่าเช่าคอนโด' },
  { id: 't4', amount: 1540, type: 'expense', category: 'ที่อยู่อาศัย/บิล', date: '2026-07-02', note: 'ค่าน้ำค่าไฟ' },
  { id: 't5', amount: 450, type: 'expense', category: 'อาหาร', date: '2026-07-04', note: 'มื้อเย็นกับเพื่อน' },
  { id: 't6', amount: 120, type: 'expense', category: 'อาหาร', date: '2026-07-04', note: 'กาแฟเช้า' },
  { id: 't7', amount: 350, type: 'expense', category: 'การเดินทาง', date: '2026-07-02', note: 'เติมเงินบัตร BTS' },
  { id: 't8', amount: 2400, type: 'expense', category: 'ช้อปปิ้ง', date: '2026-07-03', note: 'เสื้อเชิ้ตใหม่' },
  { id: 't9', amount: 500, type: 'expense', category: 'สุขภาพ', date: '2026-07-03', note: 'วิตามินบำรุง' },
  
  // June 2026 (Previous Month)
  { id: 't10', amount: 45000, type: 'income', category: 'เงินเดือน', date: '2026-06-01', note: 'เงินเดือนประจำเดือน มิ.ย.' },
  { id: 't11', amount: 12000, type: 'expense', category: 'ที่อยู่อาศัย/บิล', date: '2026-06-01', note: 'ค่าเช่าคอนโด มิ.ย.' },
  { id: 't12', amount: 1890, type: 'expense', category: 'ที่อยู่อาศัย/บิล', date: '2026-06-02', note: 'ค่าน้ำค่าไฟ มิ.ย.' },
  { id: 't13', amount: 4800, type: 'expense', category: 'อาหาร', date: '2026-06-15', note: 'ทานอาหารญี่ปุ่นฉลองวันเกิด' },
  { id: 't14', amount: 3200, type: 'expense', category: 'ช้อปปิ้ง', date: '2026-06-18', note: 'รองเท้าวิ่งใหม่' },
  { id: 't15', amount: 1500, type: 'expense', category: 'ความบันเทิง', date: '2026-06-20', note: 'ตั๋วคอนเสิร์ต' },
  { id: 't16', amount: 3500, type: 'income', category: 'การลงทุน', date: '2026-06-25', note: 'เงินปันผลหุ้น' },
  { id: 't17', amount: 650, type: 'expense', category: 'การเดินทาง', date: '2026-06-10', note: 'ค่าน้ำมันรถ' },
  { id: 't18', amount: 1200, type: 'expense', category: 'สุขภาพ', date: '2026-06-22', note: 'ตรวจสุขภาพประจำปี' },

  // May 2026 (Two months ago)
  { id: 't19', amount: 45000, type: 'income', category: 'เงินเดือน', date: '2026-05-01', note: 'เงินเดือน พ.ค.' },
  { id: 't20', amount: 12000, type: 'expense', category: 'ที่อยู่อาศัย/บิล', date: '2026-05-01', note: 'ค่าเช่าคอนโด พ.ค.' },
  { id: 't21', amount: 5200, type: 'expense', category: 'อาหาร', date: '2026-05-10', note: 'วัตถุดิบทำอาหารรายเดือน' },
  { id: 't22', amount: 800, type: 'expense', category: 'การเดินทาง', date: '2026-05-12', note: 'ค่ารถไฟฟ้ากลับบ้าน' },
  { id: 't23', amount: 1500, type: 'expense', category: 'ช้อปปิ้ง', date: '2026-05-18', note: 'ของใช้ส่วนตัว' }
];
