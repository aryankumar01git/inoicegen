import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, Download, RefreshCw } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { Invoice, InvoiceItem, PaymentDetails, CustomerDetails, InvoiceStatus, ShopSettings, InventoryItem } from '../../lib/types';
import { calculateItemAmount, formatCurrency } from '../../lib/utils';
import { InvoicePDF } from './InvoicePDF';
import { getInventoryItems } from '../../lib/firestore';
import { saveProfitRecord } from '../../lib/firestore-analytics';
import { useAuth } from '../../contexts/AuthContext';

const initialItem: InvoiceItem = {
    id: '',
    name: '',
    quantity: 1,
    rate: 0,
    amount: 0,
    gst: 0,
    discount: 0
};

const initialPayment: PaymentDetails = {
    paidAmount: 0,
    paymentMode: 'CASH',
    dueDate: ''
};

interface InvoiceFormProps {
    settings: ShopSettings;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ settings }) => {
    const [customer, setCustomer] = useState<CustomerDetails>({ name: '', address: '', gstin: '', mobile: '', telegram: '' });
    const [items, setItems] = useState<InvoiceItem[]>([{ ...initialItem, id: '1' }]);
    const [payment, setPayment] = useState<PaymentDetails>(initialPayment);
    const [previousBalance, setPreviousBalance] = useState<number | ''>('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [invoiceNo, setInvoiceNo] = useState('INV-001');
    const [status, setStatus] = useState<InvoiceStatus>('DUE');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [suggestions, setSuggestions] = useState<{ [key: number]: InventoryItem[] }>({});
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

    const { user } = useAuth();

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        try {
            const items = await getInventoryItems();
            setInventory(items);
            console.log('Inventory loaded:', items.length, 'items');
        } catch (error) {
            console.error('Error loading inventory:', error);
        }
    };

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const totalGST = items.reduce((sum, item) => sum + (item.amount * item.gst / 100), 0);
    const grandTotal = subtotal + totalGST;
    const totalDue = grandTotal + (Number(previousBalance) || 0) - payment.paidAmount;

    useEffect(() => {
        if (totalDue <= 0) {
            setStatus('PAID');
        } else if (payment.paidAmount > 0) {
            setStatus('PARTIAL');
        } else {
            setStatus('DUE');
        }
    }, [totalDue, payment.paidAmount]);

    const currentInvoice: Invoice = {
        invoiceNo,
        date: invoiceDate,
        customerDetails: customer,
        items: items.filter(item => item.name),
        grandTotal,
        previousBalance: Number(previousBalance) || 0,
        paymentDetails: payment,
        status,
        roundOff: 0,
        createdAt: new Date()
    };

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        if (field === 'name') {
            if (value.length > 1) {
                const matches = inventory.filter(item =>
                    item.name.toLowerCase().includes(value.toLowerCase())
                );
                setSuggestions(prev => ({ ...prev, [index]: matches }));
            } else {
                setSuggestions(prev => {
                    const next = { ...prev };
                    delete next[index];
                    return next;
                });
                setSelectedSuggestionIndex(-1);
            }
        }

        if (['quantity', 'rate', 'discount'].includes(field)) {
            const qty = field === 'quantity' ? Number(value) : newItems[index].quantity;
            const rate = field === 'rate' ? Number(value) : newItems[index].rate;
            const disc = field === 'discount' ? Number(value) : newItems[index].discount;
            newItems[index].amount = calculateItemAmount(qty, rate, disc);
        }

        setItems(newItems);
    };

    const selectSuggestion = (index: number, inventoryItem: InventoryItem) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            name: inventoryItem.name,
            rate: inventoryItem.rate,
            gst: inventoryItem.gst ?? 0,
            amount: calculateItemAmount(newItems[index].quantity, inventoryItem.rate, newItems[index].discount)
        };
        setItems(newItems);
        setSuggestions(prev => {
            const next = { ...prev };
            delete next[index];
            return next;
        });
        setSelectedSuggestionIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        const currentSuggestions = suggestions[index] || [];
        if (currentSuggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedSuggestionIndex(prev =>
                prev < currentSuggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
            e.preventDefault();
            selectSuggestion(index, currentSuggestions[selectedSuggestionIndex]);
        }
    };

    const addItem = () => {
        setItems([...items, { ...initialItem, id: Date.now().toString() }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleClear = () => {
        if (confirm('Are you sure you want to clear customer details and items?')) {
            setCustomer({ name: '', address: '', gstin: '', mobile: '', telegram: '' });
            setItems([{ ...initialItem, id: Date.now().toString() }]);
            setPayment({ ...initialPayment, paidAmount: 0 });
            setPreviousBalance('');
            setInvoiceNo(prev => {
                const num = parseInt(prev.split('-')[1]) + 1;
                return `INV-${num.toString().padStart(3, '0')}`;
            });
        }
    };

    const handleAutoFillAmount = () => {
        setPayment(prev => ({ ...prev, paidAmount: grandTotal }));
    };

    const saveInvoiceToAnalytics = async () => {
        if (!user) return;
        try {
            await saveProfitRecord(
                user.uid,
                invoiceNo,
                grandTotal,
                payment.paidAmount
            );
            console.log('Analytics recorded');
        } catch (error) {
            console.error('Error saving analytics:', error);
        }
    };

    const handlePrint = async () => {
        setIsGeneratingPdf(true);
        try {
            await saveInvoiceToAnalytics();
            const blob = await pdf(<InvoicePDF invoice={currentInvoice} settings={settings} />).toBlob();
            const url = URL.createObjectURL(blob);
            const printWindow = window.open(url);
            if (printWindow) {
                printWindow.onload = () => {
                    printWindow.print();
                    URL.revokeObjectURL(url);
                };
            }
        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Failed to generate PDF for printing');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleDownload = async () => {
        setIsGeneratingPdf(true);
        try {
            await saveInvoiceToAnalytics();
            const blob = await pdf(<InvoicePDF invoice={currentInvoice} settings={settings} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice-${invoiceNo}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Failed to generate PDF for download');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleWhatsApp = async () => {
        if (!customer.mobile) {
            alert('Please enter customer mobile number');
            return;
        }

        try {
            const blob = await pdf(<InvoicePDF invoice={currentInvoice} settings={settings} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice-${invoiceNo}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('PDF generation error:', error);
        }

        setTimeout(() => {
            let message = `Hello ${customer.name},\\n\\nHere is your invoice ${invoiceNo} for ₹${grandTotal}.\\n\\nThank you for shopping with ${settings.shopName}!`;
            if (settings.websiteUrl) {
                message += `\\n\\nVisit us: ${settings.websiteUrl}`;
            }
            const waUrl = `https://wa.me/91${customer.mobile}?text=${encodeURIComponent(message)}`;
            window.open(waUrl, '_blank');
        }, 500);
    };

    const handleTelegram = async () => {
        if (!customer.telegram) {
            alert('Please enter customer Telegram username');
            return;
        }

        try {
            const blob = await pdf(<InvoicePDF invoice={currentInvoice} settings={settings} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice-${invoiceNo}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('PDF generation error:', error);
        }

        setTimeout(() => {
            const username = (customer.telegram || '').replace('@', '');
            const tgUrl = `https://t.me/${username}`;
            window.open(tgUrl, '_blank');
        }, 500);
    };

    return (
        <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-xl rounded-2xl my-8 transition-colors duration-200">
            <div className="flex justify-between items-center mb-8 border-b dark:border-gray-700 pb-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">New Invoice</h1>
                <div className="flex gap-3 items-center">
                    <Button variant="outline" onClick={handleClear} title="Clear Form" size="sm">
                        <RefreshCw size={16} />
                    </Button>
                    <div className="flex gap-1.5">
                        <Input
                            label="Invoice No"
                            value={invoiceNo}
                            onChange={(e) => setInvoiceNo(e.target.value)}
                            className="w-32"
                        />
                        <Input
                            type="date"
                            label="Date"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Customer Details</h3>
                    <Input
                        placeholder="Customer Name"
                        value={customer.name}
                        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    />
                    <Input
                        placeholder="Address"
                        value={customer.address}
                        onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            placeholder="GSTIN"
                            value={customer.gstin}
                            onChange={(e) => setCustomer({ ...customer, gstin: e.target.value })}
                        />
                        <Input
                            placeholder="Mobile"
                            value={customer.mobile}
                            onChange={(e) => setCustomer({ ...customer, mobile: e.target.value })}
                        />
                    </div>
                    <Input
                        placeholder="Telegram Username (e.g., @username)"
                        value={customer.telegram}
                        onChange={(e) => setCustomer({ ...customer, telegram: e.target.value })}
                    />
                </div>

                <div className="space-y-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border dark:border-gray-700">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Payment & Status</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Previous Balance"
                            type="number"
                            placeholder="0"
                            value={previousBalance}
                            onChange={(e) => setPreviousBalance(e.target.value === '' ? '' : Number(e.target.value))}
                        />
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Paid Amount
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="0"
                                    value={payment.paidAmount === 0 ? '' : payment.paidAmount.toLocaleString('en-IN')}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/,/g, '');
                                        if (value === '' || /^\d+$/.test(value)) {
                                            setPayment({ ...payment, paidAmount: value === '' ? 0 : Number(value) });
                                        }
                                    }}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                                <button
                                    onClick={handleAutoFillAmount}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-500 transition-colors"
                                    title="Auto-fill with Grand Total"
                                    type="button"
                                >
                                    ↙
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Due Date"
                            type="date"
                            value={payment.dueDate}
                            onChange={(e) => setPayment({ ...payment, dueDate: e.target.value })}
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                            <div className={`px-3 py-2 rounded-lg text-center font-medium ${status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                {status}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Items</h3>
                    <Button onClick={addItem} size="sm">
                        <Plus size={16} /> Add Item
                    </Button>
                </div>

                <div className="overflow-visible">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700">
                                <th className="p-2 text-left text-sm">Item Name</th>
                                <th className="p-2 text-center text-sm w-20">Qty</th>
                                <th className="p-2 text-right text-sm w-24">Rate</th>
                                <th className="p-2 text-center text-sm w-20">{settings.allowItemDiscount ? 'Disc%' : 'GST%'}</th>
                                <th className="p-2 text-right text-sm w-32">Amount</th>
                                <th className="p-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={item.id} className="border-b dark:border-gray-700">
                                    <td className="p-2 relative">
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="Item name"
                                        />
                                        {suggestions[index] && suggestions[index].length > 0 && (
                                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                {suggestions[index].map((suggestion, idx) => (
                                                    <div
                                                        key={suggestion.id}
                                                        onClick={() => selectSuggestion(index, suggestion)}
                                                        className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${idx === selectedSuggestionIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                                                            }`}
                                                    >
                                                        <div className="font-medium text-gray-900 dark:text-white">{suggestion.name}</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">₹{suggestion.rate}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                            className="w-full px-2 py-1 border rounded text-center dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            value={item.rate}
                                            onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                            className="w-full px-2 py-1 border rounded text-right dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            value={settings.allowItemDiscount ? item.discount : item.gst}
                                            onChange={(e) => handleItemChange(index, settings.allowItemDiscount ? 'discount' : 'gst', e.target.value)}
                                            className="w-full px-2 py-1 border rounded text-center dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </td>
                                    <td className="p-2 text-right font-medium dark:text-white">
                                        {formatCurrency(item.amount)}
                                    </td>
                                    <td className="p-2">
                                        <button
                                            onClick={() => removeItem(index)}
                                            className="text-red-500 hover:text-red-700"
                                            disabled={items.length === 1}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-between items-start mb-8">
                <div className="space-y-2">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Actions</h3>
                    <div className="flex gap-2 flex-wrap">
                        <Button onClick={handlePrint} disabled={isGeneratingPdf}>
                            <Printer size={16} /> Print
                        </Button>
                        <Button onClick={handleDownload} variant="secondary" disabled={isGeneratingPdf}>
                            <Download size={16} /> Download
                        </Button>
                        <Button onClick={handleWhatsApp} variant="outline">
                            WhatsApp
                        </Button>
                        <Button onClick={handleTelegram} variant="outline">
                            Telegram
                        </Button>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl min-w-[250px]">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                            <span className="font-medium dark:text-white">{formatCurrency(subtotal)}</span>
                        </div>
                        {settings.showGST && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Total GST:</span>
                                <span className="font-medium dark:text-white">{formatCurrency(totalGST)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold border-t pt-2 dark:border-gray-600">
                            <span className="dark:text-white">Grand Total:</span>
                            <span className="text-blue-600 dark:text-blue-400">{formatCurrency(grandTotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t pt-2 dark:border-gray-600">
                            <span className="text-gray-600 dark:text-gray-400">Balance Due:</span>
                            <span className={`font-bold ${totalDue > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                {formatCurrency(totalDue)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 pt-4">
                <p className="mt-1">Powered by <span className="font-semibold text-blue-600 dark:text-blue-400">QYNEX CORE SOFTECH</span></p>
            </div>
        </div>
    );
};
