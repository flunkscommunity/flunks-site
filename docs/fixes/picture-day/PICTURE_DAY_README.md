# 📸 Picture Day 1995 - Yearbook Voting App

A nostalgic 90s-style voting application where users can vote for their favorite Flunks to represent each clique in the yearbook.

## 🌟 Features

- **4 Unique Cliques**: Jocks, Nerds, Rebels, and Preps - each with their own color-coordinated theme
- **90s Yearbook Aesthetic**: Retro styling with scrapbook elements, polaroid effects, and nostalgic animations
- **Real-time Voting**: Live vote counts that update every 3-5 seconds
- **One Vote Per User**: Users can vote once per clique (tracked by wallet/IP)
- **Admin Panel**: Easy photo management and candidate updates
- **Mobile Responsive**: Works great on all device sizes

## 🎨 Pages

### Main Picture Day Page (`/picture-day`)
- Overview of all 4 cliques
- Real-time vote totals
- Color-coordinated clique cards with 90s styling
- Navigation to individual clique voting pages

### Clique Voting Pages (`/picture-day/[clique]`)
- Individual voting interface for each clique (jocks, nerds, rebels, preps)
- 3 candidates per clique
- Photo frames for candidate pictures
- Real-time vote counts with winner highlighting
- Voting restrictions (one vote per user per clique)

### Admin Panel (`/picture-day-admin`)
- Manage candidate information
- Upload and update candidate photos
- Filter by clique
- Bulk management interface

## 🛠 Setup Instructions

### 1. Database Setup
Run the SQL script to create the required tables:

```bash
# Execute the setup script in your Supabase dashboard or CLI
psql -f setup-picture-day-tables.sql
```

This creates:
- `picture_day_candidates` table with default candidates
- `picture_day_votes` table for vote tracking
- Proper RLS policies for security

### 2. Environment Variables
Make sure your `.env.production` or `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Default Candidates
The system comes with 3 pre-loaded candidates per clique:

**Jocks**: Captain Thunder, Ace McKenzie, Blitz Rodriguez
**Nerds**: Professor Pixel, Binary Bob, Calculator Kate  
**Rebels**: Rebel Storm, Lightning Jack, Wild Card
**Preps**: Perfect Patricia, Golden Boy, Princess Penny

### 4. Photo Management
1. Upload candidate photos to your preferred hosting service (Cloudinary, AWS S3, etc.)
2. Visit `/picture-day-admin` to manage candidates
3. Paste photo URLs into the admin interface
4. Recommended photo size: 200x250 pixels

## 🎯 API Endpoints

- `GET /api/picture-day/stats` - Get vote totals for all cliques
- `GET /api/picture-day/clique/[clique]` - Get candidates and votes for a specific clique
- `POST /api/picture-day/vote` - Submit a vote
- `GET /api/picture-day/admin/candidates` - Get all candidates (admin)
- `PUT /api/picture-day/admin/[candidateId]` - Update candidate info (admin)

## 🎨 Styling Features

### 90s Aesthetic Elements
- **Retro Color Schemes**: Each clique has its own vibrant color palette
- **Animated Elements**: Wiggling titles, floating cards, sparkling decorations
- **Pattern Backgrounds**: Dots, stripes, and geometric patterns
- **Polaroid Photo Frames**: Classic instant camera styling
- **Scrapbook Tape Effects**: Decorative tape elements
- **Neon Text Effects**: Glowing text animations

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimizations
- Accessibility features (high contrast, reduced motion support)

## 🔧 Technical Details

### Real-time Updates
- Vote counts refresh every 3 seconds on voting pages
- Overview stats refresh every 5 seconds
- Live indicator shows real-time status

### Vote Tracking
- Uses wallet address or IP address as user identifier
- One vote per user per clique restriction
- Votes are immutable once cast

### Security
- Row Level Security (RLS) policies on database tables
- Read-only access for vote counting
- Insert-only permissions for voting
- Admin endpoints require proper authentication (to be implemented)

## 🚀 Deployment

The app is ready to deploy to Vercel or any Next.js hosting platform:

```bash
npm run build
vercel --prod
```

## 📱 Usage

1. **Users visit `/picture-day`**
2. **Select a clique to vote for**
3. **View the 3 candidates with their photos**
4. **Click to vote for their favorite**
5. **See real-time results**
6. **Repeat for other cliques**

## 🎉 Future Enhancements

- User authentication integration
- Photo upload interface for admins
- Voting period controls (start/end dates)
- Export results for yearbook printing
- Social sharing features
- Sound effects and music
- Additional cliques or categories

---

*"Remember to vote responsibly and may the best Flunk win! 📚✨"*
