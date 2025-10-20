# Flunks Access Level System - Updated Configuration

## Overview
The Flunks site now has a comprehensive three-tier access control system that determines which desktop applications are visible to different user types.

## Access Levels & Codes

### 🔴 **ADMINISTRATOR** 
- **Code:** [SECURE - Backend Only]
- **Access:** ALL applications including developer tools
- **Description:** Full site access for developers and administrators

### 🟡 **BETA TESTER**
- **Code:** [SECURE - Backend Only]
- **Access:** Core applications + advanced features (LIMITED)
- **Description:** Beta testing access with restricted admin tools

### 🟢 **COMMUNITY MEMBER**
- **Code:** [SECURE - Backend Only]
- **Access:** Essential community applications only
- **Description:** Basic access for general community members

## Application Visibility Matrix

### ✅ **Available to ALL Users (ADMIN + BETA + COMMUNITY)**
- OnlyFlunks (NFT collection viewer)
- My Locker (user profile management)
- Radio (Flunks FM music player)
- Chat Rooms (community messaging)
- About Us (information about Flunks)
- Discord (external link)
- X/Twitter (external link)
- Market (NFT marketplace link)

### 🟡 **BETA + ADMIN Only**
- Terminal (advanced command interface)
- Clique Access (NFT-based access verification)
- FHS School (school administration portal)

### 🔴 **ADMIN Only (Restricted from BETA)**
- **Semester Zero** (virtual campus exploration) ❌ *Removed from BETA*
- **Game Manual** (platform documentation) ❌ *Removed from BETA*  
- **Meme Manager** (content management) ❌ *Removed from BETA*
- **MyPlace** (advanced social features) ❌ *Removed from BETA*
- **Flappy Flunk** (game access) ❌ *Removed from BETA*
- Pocket Juniors (project management)
- Flunk Creator (custom character creation)
- Graduation (system management)

## Recent Changes Made

### Apps Moved from BETA to ADMIN-ONLY:
1. **Semester Zero** - Now admin-only instead of available to all
2. **Game Manual** - Now admin-only instead of available to all  
3. **Meme Manager** - Now admin-only (was admin-only before)
4. **MyPlace** - Now admin-only instead of beta + admin
5. **Flappy Flunk** - Now admin-only instead of beta + admin

### Technical Implementation:
- All desktop applications now use `ConditionalAppIcon` component
- Permission checking happens client-side via session storage
- Real-time access level indicator shows current user status
- Centralized permission matrix in `appPermissions.ts`

## Usage Instructions

### For Administrators:
- Contact admin team for administrator access code
- Can manage and test all applications
- Has access to developer and management tools

### For Beta Testers:
- Contact admin team for beta access code
- Can test core functionality and some advanced features
- **Can access:** OnlyFlunks, Profile, Radio, Chat, About, Discord, X, Market, Terminal, Clique Access, FHS School
- **Cannot access:** Semester Zero, Game Manual, Meme Manager, MyPlace, Flappy Flunk
- Perfect for testing core user workflows without access to admin tools

### For Community Members:
- Contact admin team for community access code
- Can use essential community features
- Great for general users who want to explore the basic platform

## Visual Indicators
- Access level status is displayed in the top-right corner
- Color coding: Red (Admin), Yellow (Beta), Green (Community)
- Pulsing animation indicates active status

## Benefits of Updated System
1. **Better Beta Testing:** Beta users focus on core features without distractions
2. **Cleaner User Experience:** Simplified interface for different user types  
3. **Administrative Control:** Sensitive tools remain admin-only
4. **Scalable Permissions:** Easy to adjust access levels as needed
5. **Professional Access Gates:** Maintains exclusivity while providing structure

This system ensures that beta testers can effectively test core functionality while keeping advanced/experimental features restricted to administrators.
