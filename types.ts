
export interface BankTransaction {
  [key: string]: string | number | undefined;
  'تاریخ': string;
  'شرح / بابت': string;
  'مبلغ': number;
  'برداشت'?: number; // For chart compatibility
  'واریز'?: number;   // For chart compatibility
  'حساب مبدا'?: string;
  'نام صاحب حساب مبدا'?: string;
  'حساب/شبا مقصد'?: string;
  'نام صاحب حساب مقصد'?: string;
  'شماره تنخواه'?: string;
  'شماره پیگیری'?: string;
  'موجودی'?: number;
}

export interface SystemReport {
  [key: string]: string | number;
  'تاریخ': string;
  'شماره بارنامه': string;
  'شماره انتظامی': string;
  'وضعیت': string;
  'طرف قرارداد': string;
  'راننده': string;
  'شهر مقصد': string;
  'شهر مبدا': string;
  'مقصد': string;
  'مبدا': string;
  'پیش حمل': number;
  'پس حمل': number;
  'کرایه حمل': number;
  'پرداختی': number;
  'مانده کرایه': number;
  'نوع ماشین': string;
}

export interface ReconciliationResult {
  matched: { system: SystemReport; bank: BankTransaction }[];
  unmatchedSystem: SystemReport[];
  unmatchedBank: BankTransaction[];
}

export interface ChartData {
  name: string;
  income: number;
  expense: number;
}

export interface Task {
  id: number;
  text: string;
  completed: boolean;
}
