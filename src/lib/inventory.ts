import type { InventoryItem } from './types';

export const MOCK_INVENTORY: InventoryItem[] = [
    { id: '1', name: 'Paracetamol 500mg', rate: 20, gst: 12, stock: 100 },
    { id: '2', name: 'Amoxicillin 250mg', rate: 45, gst: 12, stock: 50 },
    { id: '3', name: 'Cough Syrup 100ml', rate: 85, gst: 12, stock: 30 },
    { id: '4', name: 'Vitamin C Tablets', rate: 120, gst: 18, stock: 200 },
    { id: '5', name: 'N95 Mask', rate: 50, gst: 5, stock: 500 },
    { id: '6', name: 'Hand Sanitizer 500ml', rate: 250, gst: 18, stock: 40 },
    { id: '7', name: 'Thermometer Digital', rate: 350, gst: 18, stock: 15 },
    { id: '8', name: 'Bandage Roll', rate: 15, gst: 5, stock: 100 },
    { id: '9', name: 'Cotton Wool 500g', rate: 180, gst: 5, stock: 25 },
    { id: '10', name: 'Surgical Gloves (Pair)', rate: 25, gst: 12, stock: 300 },
];
