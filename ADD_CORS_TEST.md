# 🧪 Quick CORS Test Setup

## Add CORS Test to Your Dashboard (Temporary)

To quickly test if your CORS fix is working, add this to your Dashboard component:

### 1. Import the CORS Test Component

Add this import to the top of `src/pages/Dashboard.tsx`:

```javascript
import CORSTestComponent from '@/components/CORSTestComponent';
```

### 2. Add the Test Component to Your Dashboard

Find the overview section in your Dashboard and add this after your quick actions card:

```javascript
{/* TEMPORARY: CORS Test - Remove after fixing CORS */}
<CORSTestComponent />
```

### 3. Test Your CORS Fix

1. Deploy your backend with CORS configuration
2. Deploy your frontend with these changes
3. Go to your dashboard at `https://ucpg-demo.netlify.app/dashboard`
4. Click "Test CORS Configuration" button
5. If it shows "✅ Working" - your CORS is fixed!
6. If it shows "❌ Failed" - check your backend CORS setup

### 4. Remove Test Component (After CORS is Fixed)

Once CORS is working:
1. Remove the `<CORSTestComponent />` from Dashboard
2. Remove the import
3. Deploy again

## Alternative: Test in Browser Console

Open browser console on your site and run:

```javascript
// Test CORS
fetch('https://ucpg-api-dev.onrender.com/api/auth/login', {
  method: 'OPTIONS',
  headers: {
    'Origin': window.location.origin
  }
})
.then(response => {
  if (response.ok || response.status === 204) {
    console.log('✅ CORS is working!', response.status);
  } else {
    console.log('❌ CORS failed:', response.status);
  }
})
.catch(error => {
  console.log('❌ CORS error:', error.message);
});
```

## Expected Results:

**✅ Success:** Status 200 or 204, no errors
**❌ Failed:** CORS policy error, network error, or non-2xx status

**Remember to fix your backend CORS configuration first!** 🚀