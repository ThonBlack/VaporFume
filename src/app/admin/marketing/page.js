'use client';

import { useState, useEffect } from 'react';
import { Mail, MessageCircle, Send, Play, Pause, AlertTriangle, Download, Copy, Users, Clock, Trash2, RefreshCw, Plus, X, Upload as UploadIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getLeads, getQueueStatus, addToQueue, removeFromQueue, importLeads, createCampaignBatch } from '@/app/actions/marketing';
import * as XLSX from 'xlsx';

export default function MarketingHub() {
    const [activeTab, setActiveTab] = useState('queue'); // queue | leads | import

    // Data
    const [leads, setLeads] = useState([]);
    const [queue, setQueue] = useState({ items: [], stats: { pending: 0, sentToday: 0 } });
    const [isLoading, setIsLoading] = useState(true);

    // Import State
    const [importFile, setImportFile] = useState(null);
    const [importTag, setImportTag] = useState('Planilha 01');
    const [isImporting, setIsImporting] = useState(false);

    // Manual Add State
    const [showAddModal, setShowAddModal] = useState(false);
    const [manualPhone, setManualPhone] = useState('');
    const [manualMsg, setManualMsg] = useState('');

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            const [leadsData, queueData] = await Promise.all([
                getLeads(),
                getQueueStatus()
            ]);
            setLeads(leadsData);
            setQueue(queueData);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStrictDelete = async (id) => {
        if (!confirm('Remover esta mensagem da fila?')) return;

        try {
            const res = await removeFromQueue(id);
            if (res.success) {
                toast.success('Removido!');
                loadData();
            } else {
                toast.error('Erro ao remover');
            }
        } catch (e) { toast.error('Erro'); }
    };

    const handleManualAdd = async () => {
        if (!manualPhone || !manualMsg) return toast.error('Preencha tudo');

        try {
            const res = await addToQueue({ phone: manualPhone, content: manualMsg });
            if (res.success) {
                toast.success('Adicionado à fila!');
                setShowAddModal(false);
                setManualPhone('');
                setManualMsg('');
                loadData();
            } else {
                toast.error('Erro ao adicionar');
            }
        } catch (e) { toast.error('Erro'); }
    };

    // ... inside MarketingHub

    const handleImport = async () => {
        if (!importFile) return toast.error('Selecione um arquivo');

        setIsImporting(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const data = e.target.result;
                let csvContent = '';

                // Check if it's Excel (binary) or CSV (text)
                if (importFile.name.endsWith('.xlsx') || importFile.name.endsWith('.xls')) {
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    csvContent = XLSX.utils.sheet_to_csv(worksheet);
                } else {
                    csvContent = data; // Assume text/csv
                }

                const res = await importLeads(csvContent, importTag);
                if (res.success) {
                    toast.success(`Importado! ${res.count} novos, ${res.skipped} pulados.`);
                    setImportFile(null);
                    loadData();
                    setActiveTab('leads');
                } else {
                    toast.error('Erro na importação');
                }
            } catch (err) {
                console.error(err);
                toast.error('Falha ao processar arquivo');
            } finally {
                setIsImporting(false);
            }
        };

        if (importFile.name.endsWith('.xlsx') || importFile.name.endsWith('.xls')) {
            reader.readAsArrayBuffer(importFile);
        } else {
            reader.readAsText(importFile);
        }
    };

    const formatDate = (ts) => new Date(ts * 1000).toLocaleString('pt-BR');

    return (
        <div className="p-8 max-w-7xl mx-auto pb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Automação & Marketing</h1>
                <p className="text-gray-500">
                    O sistema envia mensagens automáticas de Win-back (15/25/40 dias) e Reposição.
                    Gerencie a fila abaixo.
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Na Fila</p>
                        <h3 className="text-2xl font-bold text-gray-900">{queue.stats.pending}</h3>
                    </div>
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                        <Clock size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Enviados Hoje</p>
                        <h3 className="text-2xl font-bold text-gray-900">{queue.stats.sentToday}</h3>
                    </div>
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                        <Send size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total de Leads</p>
                        <h3 className="text-2xl font-bold text-gray-900">{leads.length}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Users size={24} />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
                {['queue', 'leads', 'import'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 px-4 font-bold capitalize transition-all relative ${activeTab === tab ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {tab === 'leads' ? 'Base de Leads' : tab === 'queue' ? 'Fila de Disparo (WhatsApp)' : 'Importar Planilha'}
                        {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-t-full"></div>}
                    </button>
                ))}
            </div>

            {/* QUEUE TAB */}
            {activeTab === 'queue' && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg">Fila de Mensagens</h3>
                            <p className="text-xs text-gray-400">Mensagens automáticas são agendadas para 09:00 - 17:00</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800">
                                <Plus size={16} /> Adicionar Manualmente
                            </button>
                            <button onClick={loadData} className="p-2 hover:bg-gray-100 rounded-lg"><RefreshCw size={18} /></button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                <tr>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Tipo</th>
                                    <th className="p-4">Agendado Para</th>
                                    <th className="p-4">Destino</th>
                                    <th className="p-4">Conteúdo</th>
                                    <th className="p-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {queue.items.length === 0 ? (
                                    <tr><td colSpan="6" className="p-8 text-center text-gray-400">Fila vazia</td></tr>
                                ) : (
                                    queue.items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    item.status === 'sent' ? 'bg-green-100 text-green-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {item.status === 'pending' ? 'Pendente' : item.status === 'sent' ? 'Enviado' : 'Falha'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-gray-600 text-xs font-mono bg-gray-100 px-2 py-1 rounded border">
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="p-4 font-mono text-gray-600">
                                                {formatDate(item.scheduledAt)}
                                            </td>
                                            <td className="p-4 font-mono text-gray-900">{item.phone}</td>
                                            <td className="p-4 text-gray-500 max-w-xs truncate" title={item.content}>
                                                {item.content}
                                            </td>
                                            <td className="p-4 text-right">
                                                {item.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleStrictDelete(item.id)}
                                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* LEADS TAB */}
            {activeTab === 'leads' && (
                <div className="space-y-6">
                    {/* CAMPAIGN RUNNER */}
                    <div className="bg-gradient-to-br from-gray-900 to-black text-white p-6 rounded-2xl shadow-lg">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Send size={20} /> Disparar Campanha (Planilha)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Mensagem</label>
                                <textarea
                                    value={manualMsg}
                                    onChange={e => setManualMsg(e.target.value)}
                                    className="w-full h-32 bg-gray-800 border-gray-700 rounded-xl p-3 text-sm focus:border-white transition-colors text-white"
                                    placeholder="Olá {nome}, confira nossas ofertas..."
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Variáveis disponíveis: <code>{'{primeiro_nome}'}</code>, <code>{'{nome_completo}'}</code>
                                </p>
                            </div>
                            <div className="flex flex-col justify-between">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Contatos Disponíveis</label>
                                    <div className="text-3xl font-bold mb-1">
                                        {leads.filter(l => l.sources.includes('Planilha') && (!l.lastCampaignAt || l.lastCampaignAt === null)).length}
                                    </div>
                                    <p className="text-xs text-gray-400 mb-4">Clientes da planilha que ainda não receberam campanha.</p>

                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Quantidade p/ Enviar Agora</label>
                                    <input
                                        type="number"
                                        defaultValue={50}
                                        id="batchSize"
                                        className="w-full bg-gray-800 border-gray-700 rounded-xl p-3 text-white font-mono font-bold"
                                    />
                                </div>
                                <button
                                    onClick={async () => {
                                        const batchSize = document.getElementById('batchSize').value;
                                        if (!manualMsg) return toast.error('Escreva uma mensagem!');

                                        const res = await createCampaignBatch(manualMsg, parseInt(batchSize));
                                        if (res.success) {
                                            toast.success(`${res.count} mensagens agendadas!`);
                                            loadData();
                                        } else {
                                            toast.error(res.message || 'Erro');
                                        }
                                    }}
                                    className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors mt-4"
                                >
                                    Enviar Lote
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Base de Contatos ({leads.length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                    <tr>
                                        <th className="p-4">Nome</th>
                                        <th className="p-4">Telefone</th>
                                        <th className="p-4">Origem</th>
                                        <th className="p-4">Última Atividade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {leads.map((lead, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="p-4 font-medium text-gray-900">{lead.name}</td>
                                            <td className="p-4 text-gray-600">{lead.phone}</td>
                                            <td className="p-4">
                                                <div className="flex gap-1">
                                                    {lead.sources.map(s => (
                                                        <span key={s} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs border border-gray-200">{s}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-400">
                                                {new Date(lead.lastActive).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* IMPORT TAB */}
            {activeTab === 'import' && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-xl mx-auto text-center">
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UploadIcon size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Importar Contatos (CSV)</h3>
                        <p className="text-gray-500 text-sm">
                            Envie um arquivo <b>.csv</b> contendo <code>Nome, Telefone</code>.<br />
                            O sistema ignorará duplicados automaticamente.
                        </p>
                    </div>

                    <div className="space-y-4 text-left">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Identificação (Tag)</label>
                            <input
                                value={importTag}
                                onChange={e => setImportTag(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-xl"
                                placeholder="Ex: Lista Vip Setembro"
                            />
                        </div>

                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 hover:border-black transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept=".csv, .xlsx, .xls"
                                onChange={e => setImportFile(e.target.files[0])}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="text-center">
                                <p className="font-bold text-gray-900">
                                    {importFile ? importFile.name : 'Clique para selecionar arquivo'}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Apenas arquivos .csv</p>
                            </div>
                        </div>

                        <button
                            onClick={handleImport}
                            disabled={isImporting || !importFile}
                            className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        >
                            {isImporting ? <RefreshCw className="animate-spin" /> : <UploadIcon />}
                            {isImporting ? 'Processando...' : 'Iniciar Importação'}
                        </button>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg">Adicionar Mensagem Manual</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Telefone (DD 9...)</label>
                                <input
                                    value={manualPhone}
                                    onChange={e => setManualPhone(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-black"
                                    placeholder="Ex: 67999999999"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Mensagem</label>
                                <textarea
                                    rows={4}
                                    value={manualMsg}
                                    onChange={e => setManualMsg(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-black resize-none"
                                    placeholder="Digite a mensagem..."
                                />
                            </div>

                            <button
                                onClick={handleManualAdd}
                                className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                            >
                                Adicionar à Fila
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
