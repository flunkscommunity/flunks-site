# JNRS Creator - Clique-Based Trait Upload Guide

## 🎯 Clique-Based Upload Process

### 1. **Upload Files by Clique**
Upload your trait files to the appropriate clique folders:

```
📁 FREAKS/    - All FREAK clique trait files
📁 GEEKS/     - All GEEK clique trait files  
📁 JOCKS/     - All JOCK clique trait files
📁 PREPS/     - All PREP clique trait files
📁 SHARED/    - Universal traits (backdrops, shared accessories, etc.)
```

### 2. **Run the Organization Script**
```bash
npm run organize-traits
```

This will automatically:
- ✅ Process each clique separately (no naming conflicts!)
- ✅ Sort TORSO files (_0001_BLUE-HOODY.png) by clothing patterns
- ✅ Sort HEAD files by hair/head patterns
- ✅ Sort FACE files by facial feature patterns  
- ✅ Move clique-specific files to FREAK/, GEEK/, JOCK/, PREP/ folders
- ✅ Move shared files to BACKDROPS/, EYEBROWS/, PIGMENT/, etc.
- ⚠️ Put unrecognized files in MISC/[clique]/ for manual sorting

### 3. **Generate Trait Data**
```bash
npm run generate-trait-data
```

### 4. **One Command Setup**
```bash
npm run setup-traits
```

## 📁 Upload Locations

### **Clique-Specific Traits:**
```
/upload-staging/FREAKS/     ← Dump all FREAK files here
/upload-staging/GEEKS/      ← Dump all GEEK files here  
/upload-staging/JOCKS/      ← Dump all JOCK files here
/upload-staging/PREPS/      ← Dump all PREP files here
```

### **Shared Traits:**
```
/upload-staging/SHARED/     ← Backdrops, universal accessories, etc.
```

## 🔍 Smart File Recognition

The script recognizes patterns within each clique:

### **Clothing → TORSO:**
- HOODY, VEST, TEE, LEATHER, PUFFER, BLAZER, etc.
- Files like: `_0001_BLUE-HOODY.png`

### **Hair/Head → HEAD:**  
- HAIR, AFRO, BALD, BUZZ, MOHAWK, PONYTAIL, etc.
- Files like: `_0023_CURLY-HAIR.png`

### **Facial Features → FACE:**
- EYE, MOUTH, NOSE, SMILE, FRECKLE, etc.
- Files like: `_0045_BLUE-EYES.png`

### **Special Cases:**
- BACKDROP → BACKDROPS folder
- EYEBROW → EYEBROWS folder
- PIGMENT → PIGMENT folder
- 1OF1 → 1OF1_S folder

## 📊 Expected Results

After organization:
```
/full-traits/
├── FREAK/              # All FREAK-specific traits
├── GEEK/               # All GEEK-specific traits  
├── JOCK/               # All JOCK-specific traits
├── PREP/               # All PREP-specific traits
├── BACKDROPS/          # Shared backgrounds
├── EYEBROWS/           # Shared eyebrow styles
├── PIGMENT/            # Shared skin tones
├── HEAD_OVERLAYERS/    # Shared hats, glasses
├── NUMBERS/            # Numbered elements
├── FIXES/              # Fix/overlay files
├── 1OF1_S/             # One-of-one specials
└── MISC/               # Manual sorting needed
    ├── FREAK/          # Unrecognized FREAK files
    ├── GEEK/           # Unrecognized GEEK files
    ├── JOCK/           # Unrecognized JOCK files
    ├── PREP/           # Unrecognized PREP files
    └── SHARED/         # Unrecognized shared files
```

## 🎉 Benefits of Clique-Based Upload

- ✅ **No naming conflicts** between cliques
- ✅ **Cleaner organization** - files stay with their clique
- ✅ **Better trait management** - easier to find specific clique traits
- ✅ **Safer processing** - each clique processed independently
- ✅ **Flexible uploads** - upload one clique at a time

## 🚀 Usage Steps

1. **Upload FREAKS files** to `/upload-staging/FREAKS/`
2. **Upload GEEKS files** to `/upload-staging/GEEKS/`  
3. **Upload JOCKS files** to `/upload-staging/JOCKS/`
4. **Upload PREPS files** to `/upload-staging/PREPS/`
5. **Upload shared files** to `/upload-staging/SHARED/`
6. **Run:** `npm run setup-traits`
7. **Check results** in the organized folders
8. **Manual sort** any files in MISC/ subfolders

Much cleaner and safer! �
