# Error Testing Guide

## Akses Error Testing Component

Error testing component telah terintegrasi ke dalam aplikasi dan dapat diakses melalui:
- **URL**: `http://localhost:5173/test-errors`
- **Development Mode**: Component hanya dimaksudkan untuk development dan debugging

## Fitur Testing yang Tersedia

### 1. Component Error Testing
- **ErrorDisplay Component**: Test berbagai tipe error dengan props yang berbeda
- **ErrorState Component**: Test full-page error states dengan auto-detection
- **ErrorBoundary**: Test retry functionality dan fallback behavior

### 2. Error Utilities Testing
- **Type Detection**: Test `getErrorType()` function dengan berbagai error scenarios
- **Message Generation**: Test `getUserFriendlyErrorMessage()` dengan konteks yang berbeda
- **Context Information**: Test error context gathering dan logging

### 3. Error Reporting Testing
- **Hook Testing**: Test `useGlobalErrorReporting` dengan berbagai error types
- **Manual Reporting**: Test manual error reporting dengan custom data
- **Performance Tracking**: Test performance info collection dalam error reports

### 4. Realistic Error Scenarios
- **Network Errors**: Simulate fetch failures dan timeout
- **Authentication Errors**: Test auth failures dan session expiry
- **Database Errors**: Simulate Supabase RLS violations dan connection issues
- **JavaScript Errors**: Test runtime errors dan async operation failures

## Cara Menggunakan

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Navigate to Testing Page**:
   - Buka browser ke `http://localhost:5173/test-errors`

3. **Test Interactive Scenarios**:
   - Click pada berbagai button untuk trigger error scenarios
   - Perhatikan console output untuk detailed error information
   - Observe bagaimana error boundaries menangani errors
   - Test retry functionality pada error boundaries

4. **Monitor Console Output**:
   - Error details dengan timestamps
   - Error type detection results
   - User-friendly message generation
   - Performance information
   - Retry attempt tracking

## Testing Categories

### Network Errors
- ❌ **Fetch Failure**: Test network request failures
- ⏱️ **Timeout Error**: Test request timeout scenarios
- 🔄 **Retry Logic**: Test automatic retry mechanisms

### Authentication Errors
- 🔐 **Auth Required**: Test authentication requirement scenarios
- 🔑 **Session Expired**: Test session expiry handling
- 🚫 **Permission Denied**: Test authorization failures

### Database Errors
- 🗄️ **RLS Violation**: Test Row Level Security policy violations
- 🔌 **Connection Error**: Test database connection failures
- 📊 **Query Error**: Test malformed query handling

### System Errors
- ⚠️ **Runtime Error**: Test JavaScript runtime errors
- 🔄 **Async Error**: Test promise rejection handling
- 💾 **Memory Error**: Test memory-related issues

## Console Output Examples

Saat menggunakan testing component, Anda akan melihat output seperti:

```
🧪 Testing Error Type Detection...
📋 Original Error: Error: Network request failed
🔍 Detected Type: network
💬 User Message: Koneksi internet bermasalah. Silakan coba lagi.

🧪 Testing Error Reporting...
📝 Error Report: {
  timestamp: "2024-01-15T10:30:00.000Z",
  error: "Authentication required",
  context: { url: "/test-errors", userAgent: "..." },
  performance: { memory: "50MB", timing: "..." }
}
```

## Production Considerations

⚠️ **Important**: Component ini hanya untuk development. Untuk production:
1. Hapus route `/test-errors` dari `App.jsx`
2. Atau tambahkan conditional rendering berdasarkan environment
3. Component sudah wrapped dalam lazy loading untuk optimal performance

## Integration dengan Error Handling System

Testing component memanfaatkan seluruh error handling infrastructure:
- ✅ ErrorBoundary dengan retry functionality
- ✅ GlobalErrorBoundary untuk app-wide error catching
- ✅ ErrorUtils untuk type detection dan messaging
- ✅ useGlobalErrorReporting hook untuk error tracking
- ✅ ErrorDisplay dan ErrorState components
- ✅ Alert system integration

Dengan testing component ini, Anda dapat dengan mudah memvalidasi bahwa semua improvement error handling berfungsi dengan baik dan memberikan user experience yang optimal.
