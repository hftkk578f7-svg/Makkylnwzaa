export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // YYYY-MM-DD
  note?: string;
}

export interface CategoryBudget {
  category: string;
  limit: number;
}

export interface UserProfile {
  email: string;
  name: string;
  avatarUrl?: string;
  isGuest: boolean;
}

export interface CategoryInfo {
  name: string;
  icon: string;
  color: string;
}
