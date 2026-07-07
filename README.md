# BetLens — iGaming İstihbarat Platformu (MVP)

BetLens, iGaming sektörü için bir "istihbarat katmanı"dır: casinoların on-chain para akışını, canlı kumar yayıncılarını (Kick/Twitch), oyuncu sentimentini ve topluluk güven skorlarını tek bir dashboard'da birleştirir. Bu depo; halka açık dashboard'u, admin panelini ve tüm veri katmanını içeren çalışan bir MVP'dir.

> Not: Bu proje, benzer işleve sahip platformlardan (ör. iGaming analitik siteleri) **ilham alınarak sıfırdan, özgün marka ve içerikle** geliştirilmiştir. Başka bir sitenin markası, logosu, metinleri veya verileri kullanılmamıştır. Marka adını `app/layout.jsx` içinden kolayca değiştirebilirsiniz.

## Özellikler

**Halka açık taraf**
- Ana sayfa dashboard'u: haftalık toplam hacim, canlı casino/yayıncı sayaçları, en iyi casino
- Kayan işlem şeridi (ticker): canlı yatırım/çekim akışı hissi
- 7 günlük hacme göre casino sıralaması ve pazar payı donut grafiği
- Canlı kumar yayıncıları listesi (platform, sponsor casino, izleyici sayısı)
- Sıcak cüzdan bakiyeleri (ilk 5)
- Günün en büyük yatırım/çekimleri
- Topluluk güven skorları ve sentiment barları
- Doğrulanmış oyuncu yorumları
- Sayfalar: `/casinos`, `/blockchain`, `/streamers`, `/sentiment`

**Admin paneli (`/admin`)**
- Parola ile giriş (httpOnly cookie oturumu)
- 4 koleksiyon üzerinde tam CRUD: Casinolar, Yayıncılar, İşlemler, Yorumlar
- Kayıt ekleme, düzenleme, silme; sayısal/boolean alanların otomatik dönüştürülmesi
- Tüm değişiklikler anında halka açık sayfalara yansır

## Teknoloji

| Katman | Seçim |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| UI | React 18 + Tailwind CSS |
| Veri | Upstash Redis (üretim) · `data/db.json` (lokal fallback) |
| API | Next.js Route Handlers (`/app/api/*`) |
| Kimlik doğrulama | Parola + httpOnly cookie |

**Veri katmanı nasıl çalışır?** `lib/store.js`, `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN` tanımlıysa tüm okuma/yazmayı Redis'e yapar (ilk çalıştırmada `data/db.json` tohum verisi olarak otomatik yüklenir). Bu değişkenler yoksa lokal dosyaya döner — geliştirmede ek kurulum gerekmez, üretimde ise Vercel'in geçici dosya sistemi sorununu Redis çözer.

## Kurulum

```bash
npm install
npm run dev        # http://localhost:3000
```

Üretim derlemesi:

```bash
npm run build
npm start
```

### Admin girişi

- Adres: `http://localhost:3000/admin`
- Varsayılan parola: `admin123`
- Değiştirmek için ortam değişkeni tanımlayın:

```bash
# .env.local
ADMIN_PASSWORD=cok-guclu-bir-parola
```

## Proje yapısı

```
betlens/
├── app/
│   ├── layout.jsx          # Genel şablon, nav, footer
│   ├── page.jsx            # Ana dashboard
│   ├── casinos/page.jsx    # Casino sıralama tablosu
│   ├── blockchain/page.jsx # İşlemler + sıcak cüzdanlar
│   ├── streamers/page.jsx  # Canlı/çevrimdışı yayıncılar
│   ├── sentiment/page.jsx  # Sentiment + yorumlar
│   ├── admin/page.jsx      # Admin paneli (client component)
│   └── api/
│       ├── auth/login/route.js       # Giriş / çıkış
│       ├── casinos/route.js          # GET/POST/PUT/DELETE
│       ├── streamers/route.js
│       ├── transactions/route.js
│       └── reviews/route.js
├── components/ui.jsx       # Ticker, StatCard, Panel, tablolar, Donut
├── lib/
│   ├── store.js            # JSON okuma/yazma + para/izleyici formatlama
│   ├── auth.js             # Parola kontrolü + cookie
│   └── crud.js             # Tüm koleksiyonlar için genel CRUD fabrikası
└── data/db.json            # Tohum veri (casinolar, yayıncılar, işlemler…)
```

## Veri modeli

`data/db.json` içindeki koleksiyonlar:

- **casinos**: `name, slug, share7d, volume7d, deposits7d, trustScore, sentiment, chains[]`
- **streamers**: `handle, platform, casino, title, viewers, live`
- **transactions**: `casino, chain, type(deposit|withdrawal), amountUsd, tx, ts`
- **hotWallets**: `casino, balanceUsd`
- **reviews**: `casino, author, rating(1-5), text, verified`
- **meta**: haftalık etiket ve toplam sayaçlar

## Otomatik veri çekme (dahil!)

Proje, verileri otomatik güncelleyen iki cron endpoint'i içerir:

| Endpoint | Ne yapar | Kaynak |
| --- | --- | --- |
| `GET /api/cron/streamers` | Twitch "Slots" kategorisindeki tüm canlı yayınları + izleme listesindeki Kick kanallarını çeker, izleyici sayısı ve başlıkları günceller | Twitch Helix API, Kick resmi API |
| `GET /api/cron/chain` | İzleme listesindeki sıcak cüzdanlara giren/çıkan USDT/USDC transferlerini çeker, casino hacim/pay değerlerini yeniden hesaplar | Etherscan V2, Tronscan |

**Kurulum adımları:**

1. `.env.example` dosyasını `.env.local` olarak kopyalayın.
2. **Twitch**: dev.twitch.tv/console/apps adresinden ücretsiz uygulama oluşturun → `TWITCH_CLIENT_ID` ve `TWITCH_CLIENT_SECRET`. Slots kategorisi (`gameId: 498566`) `data/watchlist.json` içinde hazır.
3. **Kick**: docs.kick.com üzerinden Developer uygulaması oluşturun → `KICK_CLIENT_ID` ve `KICK_CLIENT_SECRET`. Takip edilecek kanal slug'larını `data/watchlist.json` → `kick.channels` listesine ekleyin.
4. **Zincir**: etherscan.io/apis'ten ücretsiz anahtar alın → `ETHERSCAN_API_KEY`. Casinoların gerçek sıcak cüzdan adreslerini `data/watchlist.json` → `wallets` listesine yazın (adresler Etherscan/Arkham etiketlerinden bulunabilir). Tron için anahtar gerekmez.
5. Test: `curl http://localhost:3000/api/cron/streamers` — dönen JSON'da kaç yayının güncellendiğini görürsünüz. Eksik anahtar varsa endpoint hata vermez, raporda belirtir.

**Zamanlama:**

- **Vercel**: `vercel.json` hazır — her 5 dakikada iki endpoint otomatik tetiklenir. `CRON_SECRET` env değişkenini tanımlayın.
- **VPS**: crontab ile: `*/5 * * * * curl -s "https://siteniz.com/api/cron/streamers?secret=GIZLI"` (chain için aynısı).
- **Ücretsiz alternatif**: cron-job.org gibi bir servise iki URL'yi ekleyin.

**Davranış notları:**

- Admin panelinden elle eklediğiniz yayıncılar korunur; yalnızca `source: "auto"` kayıtlar her turda tazelenir.
- Zincir tarafında $100 altı transferler gürültü sayılıp elenir; işlem listesi son 200 kayıtla sınırlıdır ve `tx` hash'ine göre tekilleştirilir.
- Otomatik zincir verisi geldiğinde `volume7d`, `share7d`, `deposits7d` ve toplam hacim son 7 günden yeniden hesaplanır.

## Üretim yol haritası (sonraki adımlar)

1. **Veritabanı**: `lib/store.js` katmanını Prisma + PostgreSQL ile değiştirin — Vercel'de dosya sistemi kalıcı olmadığı için cron yazımları ancak DB ile kalıcı olur.
2. **Solana**: `lib/fetchers/chain.js` içine Helius/Solana RPC eklenebilir (ETH/TRX ile aynı desen).
3. **Sentiment**: Yorumları bir AI sınıflandırma hattından geçirip `sentiment` skorunu otomatik güncelleyin.
4. **Canlı akış**: Ticker'ı Server-Sent Events ile gerçek zamanlıya çevirin.
5. **Kimlik doğrulama**: Tek parola yerine NextAuth/rol tabanlı girişe geçin.

## Canlıya alma — adım adım

1. **GitHub'a yükle**
   ```bash
   git init && git add . && git commit -m "BetLens MVP"
   ```
   GitHub'da private repo oluşturup push'layın. `.env.local` asla commit'lenmez (`.gitignore` hazır).

2. **Upstash Redis oluştur** (kalıcı veri — üretimde şart)
   console.upstash.com → ücretsiz Redis database oluştur → REST API sekmesinden `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN` değerlerini kopyala. İlk istekte tohum veri Redis'e otomatik yüklenir, ekstra migrasyon gerekmez.

3. **Vercel'e deploy et**
   vercel.com → Import Project → repo'yu seç. Environment Variables bölümüne `.env.example` içindeki tüm değişkenleri gir (özellikle `ADMIN_PASSWORD`'ü güçlü bir değerle, `CRON_SECRET`'ı rastgele uzun bir dizeyle). Deploy'a bas.

4. **Cron'u kur**
   - Vercel Pro'daysanız `vercel.json` hazır — 5 dakikada bir otomatik tetiklenir (Hobby planda cron günde 1 ile sınırlıdır).
   - Ücretsiz alternatif: cron-job.org'da iki iş oluşturun:
     `https://siteniz.com/api/cron/streamers?secret=CRON_SECRET`
     `https://siteniz.com/api/cron/chain?secret=CRON_SECRET`
     her ikisi de 5 dakikada bir.

5. **Domain bağla**
   Vercel → Settings → Domains → domaininizi ekleyin, DNS sağlayıcınızda verilen kaydı girin. SSL otomatik.

6. **Veriyi doldur**
   Admin paneli → "İzlenen Cüzdanlar" sekmesine casinoların gerçek sıcak cüzdan adreslerini, "Kick Kanalları" sekmesine takip edilecek kanal slug'larını ekleyin. Twitch tarafı kategori taraması yaptığı için kendiliğinden dolar.

**Alternatif barındırma:** VPS veya Node destekli hosting'de `npm run build && npm start` ile Redis'siz (dosya tabanlı) dahi çalışır. cPanel yalnızca Node.js App desteği varsa uygundur; statik export API route'lar nedeniyle mümkün değildir.

## Yasal not

Bu yazılım yalnızca bilgilendirme amaçlı veri gösterir; bahis/yatırım tavsiyesi değildir. Kumar içerikli ürünler yerel mevzuata tabidir — Türkiye dahil birçok ülkede çevrimiçi kumar hizmetleri ve tanıtımı yasal kısıtlamalara tabidir. Yayınlamadan önce hedef pazarın hukuki gerekliliklerini mutlaka kontrol edin.
