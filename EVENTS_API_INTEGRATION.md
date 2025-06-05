# Events API Integration for Admin Promo Codes

## 🎯 Integration Summary

Successfully integrated the events API (`https://ai.alviongs.com/webhook/v1/nibog/event-game-slots/get-all`) into the admin promo codes page to display real events and their associated games.

## 🔧 Files Created/Modified

### New Files Created:

1. **API Route**: `app/api/events/get-all-with-games/route.ts`
   - Fetches events data from external API
   - Implements 30-second caching to prevent excessive calls
   - Transforms data to a more usable format
   - Handles errors gracefully

2. **Service**: `services/eventGameService.ts`
   - Provides TypeScript interfaces for events and games
   - Contains helper functions for data manipulation
   - Exports `getEventsForSelector()` and `getAllGamesFromEvents()`

3. **Documentation**: `EVENTS_API_INTEGRATION.md` (this file)

### Modified Files:

1. **Promo Code Page**: `app/admin/promo-codes/new/page.tsx`
   - Added dynamic event loading with useEffect
   - Replaced static events with API data
   - Added loading states and error handling
   - Enhanced UI to show events and their games hierarchically
   - Added game selection within events

## 🚀 Features Implemented

### Dynamic Event Loading
- ✅ Fetches real events from API on page load
- ✅ Shows loading spinner while fetching
- ✅ Displays error messages if API fails
- ✅ Caches data for 30 seconds to improve performance

### Enhanced UI
- ✅ **Events Section**: Shows all available events
- ✅ **Games Submenu**: Shows games within each selected event
- ✅ **Hierarchical Selection**: Select events first, then their games
- ✅ **Apply to All**: Option to apply promo code to all events/games

### Data Structure
The API returns events with this structure:
```json
{
  "event_id": 1,
  "event_title": "Spring Carnival",
  "event_description": "A fun-filled day with games and activities.",
  "event_date": "2025-05-10T00:00:00.000Z",
  "city": { "city_name": "Hyderbad", "state": "AP" },
  "venue": { "venue_name": "KPHB", "address": "218 North Texas blvd" },
  "games": [
    {
      "game_id": 2,
      "game_title": "Running race",
      "custom_title": "Mini Golf Challenge",
      "custom_price": 5,
      "start_time": "10:00:00",
      "end_time": "11:30:00"
    }
  ]
}
```

## 🎮 How It Works

### User Flow:
1. **Page Load**: Events are automatically fetched from API
2. **Loading State**: Shows spinner while loading
3. **Event Selection**: User can select specific events
4. **Game Selection**: For each selected event, user can choose specific games
5. **Apply to All**: Option to apply promo code to all events and games
6. **Form Submission**: Includes both selected events and games

### API Flow:
1. **Frontend** calls `/api/events/get-all-with-games`
2. **API Route** fetches from external API with caching
3. **Data Transformation** converts to frontend-friendly format
4. **Response** returns structured events with games

## 🧪 Testing

### Test the Integration:

1. **Visit Promo Code Page**:
   ```
   http://localhost:3000/admin/promo-codes/new
   ```

2. **Expected Behavior**:
   - Page loads with events fetched from API
   - Events show: "Spring Carnival", "sjasd" (based on your API data)
   - Games show under each event when selected
   - Loading states work properly

3. **Console Output**:
   ```
   Server API route: Fetching all events with games...
   Server API route: Retrieved 2 events with games
   Server API route: Cached events with games data
   Loaded events: [...]
   Loaded games: [...]
   ```

### Test Cases:
- ✅ **Normal Load**: Events load successfully
- ✅ **Caching**: Subsequent loads use cached data
- ✅ **Error Handling**: Shows error if API fails
- ✅ **Event Selection**: Can select/deselect events
- ✅ **Game Selection**: Can select games within events
- ✅ **Form Submission**: Includes event and game data

## 🔍 API Endpoints

### Internal API:
- **GET** `/api/events/get-all-with-games`
  - Returns transformed events with games
  - Implements caching
  - Handles errors gracefully

### External API:
- **GET** `https://ai.alviongs.com/webhook/v1/nibog/event-game-slots/get-all`
  - Source of events data
  - Called by internal API route

## 📊 Data Flow

```
External API → Internal API Route → Service Layer → React Component
     ↓              ↓                    ↓              ↓
Raw Events → Cached & Transformed → Typed Data → UI Display
```

## 🎉 Benefits

- ✅ **Real Data**: Uses actual events from your system
- ✅ **Performance**: 30-second caching reduces API calls
- ✅ **User Experience**: Loading states and error handling
- ✅ **Flexibility**: Can select specific events and games
- ✅ **Maintainable**: Clean separation of concerns
- ✅ **Type Safe**: Full TypeScript support

## 🔄 Future Enhancements

Potential improvements:
- Add search/filter functionality for events
- Implement real-time updates
- Add event details preview
- Bulk selection options
- Export promo code data

The events API integration is now complete and ready for use! 🎉
