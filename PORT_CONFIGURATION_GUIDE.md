# Port Configuration Guide for ClassBoom

## 🔍 The Issue

When clicking activation links from emails, you were getting "Invalid or expired invitation link" error because:

1. **Email links** were pointing to `http://localhost:5173`
2. **Your dev server** was running on `http://localhost:5174`
3. **Result**: The app on port 5174 couldn't find the activation route

## 🛠 Why This Happens

Vite (our dev server) is configured to use port 5173 by default, but when that port is already in use, it automatically increments to the next available port (5174, 5175, etc.).

Common reasons port 5173 might be in use:
- Another ClassBoom instance running
- Another Vite project running
- Port not properly released from previous session

## ✅ The Fix Applied

### 1. **Updated .env file**
```bash
VITE_APP_URL=http://localhost:5174
```

### 2. **Made activation links dynamic**
```typescript
// Now uses current browser origin as fallback
const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin || 'http://localhost:5174';
```

This ensures activation links always match your current dev server port.

## 🚀 For Different Environments

### Development (Local)
```bash
# .env.local
VITE_APP_URL=http://localhost:5174
```

### Staging
```bash
# .env.staging
VITE_APP_URL=https://staging.classboom.online
```

### Production
```bash
# .env.production
VITE_APP_URL=https://classboom.online
```

## 🔧 If Your Port Changes Again

### Option 1: Update .env file
```bash
VITE_APP_URL=http://localhost:YOUR_NEW_PORT
```

### Option 2: Kill process on port 5173
```bash
# Find what's using port 5173
lsof -i :5173

# Kill the process
kill -9 [PROCESS_ID]
```

### Option 3: Specify port when starting
```bash
npm run dev -- --port 5173
```

## 📝 Best Practices

1. **Always check your dev server URL** when it starts
2. **Keep .env updated** with the correct port
3. **Use environment-specific .env files** for different deployments
4. **The fallback to `window.location.origin`** ensures links work even if .env is misconfigured

## 🎯 Testing Activation Links

1. Send a staff invitation
2. Check the email - the link should show your current port
3. Click the link - it should open the activation page correctly
4. No more "Invalid or expired invitation link" errors!

## 🔒 Security Note

The dynamic `window.location.origin` fallback only works when sending invitations from the web app. For automated/background emails, always ensure `VITE_APP_URL` is properly configured.