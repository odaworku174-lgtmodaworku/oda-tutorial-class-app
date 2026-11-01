# ODA EDUCATIONAL APP
> **Sirna Barnootaa Kutaa 9–12 fi Yuunivarsitii (Freshman)**  
> **Abbaa Qophii: Mr. Oda Worku** (Founder & Senior Instructor)

---

## 1. Akkaataa Coodii Kana GitHub Irratti Ol-Kaayan (How to Push to GitHub)

Coodiin appii kanaa guutummaatti `git` dhaan qophaa'eera. Gara account GitHub keessaniitti ol-fe'uuf:

### Tarkaanfii 1: GitHub Irratti Repository Haaraa Bani
1. Gara [github.com](https://github.com) deemaa, account keessaniin seenaa (Sign In).
2. Mirga gubbaarraa mallattoo **`+`** tuquun **"New repository"** filadhaa.
3. Maqaa kennitoota: fakkeenyaaf `oda-educational-app`.
4. "Public" yookaan "Private" filadhaa (Private filachuun qabiyyee keessan eega).
5. "Initialize this repository with README" **duwwaa dhiisaa** (uncheck godhaa).
6. **"Create repository"** tuqaa.

### Tarkaanfii 2: Terminal / Command Line Irratti Ajajoota Kanneen Hojjadhaa
URL repository GitHub keessanii (fakkeenyaaf `https://github.com/odaworku/oda-educational-app.git`) fayyadamuun:

```bash
# 1. Liinkii GitHub keessanii itti hidhaa (Username keessaniin bakka buusaa)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/oda-educational-app.git

# 2. Branch gara main tti mirkaneessi
git branch -M main

# 3. Koodii hunda gara GitHub tti fe'i (Push)
git push -u origin main
```

---

## 2. Vidiyoo YouTube fi Buufannaa Offline (YouTube & In-App Offline Downloads)

### Hubachiisa Murteessaa:
* **YouTube Private vs Unlisted:**
  - Vidiyoon YouTube irratti **Private** ta'e barattoota dabalatee namni liinkii qabus hin argu (invite Google qofa barbaada).
  - Kanaafuu, YouTube irratti yoo fayyadamtaniis **"Unlisted"** gochuun qabdu. Unlisted yoo ta'e, barattoonni appii keessan keessaa online daawwachuu danda'u.
* **Akka Barattoonni Offline Buufatanii Daawwataniif (The 100% Offline Solution):**
  - YouTube'n sababa eegumsa DRM isaatiin biraawuzerii kamiyyuu keessaa vidiyoo kallattiin akka MP4 tti download gochuun offline akka kuufamu hin heyyamu.
  - **Furmaanni Sirriin fi 100% Hojjatu:**
    Mr. Oda'n vidiyoo isaanii kallattiin gara **Online Server Disk (500 GB+ Cloud Storage)** appii kanaatti fe'u (Bulchiinsa Qabiyyee -> "Faayila Vidiyoo Filadhaa"):
    1. Kuusaa bilbila keessanii homaa hin qabatu (0 MB phone storage).
    2. YouTube irra hin taa'u, appii keessan qofa keessatti 100% dhokataa fi qulqulluu ta'a.
    3. **Barattoonni buttoonii "Offline Buufadhu" jedhu tuquun bilbila isaanii keessatti kuufatanii intarneetii tokko malee bakka kamittiyyuu ni daawwatu!**

---

## 3. Akkaataa Appicha Kompiitara Irratti Jalqabsiisan (Local Development)

```bash
# 1. Dependency-wwan fe'adhu
npm install

# 2. Server fi Dev mode jalqabsiisi
npm run dev

# 3. Production Build hojjedhu
npm run build
npm start
```

---

## 4. Akkaataa Standalone App (PWA & APK) Ta'u
* **Public Web Link:** `https://ais-pre-oqjs24ppi5xggxhuyoyjxh-63446449139.europe-west2.run.app`
* **PWA Install:** Chrome / Safari irraa "Add to Home Screen" filachuun bilbila irratti akka native app ta'ee bana.
* **APK for Play Store:** [pwabuilder.com](https://www.pwabuilder.com) irratti liinkii public galchuun faayila `.apk` fi `.aab` daqiiqaa 2 keessatti baafachuu dandeessu.
