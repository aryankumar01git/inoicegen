export interface InvoiceItem {
    id: string;
    name: string;
    quantity: number;
    rate: number;
    amount: number;
    gst: number; // Percentage
    discount: number; // Percentage
}

export interface CustomerDetails {
    name: string;
    address: string;
    gstin?: string;
    mobile?: string;
    telegram?: string;
}

export interface PaymentDetails {
    paidAmount: number;
    dueDate?: string; // ISO Date string
    paymentMode?: 'CASH' | 'ONLINE' | 'UPI' | 'CHEQUE';
}

export type InvoiceStatus = 'PAID' | 'PARTIAL' | 'DUE';

export interface Invoice {
    id?: string;
    invoiceNo: string;
    date: string; // ISO Date string
    customerDetails: CustomerDetails;
    items: InvoiceItem[];
    paymentDetails: PaymentDetails;
    previousBalance: number;
    roundOff: number;
    grandTotal: number;
    status: InvoiceStatus;
    createdAt: any; // Firebase Timestamp
}

export interface ShopSettings {
    shopName: string;
    ownerName: string;
    address: string;
    gstin: string;
    mobile: string;
    email?: string;
    websiteUrl?: string;
    logoUrl?: string;
    signatureUrl?: string;
    sealUrl?: string;
    bankDetails?: string;
    termsAndConditions: string;
    customFooterMessage: string;
    allowItemDiscount: boolean;
    showGST: boolean;
    invoicePrimaryUseCase: 'GENERAL' | 'THERMAL_PRINTER';
    // Watermark settings
    watermarkText?: string;
    watermarkSize?: number;
    watermarkOpacity?: number;
    watermarkRotation?: number;
    watermarkColor?: string;
    showWatermark?: boolean;
}

export interface InventoryItem {
    id: string;
    name: string;
    rate: number;
    gst?: number;
    stock?: number;
}

export interface ProfitRecord {
    id?: string;
    userId: string;
    invoiceNo: string;
    date: string; // ISO date YYYY-MM-DD
    profit: number;
    grandTotal: number;
    paidAmount: number;
    createdAt: any; // Firebase Timestamp
}

export interface AnalyticsSummary {
    totalProfit: number;
    todayProfit: number;
    weekProfit: number;
    monthProfit: number;
    dailyProfit: { date: string; profit: number; total: number }[];
    weeklyProfit: { week: string; profit: number; total: number }[];
    monthlyProfit: { month: string; profit: number; total: number }[];
}

