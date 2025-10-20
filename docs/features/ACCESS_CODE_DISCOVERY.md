# 🔑 Access Code Discovery System

## Overview
Multiple ways for users to discover access codes for Flunks High School platform.

## Access Codes
- `FLUNKS2025` - Admin Access (Full Features)
- `SEMESTER0` - Beta Access (Core Features) 
- `HIGHSCHOOL95` - Community Access (Basic Features)

## Discovery Methods

### 1. Console Commands
Users can open browser dev tools and type:
- `flunks.help()` - Show available commands
- `flunks.codes()` - Show access code hints
- `flunks.unlock()` - Show all codes (localhost/dev only)
- `flunks.status()` - Show current access level
- `flunks.credits()` - Show project credits

### 2. API Endpoint
- `/api/access-codes` - Shows hint to add secret parameter
- `/api/access-codes?secret=show_me_the_codes` - Reveals all codes

### 3. Keyboard Shortcuts
- `Ctrl+Shift+H` - Reveals access codes in console with notification

### 4. Source Code Hints
- HTML comments in page source
- README.md file with hints and discovery methods
- Direct hints in AccessGate component

### 5. GitHub Repository
- README.md contains hints and discovery instructions
- Source code is publicly viewable

## Hints for Each Code

### FLUNKS2025 (Admin)
- "The year everything changed... 🎓"
- Related to education transformation in 2025

### SEMESTER0 (Beta) 
- "Before the first semester began... 📚"
- What comes before semester 1?

### HIGHSCHOOL95 (Community)
- "When high school went digital... 💻"
- Reference to Windows 95 era

## Implementation Files
- `src/utils/easterEggs.ts` - Console commands and discovery logic
- `src/pages/api/access-codes.ts` - API endpoint
- `src/pages/index.tsx` - Keyboard shortcuts and HTML hints
- `src/components/AccessGate.tsx` - Visual hints on access page
- `README.md` - Public documentation and hints
