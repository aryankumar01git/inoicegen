import React, { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Upload, FileText, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { Button } from '../ui/Button';
import { addInventoryItems, getInventoryItems, clearInventory } from '../../lib/firestore';
import { Trash2 } from 'lucide-react';
import type { InventoryItem } from '../../lib/types';
import { formatCurrency } from '../../lib/utils';

export const InventoryManager: React.FC = () => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const items = await getInventoryItems();
            setInventory(items);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        }
    };

    const processData = async (data: any[]) => {
        try {
            // Filter and clean data
            const items: Omit<InventoryItem, 'id'>[] = data
                .filter((row: any) => {
                    // Skip empty rows
                    if (!row || Object.keys(row).length === 0) return false;
                    // Must have Name and Rate
                    const name = row.Name || row.name;
                    const rate = row.Rate || row.rate;
                    return name && rate && String(name).trim() !== '' && Number(rate) > 0;
                })
                .map((row: any) => {
                    const item: Omit<InventoryItem, 'id'> = {
                        name: String(row.Name || row.name).trim(),
                        rate: Number(row.Rate || row.rate),
                    };

                    // Add optional fields only if they have valid values
                    const gst = row.GST || row.gst;
                    if (gst !== undefined && gst !== null && gst !== '' && !isNaN(Number(gst))) {
                        item.gst = Number(gst);
                    }

                    const stock = row.Stock || row.stock || row.STOCK;
                    if (stock !== undefined && stock !== null && stock !== '' && !isNaN(Number(stock))) {
                        item.stock = Number(stock);
                    }

                    return item;
                });

            if (items.length === 0) {
                throw new Error("No valid items found. Please check that Name and Rate columns exist and have values.");
            }

            await addInventoryItems(items);
            await fetchInventory();
            setUploadStatus({ type: 'success', message: `Successfully uploaded ${items.length} items!` });
        } catch (error: any) {
            setUploadStatus({ type: 'error', message: error.message || "Failed to upload inventory." });
        } finally {
            setLoading(false);
        }
    };

    const handleFile = (file: File) => {
        if (!file) return;
        setLoading(true);
        setUploadStatus(null);

        if (file.name.endsWith('.csv')) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => processData(results.data),
                error: (error) => {
                    setUploadStatus({ type: 'error', message: `CSV Error: ${error.message}` });
                    setLoading(false);
                }
            });
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(sheet);
                    processData(json);
                } catch (error: any) {
                    setUploadStatus({ type: 'error', message: `Excel Error: ${error.message}` });
                    setLoading(false);
                }
            };
            reader.readAsBinaryString(file);
        } else {
            setUploadStatus({ type: 'error', message: "Invalid file type. Please upload CSV or Excel." });
            setLoading(false);
        }
    };

    const handleClearInventory = async () => {
        if (confirm('Are you sure you want to DELETE ALL inventory items? This action cannot be undone.')) {
            if (confirm('Please confirm again: Do you really want to wipe out the entire inventory?')) {
                setLoading(true);
                try {
                    await clearInventory();
                    await fetchInventory();
                    setUploadStatus({ type: 'success', message: 'Inventory cleared successfully!' });
                } catch (error: any) {
                    console.error("Error clearing inventory:", error);
                    setUploadStatus({ type: 'error', message: 'Failed to clear inventory.' });
                } finally {
                    setLoading(false);
                }
            }
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) handleFile(file);
    };

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-xl rounded-2xl my-8 transition-colors duration-200">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Inventory Management</h1>

            {/* Upload Section */}
            <div
                className={`mb-8 p-8 border-2 border-dashed rounded-xl text-center transition-colors duration-200 ${isDragging
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'
                    }`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            >
                <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                        <FileSpreadsheet size={40} className="text-blue-500" />
                    </div>
                    <div>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                            Drag & Drop Excel or CSV here
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Supports .xlsx, .xls, .csv
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            Required: Name, Rate | Optional: GST, Stock
                        </p>
                    </div>

                    <div className="relative mt-2 flex gap-4 justify-center">
                        <div className="relative">
                            <input
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={loading}
                            />
                            <Button disabled={loading} className="gap-2">
                                <Upload size={18} /> {loading ? 'Processing...' : 'Browse Files'}
                            </Button>
                        </div>
                        <Button
                            variant="outline"
                            className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/20"
                            onClick={handleClearInventory}
                            disabled={loading || inventory.length === 0}
                        >
                            <Trash2 size={18} /> Clear Inventory
                        </Button>
                    </div>

                    {uploadStatus && (
                        <div className={`flex items-center gap-2 text-sm font-medium mt-2 ${uploadStatus.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                            {uploadStatus.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            {uploadStatus.message}
                        </div>
                    )}
                </div>
            </div>

            {/* Inventory List */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                        Current Inventory <span className="text-sm font-normal text-gray-500 ml-2">({inventory.length} items)</span>
                    </h2>
                </div>

                <div className="overflow-x-auto border dark:border-gray-700 rounded-lg shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3">Item Name</th>
                                <th className="px-4 py-3">Rate</th>
                                <th className="px-4 py-3">GST %</th>
                                <th className="px-4 py-3">Stock</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                            {inventory.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText size={32} className="text-gray-300 dark:text-gray-600" />
                                            <p>No items found in inventory.</p>
                                            <p className="text-xs">Upload a file to get started.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                inventory.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.name}</td>
                                        <td className="px-4 py-3 dark:text-gray-300">{formatCurrency(item.rate)}</td>
                                        <td className="px-4 py-3 dark:text-gray-300">
                                            <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs">
                                                {item.gst ?? 0}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 dark:text-gray-300">
                                            <span className={`px-2 py-1 rounded-full text-xs ${(item.stock ?? 0) > 10
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {item.stock ?? 0}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
