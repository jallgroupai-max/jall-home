import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ElevenLabsModel,
  ElevenLabsVoice,
  GenerateSpeechPayload,
  VoiceHistoryRecord,
  elevenLabsService,
} from '@/lib/elevenlabs.service';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  Play,
  Pause,
  Download,
  RotateCcw,
  RotateCw,
  X,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ElevenLabsPageProps {
  token: string;
}

export default function ElevenLabsPage({ token }: ElevenLabsPageProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  // Load Data States
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [models, setModels] = useState<ElevenLabsModel[]>([]);
  const [history, setHistory] = useState<VoiceHistoryRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form States
  const [text, setText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('eleven_multilingual_v2');
  const [stability, setStability] = useState([50]); // 0-100 UI, 0-1 API
  const [similarity, setSimilarity] = useState([75]); // 0-100 UI, 0-1 API
  const [isGenerating, setIsGenerating] = useState(false);

  // History Pagination & Search
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Audio Player States
  const [activeAudio, setActiveAudio] = useState<VoiceHistoryRecord | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Derived Data
  const filteredVoices = useMemo(() => {
    if (selectedLanguage === 'all') return voices;
    return voices.filter((v: any) => {
      const accent = v.labels?.accent?.toLowerCase() || '';
      const lang = v.labels?.language?.toLowerCase() || '';
      
      if (selectedLanguage === 'english') {
         const hasEnVerified = v.verified_languages?.some((vl: any) => vl.language === 'en');
         return hasEnVerified || accent.includes('english') || accent.includes('american') || accent.includes('british') || accent.includes('australian') || lang === 'en';
      }
      if (selectedLanguage === 'spanish') {
         const hasEsVerified = v.verified_languages?.some((vl: any) => vl.language === 'es');
         return hasEsVerified || accent.includes('spanish') || accent.includes('mexican') || accent.includes('colombia') || accent.includes('argentina') || accent.includes('spain') || lang === 'es' || lang === 'spanish';
      }
      return false;
    });
  }, [voices, selectedLanguage]);

  // Initial Load
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [voicesData, modelsData] = await Promise.all([
          elevenLabsService.getVoices(token),
          elevenLabsService.getModels(token),
        ]);
        setVoices(voicesData);
        if (voicesData.length > 0) setSelectedVoice(voicesData[0].voice_id);

        const filteredModels = modelsData.filter((m) => m.can_do_text_to_speech);
        setModels(filteredModels);
      } catch (err) {
        toast({
          title: 'Error cargar datos',
          description: 'No se pudieron cargar voces o modelos.',
          variant: 'destructive',
        });
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [token, toast]);

  // Load History
  const fetchHistory = async () => {
    try {
      const res = await elevenLabsService.getHistory(token, page, limit);
      // Client-side generic search for Task Name (which is truncated input basically)
      let filtered = res.data;
      if (searchQuery) {
        filtered = filtered.filter((h) =>
          h.text.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      setHistory(filtered);
      setTotalRecords(res.total);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar el historial.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, page, limit, searchQuery, token]);

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({ title: 'Atención', description: 'El texto no puede estar vacío.' });
      return;
    }
    const voiceInfo = voices.find((v) => v.voice_id === selectedVoice);
    if (!voiceInfo) return;

    setIsGenerating(true);
    try {
      const payload: GenerateSpeechPayload = {
        text,
        voiceId: selectedVoice,
        voiceName: voiceInfo.name,
        modelId: selectedModel,
        stability: stability[0] / 100,
        similarityBoost: similarity[0] / 100,
      };
      await elevenLabsService.generateSpeech(token, payload);
      toast({ title: 'Éxito', description: 'Audio generado correctamente' });
      // Reset text after success? Up to product preference.
    } catch (err: any) {
      toast({
        title: 'Error de Generación',
        description: err.message || 'Error desconocido',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // ----- Audio Player Logic -----
  const playAudioRecord = (record: VoiceHistoryRecord) => {
    setActiveAudio(record);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = elevenLabsService.getAudioUrlWithToken(record.id, token);
      audioRef.current.play();
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipTime = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  const formatAudioTime = (sec: number) => {
    if (isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleDownload = (id: string) => {
    const url = elevenLabsService.getAudioUrlWithToken(id, token);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Audio-${id}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ----- RENDER -----
  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mr-2" /> Cargando ElevenLabs...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative w-full pb-24">
      {/* Top Tabs - MD3 Segmented Button style */}
      <div className="flex w-full mb-4">
        <div className="flex w-full max-w-md mx-auto bg-muted/50 rounded-full p-1 self-center my-2 gap-1 border border-border/20">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 px-6 text-sm font-bold rounded-full transition-all duration-300 ${
              activeTab === 'create'
                ? 'bg-background text-primary shadow-md translate-y-[-1px]'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
            }`}
          >
            Create Voice
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-6 text-sm font-bold rounded-full transition-all duration-300 ${
              activeTab === 'history'
                ? 'bg-background text-primary shadow-md translate-y-[-1px]'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
            }`}
          >
            History
          </button>
        </div>
      </div>

      <div className="py-2 flex-1">
        {/* --- CREATE VOICE TAB --- */}
        {activeTab === 'create' && (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Left: Text Area - Surface Container */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex flex-col h-full bg-muted/20 rounded-[2.5rem] p-6 border border-border/40 shadow-inner group focus-within:border-primary/40 transition-all">
                 <div className="flex justify-between items-center mb-2 px-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Input Text</span>
                 </div>
                <Textarea
                  placeholder="Escribe el texto que deseas convertir a voz aquí..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 resize-none bg-transparent text-lg p-2 border-none focus-visible:ring-0 shadow-none leading-relaxed placeholder:text-muted-foreground/50"
                  style={{ minHeight: '350px' }}
                />
                <div className="flex justify-between items-center mt-4 px-2">
                  <div className="text-xs font-medium text-muted-foreground/60 transition-colors group-focus-within:text-primary/70">
                    {text.length} characters
                  </div>
                  {text.length > 0 && (
                     <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setText('')}
                      className="h-7 text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Settings - MD3 Side Sheet style */}
            <div className="w-full lg:w-[340px] flex flex-col gap-6">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !text}
                className="w-full h-14 text-lg font-black rounded-full shadow-lg hover:shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.98]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" /> Creando audio...
                  </>
                ) : (
                  'Generate Voice'
                )}
              </Button>

              <div className="bg-secondary/20 border border-border/40 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold text-foreground/90">Voice Settings</h3>
                  <p className="text-xs text-muted-foreground/70 tracking-tight">Personalize your generation output</p>
                </div>

                {/* Credits / Status Badge */}
                <div className="flex justify-between items-center bg-background/60 backdrop-blur-sm text-primary px-4 py-2.5 rounded-2xl border border-primary/10 text-xs font-black shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span>CREDITS: UNLIMITED</span>
                  </div>
                </div>

                {/* Language / Accent Filter */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Language / Accent</label>
                  <Select 
                    value={selectedLanguage} 
                    onValueChange={(val) => {
                       setSelectedLanguage(val);
                       // Auto-select first valid voice if current is invalidated
                       const validVoices = voices.filter((v: any) => {
                         if (val === 'all') return true;
                         const accent = v.labels?.accent?.toLowerCase() || '';
                         const lang = v.labels?.language?.toLowerCase() || '';
                         if (val === 'english') {
                           const hasEnVerified = v.verified_languages?.some((vl: any) => vl.language === 'en');
                           return hasEnVerified || accent.includes('english') || accent.includes('american') || accent.includes('british') || accent.includes('australian') || lang === 'en';
                         }
                         if (val === 'spanish') {
                           const hasEsVerified = v.verified_languages?.some((vl: any) => vl.language === 'es');
                           return hasEsVerified || accent.includes('spanish') || accent.includes('mexican') || accent.includes('colombia') || accent.includes('argentina') || accent.includes('spain') || lang === 'es' || lang === 'spanish';
                         }
                         return false;
                       });
                       const voiceStillValid = validVoices.find(v => v.voice_id === selectedVoice);
                       if (!voiceStillValid && validVoices.length > 0) {
                         setSelectedVoice(validVoices[0].voice_id);
                       } else if (!voiceStillValid) {
                         setSelectedVoice('');
                       }
                    }}
                  >
                    <SelectTrigger className="w-full h-12 rounded-2xl bg-background border-border/40 hover:border-primary/30 transition-all">
                      <SelectValue placeholder="All Languages" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/40 shadow-xl max-h-[250px]">
                      <SelectItem value="all" className="rounded-lg my-0.5 font-bold">🌐 All Languages</SelectItem>
                      <SelectItem value="spanish" className="rounded-lg my-0.5 font-bold">🇪🇸 Español</SelectItem>
                      <SelectItem value="english" className="rounded-lg my-0.5 font-bold">🇺🇸 English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Voice Select */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Voice Profile</label>
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger className="w-full h-12 rounded-2xl bg-background border-border/40 hover:border-primary/30 transition-all">
                      <SelectValue placeholder="Selecciona una voz" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/40 shadow-xl max-h-[300px]">
                      {filteredVoices.map((v) => (
                        <SelectItem key={v.voice_id} value={v.voice_id} className="rounded-lg my-0.5">
                          <span className="font-bold">{v.name}</span>
                          {v.labels?.description ? <span className="text-muted-foreground ml-2 font-normal opacity-70"> - {v.labels.description}</span> : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Model Select */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Model Engine</label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-full h-12 rounded-2xl bg-background border-border/40 hover:border-primary/30 transition-all">
                      <SelectValue placeholder="Selecciona un modelo" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/40 shadow-xl">
                      {models.map((m) => (
                        <SelectItem key={m.model_id} value={m.model_id} className="rounded-lg my-0.5 font-bold">
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-10 pt-4">
                  {/* Stability Slider */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Stability</label>
                      <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-black border border-primary/5">{stability[0]}%</span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={stability}
                      onValueChange={setStability}
                      className="py-1"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                      <span>Variable</span>
                      <span>Stable</span>
                    </div>
                  </div>

                  {/* Similarity Slider */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Similarity</label>
                      <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-black border border-primary/5">{similarity[0]}%</span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={similarity}
                      onValueChange={setSimilarity}
                      className="py-1"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStability([50]);
                      setSimilarity([75]);
                    }}
                    className="text-[10px] font-black uppercase tracking-widest hover:bg-background/40 hover:text-primary transition-all rounded-full h-8"
                  >
                    <RotateCcw className="w-3 h-3 mr-2" /> Reset defaults
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- HISTORY TAB --- */}
        {activeTab === 'history' && (
          <div className="flex flex-col gap-8 h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-end sm:items-center">
               <div className="space-y-1">
                  <h3 className="text-2xl font-black text-foreground/90">Your Generations</h3>
                  <p className="text-sm text-muted-foreground/70 font-medium">Manage and replay your created voice audio clips</p>
               </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                   <Input
                    placeholder="Search past audio..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 rounded-full pl-6 bg-secondary/20 border-border/40 focus:bg-background transition-all"
                  />
                </div>
                <Button onClick={fetchHistory} variant="secondary" size="icon" className="h-11 w-11 rounded-full shadow-sm hover:rotate-180 transition-transform duration-500">
                  <RefreshCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="bg-secondary/20 border border-border/40 rounded-[2.5rem] p-4 lg:p-6 shadow-sm overflow-hidden flex-1 flex flex-col">
              <div className="rounded-[1.5rem] border border-border/30 overflow-hidden bg-background/50 backdrop-blur-sm">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-b-border/30 hover:bg-transparent">
                      <TableHead className="font-black text-xs uppercase tracking-widest py-5 pl-8 text-muted-foreground">Original Text</TableHead>
                      <TableHead className="font-black text-xs uppercase tracking-widest text-muted-foreground">Voice</TableHead>
                      <TableHead className="font-black text-xs uppercase tracking-widest text-muted-foreground">Status</TableHead>
                      <TableHead className="font-black text-xs uppercase tracking-widest text-muted-foreground">Date</TableHead>
                      <TableHead className="w-[120px] pr-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((record) => (
                      <TableRow key={record.id} className="border-b-border/20 hover:bg-primary/5 transition-colors group">
                        <TableCell className="max-w-[350px] py-4 pl-8">
                          <p className="font-bold text-sm truncate text-foreground/80 group-hover:text-foreground transition-colors" title={record.text}>
                            {record.text}
                          </p>
                        </TableCell>
                        <TableCell className="py-4">
                           <span className="font-bold text-sm bg-muted/50 px-3 py-1 rounded-full">{record.voiceName}</span>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="inline-flex items-center text-[10px] font-black uppercase tracking-tighter text-green-700 dark:text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full w-fit">
                            <CheckCircle2 className="w-3 h-3 mr-1.5" /> Completed
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground/80 text-xs font-bold py-4">
                          {format(new Date(record.createdAt), 'HH:mm • dd MMM yyyy')}
                        </TableCell>
                        <TableCell className="text-right py-4 pr-8">
                          <div className="flex gap-2 justify-end opacity-60 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="secondary"
                              size="icon"
                              onClick={() => playAudioRecord(record)}
                              className="h-10 w-10 rounded-full shadow-sm hover:bg-primary hover:text-primary-foreground transition-all"
                            >
                              <Play className="h-4 w-4 fill-current" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(record.id)}
                              className="h-10 w-10 rounded-full"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {history.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-24 text-muted-foreground font-bold italic opacity-40">
                          Tu historial de voces está vacío
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls - Footnote style */}
              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 px-4 gap-4">
                <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground/70">
                  <div className="flex items-center gap-3 bg-background/50 p-1.5 rounded-full border border-border/30">
                    <span className="ml-3">View:</span>
                    <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
                      <SelectTrigger className="h-7 w-[65px] rounded-full text-xs font-black bg-background border-none shadow-none focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="min-w-[60px] rounded-xl font-bold">
                        {[10, 20, 50].map((v) => (
                          <SelectItem key={v} value={String(v)}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="bg-background/30 px-4 py-2 rounded-full border border-border/10 tracking-tight">
                    {totalRecords} TOTAL RECORDS
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-full h-9 px-5 shadow-sm font-black text-xs uppercase"
                  >
                    Prev
                  </Button>
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-black shadow-lg">
                    {page}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={history.length < limit}
                    className="rounded-full h-9 px-5 shadow-sm font-black text-xs uppercase"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- HIDDEN AUDIO ELEMENT --- */}
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* --- GLOBAL AUDIO PLAYER BOTTOM BAR - MD3 Floating Pill Player --- */}
      {activeAudio && (
        <div className="absolute bottom-6 left-1/2 translate-x-[-50%] w-[94%] max-w-5xl z-[100] animate-in slide-in-from-bottom-10 fade-in duration-700 ease-out">
          <div className="bg-background/90 backdrop-blur-2xl border border-primary/20 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-4 flex flex-col md:flex-row items-center gap-6">
            
            {/* Info Section */}
            <div className="md:w-[28%] flex items-center gap-4 pl-4 overflow-hidden">
               <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                  <Play className={`w-5 h-5 text-primary ${isPlaying ? 'animate-pulse' : ''}`} />
               </div>
               <div className="flex flex-col justify-center overflow-hidden">
                <p className="text-sm font-black text-foreground truncate w-full" title={activeAudio.text}>
                  {activeAudio.text}
                </p>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                   <p className="text-xs font-bold text-muted-foreground/80 truncate uppercase tracking-tighter">{activeAudio.voiceName}</p>
                </div>
              </div>
            </div>

            {/* Main Controls Center */}
            <div className="flex-1 flex items-center gap-4 md:gap-6 justify-center">
              <span className="text-[10px] font-black text-muted-foreground/60 tabular-nums w-12 text-right">
                {formatAudioTime(currentTime)}
              </span>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => skipTime(-10)}
                  className="text-muted-foreground/50 hover:text-primary transition-all p-2 rounded-full hover:bg-primary/5 active:scale-90"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                
                <button
                  onClick={togglePlayPause}
                  className="bg-primary text-primary-foreground h-14 w-14 rounded-full hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center justify-center shrink-0 active:scale-95"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current pl-1" />
                  )}
                </button>
                
                <button
                  onClick={() => skipTime(10)}
                  className="text-muted-foreground/50 hover:text-primary transition-all p-2 rounded-full hover:bg-primary/5 active:scale-90"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
              </div>

              {/* Waveform Visualization UI */}
              <div className="hidden lg:flex items-center gap-[3px] h-10 w-48 opacity-80 overflow-hidden">
                {Array.from({ length: 42 }).map((_, i) => (
                   <div
                    key={i}
                    className={`w-[3px] rounded-full transition-all duration-300 ${
                      i / 42 <= currentTime / (duration || 0.1)
                        ? 'bg-primary'
                        : 'bg-muted-foreground/20'
                    }`}
                    style={{
                      height: `${(isPlaying ? Math.abs(Math.sin((currentTime * 5) + i * 0.4)) : 0.2) * 80 + 20}%`,
                    }}
                  />
                ))}
              </div>

              <span className="text-[10px] font-black text-muted-foreground/60 tabular-nums w-12">
                {formatAudioTime(duration)}
              </span>
            </div>

            {/* Actions Pillar */}
            <div className="md:w-auto flex items-center gap-3 pr-4">
              <div className="h-8 w-[1px] bg-border/40 mx-2 hidden md:block" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDownload(activeAudio.id)}
                className="h-11 w-11 rounded-full border-primary/10 hover:bg-primary/5 transition-all shadow-none"
                title="Descargar Audio"
              >
                <Download className="w-4 h-4 text-primary/80" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setActiveAudio(null);
                  if (audioRef.current) audioRef.current.pause();
                }}
                className="h-11 w-11 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all"
                title="Cerrar reproductor"
              >
                <X className="w-5 h-5 opacity-60" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

