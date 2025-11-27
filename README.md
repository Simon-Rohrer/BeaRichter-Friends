# Bea Richter & Friends Website

Moderne, responsive Website für die Band "Bea Richter & Friends" mit Hero-Section, Band-Mitgliedern, Audio-Player und Booking-Formular.

## 🚀 Lokalen Server starten

```bash
cd /Users/simonrohrer/bearichter-friends
python3 -m http.server 8000
```
Dann im Browser öffnen: [http://localhost:8000](http://localhost:8000)

## 🛑 Server beenden

**Einfachste Methode:** Drücke `control+C` im Terminal

**Alternative:**

1. Prozess finden:
```bash
lsof -i :8000
```

2. Prozess beenden (ersetze `PID` mit der angezeigten Nummer):
```bash
kill -9 PID
```

## 📁 Projektstruktur

```
bearichter-friends/
├── index.html              # Hauptseite
├── style.css               # Styling
├── script.js               # JavaScript Funktionalität
└── assets/                 # Bilder & Audio
    ├── images/             # Bandfotos & Hintergrund
    └── audio/              # Demo-Songs
```

## ✨ Features

*   **Hero Section** - Atmosphärischer Hintergrund mit Call-to-Action
*   **Band Members** - Vorstellung der 3 Mitglieder (Bea, Silas, Ruwen)
*   **Audio Player** - Integrierter Player für Hörproben
*   **Latest News** - Übersicht der letzten Auftritte
*   **Booking Form** - Kontaktformular für Anfragen
*   **Responsive Design** - Optimiert für Desktop & Mobile

## 📝 Inhalte anpassen

*   **Bilder:** Ersetze Dateien in `assets/images/`
*   **Audio:** Ersetze MP3-Dateien in `assets/audio/`
*   **Texte:** Bearbeite die `index.html` direkt
*   **Styling:** Passe `style.css` an

## 🌐 Seiten

*   **Hauptseite:** [http://localhost:8000](http://localhost:8000)

---
*Tipp: Nach Änderungen im Code einfach die Seite im Browser neu laden (F5 / Cmd+R)*
