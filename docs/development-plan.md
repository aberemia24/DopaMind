# Plan Detaliat - Aplicație Suport ADHD (Versiunea 3.0)

## Scopul Aplicației

Aplicația are ca scop să ofere suport persoanelor cu ADHD în gestionarea provocărilor zilnice, concentrându-se pe probleme specifice precum time blindness, hyperfocus, și task management. Abordarea este minimalistă, non-judgmental și focusată pe awareness și suport în loc de restricții.

## Stiva Tehnologică

### Frontend

- **React Native + Expo Managed Workflow**
  - Cross-platform development (iOS + Android)
  - Dezvoltare rapidă prin Hot Reload
  - Asset management simplificat
  - OTA updates prin Expo
  - Acces la native APIs prin Expo SDK
  - Configurare minimă necesară
  - PWA support pentru acces desktop
  - Expo dev client pentru debugging
  - Expo modules pentru funcționalități native
  - Build-uri optimizate automat

### Backend & Servicii

- **Firebase**
  - Authentication pentru user management
  - Firestore pentru stocare date
  - Cloud Functions pentru logică server-side
  - Push notifications cu sistem ML pentru timing optim
  - Analytics integrat
  - Remote Config pentru feature flags
  - Free tier generos pentru început

### Monetizare & Payments

- **RevenueCat**
  - Gestionare subscriptions cross-platform
  - Analytics pentru revenue
  - A/B testing pentru prețuri
  - Gestionare promoții și trials
  - Sistem de referral integrat

### Monitoring & Analytics

- **Sentry**

  - Error tracking în timp real
  - Performance monitoring
  - Session replay pentru debugging
  - Crash reporting detaliat

- **Google Analytics for Firebase**
  - User behavior tracking
  - Engagement metrics
  - Retention analysis
  - Feature usage tracking
  - A/B testing pentru feature flags

## Funcționalități MVP

### 1. Task Management Ultra-Simplificat

#### Features Core

- Limită strictă de 3 taskuri pe zi
- Organizare simplă în morning/afternoon/evening
- Buton de reset prominent pentru "start fresh"
- Zero istoric sau pressure
- Voice input prin Expo AV
- Procesare text automată pentru detectare timp zilei
- Badge pe icon-ul aplicației pentru task-uri incomplete

#### UI/UX

- Design minimalist, spațios
- Butoane mari, ușor de atins
- Contrast bun pentru readability
- Feedback vizual instant la acțiuni
- Haptic feedback prin Expo Haptics
- Micro-rewards pentru completare task-uri

#### Tehnical

- AsyncStorage pentru date locale (via @react-native-async-storage/async-storage)
- Sync opțional cu cloud prin Firebase
- Background tasks prin Expo Background Fetch
- State management cu React Context sau Zustand
- Natural language processing pentru task-uri
- ML Kit pentru procesare text (via Firebase ML)

### 2. Time Blindness Support

#### Features Core

- Calculare automată "time to leave"
- Buffer time inclus by default
- Vizualizări intuitive ale timpului
- Notificări progressive prin Expo Notifications
- Integrare read-only cu Google/Apple Calendar via Expo Calendar
- Export evenimente cu buffer time automat
- Haptic feedback pentru notificări importante

#### Tehnical

- Location Services prin Expo Location
- Background location via Expo TaskManager
- Calcule pentru travel time
- Push notifications system cu ML pentru timing optim
- Calendar API integration via Expo Calendar
- Sistem de buffer time management

### 3. Time Sink Protection

#### Features Core (Free Tier)

- Tracking pentru 2 aplicații predefinite:
  - YouTube
  - TikTok
- Remindere basic după 15 minute
- Panic button simplu
- Detectare inteligentă mod work/play
- Modul Pomodoro opțional

#### Features Premium

- Tracking nelimitat de aplicații
- Customizare completă timpi
- Statistici de utilizare
- Multiple tipuri de remindere
- Analiza avansată patterns utilizare
- Recomandări personalizate pentru productivitate

#### Tehnical

- Usage Stats API integration prin Expo
- Background monitoring via Expo Background Fetch
- Local notifications prin Expo Notifications
- Data aggregation pentru statistici
- Machine learning pentru pattern detection
- Sistem de clasificare activități (productive/entertainment)

#### UI/UX

- Timer vizual non-intruziv
- Tranziții smooth pentru remindere
- Gesturi intuitive pentru dismissal
- Color coding pentru nivele de urgență
- Toggle simplu între moduri work/play

### 4. Buton de Criză

#### Features Core

- Acces instant prin Expo Quick Actions
- Shortcut pe Lock Screen (iOS) via Expo
- Quick Settings Tile (Android) via Expo
- 2 exerciții de respirație de bază
- 1 sunet calmant prin Expo AV
- Timp de response sub 1 secundă

#### Features Premium

- Library extinsă de exerciții
- Multiple sunete calmante
- Personalizare completă
- Statistici de utilizare
- Integrare cu Apple Health / Google Fit via Expo Health
- Monitorizare puls în timp real

#### Tehnical

- Quick Actions implementation prin Expo
- Audio playback system via Expo AV
- Haptic feedback via Expo Haptics
- HealthKit & Google Fit integration via Expo Health
- Background heart rate monitoring

## Model de Monetizare

### Versiunea Free

- Task management basic (3 taskuri/zi)
- Time sink tracking pentru 2 apps
- Buton de criză cu features basic
- Remindere simple
- Calendar read-only

### Versiunea Premium

#### Pricing

- $5.99/lună
- $49.99/an (reducere ~30%)
- Trial 14 zile
- Sistem de referral: +7 zile premium pentru fiecare prieten invitat

#### Features Deblocate

- Tracking nelimitat de apps
- Toate tipurile de remindere
- Backup în cloud
- Cross-device sync
- Statistici avansate
- Teme și personalizare
- Exerciții și sunete adiționale
- Integrare completă calendar
- Monitorizare health metrics

## Plan de Dezvoltare

### Faza 1 - Setup & Core (2 săptămâni)

- Setup proiect React Native + Expo
- Integrare Firebase
- Setup RevenueCat
- Implementare authentication
- Setup feature flags system
- Configurare CI/CD

### Faza 2 - Features Core (5 săptămâni)

#### Săptămânile 1-2

- Task Management basic
- Implementare voice input via Expo AV
- Procesare text pentru task-uri

#### Săptămânile 3-4

- Time tracking basic
- Integrare calendar via Expo Calendar
- Sistem notificări inteligente via Expo Notifications

#### Săptămâna 5

- Smart notifications system
- Micro-rewards implementation
- Basic ML pentru timing notificări

### Faza 3 - Premium Features (3 săptămâni)

- Extindere features existente
- Implementare sync
- Statistici avansate
- Personalizare
- Health metrics integration via Expo Health
- Advanced ML features

### Faza 4 - Testing & Polish (3 săptămâni)

- Testing extensiv
- Bug fixing
- Performance optimization
- UI/UX polish
- PWA implementation via Expo Web
- Localization setup

## Metrici de Succes

### Usage Metrics

- Daily Active Users (DAU)
- Retention la 7 zile
- Timpul mediu în aplicație
- Feature adoption rate
- Voice input usage rate
- Notification engagement rate

### Business Metrics

- Conversion la premium
- Revenue per user
- Churn rate
- Customer Lifetime Value
- Referral success rate
- Feature engagement distribution

### Technical Metrics

- App crash rate
- Load times
- Battery usage
- Storage usage
- ML model accuracy
- Voice recognition success rate

## Considerații Speciale

### Privacy & Security

- GDPR compliance
- Data encryption
- Secure authentication
- Private data handling
- Health data protection
- Voice data management

### Performance

- Cold start sub 2 secunde
- Smooth animations (60fps)
- Background battery usage minimal
- Storage footprint redus
- Efficient ML processing
- Optimized voice processing

### Accessibility

- VoiceOver/TalkBack support via Expo
- Dynamic text sizing
- High contrast options
- Color blind friendly
- Multiple input methods
- Voice control comprehensive

## Adaptări Specifice pentru Expo Managed Workflow

### Limitări și Soluții

- **Widget-uri Native**: Folosirea Expo Custom Development Client pentru funcționalități care necesită cod nativ
- **Background Tasks**: Utilizarea Expo Background Fetch și TaskManager
- **Deep Linking**: Implementare prin Expo Linking
- **Notifications**: Expo Notifications pentru toate tipurile de notificări
- **File System**: Expo FileSystem pentru management local
- **Sensors**: Acces prin Expo Sensors API
- **Camera/Media**: Expo Camera și MediaLibrary
- **Location**: Expo Location pentru toate serviciile de locație

### Avantaje Specifice

- Dezvoltare mai rapidă
- Setup simplificat
- Updates Over-the-Air
- Configurare cross-platform automată
- Build process simplificat
- Development environment consistent
- Testare mai ușoară
- Deployment simplificat

## Development Log

### 2025-02-08: Implementare Persistență Login și Îmbunătățiri Autentificare

#### Modificări Implementate:
1. **Persistență Login**
   - Implementat salvarea credențialelor în AsyncStorage
   - Adăugat reautentificare automată la repornirea aplicației
   - Actualizat logica de logout pentru a curăța credențialele salvate

2. **Îmbunătățiri Autentificare**
   - Refactorizat funcționalitatea de signOut pentru a folosi instanța corectă de Firebase Auth
   - Standardizat numele funcțiilor de autentificare (register -> signUp)
   - Actualizat RegisterScreen pentru a folosi noile denumiri

3. **Bugfix-uri**
   - Rezolvat problema cu logout-ul care nu funcționa corect
   - Eliminat proprietatea newArchEnabled din app.json
   - Rezolvat conflictul între package-lock.json și yarn.lock

#### Testing:
- ✅ Login persistă după force stop
- ✅ Logout funcționează corect și curăță credențialele
- ✅ Înregistrare nouă funcționează
- ✅ Navigare între ecrane funcționează corespunzător

#### Next Steps:
- [ ] Implementare recuperare parolă
- [ ] Adăugare validări suplimentare pentru formularele de autentificare
- [ ] Implementare profil utilizator

### 9 Februarie 2025
#### Îmbunătățiri Autentificare și Onboarding
- Am creat un nou ecran de welcome cu slideshow pentru onboarding
- Am implementat un slideshow animat cu 3 slide-uri specifice pentru ADHD:
  - "Depășește Overwhelm-ul" - ajută utilizatorii să gestioneze sarcinile copleșitoare
  - "Sistem Adaptat pentru ADHD" - evidențiază tehnicile specializate
  - "Sprijin în Momente Dificile" - prezintă funcțiile de suport
- Am adăugat auto-scroll la slideshow (3 secunde per slide) cu tranziții smooth
- Am stilizat butoanele de autentificare folosind MaterialIcons și FontAwesome
- Am personalizat butonul de Google cu culorile oficiale pentru un aspect profesionist
- Am actualizat navigarea pentru a afișa WelcomeScreen ca primul ecran pentru utilizatorii neautentificați

#### Next Steps:
- [ ] Implementare autentificare cu Google
- [ ] Testare completă a fluxului de autentificare
- [ ] Adăugare animații de tranziție între ecrane

## Feature Toggle System

```javascript
const featureFlags = {
  voiceInput: true,
  calendarSync: false,
  advancedTimeTracking: false,
  healthMetrics: false,
  smartNotifications: true,
  referralSystem: true,
};

// Implementare cu Remote Config Firebase
const getFeatureFlag = async feature => {
  const remoteConfig = await firebase.remoteConfig().getValue(feature);
  return remoteConfig.asBoolean();
};
```

## Smart Notifications System

```javascript
const notificationTypes = {
  TASK_REMINDER: 'task_reminder',
  TIME_TO_LEAVE: 'time_to_leave',
  BREAK_SUGGESTION: 'break_suggestion',
  ACHIEVEMENT: 'achievement',
};

const calculateOptimalNotificationTime = async (userId, notificationType) => {
  // ML model pentru predicție timing optim
  return optimalTime;
};
```

## Activity Detection System

```javascript
const activityTypes = {
  PRODUCTIVE: 'productive',
  ENTERTAINMENT: 'entertainment',
  MIXED: 'mixed',
};

const detectActivityType = (app, timeOfDay, duration, patterns) => {
  // Analiză bazată pe multiple factori
  return activityType;
};
```

## Next Steps Post-MVP

### Feature Ideas

- Integrare calendar avansată via Expo Calendar
- Shared accountability features
- Gamification elements
- Community features
- AI-powered scheduling
- Advanced health tracking via Expo Health

### Scalability

- Server architecture planning
- Database optimization
- Cache implementation
- CDN setup
- ML model optimization
- Voice processing scaling

### Marketing

- ASO (App Store Optimization)
- Content marketing
- Social media presence
- Community building
- Referral program optimization
- Influencer partnerships

## Riscuri și Mitigări

### Tehnical Risks

- Battery drain din monitoring
- iOS restrictions cu Expo
- Background process limitations în Expo
- Storage constraints
- ML model performance
- Voice recognition accuracy

### Business Risks

- Competiție
- Cost acquisition
- Retention
- Monetization
- Feature complexity
- User overwhelm

### Mitigări

- Testing extensiv
- Feedback constant
- Iterații rapide
- Focus pe user experience
- Progressive feature rollout
- A/B testing comprehensiv

## Maintenance Plan

### Regular Updates

- Bug fixes săptămânale via Expo OTA
- Feature updates lunar
- Security patches când necesare
- Performance optimization continuu
- ML model retraining
- Voice model updates

### Monitoring

- Sentry pentru crashes
- Analytics pentru usage
- User feedback tracking
- Performance metrics
- ML model metrics
- Voice recognition metrics

### Support

- Email support
- FAQ/Knowledge base
- Community forum
- Bug reporting system
- Feature request system
- Health data support

## Localization

### Initial Languages

- Română
- Engleză
- Franceză
- Germană

### Localization System

- i18n implementation prin Expo Localization
- Automatic language detection
- Regional format adaptation
- Voice recognition per language
- ML model per language
- Support documentation per language
