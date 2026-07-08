import type { 
  AIContentRequest, 
  GeneratedContent, 
  ViralHeadline, 
  CaptionSuggestion, 
  ColorPalette, 
  PerformanceMetrics,
  CanvasElement 
} from '@/types';
import { 
  HASHTAG_CATEGORIES
} from '@/constants';

export function generateViralHeadlines(topic?: string, count: number = 5): ViralHeadline[] {
  const headlines: ViralHeadline[] = [
    { text: '5 Strateji Hatası Şirketinizi Mahvediyor', engagement: 94, category: 'Strateji' },
    { text: 'CEO\'ların Sabah 5\'te Yaptığı 3 Şey', engagement: 91, category: 'Liderlik' },
    { text: 'Bu Basit Değişiklik Verimliliğinizi %40 Artıracak', engagement: 96, category: 'Verimlilik' },
    { text: 'Uzaktan Çalışmanın Gizli Maliyeti', engagement: 88, category: 'İK' },
    { text: '2025\'te Hayatta Kalacak Şirketlerin Özelliği', engagement: 93, category: 'Trendler' },
    { text: 'Milyar Dolarlık Şirketlerin Ortak Özelliği', engagement: 95, category: 'Başarı' },
    { text: 'Çalışanlarınızı Kaybetmenin Gerçek Maliyeti', engagement: 89, category: 'İK' },
    { text: 'AI Çağında İşinizi Nasıl Korursunuz?', engagement: 92, category: 'Teknoloji' },
    { text: 'Stratejik Planlama Yapmayan Şirketlerin Sonu', engagement: 87, category: 'Strateji' },
    { text: 'Liderlik Tarzınızı Değiştirmenin Tam Zamanı', engagement: 90, category: 'Liderlik' },
    { text: 'Verimlilik Sırrı: Pomodoro Tekniği', engagement: 85, category: 'Verimlilik' },
    { text: 'Toplantılarınızı %50 Kısaltmanın Yolu', engagement: 94, category: 'Verimlilik' },
    { text: 'Agile Metodoloji Neden Başarısız Oluyor?', engagement: 88, category: 'Yöntem' },
    { text: 'Müşteri Deneyiminde 1 Numara Olmanın Sırrı', engagement: 91, category: 'Müşteri' },
    { text: 'Dijital Dönüşümde Yapılan 7 Büyük Hata', engagement: 93, category: 'Dönüşüm' },
  ];

  if (topic) {
    const filtered = headlines.filter(h => 
      h.text.toLowerCase().includes(topic.toLowerCase()) ||
      h.category.toLowerCase().includes(topic.toLowerCase())
    );
    return filtered.slice(0, count).length > 0 
      ? filtered.slice(0, count) 
      : headlines.slice(0, count);
  }

  return headlines.sort(() => Math.random() - 0.5).slice(0, count);
}

export function generateCaptions(request?: AIContentRequest): CaptionSuggestion[] {
  const captions: CaptionSuggestion[] = [
    {
      text: 'Başarı bir tesadüf değil, stratejik planlamanın sonucudur. Bugün işinizi bir üst seviyeye taşıyacak 3 adımı paylaşıyorum. 👇\n\nHangi adımı ilk uygulamaya başlayacaksınız? Yorumlarda paylaşın! 💬',
      hashtags: ['#strateji', '#işgeliştirme', '#liderlik', '#başarı', '#consulting'],
      engagement: 89,
    },
    {
      text: 'Verimlilik sırrı: Doğru şeyleri, doğru zamanda, doğru şekilde yapmak. 🚀\n\nEkibinizin verimliliğini artırmak için kullandığınız en etkili yöntem nedir?',
      hashtags: ['#verimlilik', '#zaman yönetimi', '#ekipçalışması', '#productivity'],
      engagement: 92,
    },
    {
      text: 'Değişim kaçınılmaz. Geleceği şekillendiren şirketler, değişimi fırsata çevirenlerdir. 💡\n\n2025\'te sektörünüzü nasıl etkileyeceğini düşünüyorsunuz?',
      hashtags: ['#değişim', '#inovasyon', '#gelecek', '#dijitaldönüşüm'],
      engagement: 87,
    },
    {
      text: 'Liderlik bir unvan değil, bir eylemdir. Ekibinizi ilhamla yönlendiriyor musunuz? 🎯\n\nİyi bir liderin sahip olması gereken en önemli özellik sizce nedir?',
      hashtags: ['#liderlik', '#yöneticilik', '#ekipyönetimi', '#leadership'],
      engagement: 94,
    },
    {
      text: 'Müşteri deneyimi, üründen daha önemli hale geldi. Markanız unutulmaz anlar yaratıyor mu? ✨\n\nEn son unutamadığınız müşteri deneyimini paylaşın!',
      hashtags: ['#müşterideneyimi', '#marka', '#crm', '#müşterimemnuniyeti'],
      engagement: 91,
    },
    {
      text: 'Veri, karar almanın yeni temelidir. Ama ham veri değil, içgörü önemlidir. 📊\n\nİş kararlarınızda veriyi ne kadar kullanıyorsunuz?',
      hashtags: ['#veri', '#analitik', '#businessintelligence', '#data'],
      engagement: 88,
    },
    {
      text: 'Uzaktan çalışma kültürü, güven ve sonuçlar üzerine kurulmalı. Lokasyon bağımsız başarı mümkün! 🌍\n\nUzaktan çalışmanın en büyük avantajı sizce nedir?',
      hashtags: ['#uzaktançalışma', '#remote work', '#işhayatı', '#flexible'],
      engagement: 93,
    },
    {
      text: 'Sürekli öğrenme, rekabet avantajının anahtarıdır. Bugün kendinize ne kattınız? 📚\n\nSon zamanlarda okuduğunuz en etkileyici kitap nedir?',
      hashtags: ['#öğrenme', '#kişiselgelişim', '#kariyer', '#eğitim'],
      engagement: 85,
    },
  ];

  if (request?.topic) {
    const filtered = captions.filter(c => 
      c.text.toLowerCase().includes(request.topic!.toLowerCase()) ||
      c.hashtags.some(h => h.toLowerCase().includes(request.topic!.toLowerCase()))
    );
    return filtered.length > 0 ? filtered : captions;
  }

  return captions.sort(() => Math.random() - 0.5).slice(0, 4);
}

export function generateHashtags(category?: string, count: number = 10): string[] {
  const allHashtags = Object.values(HASHTAG_CATEGORIES).flat();
  
  if (category && HASHTAG_CATEGORIES[category as keyof typeof HASHTAG_CATEGORIES]) {
    return HASHTAG_CATEGORIES[category as keyof typeof HASHTAG_CATEGORIES]
      .slice(0, count);
  }

  return allHashtags
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}

export function generateQuotes(topic?: string, count: number = 3): { text: string; author: string }[] {
  const quotes = [
    { text: 'Strateji, kaynakların doğru hedeflere yönlendirilmesidir.', author: 'Peter Drucker' },
    { text: 'Değişimi yönetenler başarılı olur, değişime direnenler kaybolur.', author: 'Jack Welch' },
    { text: 'Mükemmellik bir eylem değil, bir alışkanlıktır.', author: 'Aristotle' },
    { text: 'Liderlik, başkalarının görmediğini görmektir.', author: 'Sheryl Sandberg' },
    { text: 'Başarı, hazırlık ve fırsatın buluşmasıdır.', author: 'Bobby Unser' },
    { text: 'En iyi yatırım, kendine yapılan yatırımdır.', author: 'Warren Buffett' },
    { text: 'Veri, yeni petrolüdür. Ama işlenmemiş petrol değerlidir.', author: 'Clive Humby' },
    { text: 'İnovasyon, liderler ve takipçiler arasındaki farktır.', author: 'Steve Jobs' },
    { text: 'Müşteri deneyimi yeni savaş alanıdır.', author: 'Sundar Pichai' },
    { text: 'Agile olmak, hızlı olmak değil, esnek olmaktır.', author: 'Jeff Sutherland' },
    { text: 'Basitlik, en üst düzeyde sofistikasyondur.', author: 'Leonardo da Vinci' },
    { text: 'Başarısızlık, başarının anahtarıdır.', author: 'Malcolm Forbes' },
    { text: 'Vizyon olmadan eylem, bir hayalden ibarettir.', author: 'Joel Barker' },
    { text: 'Takım çalışması, ortak bir vizyondur.', author: 'Andrew Carnegie' },
    { text: 'Yaratıcılık, sınırları aşmaktır.', author: 'Maya Angelou' },
  ];

  if (topic) {
    const filtered = quotes.filter(q => 
      q.text.toLowerCase().includes(topic.toLowerCase()) ||
      q.author.toLowerCase().includes(topic.toLowerCase())
    );
    return filtered.slice(0, count).length > 0 
      ? filtered.slice(0, count) 
      : quotes.slice(0, count);
  }

  return quotes.sort(() => Math.random() - 0.5).slice(0, count);
}

export function generateColorPalettes(mood?: string): ColorPalette[] {
  const palettes: ColorPalette[] = [
    {
      name: 'Kurumsal Mavi',
      colors: ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'],
      mood: 'Profesyonel, güvenilir',
    },
    {
      name: 'Enerjik Turuncu',
      colors: ['#c2410c', '#f97316', '#fb923c', '#fdba74', '#ffedd5'],
      mood: 'Enerjik, yaratıcı',
    },
    {
      name: 'Doğal Yeşil',
      colors: ['#166534', '#22c55e', '#4ade80', '#86efac', '#dcfce7'],
      mood: 'Doğal, sürdürülebilir',
    },
    {
      name: 'Lüks Mor',
      colors: ['#6b21a8', '#a855f7', '#c084fc', '#d8b4fe', '#f3e8ff'],
      mood: 'Lüks, yaratıcı',
    },
    {
      name: 'Minimal Gri',
      colors: ['#171717', '#404040', '#737373', '#a3a3a3', '#f5f5f5'],
      mood: 'Minimal, sofistike',
    },
    {
      name: 'Sıcak Kırmızı',
      colors: ['#991b1b', '#ef4444', '#f87171', '#fca5a5', '#fee2e2'],
      mood: 'Tutku, aciliyet',
    },
    {
      name: 'Teknoloji Cyan',
      colors: ['#164e63', '#06b6d4', '#22d3ee', '#67e8f9', '#cffafe'],
      mood: 'Modern, teknolojik',
    },
    {
      name: 'Altın Sarısı',
      colors: ['#713f12', '#eab308', '#facc15', '#fde047', '#fef9c3'],
      mood: 'Lüks, başarı',
    },
  ];

  if (mood) {
    const filtered = palettes.filter(p => 
      p.mood.toLowerCase().includes(mood.toLowerCase())
    );
    return filtered.length > 0 ? filtered : palettes;
  }

  return palettes;
}

export function predictPerformance(
  elements: CanvasElement[],
  backgroundColor: string,
  caption?: string
): PerformanceMetrics {
  let engagement = 50;
  let reach = 50;
  let saves = 50;
  let shares = 50;
  const suggestions: string[] = [];

  // Metin elemanları analizi
  const textElements = elements.filter(e => e.type === 'text') as Extract<CanvasElement, { type: 'text' }>[];
  const hasHeadline = textElements.some(e => e.fontSize > 30);
  const hasBodyText = textElements.some(e => e.fontSize <= 24);
  const textCount = textElements.length;

  if (hasHeadline) {
    engagement += 15;
    reach += 10;
  } else {
    suggestions.push('Büyük bir başlık ekleyin (30px\'den büyük)');
  }

  if (hasBodyText) {
    engagement += 10;
  }

  if (textCount >= 2 && textCount <= 4) {
    engagement += 10;
  } else if (textCount > 5) {
    engagement -= 10;
    suggestions.push('Çok fazla metin var, bazılarını kaldırın');
  }

  // Görsel elemanlar analizi
  const imageElements = elements.filter(e => e.type === 'image');
  if (imageElements.length > 0) {
    engagement += 15;
    saves += 20;
    reach += 10;
  } else {
    suggestions.push('Görsel eklemeyi düşünün');
  }

  // Renk analizi
  const isDark = backgroundColor.toLowerCase() === '#000000' || 
                 backgroundColor.toLowerCase() === '#0f0f0f' ||
                 backgroundColor.includes('0,0,0');
  const isGradient = backgroundColor.includes('gradient');

  if (isGradient) {
    engagement += 10;
    reach += 5;
  }

  if (isDark) {
    engagement += 5;
  }

  // Kontrast kontrolü
  const hasGoodContrast = textElements.some(e => {
    const isLightText = e.color.toLowerCase() === '#ffffff' || 
                        e.color.toLowerCase() === '#fff';
    return isDark && isLightText;
  });

  if (hasGoodContrast) {
    engagement += 10;
  } else if (isDark) {
    suggestions.push('Koyu arka plan için beyaz/beyaza yakın metin kullanın');
  }

  // Caption analizi
  if (caption) {
    if (caption.length > 100) {
      engagement += 10;
      reach += 5;
    }
    if (caption.includes('#')) {
      reach += 15;
    }
    if (caption.includes('?')) {
      engagement += 10;
      shares += 5;
    }
  } else {
    suggestions.push('Etkileşimi artırmak için bir açıklama yazın');
  }

  // Virallik hesaplama
  const virality = Math.round((engagement + shares + saves) / 3);

  // Sınırları uygula
  return {
    engagement: Math.min(100, Math.max(0, engagement)),
    reach: Math.min(100, Math.max(0, reach)),
    saves: Math.min(100, Math.max(0, saves)),
    shares: Math.min(100, Math.max(0, shares)),
    virality: Math.min(100, Math.max(0, virality)),
    suggestions: suggestions.length > 0 ? suggestions : ['Harika görünüyor! 🎉'],
  };
}

export function generateCompleteContent(request: AIContentRequest): GeneratedContent {
  return {
    headlines: generateViralHeadlines(request.topic, 5).map(h => h.text),
    captions: generateCaptions(request).map(c => c.text),
    hashtags: generateHashtags(request.topic, 15),
    quotes: generateQuotes(request.topic, 5).map(q => `${q.text} — ${q.author}`),
  };
}

export function suggestImprovements(
  elements: CanvasElement[],
  backgroundColor: string
): string[] {
  const suggestions: string[] = [];
  const textElements = elements.filter(e => e.type === 'text') as Extract<CanvasElement, { type: 'text' }>[];
  const imageElements = elements.filter(e => e.type === 'image');

  // Metin önerileri
  if (textElements.length === 0) {
    suggestions.push('Gönderinize metin ekleyin');
  } else {
    const hasLargeText = textElements.some(e => e.fontSize > 36);
    if (!hasLargeText) {
      suggestions.push('Dikkat çekmek için daha büyük bir başlık kullanın');
    }

    const centeredTexts = textElements.filter(e => e.textAlign === 'center');
    if (centeredTexts.length === 0) {
      suggestions.push('Metinleri ortalamak daha profesyonel görünür');
    }
  }

  // Görsel önerileri
  if (imageElements.length === 0) {
    suggestions.push('Görseller etkileşimi %40 artırır');
  }

  // Renk önerileri
  if (backgroundColor === '#ffffff' || backgroundColor === '#fff') {
    suggestions.push('Beyaz arka plan yerine gradyan kullanmayı deneyin');
  }

  // Denge önerileri
  if (elements.length > 6) {
    suggestions.push('Çok fazla eleman var, sadelik daha etkilidir');
  }

  return suggestions;
}

export function analyzeBestPostTime(): { day: string; hour: string; reason: string } {
  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
  const hours = ['08:00', '12:00', '17:00', '19:00'];
  
  return {
    day: days[Math.floor(Math.random() * days.length)],
    hour: hours[Math.floor(Math.random() * hours.length)],
    reason: 'Hedef kitlenizin en aktif olduğu zaman dilimi',
  };
}

export function generateAIColorScheme(topic?: string): string[] {
  const schemes: Record<string, string[]> = {
    'teknoloji': ['#0f172a', '#06b6d4', '#22d3ee', '#67e8f9'],
    'finans': ['#1e3a5f', '#3b82f6', '#60a5fa', '#93c5fd'],
    'sağlık': ['#166534', '#22c55e', '#4ade80', '#86efac'],
    'eğitim': ['#713f12', '#eab308', '#facc15', '#fde047'],
    'lüks': ['#171717', '#a855f7', '#c084fc', '#e9d5ff'],
    'default': ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'],
  };

  if (topic) {
    const key = Object.keys(schemes).find(k => topic.toLowerCase().includes(k));
    return key ? schemes[key] : schemes.default;
  }

  return schemes.default;
}
