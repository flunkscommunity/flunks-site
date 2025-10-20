# 🦘 Flunky Uppy Scoreboard Setup Guide

## ✅ **Files Created**

### **API Endpoints**
1. **`/src/pages/api/flunky-uppy-score.ts`** - Score submission endpoint
2. **`/src/pages/api/flunky-uppy-leaderboard.ts`** - Leaderboard retrieval endpoint

### **Database Setup**
3. **`/setup-flunky-uppy-scores.sql`** - SQL script to create the database table

### **Integration**
4. **Updated `FlunkJumpWindow.tsx`** - Now submits scores to the API

## 🗄️ **Database Table Structure**

### **Table: `flunky_uppy_scores`**
```sql
- id (BIGSERIAL, Primary Key)
- wallet (TEXT, Player's wallet address)
- score (INTEGER, Game score)
- timestamp (TIMESTAMPTZ, When score was achieved)
- metadata (JSONB, Additional info like username, IP, etc.)
- created_at (TIMESTAMPTZ, Record creation time)
```

### **Indexes Created**
- Wallet address index
- Score index (descending for leaderboards)
- Timestamp index
- Combined wallet + score index

## 🚀 **Setup Instructions**

### **1. Create Database Table**
1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste the contents of `setup-flunky-uppy-scores.sql`
4. Click **Run** to create the table and permissions

### **2. Test the APIs**

#### **Score Submission Test**
```bash
curl -X POST http://localhost:3000/api/flunky-uppy-score \
  -H "Content-Type: application/json" \
  -d '{"wallet":"0x1234567890","score":100}'
```

#### **Leaderboard Test**
```bash
curl http://localhost:3000/api/flunky-uppy-leaderboard
```

### **3. Verify Integration**
1. Play Flunky Uppy with a connected wallet
2. Achieve a score (get game over)
3. Check browser console for score submission logs
4. Verify data appears in Supabase table

## 🎮 **API Endpoints**

### **POST `/api/flunky-uppy-score`**
**Purpose**: Submit a new score
**Body**:
```json
{
  "wallet": "0x1234567890abcdef",
  "score": 150,
  "username": "PlayerName" // optional
}
```

**Response**:
```json
{
  "success": true,
  "data": { /* inserted record */ }
}
```

### **GET `/api/flunky-uppy-leaderboard`**
**Purpose**: Get top 50 unique player scores
**Response**:
```json
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "wallet": "0x1234567890abcdef",
      "score": 250,
      "username": "PlayerName",
      "profile_icon": "🦘",
      "timestamp": "2025-09-19T12:00:00Z",
      "formatted_date": "Sep 19, 2025"
    }
  ],
  "total_unique_players": 25,
  "total_scores": 150
}
```

## 🔧 **Features Included**

### **Score Submission**
- ✅ Automatic submission when game ends
- ✅ Wallet authentication required
- ✅ Metadata tracking (IP, user agent, timestamp)
- ✅ Username integration (from user profiles)
- ✅ Error handling and logging

### **Leaderboard**
- ✅ Top 50 unique players (highest score per wallet)
- ✅ Rank calculation
- ✅ Username and profile icon integration
- ✅ Formatted dates
- ✅ Statistics (total players, total scores)

### **Security**
- ✅ Row Level Security (RLS) enabled
- ✅ Public read access for leaderboards
- ✅ Public insert access for score submission
- ✅ Proper database permissions

## 🎯 **Next Steps**

### **Optional Enhancements**
1. **Leaderboard UI**: Create a visual leaderboard component
2. **Personal Stats**: Show player's best score and rank
3. **Time-based Leaderboards**: Daily/weekly/monthly rankings
4. **Score Verification**: Add anti-cheat measures
5. **Achievements**: Badge system for milestones

### **Testing Checklist**
- [ ] Database table created successfully
- [ ] Score submission works with wallet connected
- [ ] Leaderboard API returns data
- [ ] Scores appear in Supabase dashboard
- [ ] Error handling works (no wallet, invalid score)
- [ ] Username integration works (if user has profile)

The Flunky Uppy scoreboard is now fully set up and ready to track high scores! 🏆