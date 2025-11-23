import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import type { Invoice, ShopSettings } from '../../lib/types';
import { formatCurrency, formatDate } from '../../lib/utils';

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 10,
        padding: 30,
        flexDirection: 'column',
    },
    watermark: {
        position: 'absolute',
        top: '40%',
        left: '20%',
        transform: 'rotate(-45deg)',
        fontSize: 60,
        color: 'rgba(200, 200, 200, 0.2)',
        zIndex: -1,
    },
    container: {
        border: '1px solid #000',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        padding: 10,
        borderBottom: '1px solid #000',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    shopDetails: {
        width: '60%',
    },
    invoiceDetails: {
        width: '40%',
        textAlign: 'right',
    },
    shopName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    customerSection: {
        padding: 10,
        borderBottom: '1px solid #000',
        flexDirection: 'row',
    },
    customerCol: {
        width: '50%',
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottom: '1px solid #000',
        backgroundColor: '#f0f0f0',
        paddingVertical: 5,
        fontSize: 9,
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '0.5px solid #ddd',
        paddingVertical: 4,
        fontSize: 9,
    },
    // Column widths
    col1: { width: '5%', textAlign: 'center', paddingHorizontal: 2 },
    col2: { width: '40%', paddingHorizontal: 2 },
    col3: { width: '10%', textAlign: 'center', paddingHorizontal: 2 },
    col4: { width: '15%', textAlign: 'right', paddingHorizontal: 2 },
    col5: { width: '10%', textAlign: 'center', paddingHorizontal: 2 },
    col6: { width: '20%', textAlign: 'right', paddingHorizontal: 2 },

    footer: {
        borderTop: '1px solid #000',
        padding: 10,
        marginTop: 10,
    },
    totalsSection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 10,
    },
    totalRow: {
        flexDirection: 'row',
        width: 200,
        justifyContent: 'space-between',
        marginBottom: 3,
        fontSize: 10,
    },
    terms: {
        fontSize: 8,
        marginTop: 5,
        color: '#444',
    },
    fixedFooter: {
        position: 'absolute',
        bottom: 5,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 8,
        color: '#666',
    },
});

interface InvoicePDFProps {
    invoice: Invoice;
    settings: ShopSettings;
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, settings }) => {
    // Calculate totals
    const dueAmount = invoice.grandTotal + invoice.previousBalance - invoice.paymentDetails.paidAmount;

    // Watermark style based on settings
    const watermarkStyle = {
        position: 'absolute' as const,
        top: '40%',
        left: '20%',
        transform: `rotate(${settings.watermarkRotation || -45}deg)`,
        fontSize: settings.watermarkSize || 60,
        color: settings.watermarkColor || '#cccccc',
        opacity: settings.watermarkOpacity || 0.2,
        zIndex: -1,
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Watermark - conditional */}
                {(settings.showWatermark ?? true) && (
                    <Text style={watermarkStyle}>
                        {settings.watermarkText || settings.shopName}
                    </Text>
                )}

                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.shopDetails}>
                            <Text style={styles.shopName}>{settings.shopName}</Text>
                            <Text>{settings.ownerName}</Text>
                            <Text>{settings.address}</Text>
                            <Text>GSTIN: {settings.gstin}</Text>
                            <Text>Mobile: {settings.mobile}</Text>
                        </View>
                        <View style={styles.invoiceDetails}>
                            <Text style={{ fontSize: 14, fontWeight: 'bold' }}>INVOICE</Text>
                            <Text>No: {invoice.invoiceNo}</Text>
                            <Text>Date: {formatDate(invoice.date)}</Text>
                            <Text>Status: {invoice.status}</Text>
                        </View>
                    </View>

                    {/* Customer Details */}
                    <View style={styles.customerSection}>
                        <View style={styles.customerCol}>
                            <Text style={{ fontWeight: 'bold' }}>Bill To:</Text>
                            <Text>{invoice.customerDetails.name}</Text>
                            <Text>{invoice.customerDetails.address}</Text>
                            {invoice.customerDetails.gstin && <Text>GSTIN: {invoice.customerDetails.gstin}</Text>}
                        </View>
                        <View style={styles.customerCol}>
                            {invoice.customerDetails.mobile && <Text>Mobile: {invoice.customerDetails.mobile}</Text>}
                        </View>
                    </View>

                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <Text style={styles.col1}>SN</Text>
                        <Text style={styles.col2}>Item Description</Text>
                        <Text style={styles.col3}>Qty</Text>
                        <Text style={styles.col4}>Rate</Text>
                        <Text style={styles.col5}>{settings.allowItemDiscount ? 'Disc%' : 'GST%'}</Text>
                        <Text style={styles.col6}>Amount</Text>
                    </View>

                    {/* Table Rows */}
                    <View>
                        {invoice.items.map((item, idx) => (
                            <View key={item.id} style={styles.tableRow}>
                                <Text style={styles.col1}>{idx + 1}</Text>
                                <Text style={styles.col2}>{item.name}</Text>
                                <Text style={styles.col3}>{item.quantity}</Text>
                                <Text style={styles.col4}>{Number(item.rate).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                                <Text style={styles.col5}>
                                    {settings.allowItemDiscount ? item.discount : item.gst}
                                </Text>
                                <Text style={styles.col6}>{Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <View style={styles.totalsSection}>
                            <View>
                                <View style={styles.totalRow}>
                                    <Text>Grand Total:</Text>
                                    <Text style={{ fontWeight: 'bold' }}>₹{Number(invoice.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                                </View>
                                <View style={styles.totalRow}>
                                    <Text>Paid Amount:</Text>
                                    <Text>₹{Number(invoice.paymentDetails.paidAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                                </View>
                                <View style={styles.totalRow}>
                                    <Text>Previous Balance:</Text>
                                    <Text>₹{Number(invoice.previousBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                                </View>
                                <View style={[styles.totalRow, { borderTop: '1px solid #000', paddingTop: 3, marginTop: 3 }]}>
                                    <Text style={{ fontWeight: 'bold' }}>Due Amount:</Text>
                                    <Text style={{ fontWeight: 'bold', color: invoice.status === 'PAID' ? 'green' : 'red' }}>
                                        ₹{Number(dueAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                            <View style={{ width: '60%' }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 9 }}>Terms & Conditions:</Text>
                                <Text style={styles.terms}>{settings.termsAndConditions}</Text>
                                <Text style={{ marginTop: 5, fontStyle: 'italic' }}>{settings.customFooterMessage}</Text>
                            </View>
                            <View style={{ width: '35%', alignItems: 'center' }}>
                                <View style={{ height: 40 }} />
                                <Text style={{ borderTop: '1px solid #000', paddingTop: 4 }}>Authorized Signatory</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Fixed Footer */}
                <Text style={styles.fixedFooter}>powered by QYNEX CORE SOFTECH - KD chowk</Text>
            </Page>
        </Document>
    );
};
