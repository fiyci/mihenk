import { useState, useRef, useCallback, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { 
  Type, Image, Download, Sparkles, 
  Layout, Quote, Hash, BarChart3, Settings, Undo, Redo,
  Monitor, Smartphone, Tablet, Plus, Trash2,
  Copy, Grid3X3,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Sun, Moon, Wand2,
  Target, MessageSquare,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

import type { CanvasElement, TextElement, ImageElement, ShapeElement, IconElement, BrandKit, PerformanceMetrics, PreviewDevice } from '@/types';
import { FONTS, GRADIENTS, VIRAL_TEMPLATES, DEFAULT_BRAND_KITS, ICONS_LIST, IMAGE_FILTERS } from '@/constants';
import { predictPerformance, generateCompleteContent } from '@/services/ai-services';

import './App.css';

function App() {
  // Canvas state
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState('#1a1a2e');
  const [backgroundGradient, setBackgroundGradient] = useState<string | undefined>(undefined);
  const [canvasSize, setCanvasSize] = useState({ width: 1080, height: 1080 });
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  
  // History for undo/redo
  const [history, setHistory] = useState<{ elements: CanvasElement[]; backgroundColor: string; backgroundGradient?: string }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // AI features state
  const [generatedHeadlines, setGeneratedHeadlines] = useState<{ text: string; engagement: number; category: string }[]>([]);
  const [generatedCaptions, setGeneratedCaptions] = useState<{ text: string; hashtags: string[]; engagement: number }[]>([]);
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
  const [generatedQuotes, setGeneratedQuotes] = useState<{ text: string; author: string }[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [aiTopic, setAiTopic] = useState('');
  const [captionText, setCaptionText] = useState('');
  
  // Brand kit
  const [brandKits] = useState<BrandKit[]>(DEFAULT_BRAND_KITS);
  const [selectedBrandKit, setSelectedBrandKit] = useState<BrandKit>(DEFAULT_BRAND_KITS[0]);
  
  // UI state
  const [activeTab, setActiveTab] = useState('templates');
  const [showGrid, setShowGrid] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save to history
  const saveToHistory = useCallback(() => {
    const newState = { elements: [...elements], backgroundColor, backgroundGradient };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [elements, backgroundColor, backgroundGradient, history, historyIndex]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setElements(prevState.elements);
      setBackgroundColor(prevState.backgroundColor);
      setBackgroundGradient(prevState.backgroundGradient);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setElements(nextState.elements);
      setBackgroundColor(nextState.backgroundColor);
      setBackgroundGradient(nextState.backgroundGradient);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  // Add text element
  const addText = useCallback(() => {
    const newText: TextElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'Yeni Metin',
      x: 50,
      y: 50,
      fontSize: 32,
      fontFamily: selectedBrandKit.fontHeading,
      color: '#ffffff',
      fontWeight: '600',
      textAlign: 'center',
      isBold: false,
      isItalic: false,
      isUnderline: false,
      letterSpacing: 0,
      lineHeight: 1.2,
      rotation: 0,
      opacity: 1,
    };
    setElements([...elements, newText]);
    setSelectedId(newText.id);
    saveToHistory();
  }, [elements, selectedBrandKit, saveToHistory]);

  // Add image element
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImage: ImageElement = {
          id: `image-${Date.now()}`,
          type: 'image',
          src: event.target?.result as string,
          x: 50,
          y: 50,
          width: 300,
          height: 200,
          rotation: 0,
          opacity: 1,
          filter: 'none',
          borderRadius: 0,
          objectFit: 'cover',
        };
        setElements([...elements, newImage]);
        setSelectedId(newImage.id);
        saveToHistory();
      };
      reader.readAsDataURL(file);
    }
  }, [elements, saveToHistory]);

  // Add shape element
  const addShape = useCallback((shapeType: 'rectangle' | 'circle' | 'triangle' | 'star' | 'line' | 'arrow') => {
    const newShape: ShapeElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      shapeType,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      color: selectedBrandKit.primaryColor,
      rotation: 0,
      opacity: 1,
      borderWidth: 0,
      borderColor: '#000000',
    };
    setElements([...elements, newShape]);
    setSelectedId(newShape.id);
    saveToHistory();
  }, [elements, selectedBrandKit, saveToHistory]);

  // Add icon element
  const addIcon = useCallback((iconName: string) => {
    const newIcon: IconElement = {
      id: `icon-${Date.now()}`,
      type: 'icon',
      iconName,
      x: 50,
      y: 50,
      size: 48,
      color: selectedBrandKit.accentColor,
      rotation: 0,
      opacity: 1,
    };
    setElements([...elements, newIcon]);
    setSelectedId(newIcon.id);
    saveToHistory();
  }, [elements, selectedBrandKit, saveToHistory]);

  // Update element
  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } as CanvasElement : el));
  }, [elements]);

  // Delete element
  const deleteElement = useCallback((id: string) => {
    setElements(elements.filter(el => el.id !== id));
    setSelectedId(null);
    saveToHistory();
  }, [elements, saveToHistory]);

  // Duplicate element
  const duplicateElement = useCallback((id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      const newElement = { ...element, id: `${element.type}-${Date.now()}`, x: element.x + 10, y: element.y + 10 };
      setElements([...elements, newElement as CanvasElement]);
      setSelectedId(newElement.id);
      saveToHistory();
    }
  }, [elements, saveToHistory]);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    setElements([]);
    setSelectedId(null);
    setBackgroundColor('#1a1a2e');
    setBackgroundGradient(undefined);
    saveToHistory();
  }, [saveToHistory]);

  // Apply template
  const applyTemplate = useCallback((templateId: string) => {
    const template = VIRAL_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setElements(template.elements.map(e => ({ ...e, id: `${e.type}-${Date.now()}-${Math.random()}` })));
      setBackgroundColor(template.backgroundColor);
      setBackgroundGradient(template.backgroundGradient);
      saveToHistory();
      toast.success(`"${template.name}" şablonu uygulandı`);
    }
  }, [saveToHistory]);

  // Apply brand kit
  const applyBrandKit = useCallback((kit: BrandKit) => {
    setSelectedBrandKit(kit);
    setElements(elements.map(el => {
      if (el.type === 'text') {
        return { ...el, fontFamily: el.fontSize > 30 ? kit.fontHeading : kit.fontBody };
      }
      if (el.type === 'shape') {
        return { ...el, color: kit.primaryColor };
      }
      if (el.type === 'icon') {
        return { ...el, color: kit.accentColor };
      }
      return el;
    }));
    saveToHistory();
    toast.success(`"${kit.name}" marka kiti uygulandı`);
  }, [elements, saveToHistory]);

  // Export image
  const exportImage = useCallback(async (format: 'png' | 'jpg' | 'webp' = 'png') => {
    if (!canvasRef.current) return;
    
    try {
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: backgroundGradient ? undefined : backgroundColor,
      });
      
      const link = document.createElement('a');
      link.download = `consulting-post-${Date.now()}.${format}`;
      link.href = canvas.toDataURL(`image/${format}`, 0.95);
      link.click();
      
      toast.success('Görsel başarıyla indirildi!');
    } catch (error) {
      toast.error('Görsel dışa aktarılırken hata oluştu');
    }
  }, [backgroundColor, backgroundGradient]);

  // AI Functions
  const analyzePerformance = useCallback(() => {
    const metrics = predictPerformance(elements, backgroundColor, captionText);
    setPerformanceMetrics(metrics);
    toast.success('Performans analizi tamamlandı!');
  }, [elements, backgroundColor, captionText]);

  const generateAllContent = useCallback(() => {
    const content = generateCompleteContent({ topic: aiTopic || undefined, tone: 'professional' });
    setGeneratedHeadlines(content.headlines.map((text, i) => ({ text, engagement: 85 + i * 2, category: 'Genel' })));
    setGeneratedCaptions(content.captions.map((text, i) => ({ text, hashtags: content.hashtags.slice(0, 5), engagement: 80 + i * 3 })));
    setGeneratedHashtags(content.hashtags);
    setGeneratedQuotes(content.quotes.map(q => {
      const parts = q.split(' — ');
      return { text: parts[0], author: parts[1] || 'Bilinmiyor' };
    }));
    toast.success('Tüm içerikler başarıyla oluşturuldu!');
  }, [aiTopic]);

  // Apply headline to canvas
  const applyHeadline = useCallback((headline: string) => {
    const newText: TextElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: headline,
      x: 50,
      y: 35,
      fontSize: 42,
      fontFamily: selectedBrandKit.fontHeading,
      color: '#ffffff',
      fontWeight: '700',
      textAlign: 'center',
      isBold: true,
      isItalic: false,
      isUnderline: false,
      letterSpacing: 0,
      lineHeight: 1.2,
      rotation: 0,
      opacity: 1,
      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
    };
    setElements([...elements, newText]);
    setSelectedId(newText.id);
    saveToHistory();
  }, [elements, selectedBrandKit, saveToHistory]);

  // Apply caption
  const applyCaption = useCallback((caption: string) => {
    setCaptionText(caption);
    toast.success('Açıklama kopyalandı!');
  }, []);

  // Copy hashtags
  const copyHashtags = useCallback(() => {
    navigator.clipboard.writeText(generatedHashtags.join(' '));
    toast.success('Hashtagler kopyalandı!');
  }, [generatedHashtags]);

  // Apply quote to canvas
  const applyQuote = useCallback((quote: { text: string; author: string }) => {
    const quoteText: TextElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: `"${quote.text}"`,
      x: 50,
      y: 40,
      fontSize: 32,
      fontFamily: 'Playfair Display, serif',
      color: '#ffffff',
      fontWeight: '600',
      textAlign: 'center',
      isBold: false,
      isItalic: true,
      isUnderline: false,
      letterSpacing: 0.5,
      lineHeight: 1.4,
      rotation: 0,
      opacity: 1,
    };
    const authorText: TextElement = {
      id: `text-${Date.now() + 1}`,
      type: 'text',
      content: `— ${quote.author}`,
      x: 50,
      y: 70,
      fontSize: 18,
      fontFamily: selectedBrandKit.fontBody,
      color: '#e0e0e0',
      fontWeight: '400',
      textAlign: 'center',
      isBold: false,
      isItalic: false,
      isUnderline: false,
      letterSpacing: 2,
      lineHeight: 1.2,
      rotation: 0,
      opacity: 0.8,
    };
    setElements([...elements, quoteText, authorText]);
    saveToHistory();
  }, [elements, selectedBrandKit, saveToHistory]);

  // Get selected element
  const selectedElement = elements.find(el => el.id === selectedId);

  // Initialize history
  useEffect(() => {
    if (history.length === 0) {
      setHistory([{ elements: [], backgroundColor: '#1a1a2e' }]);
      setHistoryIndex(0);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedId) {
          duplicateElement(selectedId);
        }
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          deleteElement(selectedId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedId, duplicateElement, deleteElement]);

  return (
    <TooltipProvider>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'}`}>
        {/* Header */}
        <header className={`border-b ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} px-4 py-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">ConsultingPost Pro</h1>
                <p className="text-xs text-gray-500">AI Destekli Instagram Post Oluşturucu</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={undo} disabled={historyIndex <= 0}>
                    <Undo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Geri Al (Ctrl+Z)</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={redo} disabled={historyIndex >= history.length - 1}>
                    <Redo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>İleri Al (Ctrl+Shift+Z)</TooltipContent>
              </Tooltip>
              
              <Separator orientation="vertical" className="h-8" />
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => setShowGrid(!showGrid)}>
                    <Grid3X3 className={`h-4 w-4 ${showGrid ? 'text-blue-500' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Izgara Göster/Gizle</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => setDarkMode(!darkMode)}>
                    {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{darkMode ? 'Açık Tema' : 'Koyu Tema'}</TooltipContent>
              </Tooltip>
              
              <Separator orientation="vertical" className="h-8" />
              
              <Select value={previewDevice} onValueChange={(v) => setPreviewDevice(v as PreviewDevice)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desktop">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      <span>Masaüstü</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="tablet">
                    <div className="flex items-center gap-2">
                      <Tablet className="h-4 w-4" />
                      <span>Tablet</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="mobile">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <span>Mobil</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Dışa Aktar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Gönderiyi Dışa Aktar</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Button onClick={() => exportImage('png')} className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      PNG olarak indir
                    </Button>
                    <Button onClick={() => exportImage('jpg')} variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      JPG olarak indir
                    </Button>
                    <Button onClick={() => exportImage('webp')} variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      WebP olarak indir
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-73px)]">
          {/* Left Sidebar */}
          <div className={`w-80 border-r ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} flex flex-col`}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="templates"><Layout className="h-4 w-4" /></TabsTrigger>
                <TabsTrigger value="elements"><Plus className="h-4 w-4" /></TabsTrigger>
                <TabsTrigger value="ai"><Sparkles className="h-4 w-4" /></TabsTrigger>
                <TabsTrigger value="settings"><Settings className="h-4 w-4" /></TabsTrigger>
              </TabsList>
              
              <ScrollArea className="flex-1">
                {/* Templates Tab */}
                <TabsContent value="templates" className="m-0 p-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Viral Şablonlar</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {VIRAL_TEMPLATES.map(template => (
                        <button
                          key={template.id}
                          onClick={() => applyTemplate(template.id)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                            darkMode ? 'border-gray-700 hover:border-blue-500' : 'border-gray-200 hover:border-blue-500'
                          }`}
                        >
                          <div 
                            className="absolute inset-0 flex items-center justify-center p-2"
                            style={{ 
                              background: template.backgroundGradient || template.backgroundColor 
                            }}
                          >
                            <span className="text-xs font-medium text-center" style={{ color: '#fff' }}>
                              {template.name}
                            </span>
                          </div>
                          <div className="absolute top-1 right-1">
                            <Badge variant="secondary" className="text-[10px]">
                              {template.engagementPrediction}%
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Marka Kitleri</h3>
                    <div className="space-y-2">
                      {brandKits.map(kit => (
                        <button
                          key={kit.id}
                          onClick={() => applyBrandKit(kit)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            selectedBrandKit.id === kit.id 
                              ? 'border-blue-500 bg-blue-500/10' 
                              : darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex gap-1">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: kit.primaryColor }} />
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: kit.secondaryColor }} />
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: kit.accentColor }} />
                          </div>
                          <span className="text-sm">{kit.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                {/* Elements Tab */}
                <TabsContent value="elements" className="m-0 p-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Eleman Ekle</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={addText} variant="outline" className="h-20 flex flex-col gap-2">
                        <Type className="h-5 w-5" />
                        <span className="text-xs">Metin</span>
                      </Button>
                      <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="h-20 flex flex-col gap-2">
                        <Image className="h-5 w-5" />
                        <span className="text-xs">Görsel</span>
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Şekiller</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {['rectangle', 'circle', 'triangle', 'star', 'line', 'arrow'].map(shape => (
                        <Button
                          key={shape}
                          onClick={() => addShape(shape as any)}
                          variant="outline"
                          className="h-14"
                        >
                          <div className="text-xs capitalize">{shape}</div>
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-semibold mb-3">İkonlar</h3>
                    <div className="grid grid-cols-6 gap-1">
                      {ICONS_LIST.slice(0, 24).map(iconName => (
                        <Button
                          key={iconName}
                          onClick={() => addIcon(iconName)}
                          variant="outline"
                          size="icon"
                          className="h-10 w-10"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                {/* AI Tab */}
                <TabsContent value="ai" className="m-0 p-4 space-y-4">
                  <div>
                    <Label className="text-sm font-semibold">AI Konu/Anahtar Kelime</Label>
                    <Input
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="ör: strateji, liderlik, verimlilik..."
                      className="mt-2"
                    />
                  </div>
                  
                  <Button onClick={generateAllContent} className="w-full bg-gradient-to-r from-blue-500 to-purple-600">
                    <Wand2 className="mr-2 h-4 w-4" />
                    Tüm İçerikleri Oluştur
                  </Button>
                  
                  <Separator />
                  
                  {/* Generated Headlines */}
                  {generatedHeadlines.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Viral Başlıklar
                      </h3>
                      <div className="space-y-2">
                        {generatedHeadlines.map((headline, i) => (
                          <div
                            key={i}
                            onClick={() => applyHeadline(headline.text)}
                            className={`p-2 rounded-lg cursor-pointer text-sm transition-all hover:scale-[1.02] ${
                              darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{headline.text}</span>
                              <Badge variant="secondary" className="text-[10px]">{headline.engagement}%</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Generated Captions */}
                  {generatedCaptions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Açıklama Önerileri
                      </h3>
                      <div className="space-y-2">
                        {generatedCaptions.map((caption, i) => (
                          <div
                            key={i}
                            onClick={() => applyCaption(caption.text)}
                            className={`p-2 rounded-lg cursor-pointer text-xs transition-all hover:scale-[1.02] ${
                              darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            <p className="line-clamp-3">{caption.text}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[10px] text-gray-500">{caption.hashtags.slice(0, 3).join(' ')}</span>
                              <Badge variant="secondary" className="text-[10px]">{caption.engagement}%</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Generated Hashtags */}
                  {generatedHashtags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Hashtagler
                      </h3>
                      <div className={`p-2 rounded-lg text-xs ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <p className="mb-2">{generatedHashtags.join(' ')}</p>
                        <Button onClick={copyHashtags} size="sm" variant="outline" className="w-full">
                          <Copy className="mr-2 h-3 w-3" />
                          Kopyala
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Generated Quotes */}
                  {generatedQuotes.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Quote className="h-4 w-4" />
                        Alıntılar
                      </h3>
                      <div className="space-y-2">
                        {generatedQuotes.map((quote, i) => (
                          <div
                            key={i}
                            onClick={() => applyQuote(quote)}
                            className={`p-2 rounded-lg cursor-pointer text-xs transition-all hover:scale-[1.02] ${
                              darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            <p className="italic">"{quote.text}"</p>
                            <p className="text-right text-gray-500 mt-1">— {quote.author}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Separator />
                  
                  {/* Performance Analysis */}
                  <Button onClick={analyzePerformance} variant="outline" className="w-full">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Performans Analizi
                  </Button>
                  
                  {performanceMetrics && (
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <h4 className="text-sm font-semibold mb-3">Tahmini Performans</h4>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Etkileşim</span>
                            <span>{performanceMetrics.engagement}%</span>
                          </div>
                          <Progress value={performanceMetrics.engagement} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Erişim</span>
                            <span>{performanceMetrics.reach}%</span>
                          </div>
                          <Progress value={performanceMetrics.reach} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Kaydetme</span>
                            <span>{performanceMetrics.saves}%</span>
                          </div>
                          <Progress value={performanceMetrics.saves} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Paylaşım</span>
                            <span>{performanceMetrics.shares}%</span>
                          </div>
                          <Progress value={performanceMetrics.shares} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Virallik</span>
                            <span>{performanceMetrics.virality}%</span>
                          </div>
                          <Progress value={performanceMetrics.virality} className="h-2" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs font-semibold mb-1">Öneriler:</p>
                        <ul className="text-xs space-y-1">
                          {performanceMetrics.suggestions.map((s, i) => (
                            <li key={i} className="text-gray-500">• {s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                {/* Settings Tab */}
                <TabsContent value="settings" className="m-0 p-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Arka Plan</h3>
                    <div className="grid grid-cols-5 gap-1 mb-3">
                      {['#1a1a2e', '#0f0f0f', '#ffffff', '#dc2626', '#2563eb', '#16a34a', '#ca8a04', '#9333ea'].map(color => (
                        <button
                          key={color}
                          onClick={() => { setBackgroundColor(color); setBackgroundGradient(undefined); }}
                          className={`w-8 h-8 rounded-full border-2 ${backgroundColor === color && !backgroundGradient ? 'border-blue-500' : 'border-transparent'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Özel Renk</Label>
                      <Input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => { setBackgroundColor(e.target.value); setBackgroundGradient(undefined); }}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Gradyanlar</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {GRADIENTS.slice(0, 6).map(gradient => (
                        <button
                          key={gradient.name}
                          onClick={() => setBackgroundGradient(gradient.value)}
                          className={`h-12 rounded-lg border-2 transition-all ${
                            backgroundGradient === gradient.value ? 'border-blue-500 scale-105' : 'border-transparent'
                          }`}
                          style={{ background: gradient.value }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Canvas Boyutu</h3>
                    <Select 
                      value={`${canvasSize.width}x${canvasSize.height}`}
                      onValueChange={(v) => {
                        const [w, h] = v.split('x').map(Number);
                        setCanvasSize({ width: w, height: h });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1080x1080">Kare (1:1)</SelectItem>
                        <SelectItem value="1080x1350">Dikey (4:5)</SelectItem>
                        <SelectItem value="1080x608">Yatay (16:9)</SelectItem>
                        <SelectItem value="1080x1920">Hikaye/Reel (9:16)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <Button onClick={clearCanvas} variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Canvas'ı Temizle
                  </Button>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Canvas Area */}
          <div className={`flex-1 ${darkMode ? 'bg-gray-950' : 'bg-gray-200'} flex items-center justify-center p-8 overflow-auto`}>
            <div
              ref={canvasRef}
              className="relative shadow-2xl transition-all"
              style={{
                width: canvasSize.width,
                height: canvasSize.height,
                background: backgroundGradient || backgroundColor,
                backgroundSize: 'cover',
              }}
            >
              {showGrid && (
                <div 
                  className="absolute inset-0 pointer-events-none opacity-10"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, ${darkMode ? '#fff' : '#000'} 1px, transparent 1px),
                      linear-gradient(to bottom, ${darkMode ? '#fff' : '#000'} 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px',
                  }}
                />
              )}
              
              {elements.map(element => (
                <div
                  key={element.id}
                  onClick={() => setSelectedId(element.id)}
                  className={`absolute cursor-move transition-all ${
                    selectedId === element.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  style={{
                    left: `${element.x}%`,
                    top: `${element.y}%`,
                    transform: `translate(-50%, -50%) rotate(${element.rotation}deg)`,
                    opacity: element.opacity,
                  }}
                >
                  {element.type === 'text' && (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => updateElement(element.id, { content: e.currentTarget.textContent || '' })}
                      style={{
                        fontSize: `${element.fontSize}px`,
                        fontFamily: element.fontFamily,
                        color: element.color,
                        fontWeight: element.fontWeight,
                        textAlign: element.textAlign,
                        fontStyle: element.isItalic ? 'italic' : 'normal',
                        textDecoration: element.isUnderline ? 'underline' : 'none',
                        letterSpacing: `${element.letterSpacing}px`,
                        lineHeight: element.lineHeight,
                        textShadow: element.textShadow,
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {element.content}
                    </div>
                  )}
                  
                  {element.type === 'image' && (
                    <img
                      src={element.src}
                      alt=""
                      style={{
                        width: element.width,
                        height: element.height,
                        filter: element.filter,
                        borderRadius: `${element.borderRadius}px`,
                        objectFit: element.objectFit,
                      }}
                    />
                  )}
                  
                  {element.type === 'shape' && (
                    <div
                      style={{
                        width: element.width,
                        height: element.height,
                        backgroundColor: element.color,
                        borderWidth: `${element.borderWidth}px`,
                        borderColor: element.borderColor,
                        borderStyle: 'solid',
                        clipPath: element.shapeType === 'triangle' 
                          ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                          : element.shapeType === 'star'
                          ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                          : element.shapeType === 'circle'
                          ? 'circle(50%)'
                          : 'none',
                        borderRadius: element.shapeType === 'circle' ? '50%' : '0',
                      }}
                    />
                  )}
                  
                  {element.type === 'icon' && (
                    <div style={{ fontSize: element.size, color: element.color }}>
                      <Star className="h-full w-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar - Properties */}
          {selectedElement && (
            <div className={`w-72 border-l ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Özellikler</h3>
                <div className="flex gap-1">
                  <Button onClick={() => duplicateElement(selectedElement.id)} size="icon" variant="ghost">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => deleteElement(selectedElement.id)} size="icon" variant="ghost">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-4">
                  {/* Position */}
                  <div>
                    <Label className="text-xs">Konum X</Label>
                    <Slider
                      value={[selectedElement.x]}
                      onValueChange={([v]) => updateElement(selectedElement.id, { x: v })}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Konum Y</Label>
                    <Slider
                      value={[selectedElement.y]}
                      onValueChange={([v]) => updateElement(selectedElement.id, { y: v })}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>
                  
                  {/* Opacity */}
                  <div>
                    <Label className="text-xs">Opaklık</Label>
                    <Slider
                      value={[selectedElement.opacity * 100]}
                      onValueChange={([v]) => updateElement(selectedElement.id, { opacity: v / 100 })}
                      min={0}
                      max={100}
                    />
                  </div>
                  
                  {/* Rotation */}
                  <div>
                    <Label className="text-xs">Döndürme</Label>
                    <Slider
                      value={[selectedElement.rotation]}
                      onValueChange={([v]) => updateElement(selectedElement.id, { rotation: v })}
                      min={-180}
                      max={180}
                    />
                  </div>
                  
                  {selectedElement.type === 'text' && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-xs">Yazı Boyutu</Label>
                        <Slider
                          value={[selectedElement.fontSize]}
                          onValueChange={([v]) => updateElement(selectedElement.id, { fontSize: v })}
                          min={12}
                          max={120}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Yazı Tipi</Label>
                        <Select
                          value={selectedElement.fontFamily}
                          onValueChange={(v) => updateElement(selectedElement.id, { fontFamily: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FONTS.map(font => (
                              <SelectItem key={font.name} value={font.value}>{font.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Renk</Label>
                        <Input
                          type="color"
                          value={selectedElement.color}
                          onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => updateElement(selectedElement.id, { isBold: !selectedElement.isBold })}
                          variant={selectedElement.isBold ? 'default' : 'outline'}
                          size="icon"
                        >
                          <Bold className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => updateElement(selectedElement.id, { isItalic: !selectedElement.isItalic })}
                          variant={selectedElement.isItalic ? 'default' : 'outline'}
                          size="icon"
                        >
                          <Italic className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => updateElement(selectedElement.id, { isUnderline: !selectedElement.isUnderline })}
                          variant={selectedElement.isUnderline ? 'default' : 'outline'}
                          size="icon"
                        >
                          <Underline className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => updateElement(selectedElement.id, { textAlign: 'left' })}
                          variant={selectedElement.textAlign === 'left' ? 'default' : 'outline'}
                          size="icon"
                        >
                          <AlignLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => updateElement(selectedElement.id, { textAlign: 'center' })}
                          variant={selectedElement.textAlign === 'center' ? 'default' : 'outline'}
                          size="icon"
                        >
                          <AlignCenter className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => updateElement(selectedElement.id, { textAlign: 'right' })}
                          variant={selectedElement.textAlign === 'right' ? 'default' : 'outline'}
                          size="icon"
                        >
                          <AlignRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <Label className="text-xs">Harf Aralığı</Label>
                        <Slider
                          value={[selectedElement.letterSpacing]}
                          onValueChange={([v]) => updateElement(selectedElement.id, { letterSpacing: v })}
                          min={-5}
                          max={20}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Satır Yüksekliği</Label>
                        <Slider
                          value={[selectedElement.lineHeight * 10]}
                          onValueChange={([v]) => updateElement(selectedElement.id, { lineHeight: v / 10 })}
                          min={8}
                          max={30}
                        />
                      </div>
                    </>
                  )}
                  
                  {selectedElement.type === 'image' && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-xs">Genişlik</Label>
                        <Slider
                          value={[selectedElement.width]}
                          onValueChange={([v]) => updateElement(selectedElement.id, { width: v })}
                          min={50}
                          max={800}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Yükseklik</Label>
                        <Slider
                          value={[selectedElement.height]}
                          onValueChange={([v]) => updateElement(selectedElement.id, { height: v })}
                          min={50}
                          max={800}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Köşe Yuvarlaklığı</Label>
                        <Slider
                          value={[selectedElement.borderRadius]}
                          onValueChange={([v]) => updateElement(selectedElement.id, { borderRadius: v })}
                          min={0}
                          max={100}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Filtre</Label>
                        <Select
                          value={selectedElement.filter}
                          onValueChange={(v) => updateElement(selectedElement.id, { filter: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {IMAGE_FILTERS.map(filter => (
                              <SelectItem key={filter.value} value={filter.value}>{filter.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  
                  {selectedElement.type === 'shape' && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-xs">Genişlik</Label>
                        <Slider
                          value={[selectedElement.width]}
                          onValueChange={([v]) => updateElement(selectedElement.id, { width: v })}
                          min={20}
                          max={500}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Yükseklik</Label>
                        <Slider
                          value={[selectedElement.height]}
                          onValueChange={([v]) => updateElement(selectedElement.id, { height: v })}
                          min={20}
                          max={500}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Renk</Label>
                        <Input
                          type="color"
                          value={selectedElement.color}
                          onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Kenarlık Kalınlığı</Label>
                        <Slider
                          value={[selectedElement.borderWidth]}
                          onValueChange={([v]) => updateElement(selectedElement.id, { borderWidth: v })}
                          min={0}
                          max={20}
                        />
                      </div>
                    </>
                  )}
                  
                  {selectedElement.type === 'icon' && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-xs">Boyut</Label>
                        <Slider
                          value={[selectedElement.size]}
                          onValueChange={([v]) => updateElement(selectedElement.id, { size: v })}
                          min={16}
                          max={200}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Renk</Label>
                        <Input
                          type="color"
                          value={selectedElement.color}
                          onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

export default App;
