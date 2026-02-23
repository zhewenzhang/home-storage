import { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { X, Download, Printer, Settings2 } from 'lucide-react';

interface QRCodeGeneratorProps {
    locationId: string;
    locationName: string;
    onClose: () => void;
}

export default function QRCodeGenerator({ locationId, locationName, onClose }: QRCodeGeneratorProps) {
    const qrRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState<'standard' | 'square'>('standard');
    const [isGenerating, setIsGenerating] = useState(false);

    // Generate the unique link for this location
    const directLink = `${window.location.origin}/#/items?locationId=${locationId}`;

    const handleDownload = async () => {
        if (!qrRef.current) return;
        setIsGenerating(true);
        try {
            const canvas = await html2canvas(qrRef.current, {
                scale: 4, // High resolution for printing
                useCORS: true,
                backgroundColor: '#FFFFFF',
            });
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `HomeBox_Label_${locationName}.png`;
            link.href = url;
            link.click();
        } catch (err) {
            console.error('保存标签失败:', err);
            alert('保存便签失败，请重试');
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-enter">
            {/* 这是一个仅在打印时生效的全局样式，用于强制隐藏除条码外的界面并且设定纸张 */}
            <style>
                {`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-label, #printable-label * {
              visibility: visible;
            }
            #printable-label {
              position: absolute;
              left: 0;
              top: 0;
              margin: 0;
              padding: 0;
              width: ${size === 'standard' ? '60mm' : '40mm'};
              height: ${size === 'standard' ? '40mm' : '40mm'};
              page-break-after: always;
            }
            @page {
              size: ${size === 'standard' ? '60mm 40mm' : '40mm 40mm'};
              margin: 0;
            }
          }
        `}
            </style>

            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-[#3B6D8C]" />
                        <h3 className="text-lg font-bold text-gray-900">打印数字空间码</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center bg-gray-100/50">
                    {/* Label Preview Container */}
                    <div
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 transition-all flex items-center justify-center relative origin-top"
                        style={{
                            width: size === 'standard' ? '280px' : '200px',
                            height: size === 'standard' ? '180px' : '200px',
                        }}
                    >
                        {/* The actual element to be captured/printed */}
                        <div
                            id="printable-label"
                            ref={qrRef}
                            className={`bg-white text-black flex ${size === 'standard' ? 'flex-row items-center gap-4' : 'flex-col items-center justify-center gap-2'} w-full h-full p-2`}
                            style={{ boxSizing: 'border-box' }}
                        >
                            <QRCodeSVG
                                value={directLink}
                                size={size === 'standard' ? 120 : 130}
                                level="M"
                                includeMargin={false}
                            />
                            <div className={`flex flex-col ${size === 'standard' ? 'items-start justify-center flex-1' : 'items-center'} overflow-hidden`}>
                                <span
                                    className="font-extrabold text-black leading-tight truncate w-full"
                                    style={{ fontSize: size === 'standard' ? '22px' : '18px', textAlign: size === 'standard' ? 'left' : 'center' }}
                                >
                                    {locationName}
                                </span>
                                <span className="text-black font-bold mt-1" style={{ fontSize: '10px' }}>
                                    扫码查看内容
                                </span>
                                <span className="text-black font-bold mt-2 border-t-2 border-black pt-1" style={{ fontSize: '12px' }}>
                                    HomeBox
                                </span>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-center text-gray-400 mt-4 max-w-xs leading-relaxed">
                        将生成的图片发往手机相册，即可使用精臣、兄弟等专属蓝牙标签机 App 完美打印。
                    </p>
                </div>

                <div className="px-6 py-5 bg-white border-t border-gray-100">
                    <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl justify-center">
                        <button
                            onClick={() => setSize('standard')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${size === 'standard' ? 'bg-white shadow text-[#2A4D63]' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            标准横向 (60x40)
                        </button>
                        <button
                            onClick={() => setSize('square')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${size === 'square' ? 'bg-white shadow text-[#2A4D63]' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            小型正方 (40x40)
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleDownload}
                            disabled={isGenerating}
                            className="flex-1 btn-primary flex items-center justify-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            {isGenerating ? '生成中...' : '保存高清图片'}
                        </button>
                        <button
                            onClick={handlePrint}
                            className="px-5 py-3 rounded-2xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2"
                            title="直接调用电脑连接的打印机"
                        >
                            <Printer className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
