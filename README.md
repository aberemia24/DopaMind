# ADHD Support App

O aplicație mobilă pentru suport ADHD, dezvoltată cu React Native + Expo, focalizată pe time management și productivitate într-un mod non-judgmental și prietenos.

## 🎯 Obiective

- Suport pentru persoanele cu ADHD în gestionarea provocărilor zilnice
- Focus pe time blindness și hyperfocus
- Abordare minimalistă și non-judgmental
- Orientare spre awareness și suport, nu restricții

## 🚀 Features Principale

- 📋 Task Management Ultra-Simplificat

  - Limită de 3 taskuri pe zi
  - Organizare automată (dimineață/după-amiază/seară)
  - Voice input pentru adăugare rapidă
  - Procesare text automată

- ⏰ Time Blindness Support

  - Calcul automat "time to leave"
  - Buffer time inclus by default
  - Notificări progresive
  - Integrare calendar

- 🎯 Time Sink Protection

  - Tracking pentru aplicații (YouTube, TikTok)
  - Remindere inteligente
  - Detectare mod work/play
  - Statistici de utilizare

- 🆘 Buton de Criză
  - Acces instant
  - Exerciții de respirație
  - Sunete calmante
  - Monitorizare health metrics

## 🛠 Tech Stack

### Frontend

- React Native + Expo Managed Workflow
- Expo SDK pentru funcționalități native
- AsyncStorage pentru stocare locală
- React Navigation pentru routing

### Backend & Servicii

- Firebase (Auth, Firestore, Cloud Functions)
- RevenueCat pentru plăți
- Sentry pentru monitoring
- Google Analytics

## 📱 Cerințe Sistem

### Pentru Dezvoltare

- Node.js 16+
- Expo CLI
- iOS 13+ sau Android 8+
- Xcode 13+ (pentru iOS)
- Android Studio (pentru Android)

### Pentru Utilizare

- iOS 13+ sau Android 8+
- ~100MB spațiu stocare
- Permisiuni: Notificări, Calendar, Health (opțional)

## 🚀 Quickstart

1. **Setup Development Environment**

```bash
# Instalare dependențe
npm install

# Pornire dezvoltare
npm start
```

2. **Configurare Firebase**

```bash
# Instalare Firebase CLI
npm install -g firebase-tools

# Login și inițializare proiect
firebase login
firebase init
```

3. **Configurare Environment**

```bash
# Copiază .env.example în .env
cp .env.example .env

# Completează variabilele necesare în .env
```

## 📚 Documentație

- [Wiki](./docs/wiki.md)
- [Arhitectură](./docs/architecture.md)
- [API Reference](./docs/api-reference.md)
- [Ghid Contribuție](./CONTRIBUTING.md)

## 🧪 Testing

```bash
# Rulare teste
npm test

# Rulare teste cu coverage
npm run test:coverage

# Rulare teste E2E
npm run test:e2e
```

## 📦 Build & Deploy

### Development

```bash
# Build dezvoltare
expo build:android -t apk
expo build:ios -t simulator
```

### Production

```bash
# Build producție
expo build:android -t app-bundle
expo build:ios -t archive
```

## 🤝 Contribuție

1. Fork repository
2. Creează branch pentru feature (`git checkout -b feature/AmazingFeature`)
3. Commit schimbările (`git commit -m 'Add AmazingFeature'`)
4. Push către branch (`git push origin feature/AmazingFeature`)
5. Deschide Pull Request

## 📄 Licență

Acest proiect este licențiat sub [MIT License](./LICENSE)

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) pentru platformă și tooling
- [Firebase](https://firebase.google.com/) pentru backend services
- [RevenueCat](https://www.revenuecat.com/) pentru payment processing
- Community pentru feedback și suport

## 📞 Contact

Email: support@adhdapp.com
Website: https://adhdapp.com
Twitter: [@ADHDSupportApp](https://twitter.com/ADHDSupportApp)

## 🔄 Roadmap

- [x] MVP Release
- [ ] Integrare completă Health Metrics
- [ ] Shared Accountability Features
- [ ] Gamification Elements
- [ ] Community Features
- [ ] AI-powered Scheduling

## 🏗️ Project Structure

```
src/
├── components/         # Componente refolosibile
├── screens/           # Screen components
├── navigation/        # Navigation configuration
├── services/          # Business logic & API calls
├── hooks/             # Custom hooks
├── utils/             # Helper functions
├── constants/         # App constants
├── assets/            # Static assets
└── config/           # Configuration files
```
