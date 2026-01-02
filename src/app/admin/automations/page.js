'use client';

import { useState, useEffect } from 'react';
import { getAutomationData } from '@/lib/actions';
import { Loader2, RefreshCw, Smartphone, CheckCircle, XCircle } from 'lucide-react';
import QRCode from 'react-qr-code'; // Need to add to package.json? Or use 'qrcode.react' 
// Safe bet: Use 'qrcode' package I installed and render <img>, or just use a simple react lib.
// Wait, I installed 'qrcode' for backend. For frontend, 'react-qr-code' is easy.
// I'll assume I can install it or use a simple img src approach if I generated base64.
// My worker saves the raw QR string. 
// I'll use a library or just display the string? No, need a visual code.
// Let's use `react-qr-code` which is standard.

export default function AutomationsPage() {
    const [data, setData] = useState({ queue: [], qr: null, status: 'loading' });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        const res = await getAutomationData();
        setData(res);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Automações & WhatsApp</h1>
                    <p className="text-gray-500">Gerencie a fila de envios e conexão</p>
                </div>
                <button onClick={fetchData} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Connection Status Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                    <Smartphone size={48} className={`mb-4 ${data.status === 'connected' ? 'text-green-500' : 'text-gray-300'}`} />
                    <h3 className="text-xl font-bold mb-1">
                        {data.status === 'connected' ? 'WhatsApp Conectado' :
                            data.status === 'qrcode' ? 'Aguardando Leitura' : 'Desconectado'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        {data.status === 'connected' ? 'O sistema está pronto para enviar mensagens.' : 'Escaneie o QR Code abaixo para conectar.'}
                    </p>

                    {data.status !== 'connected' && data.qr && (
                        <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-200 flex flex-col items-center">
                            <QRCode value={data.qr} size={192} />
                            <p className="text-xs text-center text-gray-400 mt-4 break-all max-w-[200px]">
                                {data.qr.substring(0, 15)}...
                            </p>
                        </div>
                    )}
                </div>

                {/* Statistics Card */}
                <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Fila de Envios</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="p-3 rounded-l-lg">Para</th>
                                    <th className="p-3">Mensagem</th>
                                    <th className="p-3">Agendado</th>
                                    <th className="p-3 rounded-r-lg">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.queue.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-gray-400">
                                            A fila está vazia.
                                        </td>
                                    </tr>
                                ) : (
                                    data.queue.map(msg => (
                                        <tr key={msg.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                            <td className="p-3 font-medium">{msg.phone}</td>
                                            <td className="p-3 max-w-xs truncate" title={msg.content}>
                                                {msg.content}
                                            </td>
                                            <td className="p-3 text-gray-500">
                                                {new Date(msg.scheduledAt * 1000).toLocaleTimeString()}
                                            </td>
                                            <td className="p-3">
                                                <span className={`
                                                    px-2 py-1 rounded-full text-xs font-bold
                                                    ${msg.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        msg.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                                                `}>
                                                    {msg.status.toUpperCase()}
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
        </div>
    );
}
