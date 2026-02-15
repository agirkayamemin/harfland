# harfland - cocuk alfabe egitim uygulamasi

3-5 yas arasi cocuklara turk alfabesini ogreten offline mobil uygulama.

CLAUDE Session ID:  

## Teknoloji

- **Framework:** React Native + Expo (managed workflow, Expo Router)
- **Dil:** TypeScript (strict mode)
- **State:** Zustand + MMKV (react-native-mmkv)
- **Animasyon:** react-native-reanimated + Lottie
- **Cizim:** react-native-svg + react-native-gesture-handler
- **Ses:** expo-av
- **Navigasyon:** Expo Router (file-based routing)

## Proje Yapisi

```
src/
  app/          -> Expo Router sayfa dosyalari
  components/   -> UI, letter, game, feedback componentleri
  data/         -> alphabet.ts, syllables.ts, words.ts, tracePaths.ts
  stores/       -> Zustand store'lari (progressStore, settingsStore)
  hooks/        -> Custom hook'lar
  utils/        -> Yardimci fonksiyonlar (scoring, traceValidator, adaptiveDifficulty)
  assets/       -> audio, images, animations, fonts
```

Detayli plan: `plan.md`
Ilerleme kaydi: `PROGRESS.md`

---

## Ilerleme Takibi (ONEMLI)

- Her adim tamamlandiginda `PROGRESS.md` dosyasini guncelle.
- Her kayit su formatta olsun:

```
## [TARIH] - Kisa baslik

### Yapilan
- Ne yapildi (dosya adi, komut, degisiklik)

### Olusturulan/Degistirilen Dosyalar
- `dosya/yolu.ts` - Aciklama

### Notlar
- Karsilasilan sorunlar, alinan kararlar, sonraki adim icin bilgi
```

- Kucuk adimlar bile kayit edilsin (paket yukleme, config degisikligi, tek dosya olusturma).
- Basarisiz denemeler ve cozumleri de yazilsin.
- PROGRESS.md projenin tam tarihcesi olsun, yeni bir oturumda kalinan yerden devam edilebilsin.

---

## Calisma Sekli (ONEMLI)

### Aciklayarak Ilerle
- Herhangi bir terminal komutu calistirmadan, dosya olusturmadan veya kod yazmadan ONCE kullaniciya ne yapacagini ve neden yapacagini acikla.
- Yapilacak islemleri madde madde listele, her maddenin ne ise yaradigini kisa ve anlasilir sekilde belirt.
- Kullanicinin onayini al, sonra isle.
- Ornek format:

```
Simdi su islemleri yapacagim:

1. `npx expo install react-native-svg` - Harf cizimi icin SVG destegi ekler
2. `src/data/alphabet.ts` dosyasi olusturma - 29 Turk harfinin bilgilerini (ses, ornek kelime, renk) icerir
3. ...

Onayliyorsan devam edeyim.
```

### Terminal Komutlari
- Paket yukleme, build, proje olusturma gibi terminal komutlarini calistirmadan once kullaniciya komutu ve ne yaptigini goster.
- Birden fazla komutu art arda calistirmak yerine grupla ve acikla.
- Hata alirsan hatayi kullaniciya raporla ve cozum onerileriyle birlikte sun.

### Dosya ve Kod Olusturma
- Yeni dosya olusturmadan once dosyanin amacini ve icerdigi temel yapilari acikla.
- Mevcut dosyayi degistirmeden once hangi satirlarin neden degistigini belirt.
- Buyuk degisiklikleri kucuk adimlara bol, her adimi ayri acikla.

---

## Guvenlik Kurallari

### Genel Guvenlik
- Belirsiz veya birden fazla yaklasim mumkun olan durumlarda ONCE kullaniciya sor, varsayim yapma.
- `rm -rf`, `git reset --hard`, `git push --force` gibi geri donusu zor komutlari ASLA otomatik calistirma.
- `.env`, credential, API key iceren dosyalari ASLA olusturma veya commit etme.
- Kullanicinin onaylamadigi hicbir islemi gerceklestirme.

### Paket ve Bagimlilik Guvenligi
- Sadece plan.md'de belirtilen veya kullanicinin onayladigi paketleri yukle.
- Bilinmeyen veya dusuk indirme sayisina sahip npm paketleri onerme, once kullaniciyla tartis.
- `npm audit` uyarilarini kullaniciya bildir.

### Kod Guvenligi
- TypeScript strict mode, `any` kullanma.
- Kullanici girdisi (cocuk ismi vb.) her zaman sanitize edilsin.
- Uygulama tamamen offline, hicbir network cagrisi yapma.
- Dis URL, deeplink veya webview YASAK.
- Dosya sistemi erisimi sadece MMKV uzerinden, harici dosya okuma/yazma yok.

---

## Gelistirme Kurallari

### Hedef Kitle: 3-5 Yas
- Minimum dokunma alani: 64x64dp (standart 48dp degil)
- Scroll yerine swipe/sayfa gecisi kullan
- Metin tabanli navigasyon YASAK, her sey ikon + ses ile
- Maksimum 2 dokunusla hedef ekrana ulasim
- Parlak, doygun renkler kullan (soluk renkler cocuklar icin uygun degil)
- Buyuk, yuvarlak hatli tipografi

### Geri Bildirim
- Dogru cevap: kutlama animasyonu + alkis sesi + yildiz
- Yanlis cevap: nazik yonlendirme + "Tekrar dene!" (ASLA "Yanlis!" deme)
- 10 saniye hareketsizlik -> sesli ipucu ver
- Cocuk hicbir zaman "basarisiz" olmaz, her girisim odullendirilir

### Ebeveyn Guvenligi
- Uygulama ici satin alma YOK
- Reklam YOK
- Dis link YOK
- Ayarlar ekrani ebeveyn kapisi arkasinda (matematik sorusu)
- Ekran suresi hatirlatici: 20 dk sonra mola uyarisi

### Kod Kalitesi
- Component'ler kucuk ve tek sorumluluklu olsun
- Tum renk ve boyut degerleri constants/theme dosyasinda tanimlansin
- Ses ve gorsel asset'ler lazy load edilsin
- 60fps animasyon hedefi, JS thread'i bloklama
- Reanimated worklet'leri UI thread'de calis
- Tum veri offline MMKV'de saklansin

### Ogrenme Algoritmasi
- MEB mufredatina uygun harf siralama grubu (plan.md 3.1)
- Her harf 4 asamali: Tanitma -> Tanima -> Yazma -> Pratik
- Aralikli tekrar (SM-2 varyanti) ile pekistirme
- Adaptif zorluk: %90+ basari -> ilerle, %50 alti -> geri don
- Oturum icerigi: %80 bilinen + %20 yeni materyal

### Commit Mesajlari
- Turkce veya Ingilizce, tutarli ol
- Kisa ve aciklayici: "feat: harf cizme ekrani eklendi"
- Co-Authored-By satiri EKLEME
