# NIBOG Admin Panel API Documentation

## Hierarchical Navigation Structure

The NIBOG Admin Panel follows a hierarchical navigation structure:

1. **Cities** - Browse and manage cities where events are held
2. **Venues** - For each city, manage venues where events take place
3. **Events** - For each venue, manage events with their games and slots
4. **Games** - Configure games within events, including customizing prices

This hierarchical approach applies to both active events and completed events sections.

## Games Management

- `GET /api/admin/games` - List all game templates
- `GET /api/admin/games/:id` - Get game template details
- `POST /api/admin/games` - Create new game template
- `PUT /api/admin/games/:id` - Update game template
- `DELETE /api/admin/games/:id` - Delete game template

## Cities Management

- `GET /api/admin/cities` - List all cities
- `GET /api/admin/cities/:id` - Get city details
- `POST /api/admin/cities` - Add new city
- `PUT /api/admin/cities/:id` - Update city
- `DELETE /api/admin/cities/:id` - Delete city

## Venues Management

- `GET /api/admin/venues` - List all venues
- `GET /api/admin/venues/:id` - Get venue details
- `POST /api/admin/venues` - Add new venue
- `PUT /api/admin/venues/:id` - Update venue
- `DELETE /api/admin/venues/:id` - Delete venue
- `GET /api/admin/venues/by-city/:cityId` - Get venues by city

## Events Management

- `GET /api/admin/events` - List all events
- `GET /api/admin/events/:id` - Get event details
- `POST /api/admin/events` - Create new event
- `PUT /api/admin/events/:id` - Update event
- `DELETE /api/admin/events/:id` - Delete event
- `POST /api/admin/events/clone/:id` - Clone existing event
- `GET /api/admin/events/by-city/:cityId` - Get events by city
- `GET /api/admin/events/by-venue/:venueId` - Get events by venue
- `GET /api/admin/events/by-game/:gameId` - Get events by game template

## Event Games Management

- `GET /api/admin/events/:eventId/games` - List all games for an event
- `GET /api/admin/events/:eventId/games/:gameId` - Get game details within an event
- `POST /api/admin/events/:eventId/games` - Add game to event
- `PUT /api/admin/events/:eventId/games/:gameId` - Update game within event (including custom pricing)
- `DELETE /api/admin/events/:eventId/games/:gameId` - Remove game from event

## Event Slots Management

- `GET /api/admin/events/:eventId/games/:gameId/slots` - List all slots for a game in an event
- `GET /api/admin/events/:eventId/games/:gameId/slots/:slotId` - Get slot details
- `POST /api/admin/events/:eventId/games/:gameId/slots` - Add new slot to game
- `PUT /api/admin/events/:eventId/games/:gameId/slots/:slotId` - Update slot
- `DELETE /api/admin/events/:eventId/games/:gameId/slots/:slotId` - Delete slot
- `PUT /api/admin/events/:eventId/games/:gameId/slots/:slotId/status` - Update slot status (active/inactive)

## Bookings Management

- `GET /api/admin/bookings` - List all bookings
- `GET /api/admin/bookings/:id` - Get booking details
- `POST /api/admin/bookings` - Create new booking
- `PUT /api/admin/bookings/:id` - Update booking
- `DELETE /api/admin/bookings/:id` - Cancel booking
- `GET /api/admin/bookings/by-event/:eventId` - Get bookings by event
- `GET /api/admin/bookings/by-event/:eventId/game/:gameId` - Get bookings by game within an event
- `GET /api/admin/bookings/by-event/:eventId/game/:gameId/slot/:slotId` - Get bookings by slot
- `GET /api/admin/bookings/by-user/:userId` - Get bookings by user
- `POST /api/admin/bookings/:id/waiting-list` - Add booking to waiting list
- `GET /api/admin/events/:eventId/waiting-list` - Get waiting list for an event
- `PUT /api/admin/bookings/:id/waiting-list/status` - Update waiting list status

## Attendance Management

- `POST /api/admin/events/:eventId/games/:gameId/scan-entry/:bookingId` - Scan QR code for event entry
- `POST /api/admin/events/:eventId/scan-addon/:bookingId/:addonId` - Scan QR code for add-on collection
- `GET /api/admin/events/:eventId/attendance` - Get attendance statistics for an event
- `GET /api/admin/events/:eventId/games/:gameId/attendance` - Get attendance statistics for a specific game
- `GET /api/admin/events/:eventId/attendance/no-shows` - Get no-show participants
- `GET /api/admin/events/:eventId/games/:gameId/attendance/no-shows` - Get no-show participants for a specific game
- `GET /api/admin/events/:eventId/addon-collection` - Get add-on collection statistics

## Certificate Management

- `GET /api/admin/certificate-templates` - List all certificate templates
- `GET /api/admin/certificate-templates/:id` - Get certificate template details
- `POST /api/admin/certificate-templates` - Create new certificate template
- `PUT /api/admin/certificate-templates/:id` - Update certificate template
- `DELETE /api/admin/certificate-templates/:id` - Delete certificate template
- `POST /api/admin/events/:eventId/generate-certificates` - Generate certificates for an event
- `POST /api/admin/events/:eventId/games/:gameId/generate-certificates` - Generate certificates for a specific game
- `POST /api/admin/events/:eventId/send-certificates` - Send certificates to participants
- `POST /api/admin/events/:eventId/games/:gameId/send-certificates` - Send certificates to participants of a specific game
- `GET /api/admin/events/:eventId/certificates/status` - Get certificate generation/sending status
- `GET /api/admin/events/:eventId/games/:gameId/certificates/status` - Get certificate generation/sending status for a specific game

## Participants Management

- `GET /api/admin/events/:eventId/participants` - List all participants for an event
- `GET /api/admin/events/:eventId/games/:gameId/participants` - List participants for a specific game
- `GET /api/admin/events/:eventId/games/:gameId/slots/:slotId/participants` - List participants for a specific slot
- `POST /api/admin/events/:eventId/participants/export` - Export all participants list
- `POST /api/admin/events/:eventId/games/:gameId/participants/export` - Export participants list for a specific game
- `POST /api/admin/events/:eventId/games/:gameId/slots/:slotId/participants/export` - Export participants list for a specific slot

## Payments Management

- `GET /api/admin/payments` - List all payments
- `GET /api/admin/payments/:id` - Get payment details
- `GET /api/admin/payments/by-booking/:bookingId` - Get payments by booking
- `POST /api/admin/payments/export` - Export payments data
- `PUT /api/admin/payments/:id/status` - Update payment status

## Completed Events Management

- `GET /api/admin/completed-events` - List all completed events
- `GET /api/admin/completed-events/cities` - List cities with completed events
- `GET /api/admin/completed-events/cities/:cityId` - Get completed events for a city
- `GET /api/admin/completed-events/venues/:venueId` - Get completed events for a venue
- `GET /api/admin/completed-events/:eventId` - Get completed event details
- `GET /api/admin/completed-events/:eventId/games` - Get games for a completed event
- `GET /api/admin/completed-events/:eventId/games/:gameId` - Get game details for a completed event
- `GET /api/admin/completed-events/:eventId/analytics` - Get analytics for a completed event
- `GET /api/admin/completed-events/:eventId/games/:gameId/analytics` - Get analytics for a specific game in a completed event
- `GET /api/admin/completed-events/analytics` - Get overall analytics for completed events

## Users Management

- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - Get user details
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `PUT /api/admin/users/:id/status` - Update user status (active/inactive)

## Promo Codes Management

- `GET /api/admin/promo-codes` - List all promo codes
- `GET /api/admin/promo-codes/:id` - Get promo code details
- `POST /api/admin/promo-codes` - Create new promo code
- `PUT /api/admin/promo-codes/:id` - Update promo code
- `DELETE /api/admin/promo-codes/:id` - Delete promo code
- `PUT /api/admin/promo-codes/:id/status` - Update promo code status (active/inactive)
- `GET /api/admin/promo-codes/analytics` - Get promo code usage analytics
- `GET /api/admin/promo-codes/:id/usage` - Get detailed usage for a specific promo code

## Add-ons Management

- `GET /api/admin/add-ons` - List all add-ons
- `GET /api/admin/add-ons/:id` - Get add-on details
- `POST /api/admin/add-ons` - Create new add-on
- `PUT /api/admin/add-ons/:id` - Update add-on
- `DELETE /api/admin/add-ons/:id` - Delete add-on
- `GET /api/admin/add-ons/:id/variants` - Get add-on variants
- `POST /api/admin/add-ons/:id/variants` - Add variant to add-on
- `PUT /api/admin/add-ons/:id/variants/:variantId` - Update variant
- `DELETE /api/admin/add-ons/:id/variants/:variantId` - Delete variant
- `PUT /api/admin/add-ons/:id/inventory` - Update add-on inventory
- `GET /api/admin/add-ons/analytics` - Get add-on sales analytics
- `GET /api/admin/add-ons/top-selling` - Get top-selling add-ons
- `GET /api/admin/events/:eventId/add-ons/collection-status` - Get add-on collection status for an event

## Dashboard Analytics

- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/dashboard/revenue` - Get revenue data
- `GET /api/admin/dashboard/bookings` - Get bookings data
- `GET /api/admin/dashboard/events` - Get upcoming events
- `GET /api/admin/dashboard/attendance` - Get attendance statistics
- `GET /api/admin/dashboard/add-ons` - Get add-on sales statistics
