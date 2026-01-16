import React, { useState, useRef } from 'react';
import { Bot, Mic, Send, Square, Loader2, CheckCircle2, AlertCircle, Trash2, Edit2, ArrowRight } from 'lucide-react';
import { processAudioCommand, processTextCommand, ProcessedAudioResult } from '../services/geminiService';
import { Transaction, Client } from '../types';

interface AIIntelligenceProps {
  onConfirmTransactions: (transactions: Partial<Transaction>[]) => void;
  onConfirmClients: (clients: Partial<Client>[]) => void;
}

const AIIntelligence: React.FC<AIIntelligenceProps> = ({ onConfirmTransactions, onConfirmClients }) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ProcessedAudioResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Recording Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleProcessing(audioBlob, 'audio');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Permissão de microfone necessária.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendText = async () => {
    if (!inputText.trim()) return;
    await handleProcessing(inputText, 'text');
    setInputText('');
  };

  const handleProcessing = async (input: Blob | string, type: 'audio' | 'text') => {
    setIsProcessing(true);
    setParsedData(null);
    setError(null);
    try {
      let result;
      if (type === 'audio') {
        result = await processAudioCommand(input as Blob);
      } else {
        result = await processTextCommand(input as string);
      }

      if (result) {
        setParsedData(result);
      } else {
        setError('Não foi possível interpretar os dados.');
      }
    } catch (error) {
      console.error(error);
      setError('Erro ao processar. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (!parsedData) return;

    if (parsedData.extractedTransactions.length > 0) {
      onConfirmTransactions(parsedData.extractedTransactions);
    }
    if (parsedData.extractedClients.length > 0) {
      onConfirmClients(parsedData.extractedClients);
    }
    
    setParsedData(null); // Reset after save
  };

  // Helper to remove item from preview list
  const removeTransaction = (index: number) => {
    if (!parsedData) return;
    const newTx = [...parsedData.extractedTransactions];
    newTx.splice(index, 1);
    setParsedData({ ...parsedData, extractedTransactions: newTx });
  };

  const removeClient = (index: number) => {
     if (!parsedData) return;
     const newCl = [...parsedData.extractedClients];
     newCl.splice(index, 1);
     setParsedData({ ...parsedData, extractedClients: newCl });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-4">
           <Bot size={32} className="text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Inteligência Artificial</h2>
        <p className="text-slate-500 mt-2">Descreva movimentações financeiras ou novos clientes. A IA organiza para você.</p>
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-slate-400 ml-2 font-mono">AI Command Center</span>
        </div>
        
        <div className="p-6">
            <textarea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ex: Recebemos 5 mil da Alpha Corp hoje referente a consultoria. Também gastamos 200 reais com software."
                className="w-full h-32 resize-none outline-none text-slate-700 text-lg placeholder:text-slate-300 bg-white"
                disabled={isProcessing || isRecording}
            />
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
                <button
                   onClick={isRecording ? stopRecording : startRecording}
                   disabled={isProcessing}
                   className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                     isRecording 
                       ? 'bg-rose-100 text-rose-600 animate-pulse' 
                       : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                   }`}
                >
                   {isRecording ? <Square size={18} fill="currentColor" /> : <Mic size={18} />}
                   <span className="text-sm font-medium">{isRecording ? 'Parar Gravação' : 'Gravar Áudio'}</span>
                </button>

                <button
                    onClick={handleSendText}
                    disabled={(!inputText.trim() && !isRecording) || isProcessing}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    <span className="text-sm font-medium">Processar</span>
                </button>
            </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-lg flex items-center gap-3">
           <AlertCircle size={20} />
           <p>{error}</p>
        </div>
      )}

      {/* Results Confirmation Area */}
      {parsedData && (
         <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg mb-6">
               <h3 className="font-semibold text-indigo-900 mb-1 flex items-center">
                  <Bot size={18} className="mr-2" /> Resumo da Análise
               </h3>
               <p className="text-indigo-700 text-sm">{parsedData.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Transactions Draft */}
               <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                     Transações Identificadas
                     <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{parsedData.extractedTransactions.length}</span>
                  </h4>
                  
                  {parsedData.extractedTransactions.length === 0 ? (
                      <p className="text-slate-400 text-sm italic">Nenhuma transação encontrada.</p>
                  ) : (
                      <div className="space-y-3">
                         {parsedData.extractedTransactions.map((tx, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-100 flex justify-between items-start group">
                               <div>
                                  <p className="font-medium text-slate-900">{tx.description}</p>
                                  <div className="flex gap-2 text-xs text-slate-500 mt-1">
                                     <span className={`px-1.5 py-0.5 rounded ${tx.type === 'revenue' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                        {tx.type === 'revenue' ? 'Receita' : 'Despesa'}
                                     </span>
                                     <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded">{tx.frequency === 'recurring' ? 'Recorrente' : 'Pontual'}</span>
                                  </div>
                               </div>
                               <div className="text-right">
                                  <p className={`font-bold ${tx.type === 'revenue' ? 'text-emerald-600' : 'text-slate-700'}`}>
                                     R$ {tx.amount.toLocaleString('pt-BR')}
                                  </p>
                                  <button onClick={() => removeTransaction(idx)} className="text-slate-300 hover:text-rose-500 mt-1">
                                     <Trash2 size={14} />
                                  </button>
                               </div>
                            </div>
                         ))}
                      </div>
                  )}
               </div>

               {/* Clients Draft */}
               <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                     Novos Clientes
                     <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{parsedData.extractedClients.length}</span>
                  </h4>
                  
                  {parsedData.extractedClients.length === 0 ? (
                      <p className="text-slate-400 text-sm italic">Nenhum cliente identificado.</p>
                  ) : (
                      <div className="space-y-3">
                         {parsedData.extractedClients.map((client, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-100 flex justify-between items-start group">
                               <div>
                                  <p className="font-medium text-slate-900">{client.name}</p>
                                  <p className="text-xs text-slate-500 mt-1">Recorrência Mensal</p>
                               </div>
                               <div className="text-right">
                                  <p className="font-bold text-slate-800">
                                     R$ {client.monthlyValue.toLocaleString('pt-BR')}
                                  </p>
                                  <button onClick={() => removeClient(idx)} className="text-slate-300 hover:text-rose-500 mt-1">
                                     <Trash2 size={14} />
                                  </button>
                               </div>
                            </div>
                         ))}
                      </div>
                  )}
               </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
               <button 
                 onClick={() => setParsedData(null)}
                 className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
               >
                 Descartar
               </button>
               <button 
                 onClick={handleConfirm}
                 className="px-8 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 shadow-lg shadow-slate-200 flex items-center transition-all"
               >
                 <CheckCircle2 size={18} className="mr-2" /> Confirmar e Salvar
               </button>
            </div>
         </div>
      )}
    </div>
  );
};

export default AIIntelligence;
