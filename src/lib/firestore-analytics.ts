import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { ProfitRecord, AnalyticsSummary } from './types';
// Custom date utility functions to replace date-fns
const startOfDay = (date: Date | string): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const endOfDay = (date: Date | string): Date => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
};

const startOfWeek = (date: Date | string): Date => {
    const d = new Date(date);
    const day = d.getDay(); // 0 (Sun) - 6 (Sat)
    const diff = (day + 6) % 7; // days since Monday
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

const endOfWeek = (date: Date | string): Date => {
    const start = startOfWeek(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
};

const startOfMonth = (date: Date | string): Date => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
};

const endOfMonth = (date: Date | string): Date => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
};

const format = (date: Date | string, _fmt: string): string => {
    // Simple YYYY-MM-DD format, ignoring fmt for now
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// End of custom date utilities


// Save profit record to Firebase
export const saveProfitRecord = async (
    userId: string,
    invoiceNo: string,
    grandTotal: number,
    paidAmount: number
): Promise<void> => {
    const profit = paidAmount; // For now, profit = paid amount (can be customized)
    const today = format(new Date(), 'yyyy-MM-dd');

    const profitRecord: ProfitRecord = {
        userId,
        invoiceNo,
        date: today,
        profit,
        grandTotal,
        paidAmount,
        createdAt: Timestamp.now()
    };

    console.log('💰 Saving profit record:', profitRecord);
    await addDoc(collection(db, 'profits'), profitRecord);
    console.log('✅ Profit record saved successfully');
};

// Get profit records for a date range
export const getProfitRecords = async (
    userId: string,
    startDate: Date,
    endDate: Date
): Promise<ProfitRecord[]> => {
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');

    const q = query(
        collection(db, 'profits'),
        where('userId', '==', userId),
        where('date', '>=', startDateStr),
        where('date', '<=', endDateStr),
        orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProfitRecord));
};

// Get analytics summary
export const getAnalyticsSummary = async (userId: string): Promise<AnalyticsSummary> => {
    const now = new Date();

    // Get all records for the current month
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const allRecords = await getProfitRecords(userId, monthStart, monthEnd);

    // Calculate totals
    const totalProfit = allRecords.reduce((sum, record) => sum + record.profit, 0);

    // Today's profit
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const todayRecords = allRecords.filter(r => {
        const recordDate = new Date(r.date);
        return recordDate >= todayStart && recordDate <= todayEnd;
    });
    const todayProfit = todayRecords.reduce((sum, record) => sum + record.profit, 0);

    // This week's profit
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const weekRecords = allRecords.filter(r => {
        const recordDate = new Date(r.date);
        return recordDate >= weekStart && recordDate <= weekEnd;
    });
    const weekProfit = weekRecords.reduce((sum, record) => sum + record.profit, 0);

    // This month's profit (already have all records)
    const monthProfit = totalProfit;

    // Group by day
    const dailyMap = new Map<string, { profit: number; total: number }>();
    allRecords.forEach(record => {
        const existing = dailyMap.get(record.date) || { profit: 0, total: 0 };
        dailyMap.set(record.date, {
            profit: existing.profit + record.profit,
            total: existing.total + record.grandTotal
        });
    });
    const dailyProfit = Array.from(dailyMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

    // Group by week (simplified - using week start date)
    const weeklyMap = new Map<string, { profit: number; total: number }>();
    allRecords.forEach(record => {
        const recordDate = new Date(record.date);
        const weekStartDate = format(startOfWeek(recordDate), 'yyyy-MM-dd');
        const existing = weeklyMap.get(weekStartDate) || { profit: 0, total: 0 };
        weeklyMap.set(weekStartDate, {
            profit: existing.profit + record.profit,
            total: existing.total + record.grandTotal
        });
    });
    const weeklyProfit = Array.from(weeklyMap.entries())
        .map(([week, data]) => ({ week, ...data }))
        .sort((a, b) => a.week.localeCompare(b.week));

    // Group by month (using YYYY-MM format)
    const monthlyMap = new Map<string, { profit: number; total: number }>();
    allRecords.forEach(record => {
        const month = record.date.substring(0, 7); // YYYY-MM
        const existing = monthlyMap.get(month) || { profit: 0, total: 0 };
        monthlyMap.set(month, {
            profit: existing.profit + record.profit,
            total: existing.total + record.grandTotal
        });
    });
    const monthlyProfit = Array.from(monthlyMap.entries())
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month));

    return {
        totalProfit,
        todayProfit,
        weekProfit,
        monthProfit,
        dailyProfit,
        weeklyProfit,
        monthlyProfit
    };
};
