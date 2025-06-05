# Promo Code API Integration

## 🎯 Integration Summary

Successfully integrated the promo code creation API (`https://ai.alviongs.com/webhook/v1/nibog/promocode/create`) into the admin promo codes new page with full form validation, error handling, and real-time event/game selection.

## 🔧 Files Created/Modified

### New Files Created:

1. **API Route**: `app/api/promo-codes/create/route.ts`
   - Handles promo code creation requests
   - Validates required fields
   - Calls external API with proper error handling
   - Returns structured responses

2. **Service**: `services/promoCodeService.ts`
   - TypeScript interfaces for promo code data
   - Form validation logic
   - Data transformation utilities
   - API communication functions

3. **Documentation**: `PROMO_CODE_API_INTEGRATION.md` (this file)

### Modified Files:

1. **Promo Code New Page**: `app/admin/promo-codes/new/page.tsx`
   - Integrated real API calls
   - Added comprehensive form validation
   - Enhanced error handling and user feedback
   - Improved loading states and UI

## 🚀 Features Implemented

### Real API Integration
- ✅ **API Route**: Internal route that calls external API
- ✅ **Form Validation**: Client-side and server-side validation
- ✅ **Error Handling**: Comprehensive error messages and feedback
- ✅ **Loading States**: Visual feedback during API calls
- ✅ **Success Handling**: Toast notifications and navigation

### Enhanced Form Features
- ✅ **Dynamic Events**: Real events loaded from API
- ✅ **Game Selection**: Hierarchical event → game selection
- ✅ **Validation Feedback**: Real-time form validation
- ✅ **Error Display**: Clear error messages in UI
- ✅ **Apply to All**: Option to apply to all events/games

### Data Transformation
- ✅ **Date Formatting**: Converts form dates to ISO format
- ✅ **Event Mapping**: Maps UI selections to API format
- ✅ **Game Association**: Links games to their events
- ✅ **Type Safety**: Full TypeScript support

## 📊 API Payload Structure

### Request Format:
```json
{
  "promo_code": "NIBOG25",
  "type": "percentage",
  "value": 25,
  "valid_from": "2025-01-01T00:00:00Z",
  "valid_to": "2025-12-31T23:59:59Z",
  "usage_limit": 1000,
  "minimum_purchase_amount": 1000,
  "maximum_discount_amount": 500,
  "description": "25% off on all NIBOG events",
  "events": [
    {
      "id": 1,
      "games_id": [4, 5]
    },
    {
      "id": 2,
      "games_id": []
    }
  ]
}
```

### Response Format:
```json
{
  "success": true,
  "message": "Promo code created successfully",
  "data": { ... }
}
```

## 🎮 How It Works

### User Flow:
1. **Page Load**: Events are fetched from API
2. **Form Filling**: User fills promo code details
3. **Event Selection**: User selects events and games
4. **Validation**: Form is validated before submission
5. **API Call**: Data is sent to external API
6. **Feedback**: Success/error messages shown
7. **Navigation**: Redirects to promo codes list on success

### Data Flow:
```
Form Data → Validation → Transformation → API Call → Response → UI Update
```

### Event/Game Selection:
- **Apply to All**: Includes all events with all their games
- **Specific Selection**: User selects events, then games within those events
- **Dynamic Updates**: Game options update based on event selection

## 🧪 Testing the Integration

### Test Steps:

1. **Visit Promo Code Creation Page**:
   ```
   http://localhost:3000/admin/promo-codes/new
   ```

2. **Fill Form with Test Data**:
   - **Promo Code**: `TEST123`
   - **Discount Type**: `percentage`
   - **Discount Value**: `25`
   - **Max Discount**: `500`
   - **Min Purchase**: `1000`
   - **Valid From**: `2025-01-01`
   - **Valid To**: `2025-12-31`
   - **Usage Limit**: `100`
   - **Description**: `Test promo code`

3. **Select Events/Games**:
   - Either check "Apply to all events and games"
   - Or select specific events and their games

4. **Submit Form**:
   - Click "Create Promo Code"
   - Watch for loading state
   - Check console for API calls

### Expected Behavior:

**Success Case**:
- Form validates successfully
- API call is made to external endpoint
- Success toast notification appears
- Redirects to promo codes list page

**Error Cases**:
- **Validation Errors**: Shows error messages in form
- **API Errors**: Shows error toast with details
- **Network Errors**: Shows generic error message

### Console Output:
```
Creating promo code: { ... }
Transformed form data to API format: { ... }
Server API route: Starting promo code creation request
Server API route: Calling API URL: https://ai.alviongs.com/webhook/v1/nibog/promocode/create
Server API route: Promo code creation response: { ... }
Promo code creation response: { success: true, ... }
```

## 🔍 Validation Rules

### Required Fields:
- ✅ Promo code
- ✅ Discount value
- ✅ Minimum purchase amount
- ✅ Valid from date
- ✅ Valid to date
- ✅ Usage limit

### Business Rules:
- ✅ **Percentage**: Must be between 1-100%
- ✅ **Fixed Amount**: Must be greater than 0
- ✅ **Date Range**: Valid to must be after valid from
- ✅ **Event Selection**: At least one event if not applying to all
- ✅ **Numeric Values**: All numeric fields validated

### Error Messages:
- Clear, specific error messages for each validation rule
- Real-time validation feedback
- Toast notifications for API errors

## 🛠️ API Endpoints

### Internal API:
- **POST** `/api/promo-codes/create`
  - Validates and forwards requests
  - Handles errors gracefully
  - Returns structured responses

### External API:
- **POST** `https://ai.alviongs.com/webhook/v1/nibog/promocode/create`
  - Creates promo codes in your system
  - Returns creation confirmation

## 🎉 Benefits

- ✅ **Real Integration**: Uses actual promo code API
- ✅ **User Experience**: Smooth form interaction with validation
- ✅ **Error Handling**: Comprehensive error management
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Maintainable**: Clean separation of concerns
- ✅ **Flexible**: Supports both "apply to all" and specific selections

## 🔄 Future Enhancements

Potential improvements:
- Add promo code preview before creation
- Implement duplicate code checking
- Add bulk promo code creation
- Include usage analytics
- Add promo code templates

## 🚨 Important Notes

- **Real API**: This creates actual promo codes in your system
- **Validation**: Form validation prevents invalid data submission
- **Error Handling**: All API errors are caught and displayed
- **Navigation**: Successful creation redirects to promo codes list

The promo code API integration is now complete and ready for production use! 🎉

## 🧪 Quick Test

To quickly test the integration:

1. Go to: `http://localhost:3000/admin/promo-codes/new`
2. Click "Generate Random Code" for promo code
3. Fill in discount details
4. Select events/games or use "Apply to all"
5. Click "Create Promo Code"
6. Check console for API calls and responses

The form should validate, call the API, and show success/error feedback appropriately.
