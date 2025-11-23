import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { ShopSettings } from '../../lib/types';

interface SettingsFormProps {
    settings: ShopSettings;
    onSave: (settings: ShopSettings) => void;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ settings: initialSettings, onSave }) => {
    const [settings, setSettings] = useState<ShopSettings>(initialSettings);

    const handleChange = (field: keyof ShopSettings, value: any) => {
        setSettings({ ...settings, [field]: value });
    };

    const handleSave = () => {
        onSave(settings);
        alert('Settings saved!');
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-xl rounded-2xl my-8 transition-colors duration-200">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-8 border-b dark:border-gray-700 pb-4">Shop Settings</h1>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Shop Name"
                        value={settings.shopName}
                        onChange={(e) => handleChange('shopName', e.target.value)}
                    />
                    <Input
                        label="Owner Name"
                        value={settings.ownerName}
                        onChange={(e) => handleChange('ownerName', e.target.value)}
                    />
                    <Input
                        label="Address"
                        value={settings.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                    />
                    <Input
                        label="GSTIN"
                        value={settings.gstin}
                        onChange={(e) => handleChange('gstin', e.target.value)}
                    />
                    <Input
                        label="Mobile"
                        value={settings.mobile}
                        onChange={(e) => handleChange('mobile', e.target.value)}
                    />
                    <Input
                        label="Email"
                        value={settings.email || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                    />
                    <Input
                        label="Website URL"
                        placeholder="https://example.com"
                        value={settings.websiteUrl || ''}
                        onChange={(e) => handleChange('websiteUrl', e.target.value)}
                    />
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 h-10">
                            <input
                                type="checkbox"
                                id="allowItemDiscount"
                                checked={settings.allowItemDiscount}
                                onChange={(e) => handleChange('allowItemDiscount', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                            />
                            <label htmlFor="allowItemDiscount" className="text-sm text-gray-700 dark:text-gray-300">
                                Allow Item-wise Discount
                            </label>
                        </div>
                        <div className="flex items-center gap-2 h-10">
                            <input
                                type="checkbox"
                                id="showGST"
                                checked={settings.showGST}
                                onChange={(e) => handleChange('showGST', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                            />
                            <label htmlFor="showGST" className="text-sm text-gray-700 dark:text-gray-300">
                                Show GST in Invoice
                            </label>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Print Details</h3>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Terms & Conditions</label>
                        <textarea
                            className="flex min-h-[100px] w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder-gray-400"
                            value={settings.termsAndConditions}
                            onChange={(e) => handleChange('termsAndConditions', e.target.value)}
                        />
                    </div>
                    <Input
                        label="Custom Footer Message"
                        value={settings.customFooterMessage}
                        onChange={(e) => handleChange('customFooterMessage', e.target.value)}
                    />
                </div>

                {/* Watermark Settings */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Watermark Settings</h3>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="showWatermark"
                            checked={settings.showWatermark ?? true}
                            onChange={(e) => handleChange('showWatermark', e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="showWatermark" className="text-sm text-gray-700 dark:text-gray-300">
                            Show Watermark on Invoice
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Watermark Text</label>
                            <input
                                type="text"
                                className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                value={settings.watermarkText || settings.shopName}
                                onChange={(e) => handleChange('watermarkText', e.target.value)}
                                placeholder="Enter watermark text"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Font Size: {settings.watermarkSize || 60}px
                            </label>
                            <input
                                type="range"
                                min="30"
                                max="120"
                                value={settings.watermarkSize || 60}
                                onChange={(e) => handleChange('watermarkSize', Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Opacity: {((settings.watermarkOpacity || 0.2) * 100).toFixed(0)}%
                            </label>
                            <input
                                type="range"
                                min="0.05"
                                max="0.5"
                                step="0.05"
                                value={settings.watermarkOpacity || 0.2}
                                onChange={(e) => handleChange('watermarkOpacity', Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Rotation: {settings.watermarkRotation || -45}°
                            </label>
                            <input
                                type="range"
                                min="-90"
                                max="90"
                                value={settings.watermarkRotation || -45}
                                onChange={(e) => handleChange('watermarkRotation', Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Watermark Color</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={settings.watermarkColor || '#cccccc'}
                                    onChange={(e) => handleChange('watermarkColor', e.target.value)}
                                    className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={settings.watermarkColor || '#cccccc'}
                                    onChange={(e) => handleChange('watermarkColor', e.target.value)}
                                    className="flex h-10 flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                    placeholder="#cccccc"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button className="gap-2" onClick={handleSave}>
                        <Save size={18} /> Save Settings
                    </Button>
                </div>
            </div>
        </div>
    );
};
