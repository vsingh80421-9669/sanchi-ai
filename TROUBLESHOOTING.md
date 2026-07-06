# SANCHI Troubleshooting Guide

## App nahi khul raha? Try these steps:

### 1. Preview Refresh karein
- v0 preview window mein refresh button click karein
- Ya browser refresh (Ctrl+R / Cmd+R) karein

### 2. Environment Variables check karein
- Vars section mein jaake dekhen ki ye variables properly set hain:
  - `OPENAI_API_KEY` (required)
  - `ELEVENLABS_API_KEY` (required)
  - `GOOGLE_SEARCH_API_KEY` (optional - search ke liye)
  - `GOOGLE_SEARCH_ENGINE_ID` (optional - search ke liye)

### 3. Browser Console check karein
- F12 press karke Developer Tools kholen
- Console tab mein errors dekhen
- Agar koi error ho to screenshot leke share karen

### 4. Features Status

#### Working Features (Environment variables ke sath):
- ✅ Chat Interface
- ✅ Voice Input (Web Speech API - browser built-in)
- ✅ Voice Output (Browser fallback - works without ElevenLabs)
- ✅ Notes Management
- ✅ Reminders Management

#### Features requiring API keys:
- 🔑 Natural Voice (ElevenLabs) - requires ELEVENLABS_API_KEY with text-to-speech permission
- 🔑 Internet Search - requires GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID

### 5. Known Issues

#### ElevenLabs Voice Error:
```
fetch to https://api.elevenlabs.io/v1/text-to-speech/... failed with status 401
```
**Solution**: 
- API key ko text-to-speech permission nahi hai
- Browser speech synthesis automatically fallback use karega
- Voice kaafi achhi hai, though ElevenLabs se natural nahi

#### Search Not Working:
```
Search credentials invalid, skipping search
```
**Solution**:
- GOOGLE_SEARCH_API_KEY aur GOOGLE_SEARCH_ENGINE_ID add karein
- Tab tak SANCHI apni existing knowledge se jawab degi

### 6. App completely blank hai?

Check karein:
- Internet connection
- Browser compatibility (Chrome, Firefox, Safari recommended)
- Ad blockers disable karein
- Private/Incognito mode try karein

### 7. Voice input kaam nahi kar raha?

Check karein:
- Browser ko microphone permission di hai?
- HTTPS connection hai? (voice APIs require secure connection)
- Microphone hardware working hai?

### 8. Still not working?

Contact details:
- Open a support ticket at vercel.com/help
- Ya debug logs share karein

## Quick Test

App open hone par ye dikhna chahiye:
1. "SANCHI" heading with gradient
2. Avatar with pulsing circle
3. Voice visualizer bars
4. Microphone button
5. Chat, Weather, Notes, Reminders tabs
6. "System Online" status at bottom
