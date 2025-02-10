# Convenții pentru Fișierele de Traduceri

## 1. Structura Ierarhică

### 1.1 Organizare de Bază
```json
{
  "common": {
    "actions": {},     // Acțiuni reutilizabile (save, cancel, delete)
    "fields": {},      // Câmpuri de formular comune
    "labels": {},      // Etichete și texte statice comune
    "validation": {},  // Mesaje de validare comune
    "navigation": {},  // Elemente de navigare
    "status": {},     // Stări și statusuri comune
    "tasks": {}       // Texte comune pentru task-uri
  },
  "errors": {
    "validation": {},  // Erori de validare
    "auth": {},       // Erori de autentificare
    "network": {},    // Erori de rețea
    "data": {}       // Erori legate de date
  }
}
```

### 1.2 Referințe și Reutilizare
Folosește referințe pentru a evita duplicarea:
```json
{
  "common": {
    "actions": {
      "save": "Salvează"
    }
  },
  "taskManagement": {
    "buttons": {
      "save": "@:common.actions.save" // Referință la textul comun
    }
  }
}
```

## 2. Convenții de Denumire

### 2.1 Format Chei
- Folosește camelCase pentru toate cheile
- Evită abrevierile, folosește nume descriptive complete
- Limitează adâncimea la maxim 4 nivele

### 2.2 Prefixe Standard
```
button_   : Pentru texte de butoane
error_    : Pentru mesaje de eroare
label_    : Pentru etichete
status_   : Pentru stări
validation_: Pentru mesaje de validare
placeholder_: Pentru placeholder-uri
title_    : Pentru titluri
description_: Pentru descrieri
```

## 3. Duplicate Permise vs. Nepermise

### 3.1 Duplicate Permise
- Texte care au sens diferit în contexte diferite
- Validări specifice unui context
- Titluri care apar în mai multe locuri dar cu rol diferit

### 3.2 Duplicate Nepermise
- Butoane cu aceeași acțiune
- Mesaje de eroare generale
- Texte statice comune
- Etichete pentru câmpuri de formular comune

## 4. Modularizare

### 4.1 Structura Fișierelor
```
src/i18n/
├── translations/
│   ├── common/
│   │   ├── actions.json
│   │   ├── fields.json
│   │   └── validation.json
│   ├── features/
│   │   ├── auth.json
│   │   ├── tasks.json
│   │   └── settings.json
│   └── index.ts        // Combină toate traducerile
```

### 4.2 Reguli de Modularizare
- Separă traducerile comune în fișiere dedicate
- Grupează traducerile specifice feature-urilor
- Menține o structură consistentă între limbi

## 5. Automatizare și Validare

### 5.1 Script de Audit
Rulează periodic scriptul de verificare a duplicatelor:
```powershell
.\scripts\find-duplicate-translations.ps1
```

### 5.2 Verificări Pre-Commit
- Validează formatul JSON
- Verifică respectarea convențiilor de denumire
- Identifică duplicate nepermise

## 6. Exemple Practice

### 6.1 Utilizare Corectă
```json
{
  "common": {
    "validation": {
      "required": "Acest câmp este obligatoriu"
    }
  },
  "taskManagement": {
    "validation": {
      "titleRequired": "@:common.validation.required"
    }
  }
}
```

### 6.2 Utilizare Incorectă
```json
{
  "taskManagement": {
    "validation": {
      "required": "Acest câmp este obligatoriu" // Duplicat nepermis
    }
  }
}
```

## 7. Procesul de Modificare

### 7.1 Pași pentru Modificări
1. Fă backup înainte de modificări
2. Verifică duplicatele existente
3. Aplică modificările într-un mod incremental
4. Rulează scriptul de validare
5. Testează modificările în aplicație
6. Documentează schimbările în CHANGELOG

### 7.2 Revizuire și Mentenanță
- Revizuiește periodic structura traducerilor
- Actualizează documentația când apar schimbări
- Menține un istoric al modificărilor importante
