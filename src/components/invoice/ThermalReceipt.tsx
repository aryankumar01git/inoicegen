import React from 'react';
import type { Invoice, ShopSettings } from '../../lib/types';
import { formatCurrency, formatDate } from '../../lib/utils';

interface ThermalReceiptProps {
    invoice: Invoice;
    settings: ShopSettings;
    width: '33mm' | '58mm';
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ invoice, settings, width }) => {
    // Styles optimized for thermal printing
    const containerStyle: React.CSSProperties = {
        width: width,
        fontFamily: 'monospace',
        fontSize: width === '33mm' ? '10px' : '12px',
        lineHeight: '1.2',
        padding: '2px',
        margin: '0 auto',
        backgroundColor: '#fff',
        color: '#000',
    };

    const headerStyle: React.CSSProperties = {
        textAlign: 'center',
        marginBottom: '10px',
        borderBottom: '1px dashed #000',
        paddingBottom: '5px',
    };

    const tableStyle: React.CSSProperties = {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '10px',
    };

    const rowStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
    };

    return (
        <div className="thermal-receipt" style={containerStyle}>
            <div style={headerStyle}>
                <div style={{ fontWeight: 'bold', fontSize: '1.2em' }}>{settings.shopName}</div>
                <div>{settings.address}</div>
                <div>Mob: {settings.mobile}</div>
                {settings.gstin && <div>GSTIN: {settings.gstin}</div>}
            </div>

            <div style={{ marginBottom: '5px' }}>
                <div style={rowStyle}>
                    <span>Inv: {invoice.invoiceNo}</span>
                    <span>{formatDate(invoice.date)}</span>
                </div>
                <div>Name: {invoice.customerDetails.name}</div>
            </div>

            <div style={{ borderBottom: '1px dashed #000', marginBottom: '5px' }} />

            <table style={tableStyle}>
                <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px dashed #000' }}>
                        <th style={{ width: '50%' }}>Item</th>
                        <th style={{ width: '15%', textAlign: 'center' }}>Qty</th>
                        <th style={{ width: '35%', textAlign: 'right' }}>Amt</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.items.map((item, idx) => (
                        <tr key={idx}>
                            <td style={{ paddingRight: '2px' }}>{item.name}</td>
                            <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                            <td style={{ textAlign: 'right' }}>{formatCurrency(item.amount).replace('₹', '')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ borderTop: '1px dashed #000', paddingTop: '5px' }}>
                <div style={rowStyle}>
                    <span>Total:</span>
                    <span style={{ fontWeight: 'bold' }}>{formatCurrency(invoice.grandTotal)}</span>
                </div>
                {invoice.paymentDetails.paidAmount > 0 && (
                    <div style={rowStyle}>
                        <span>Paid:</span>
                        <span>{formatCurrency(invoice.paymentDetails.paidAmount)}</span>
                    </div>
                )}
                {invoice.previousBalance > 0 && (
                    <div style={rowStyle}>
                        <span>Prev Bal:</span>
                        <span>{formatCurrency(invoice.previousBalance)}</span>
                    </div>
                )}
                <div style={rowStyle}>
                    <span>Due:</span>
                    <span style={{ fontWeight: 'bold' }}>{formatCurrency(invoice.grandTotal + invoice.previousBalance - invoice.paymentDetails.paidAmount)}</span>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.9em' }}>
                <div>{settings.customFooterMessage}</div>
                <div style={{ marginTop: '5px' }}>*** Thank You ***</div>
            </div>
        </div>
    );
};
