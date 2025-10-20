# 📸 Clique Profile Pictures Upload Guide

## Directory Structure

Profile pictures for each clique should be uploaded to the following directories:

```
/public/images/profiles/cliques/
├── the-populars/  (Preps)
├── the-outcasts/  (Freaks)
├── the-jocks/     (Jocks)
└── the-nerds/     (Geeks)
```

## Upload Instructions

### 1. File Naming Convention
- Use descriptive names like: `profile-picture.png`, `avatar.jpg`, `main-pic.webp`
- Supported formats: `.png`, `.jpg`, `.jpeg`, `.webp`
- Recommended size: 400x400px (square format works best)

### 2. Upload Locations by Clique

#### **The Populars** (Preps)
```
/public/images/profiles/cliques/the-populars/
```
- Theme: Glamorous, fashionable, high-end aesthetic
- Color scheme: Pink/hot pink backgrounds

#### **The Outcasts** (Freaks)
```
/public/images/profiles/cliques/the-outcasts/
```
- Theme: Dark, mysterious, gothic aesthetic  
- Color scheme: Dark brown/black backgrounds

#### **The Jocks** (Athletes)
```
/public/images/profiles/cliques/the-jocks/
```
- Theme: Athletic, sporty, competitive
- Color scheme: Blue backgrounds

#### **The Nerds** (Geeks)
```
/public/images/profiles/cliques/the-nerds/
```
- Theme: Intellectual, tech-savvy, academic
- Color scheme: Green backgrounds

### 3. Implementation Notes

To use uploaded pictures instead of text initials, you'll need to:

1. **Upload your image** to the appropriate clique folder
2. **Update the profile data** in `/src/data/cliqueProfiles.ts` to include a `profilePicture` field
3. **Modify the component** in `/src/components/MySpaceProfile.tsx` to display the image instead of the initial

Example code modification for `cliqueProfiles.ts`:
```typescript
'the-populars': {
  profilePicture: "/images/profiles/cliques/the-populars/profile-picture.png",
  // ... rest of profile data
}
```

Example code modification for `MySpaceProfile.tsx`:
```tsx
<ProfilePicture bgColor={profile.backgroundColor}>
  {profile.profilePicture ? (
    <img 
      src={profile.profilePicture} 
      alt="Profile" 
      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
    />
  ) : (
    profile.name.charAt(0)
  )}
</ProfilePicture>
```

### 4. Current State

✅ **Completed:**
- Clique names removed from MyPlace profiles
- Directory structure created for 4 main cliques (Geek, Freak, Jock, Prep)
- Profile picture upload locations established
- Removed unused cliques (Artists, Rebels) from data and directories

⏳ **Next Steps:**
- Upload profile pictures for each of the 4 cliques
- Add `profilePicture` field to clique profile data
- Update component to display uploaded images