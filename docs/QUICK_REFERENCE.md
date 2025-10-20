# 📚 Quick Documentation Reference

**Find what you need fast!**

## 🔍 Common Tasks

### "I need to fix a bug"
→ Check `docs/fixes/[category]/` 
- Chat issues? → `docs/fixes/chat/`
- Wallet problems? → `docs/fixes/wallet/`
- Mobile issues? → `docs/fixes/mobile/`

### "How does [feature] work?"
→ Look in `docs/features/`
- Access control system
- Gum economy
- Profile system
- Game mechanics

### "How do I implement [thing]?"
→ Follow guides in `docs/guides/`
- Deployment procedures
- UI/UX implementation
- Testing guides
- Integration guides

### "I need to update the database"
→ Use scripts in `docs/database/`
- Create table? → `docs/database/tables/`
- Update schema? → `docs/database/migrations/`
- Check data? → `docs/database/queries/`
- Testing? → `docs/database/testing/`

## 📂 Directory Cheat Sheet

```
docs/
├── fixes/          # Something broke? Look here
│   ├── chat/       # Chat & messenger issues
│   ├── wallet/     # Wallet connection problems
│   ├── mobile/     # Mobile responsive fixes
│   ├── gum/        # Gum economy bugs
│   └── ...
├── features/       # How systems work
├── guides/         # How to build things
└── database/       # SQL scripts
    ├── tables/     # CREATE TABLE
    ├── migrations/ # ALTER/UPDATE
    ├── queries/    # SELECT/CHECK
    └── testing/    # Test utilities
```

## 🎯 Recent Additions

### Latest Chat Fix (Oct 20, 2025)
**Problem:** Already-logged-in users stuck in login loop
**Fix:** `docs/fixes/chat/CHAT_ROOMS_ALREADY_LOGGED_IN_FIX.md`
**Solution:** Use `primaryWallet` in auth check

## 💡 Pro Tips

- Each category has a README - **start there!**
- File names tell you what they contain
- All files are searchable (Cmd+Shift+F in VS Code)
- Nothing in `docs/` affects runtime - safe to explore!

## 🆘 Can't Find Something?

1. Check the category README files
2. Search by keyword (Cmd+Shift+F)
3. Look at `DOCUMENTATION_ORGANIZATION.md` for full inventory
4. Check the main `docs/README.md`

---

**Your docs are organized. Your mind is at peace. Go build something cool! 🚀**
