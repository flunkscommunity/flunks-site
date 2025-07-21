# JNRS Creator - Trait File Upload Guide

## 🚀 Quick Upload Process

### 1. **Mass Upload Your Files**
Just dump ALL your trait files into this folder:
```
/public/images/jnr-traits/upload-staging/
```

### 2. **Run the Organization Script**
```bash
npm run organize-traits
```

This will automatically:
- ✅ Sort files by name patterns into correct folders
- ✅ Move TORSO files to TORSO folder
- ✅ Move HEAD files to HEAD folder  
- ✅ Move FACE files to FACE folder
- ✅ Move clique files (GEEK, JOCK, PREP, FREAK) to respective folders
- ✅ Handle special cases like HEAD_OVERLAYERS, BACKDROPS, etc.
- ⚠️ Put unrecognized files in MISC folder for manual sorting

### 3. **Generate Trait Data**
```bash
npm run generate-trait-data
```

This will:
- 🔍 Scan all organized folders
- 📝 Generate a TypeScript file with all available traits
- 🎨 Update the JNRS Creator with real trait options

### 4. **One Command Setup**
```bash
npm run setup-traits
```
Runs both scripts in sequence for complete automation!

## 📁 Expected File Structure After Organization

```
/public/images/jnr-traits/full-traits/
├── BACKDROPS/          # Background scenes
├── TORSO/              # _0001_BLUE-HOODY.png, etc.
├── HEAD/               # Hair and head shapes  
├── FACE/               # Facial features
├── EYEBROWS/           # Eyebrow styles
├── HEAD_OVERLAYERS/    # Hats, glasses, etc.
├── PIGMENT/            # Skin tones
├── GEEK/               # Geek-specific traits
├── JOCK/               # Jock-specific traits  
├── PREP/               # Prep-specific traits
├── FREAK/              # Freak-specific traits
├── NUMBERS/            # Numbered elements
├── FIXES/              # Fix/overlay files
├── 1OF1_S/             # One-of-one special traits
└── MISC/               # Files that need manual sorting
```

## 🎯 Smart File Recognition

The script recognizes files by patterns:
- **Clothing**: HOODY, VEST, TEE, LEATHER, PUFFER → TORSO
- **Hair**: HAIR, AFRO, BALD, BUZZ → HEAD  
- **Face**: EYE, MOUTH, NOSE, SMILE → FACE
- **Cliques**: GEEK, JOCK, PREP, FREAK → respective folders
- **Direct matches**: BACKDROP, EYEBROW, PIGMENT, etc.

## 🔧 Manual Sorting

If files end up in MISC folder:
1. Look at the filename
2. Move to appropriate folder manually
3. Run `npm run generate-trait-data` again

## ✨ Result

After running the scripts, your JNRS Creator will have:
- 🎨 All your actual trait files available
- 🖼️ Dropdown menus populated with real options
- 🎭 Proper categorization and layering
- 🚀 Thousands of possible combinations!

Just upload your files and let the automation handle the rest! 🎉
