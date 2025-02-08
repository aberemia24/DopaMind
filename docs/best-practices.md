# DopaMind Best Practices

## Localizare și Texte
- **NU** folosiți texte hardcodate în componente
- Adăugați toate textele în fișierele de traducere (`src/i18n/translations/`)
- Organizați cheile de traducere ierarhic (ex: `auth.login.welcome`)
- Folosiți hook-ul `useTranslation` în componente: `const { t } = useTranslation()`

## Componente
- Folosiți TypeScript pentru toate componentele noi
- Definiți explicit tipurile pentru props
- Adăugați comentarii pentru props complexe
- Separați logica de UI folosind custom hooks
- Folosiți `memo` pentru componente care primesc props care se schimbă rar

## Stilizare
- Folosiți `StyleSheet.create` pentru stiluri
- Respectați spacing-ul consistent (multiplii de 8)
- Folosiți culori din paleta ADHD-friendly
- Asigurați-vă că butoanele au minim 44x44 pixeli pentru touch
- Folosiți `SafeAreaView` pentru a gestiona notch-ul și alte zone speciale

## Forms și Input-uri
- Folosiți `KeyboardAvoidingView` pentru forms
- Implementați focus management cu `useRef`
- Adăugați validări și feedback vizual pentru erori
- Folosiți placeholdere traduse din i18n
- Setați corect `returnKeyType` și `keyboardType`

## Navigare
- Definiți tipurile pentru stack parameters
- Folosiți traduceri pentru titlurile de screen-uri
- Implementați logica de autentificare în hooks separate

## State Management
- Folosiți hooks pentru logica de business
- Implementați loading states pentru operații asincrone
- Gestionați erorile consistent și afișați-le traduse

## Type Safety
- Definiți interfețe pentru toate modelele de date
- Folosiți type guards pentru verificări de tip
- Evitați folosirea tipului `any`
- Adăugați type assertions doar când este absolut necesar

## Testing
- Scrieți teste pentru logica de business
- Testați flow-urile de autentificare
- Verificați că textele sunt corect traduse

## Performance
- Folosiți `useMemo` și `useCallback` pentru optimizări
- Evitați re-renderuri inutile
- Implementați lazy loading pentru componente mari

## Accesibilitate
- Adăugați `accessibilityLabel` și `accessibilityHint`
- Asigurați contrast suficient pentru text
- Testați cu VoiceOver/TalkBack

## Git și Versionare
- Faceți commit-uri atomice și descriptive
- Testați modificările înainte de commit
- Actualizați development log-ul după modificări importante
