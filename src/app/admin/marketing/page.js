'use client';

import { useState, useEffect } from 'react';
import { Mail, MessageCircle, Send, Play, Pause, AlertTriangle, Download, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getCustomersForMarketing, getCustomersForEmail } from '@/app/actions/marketing';

export default function MarketingPage() {
    const [activeTab, setActiveTab] = useState('whatsapp'); // whatsapp | email
    const [whatsappCustomers, setWhatsappCustomers] = useState([]);
    const [emailCustomers, setEmailCustomers] = useState([]);
    const [message, setMessage] = useState('Olá [Nome], sentimos sua falta! Temos novidades na Vapor Fumê.');
    const [emailSubject, setEmailSubject] = useState('Novidades da Vapor Fumê para você!');
    const [emailBody, setEmailBody] = useState('Olá [Nome],\n\nConfira nossas novas ofertas exclusivas.\n\nAtenciosamente,\nVapor Fumê');

    // WhatsApp Safety & Queue Settings
    const [delaySeconds, setDelaySeconds] = useState(15);
    const [isSending, setIsSending] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [waData, emailData] = await Promise.all([
            getCustomersForMarketing(),
            getCustomersForEmail()
        ]);
        setWhatsappCustomers(waData);
        setEmailCustomers(emailData);
    };

    // --- WhatsApp Logic ---
    const handleStartQueue = () => {
        if (!message) {
            toast.error('Digite uma mensagem.');
            return;
        }
        if (whatsappCustomers.length === 0) {
            toast.error('Nenhum cliente com telefone encontrado.');
            return;
        }

        const confirmStart = window.confirm(`ATENÇÃO: Isso abrirá ${whatsappCustomers.length} abas do WhatsApp Web sequencialmente a cada ${delaySeconds} segundos. Certifique-se de estar logado no WhatsApp Web.\n\nDeseja iniciar?`);

        if (confirmStart) {
            setIsSending(true);
            setPaused(false);
            setCurrentIndex(0);
            setLogs(prev => [`[${new Date().toLocaleTimeString()}] Iniciando campanha WhatsApp para ${whatsappCustomers.length} contatos...`, ...prev]);
        }
    };

    useEffect(() => {
        let timer;
        if (isSending && !paused && currentIndex < whatsappCustomers.length) {
            timer = setTimeout(() => {
                sendNextMessage();
            }, currentIndex === 0 ? 100 : delaySeconds * 1000); // 1st message immediate
        } else if (currentIndex >= whatsappCustomers.length && isSending) {
            setIsSending(false);
            toast.success('Campanha Finalizada!');
            setLogs(prev => [`[${new Date().toLocaleTimeString()}] Campanha finalizada com sucesso.`, ...prev]);
        }
        return () => clearTimeout(timer);
    }, [isSending, paused, currentIndex, whatsappCustomers]);

    const sendNextMessage = () => {
        const customer = whatsappCustomers[currentIndex];
        const personalizedMsg = message.replace('[Nome]', customer.name.split(' ')[0]);
        const encodedMsg = encodeURIComponent(personalizedMsg);

        // Open WhatsApp Link
        const url = `https://web.whatsapp.com/send?phone=55${customer.phone}&text=${encodedMsg}`;
        window.open(url, '_blank');

        setLogs(prev => [`[${new Date().toLocaleTimeString()}] Enviado para ${customer.name} (${currentIndex + 1}/${whatsappCustomers.length})`, ...prev]);
        setCurrentIndex(prev => prev + 1);
    };

    // --- Email Logic ---
    const handleExportEmails = () => {
        if (emailCustomers.length === 0) {
            toast.error('Nenhum cliente com email encontrado.');
            return;
        }

        const csvContent = "data:text/csv;charset=utf-8,"
            + "Nome,Email,Ultima Compra\n"
            + emailCustomers.map(e => `${e.name},${e.email},${new Date(e.lastOrderDate).toLocaleDateString()}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "lista_emails_clientes.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`Lista de ${emailCustomers.length} emails exportada!`);
    };

    const handleCopyEmails = () => {
        if (emailCustomers.length === 0) return;
        const emails = emailCustomers.map(c => c.email).join(', ');
        navigator.clipboard.writeText(emails);
        toast.success('Emails copiados para a área de transferência!');
    };

    const handleSendTestEmail = () => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 2000)),
            {
                loading: 'Simulando envio...',
                success: 'Envio simulado com sucesso! (Nenhum email real foi enviado)',
                error: 'Erro no envio'
            }
        );
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Campanhas de Marketing</h1>
                    <p className="text-gray-500">Gerencie suas campanhas de engajamento via WhatsApp e Email.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('whatsapp')}
                    className={`pb-4 px-4 font-medium transition-colors relative ${activeTab === 'whatsapp' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        WhatsApp
                    </div>
                    {activeTab === 'whatsapp' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 rounded-t-full"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('email')}
                    className={`pb-4 px-4 font-medium transition-colors relative ${activeTab === 'email' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Email Marketing
                    </div>
                    {activeTab === 'email' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                </button>
            </div>

            {activeTab === 'whatsapp' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Configuration */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs">1</span>
                                Configuração da Mensagem
                            </h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                                <textarea
                                    rows={4}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none font-sans"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                                <p className="text-xs text-gray-400 mt-2">Variáveis: [Nome] será substituído pelo primeiro nome do cliente.</p>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                                <div className="text-xs text-yellow-800">
                                    <strong>Segurança Anti-Bloqueio:</strong> Configure um intervalo seguro (sugerimos 30s+).
                                    O sistema abrirá uma nova aba para cada cliente. Não feche esta tela enquanto roda.
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs">2</span>
                                    Execução
                                </h3>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600">Intervalo (segundos):</label>
                                    <input
                                        type="number"
                                        value={delaySeconds}
                                        onChange={e => setDelaySeconds(parseInt(e.target.value))}
                                        className="w-20 p-2 border border-gray-200 rounded-lg text-center font-bold"
                                        min="5"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                {!isSending ? (
                                    <button
                                        onClick={handleStartQueue}
                                        className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Play className="w-5 h-5" /> Iniciar Disparo
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setPaused(!paused)}
                                        className={`flex-1 ${paused ? 'bg-blue-600' : 'bg-yellow-500'} text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2`}
                                    >
                                        {paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                                        {paused ? 'Retomar' : 'Pausar'}
                                    </button>
                                )}

                                {isSending && (
                                    <button onClick={() => { setIsSending(false); setCurrentIndex(0); }} className="p-4 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200">
                                        Cancelar
                                    </button>
                                )}
                            </div>

                            {/* Progress Bar */}
                            {isSending && (
                                <div className="mt-6">
                                    <div className="flex justify-between text-sm mb-2 text-gray-600">
                                        <span>Progresso: {currentIndex} / {whatsappCustomers.length}</span>
                                        <span>{Math.round((currentIndex / whatsappCustomers.length) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-green-500 h-full transition-all duration-500"
                                            style={{ width: `${(currentIndex / whatsappCustomers.length) * 100}%` }}
                                        ></div>
                                    </div>
                                    {!paused && currentIndex < whatsappCustomers.length && (
                                        <p className="text-center text-xs text-gray-400 mt-2 animate-pulse">
                                            Próximo envio em {delaySeconds}s...
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Lists & Logs */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Audience List */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-h-[300px] overflow-y-auto">
                            <h3 className="font-semibold text-gray-900 mb-4 sticky top-0 bg-white pb-2 border-b">
                                Lista de Envio ({whatsappCustomers.length})
                            </h3>
                            {whatsappCustomers.length === 0 ? (
                                <p className="text-gray-400 text-sm">Nenhum cliente com telefone encontrado.</p>
                            ) : (
                                <div className="space-y-3">
                                    {whatsappCustomers.map((c, i) => (
                                        <div key={i} className={`flex justify-between items-center text-sm p-2 rounded ${i === currentIndex && isSending ? 'bg-green-50 border border-green-200' : ''}`}>
                                            <div>
                                                <p className="font-medium text-gray-800">{c.name}</p>
                                                <p className="text-xs text-gray-400">{c.phone}</p>
                                            </div>
                                            {i < currentIndex && <span className="text-green-600 text-xs font-bold">Enviado</span>}
                                            {i === currentIndex && isSending && <span className="text-blue-600 text-xs font-bold">Enviando...</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Logs */}
                        <div className="bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-800 h-[300px] overflow-y-auto font-mono text-xs">
                            <h3 className="font-semibold text-gray-400 mb-2 sticky top-0 bg-gray-900 pb-2 border-b border-gray-800">
                                Log de Execução
                            </h3>
                            <div className="space-y-1">
                                {logs.length === 0 && <p className="text-gray-600 italic">Aguardando início...</p>}
                                {logs.map((log, i) => (
                                    <p key={i} className="text-green-400">{log}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-4">Compor Email</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                                        value={emailSubject}
                                        onChange={(e) => setEmailSubject(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Corpo do Email</label>
                                    <textarea
                                        rows={8}
                                        className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 resize-none"
                                        value={emailBody}
                                        onChange={(e) => setEmailBody(e.target.value)}
                                    />
                                    <p className="text-xs text-gray-400 mt-2">Suporte a texto simples. Para HTML avançado, utilize uma ferramenta externa com nossa lista de exportação.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-4">Ações de Disparo</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={handleSendTestEmail}
                                    className="p-4 border border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Send className="w-5 h-5" /> Simular Envio (Teste)
                                </button>
                                <button
                                    onClick={handleExportEmails}
                                    className="p-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Download className="w-5 h-5" /> Exportar Lista (CSV)
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-4 text-center">
                                Nota: Para envios em massa reais, recomendamos exportar a lista e usar serviços como Mailchimp, Resend ou Brevo para garantir entregabilidade.
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <h3 className="font-semibold text-gray-900">Público Alvo ({emailCustomers.length})</h3>
                                <button onClick={handleCopyEmails} title="Copiar todos" className="text-gray-400 hover:text-blue-600">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>

                            {emailCustomers.length === 0 ? (
                                <p className="text-gray-400 text-sm">Nenhum email cadastrado.</p>
                            ) : (
                                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                    {emailCustomers.map((c, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded">
                                            <div>
                                                <p className="font-medium text-gray-800">{c.name}</p>
                                                <p className="text-xs text-gray-500">{c.email}</p>
                                            </div>
                                            <span className="text-xs text-gray-400">{new Date(c.lastOrderDate).toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
