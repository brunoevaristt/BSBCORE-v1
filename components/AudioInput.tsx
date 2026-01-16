import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, CheckCircle2 } from 'lucide-react';
import { processAudioCommand, ProcessedAudioResult } from '../services/geminiService';

interface AudioInputProps {
  onDataProcessed: (result: ProcessedAudioResult) => void;
}

const AudioInput: React.FC<AudioInputProps> = ({ onDataProcessed }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
        await handleAudioProcessing(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Permissão de microfone necessária.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAudioProcessing = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const result = await processAudioCommand(blob);
      if (result) {
        onDataProcessed(result);
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao processar áudio. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`
          flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-300
          ${isRecording 
            ? 'bg-rose-600 hover:bg-rose-700 animate-pulse' 
            : 'bg-slate-900 hover:bg-slate-800'}
          ${isProcessing ? 'cursor-not-allowed opacity-80' : ''}
        `}
      >
        {isProcessing ? (
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        ) : isRecording ? (
          <Square className="w-6 h-6 text-white" fill="currentColor" />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}
      </button>
      
      {/* Label Tooltip */}
      <div className="absolute right-20 top-1/2 -translate-y-1/2 whitespace-nowrap bg-white px-3 py-1 rounded-md shadow-md text-sm font-medium text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {isRecording ? 'Parar gravação' : 'Falar com IA'}
      </div>
    </div>
  );
};

export default AudioInput;
