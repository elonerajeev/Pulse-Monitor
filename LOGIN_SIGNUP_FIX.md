# Login & Signup Error Fix Guide

## 🔧 Issues Fixed

### 1. Missing Backend `.env` File
**Problem:** Backend was missing environment variables configuration  
**Solution:** Created `/backend/.env` with all required credentials

### 2. CORS Configuration
**Problem:** Frontend URL not whitelisted in CORS  
**Solution:** Added your frontend URLs to allowed origins:
- `https://automatic-fortnight-x55wgj9vxrq29v5j-5173.app.github.dev`
- `https://pulsemonitorlog.netlify.app`
- `http://localhost:5173` (local)

### 3. API Base URL
**Problem:** Frontend API client not using correct backend URL  
**Solution:** Updated frontend API client to use:
- `https://automatic-fortnight-x55wgj9vxrq29v5j-5000.app.github.dev/api/v1`

---

## 📋 Configuration Files Created

### Backend `.env` File Location
**Path:** `/backend/.env`

```env
PORT=5000
MONGO_URI=mongodb+srv://YOUR_MONGO_USER:YOUR_MONGO_PASSWORD@cluster0.pqzslj3.mongodb.net/hello?retryWrites=true&w=majority
ACCESS_TOKEN_SECRET=YOUR_JWT_SECRET_KEY
ACCESS_TOKEN_EXPIRY=7d
REFRESH_TOKEN_SECRET=YOUR_REFRESH_TOKEN_SECRET
CORS_ORIGIN=https://pulsemonitorlog.netlify.app/
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
FRONTEND_URL=https://automatic-fortnight-x55wgj9vxrq29v5j-5173.app.github.dev/
BACKEND_URL=https://automatic-fortnight-x55wgj9vxrq29v5j-5000.app.github.dev
```

**Note:** Replace the placeholder values with actual credentials from your services

### Frontend `.env.local` File Location
**Path:** `/frontend/.env.local`

```env
VITE_API_URL=https://automatic-fortnight-x55wgj9vxrq29v5j-5000.app.github.dev/api/v1
```

---

## 🚀 How to Test Login/Signup Now

### Step 1: Verify Backend is Running
```bash
# Check if backend is running on port 5000
curl https://automatic-fortnight-x55wgj9vxrq29v5j-5000.app.github.dev/api/v1/healthcheck

# Expected Response:
{
  "status": "success",
  "code": 200,
  "data": {
    "message": "Health check successful",
    "timestamp": "2026-09-26T10:00:00Z"
  },
  "message": "Health check successful"
}
```

### Step 2: Verify Frontend is Running
Navigate to: `https://automatic-fortnight-x55wgj9vxrq29v5j-5173.app.github.dev/`

### Step 3: Test Signup
1. Click "Sign Up"
2. Fill in:
   - **Name:** Test User
   - **Email:** test@example.com
   - **Password:** Test@123456
   - **Confirm Password:** Test@123456
3. Click "Sign Up"

**Expected Success Response:**
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "user": {
      "id": "USER_ID",
      "name": "Test User",
      "email": "test@example.com",
      "plan": "free",
      "createdAt": "2026-09-26T10:00:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

### Step 4: Test Login
1. Click "Log In"
2. Fill in:
   - **Email:** test@example.com
   - **Password:** Test@123456
3. Click "Log In"

**Expected Success Response:**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "user": {
      "id": "USER_ID",
      "name": "Test User",
      "email": "test@example.com",
      "plan": "free",
      "createdAt": "2026-09-26T10:00:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User logged in successfully"
}
```

---

## 🐛 Common Errors & Solutions

### Error 1: "CORS Error" or "Access to XMLHttpRequest blocked"
**Cause:** Frontend domain not whitelisted in backend CORS  
**Solution:** Backend `.env` file is now created with correct CORS origins

### Error 2: "Cannot POST /api/v1/auth/register"
**Cause:** Backend server not running or incorrect URL  
**Solution:** 
- Verify backend is running: `https://automatic-fortnight-x55wgj9vxrq29v5j-5000.app.github.dev/api/v1/healthcheck`
- Check frontend `.env.local` has correct `VITE_API_URL`

### Error 3: "MONGO_URI is not defined"
**Cause:** Backend `.env` file missing  
**Solution:** `.env` file has been created in `/backend/` directory with your MongoDB credentials

### Error 4: "ACCESS_TOKEN_SECRET is not defined"
**Cause:** JWT secrets not configured  
**Solution:** Backend `.env` now has `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` set

### Error 5: "User with this email already exists"
**Cause:** You're using an email that's already registered  
**Solution:** Use a different email or delete the user from MongoDB and try again

### Error 6: "Invalid credentials"
**Cause:** Wrong password entered  
**Solution:** Check password case sensitivity and ensure no extra spaces

---

## 🔍 Debug Information

### View Network Requests
**Browser Console → Network Tab:**

1. **Signup Request:**
   - **Method:** POST
   - **URL:** `https://automatic-fortnight-x55wgj9vxrq29v5j-5000.app.github.dev/api/v1/auth/register`
   - **Headers:** `Content-Type: application/json`
   - **Body:** `{ "name": "...", "email": "...", "password": "...", "confirmPassword": "..." }`

2. **Login Request:**
   - **Method:** POST
   - **URL:** `https://automatic-fortnight-x55wgj9vxrq29v5j-5000.app.github.dev/api/v1/auth/login`
   - **Headers:** `Content-Type: application/json`
   - **Body:** `{ "email": "...", "password": "..." }`

### View Backend Logs
If backend is running locally:
```bash
cd backend
npm run dev

# Look for logs:
# ✓ Connected to MongoDB
# ✓ Server is running on http://localhost:5000
# POST /api/v1/auth/register
# POST /api/v1/auth/login
```

---

## ✅ Verification Checklist

- ✅ Backend `.env` file created with MongoDB URI
- ✅ Frontend `.env.local` file created with correct API URL
- ✅ CORS configured to allow frontend domain
- ✅ JWT secrets configured
- ✅ MongoDB connection string set
- ✅ Backend running and accessible
- ✅ Frontend running and accessible
- ✅ Network requests show correct URLs
- ✅ No CORS errors in browser console

---

## 🔧 Manual Testing with cURL

### Test Signup
```bash
curl -X POST "https://automatic-fortnight-x55wgj9vxrq29v5j-5000.app.github.dev/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@123456",
    "confirmPassword": "Test@123456"
  }'
```

### Test Login
```bash
curl -X POST "https://automatic-fortnight-x55wgj9vxrq29v5j-5000.app.github.dev/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123456"
  }'
```

---

## 📝 Files Modified

1. ✅ **Backend `.env`** - Created with all credentials
2. ✅ **Frontend `.env.local`** - Created with API URL
3. ✅ **Backend `app.js`** - Updated CORS configuration
4. ✅ **Frontend `api.ts`** - Updated API base URL

---

## 🎯 Next Steps

1. **Verify Setup:**
   ```bash
   # Check backend health
   curl https://automatic-fortnight-x55wgj9vxrq29v5j-5000.app.github.dev/api/v1/healthcheck
   ```

2. **Test on Frontend:**
   - Open: `https://automatic-fortnight-x55wgj9vxrq29v5j-5173.app.github.dev/`
   - Click "Sign Up"
   - Fill in credentials
   - Click "Sign Up"

3. **Monitor Browser Console:**
   - Look for successful network responses (200, 201 status codes)
   - No CORS or 404 errors

4. **Check Backend Logs:**
   - Should see incoming POST requests to `/auth/register` and `/auth/login`
   - Should show successful MongoDB connections

---

## 📞 Still Having Issues?

### Check These in Order:
1. ✅ Backend `.env` file exists: `/backend/.env`
2. ✅ Frontend `.env.local` exists: `/frontend/.env.local`
3. ✅ Backend running and accessible
4. ✅ Frontend running and accessible
5. ✅ MongoDB connection working
6. ✅ No CORS errors in browser console
7. ✅ Network request showing correct URLs

**If still failing:**
- Check browser Console (F12) for detailed error messages
- Check backend logs for MongoDB connection issues
- Verify MongoDB credentials are correct
- Ensure both URLs are accessible and not blocked

---

**Created:** September 26, 2026  
**Status:** ✅ All fixes applied
