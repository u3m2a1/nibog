# NIBOG Application API Documentation

This document provides a comprehensive overview of the API endpoints required for the NIBOG Platform's user-facing application. These APIs support the core functionality of the platform, including user authentication, event discovery, booking management, and other essential features.

## Table of Contents

1. [Authentication & User Management](#authentication--user-management)
2. [Child Profile Management](#child-profile-management)
3. [Event Discovery & Filtering](#event-discovery--filtering)
4. [Event Registration & Booking](#event-registration--booking)
5. [User Dashboard](#user-dashboard)
6. [Payments](#payments)
7. [Reviews & Testimonials](#reviews--testimonials)
8. [Content & Information](#content--information)
9. [Notifications](#notifications)

## Authentication & User Management

### User Registration

- `POST /api/auth/register` - Register a new user
  - Request Body:
    ```json
    {
      "name": "string",
      "email": "string",
      "phone": "string",
      "password": "string",
      "defaultCity": "string",
      "termsAccepted": "boolean"
    }
    ```
  - Response: User object with JWT token

### User Login

- `POST /api/auth/login` - Login with email and password
  - Request Body:
    ```json
    {
      "email": "string",
      "password": "string",
      "rememberMe": "boolean"
    }
    ```
  - Response: User object with JWT token

- `POST /api/auth/login/google` - Login with Google OAuth
  - Request Body: Google OAuth token
  - Response: User object with JWT token

- `POST /api/auth/login/phone` - Request OTP for phone login
  - Request Body:
    ```json
    {
      "phone": "string"
    }
    ```
  - Response: Success message with OTP reference

- `POST /api/auth/login/phone/verify` - Verify OTP for phone login
  - Request Body:
    ```json
    {
      "phone": "string",
      "otp": "string",
      "reference": "string"
    }
    ```
  - Response: User object with JWT token

### Password Management

- `POST /api/auth/forgot-password` - Request password reset
  - Request Body:
    ```json
    {
      "email": "string"
    }
    ```
  - Response: Success message

- `POST /api/auth/reset-password` - Reset password with token
  - Request Body:
    ```json
    {
      "token": "string",
      "password": "string",
      "confirmPassword": "string"
    }
    ```
  - Response: Success message

- `PUT /api/auth/change-password` - Change password (authenticated)
  - Request Body:
    ```json
    {
      "currentPassword": "string",
      "newPassword": "string",
      "confirmPassword": "string"
    }
    ```
  - Response: Success message

### User Profile Management

- `GET /api/users/me` - Get current user profile
  - Response: User profile object

- `PUT /api/users/me` - Update user profile
  - Request Body:
    ```json
    {
      "name": "string",
      "email": "string",
      "phone": "string",
      "defaultCity": "string",
      "profilePicture": "string (optional)"
    }
    ```
  - Response: Updated user profile

- `DELETE /api/users/me` - Delete user account
  - Response: Success message

- `POST /api/users/me/verify-email` - Request email verification
  - Response: Success message

- `POST /api/users/me/verify-phone` - Request phone verification
  - Response: Success message with OTP reference

- `POST /api/users/me/verify-phone/confirm` - Confirm phone verification with OTP
  - Request Body:
    ```json
    {
      "otp": "string",
      "reference": "string"
    }
    ```
  - Response: Success message

## Child Profile Management

- `GET /api/users/me/children` - Get all children profiles for current user
  - Response: Array of child profile objects

- `GET /api/users/me/children/:id` - Get specific child profile
  - Response: Child profile object

- `POST /api/users/me/children` - Add new child profile
  - Request Body:
    ```json
    {
      "name": "string",
      "dob": "string (YYYY-MM-DD)",
      "gender": "string (male/female)",
      "notes": "string (optional)"
    }
    ```
  - Response: Created child profile

- `PUT /api/users/me/children/:id` - Update child profile
  - Request Body:
    ```json
    {
      "name": "string",
      "dob": "string (YYYY-MM-DD)",
      "gender": "string (male/female)",
      "notes": "string (optional)"
    }
    ```
  - Response: Updated child profile

- `DELETE /api/users/me/children/:id` - Delete child profile
  - Response: Success message

## Event Discovery & Filtering

- `GET /api/events` - List all events with optional filtering
  - Query Parameters:
    - `city`: Filter by city
    - `minAge`: Minimum age in months
    - `maxAge`: Maximum age in months
    - `date`: Event date (YYYY-MM-DD)
    - `search`: Search term
    - `category`: Event category
    - `venue`: Venue name
    - `page`: Page number for pagination
    - `limit`: Number of results per page
  - Response: Paginated list of events

- `GET /api/events/:id` - Get detailed event information
  - Response: Detailed event object including:
    - Basic event details
    - Age requirements
    - Available slots
    - Venue information
    - Gallery images
    - FAQs
    - Reviews
    - Related events

- `GET /api/events/featured` - Get featured events
  - Query Parameters:
    - `city`: Filter by city (optional)
    - `limit`: Number of results (default: 6)
  - Response: Array of featured events

- `GET /api/events/upcoming` - Get upcoming events
  - Query Parameters:
    - `city`: Filter by city (optional)
    - `limit`: Number of results (default: 6)
  - Response: Array of upcoming events

- `GET /api/events/cities` - Get list of cities with events
  - Response: Array of city objects with event counts

- `GET /api/events/categories` - Get list of event categories
  - Response: Array of category objects

- `GET /api/events/venues` - Get list of venues
  - Query Parameters:
    - `city`: Filter by city (optional)
  - Response: Array of venue objects

- `GET /api/events/age-ranges` - Get standard age ranges for filtering
  - Response: Array of age range objects

## Event Registration & Booking

- `GET /api/events/:id/slots` - Get available slots for an event
  - Query Parameters:
    - `date`: Filter by date (YYYY-MM-DD) (optional)
  - Response: Array of available slot objects

- `GET /api/events/:id/check-eligibility` - Check if a child is eligible for an event
  - Query Parameters:
    - `childId`: Child ID
    - `slotId`: Slot ID (optional)
  - Response: Eligibility status with reason if not eligible

- `POST /api/bookings` - Create a new booking
  - Request Body:
    ```json
    {
      "eventId": "string",
      "slotId": "string",
      "childId": "string",
      "addOns": [
        {
          "id": "string",
          "quantity": "number",
          "variantId": "string (optional)"
        }
      ],
      "promoCode": "string (optional)"
    }
    ```
  - Response: Booking object with payment information

- `GET /api/events/:id/add-ons` - Get available add-ons for an event
  - Response: Array of add-on objects with variants

- `POST /api/bookings/validate-promo` - Validate a promo code
  - Request Body:
    ```json
    {
      "code": "string",
      "eventId": "string",
      "slotId": "string (optional)",
      "amount": "number"
    }
    ```
  - Response: Promo code validation result with discount amount

- `POST /api/bookings/guest` - Create a guest booking (without authentication)
  - Request Body:
    ```json
    {
      "parentName": "string",
      "email": "string",
      "phone": "string",
      "childName": "string",
      "childDob": "string (YYYY-MM-DD)",
      "childGender": "string",
      "schoolName": "string (optional)",
      "eventId": "string",
      "slotId": "string",
      "addOns": [
        {
          "id": "string",
          "quantity": "number",
          "variantId": "string (optional)"
        }
      ],
      "promoCode": "string (optional)"
    }
    ```
  - Response: Booking object with payment information and temporary access token

## User Dashboard

- `GET /api/bookings` - Get all bookings for current user
  - Query Parameters:
    - `status`: Filter by status (upcoming, past, cancelled)
    - `page`: Page number
    - `limit`: Results per page
  - Response: Paginated list of bookings

- `GET /api/bookings/:id` - Get detailed booking information
  - Response: Detailed booking object

- `PUT /api/bookings/:id/cancel` - Cancel a booking
  - Request Body:
    ```json
    {
      "reason": "string (optional)"
    }
    ```
  - Response: Updated booking with cancellation details

- `GET /api/bookings/:id/ticket` - Get ticket for a booking
  - Query Parameters:
    - `format`: Ticket format (pdf, image)
  - Response: Ticket URL or binary data

- `GET /api/bookings/:id/certificate` - Get certificate for a completed booking
  - Query Parameters:
    - `format`: Certificate format (pdf, image)
  - Response: Certificate URL or binary data

- `GET /api/users/me/favorites` - Get user's favorite events
  - Response: Array of favorited events

- `POST /api/users/me/favorites/:eventId` - Add event to favorites
  - Response: Updated favorites list

- `DELETE /api/users/me/favorites/:eventId` - Remove event from favorites
  - Response: Updated favorites list

## Payments

- `POST /api/payments/create` - Create a payment intent
  - Request Body:
    ```json
    {
      "bookingId": "string",
      "paymentMethod": "string (card, upi, netbanking)",
      "amount": "number",
      "currency": "string (default: INR)"
    }
    ```
  - Response: Payment intent with client secret

- `POST /api/payments/confirm` - Confirm a payment
  - Request Body:
    ```json
    {
      "paymentIntentId": "string",
      "paymentMethodId": "string"
    }
    ```
  - Response: Payment confirmation

- `GET /api/payments/methods` - Get available payment methods
  - Response: Array of payment method objects

- `GET /api/payments/history` - Get payment history for current user
  - Query Parameters:
    - `status`: Filter by status
    - `page`: Page number
    - `limit`: Results per page
  - Response: Paginated list of payments

- `GET /api/payments/:id` - Get payment details
  - Response: Detailed payment object

- `POST /api/payments/refund` - Request a refund
  - Request Body:
    ```json
    {
      "bookingId": "string",
      "reason": "string"
    }
    ```
  - Response: Refund request confirmation

## Reviews & Testimonials

- `GET /api/events/:id/reviews` - Get reviews for an event
  - Query Parameters:
    - `page`: Page number
    - `limit`: Results per page
    - `sort`: Sort order (recent, rating)
  - Response: Paginated list of reviews

- `POST /api/bookings/:id/review` - Submit a review for a booking
  - Request Body:
    ```json
    {
      "rating": "number (1-5)",
      "comment": "string"
    }
    ```
  - Response: Created review

- `PUT /api/bookings/:id/review` - Update a review
  - Request Body:
    ```json
    {
      "rating": "number (1-5)",
      "comment": "string"
    }
    ```
  - Response: Updated review

- `DELETE /api/bookings/:id/review` - Delete a review
  - Response: Success message

- `GET /api/testimonials` - Get featured testimonials
  - Query Parameters:
    - `limit`: Number of testimonials (default: 6)
  - Response: Array of testimonial objects

## Content & Information

- `GET /api/faqs` - Get frequently asked questions
  - Query Parameters:
    - `category`: FAQ category (general, registration, payment, etc.)
  - Response: Array of FAQ objects grouped by category

- `GET /api/cities` - Get list of all cities
  - Response: Array of city objects

- `POST /api/contact` - Submit contact form
  - Request Body:
    ```json
    {
      "name": "string",
      "email": "string",
      "phone": "string (optional)",
      "subject": "string",
      "message": "string"
    }
    ```
  - Response: Success message

- `GET /api/content/about` - Get about us content
  - Response: About us content object

- `GET /api/content/terms` - Get terms and conditions
  - Response: Terms and conditions content

- `GET /api/content/privacy` - Get privacy policy
  - Response: Privacy policy content

- `GET /api/content/refund-policy` - Get refund policy
  - Response: Refund policy content

## Notifications

- `GET /api/notifications` - Get user notifications
  - Query Parameters:
    - `read`: Filter by read status (true/false)
    - `page`: Page number
    - `limit`: Results per page
  - Response: Paginated list of notifications

- `PUT /api/notifications/:id/read` - Mark notification as read
  - Response: Updated notification

- `PUT /api/notifications/read-all` - Mark all notifications as read
  - Response: Success message

- `GET /api/notifications/settings` - Get notification preferences
  - Response: Notification settings object

- `PUT /api/notifications/settings` - Update notification preferences
  - Request Body:
    ```json
    {
      "email": {
        "bookingConfirmation": "boolean",
        "bookingReminder": "boolean",
        "promotions": "boolean",
        "newsletter": "boolean"
      },
      "sms": {
        "bookingConfirmation": "boolean",
        "bookingReminder": "boolean",
        "promotions": "boolean"
      }
    }
    ```
  - Response: Updated notification settings

## Data Models

### User

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "defaultCity": "string",
  "profilePicture": "string (URL)",
  "emailVerified": "boolean",
  "phoneVerified": "boolean",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

### Child

```json
{
  "id": "string",
  "userId": "string",
  "name": "string",
  "dob": "string (ISO date)",
  "gender": "string (male/female)",
  "notes": "string",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

### Event

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "minAgeMonths": "number",
  "maxAgeMonths": "number",
  "date": "string (ISO date)",
  "time": "string",
  "venue": "string",
  "address": "string",
  "city": "string",
  "price": "number",
  "image": "string (URL)",
  "gallery": ["string (URL)"],
  "spotsLeft": "number",
  "totalSpots": "number",
  "categories": ["string"],
  "featured": "boolean",
  "slots": [
    {
      "id": "string",
      "startTime": "string",
      "endTime": "string",
      "capacity": "number",
      "booked": "number",
      "status": "string (active/inactive)"
    }
  ],
  "faqs": [
    {
      "question": "string",
      "answer": "string"
    }
  ],
  "reviews": [
    {
      "id": "string",
      "userId": "string",
      "userName": "string",
      "rating": "number",
      "comment": "string",
      "createdAt": "string (ISO date)"
    }
  ],
  "relatedEvents": ["string (event ID)"]
}
```

### Booking

```json
{
  "id": "string",
  "userId": "string",
  "eventId": "string",
  "slotId": "string",
  "childId": "string",
  "status": "string (confirmed, cancelled, completed)",
  "price": "number",
  "discount": "number",
  "totalAmount": "number",
  "paymentStatus": "string (pending, paid, refunded)",
  "addOns": [
    {
      "id": "string",
      "name": "string",
      "quantity": "number",
      "variantId": "string",
      "variantName": "string",
      "price": "number"
    }
  ],
  "promoCode": "string",
  "ticketUrl": "string",
  "certificateUrl": "string",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

### Payment

```json
{
  "id": "string",
  "bookingId": "string",
  "userId": "string",
  "amount": "number",
  "currency": "string",
  "paymentMethod": "string",
  "transactionId": "string",
  "status": "string (pending, successful, failed, refunded)",
  "refundAmount": "number",
  "refundReason": "string",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

### Review

```json
{
  "id": "string",
  "userId": "string",
  "bookingId": "string",
  "eventId": "string",
  "rating": "number",
  "comment": "string",
  "status": "string (pending, approved, rejected)",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

### Testimonial

```json
{
  "id": "string",
  "name": "string",
  "city": "string",
  "event": "string",
  "rating": "number",
  "comment": "string",
  "image": "string (URL)",
  "featured": "boolean",
  "createdAt": "string (ISO date)"
}
```

### Notification

```json
{
  "id": "string",
  "userId": "string",
  "type": "string",
  "title": "string",
  "message": "string",
  "read": "boolean",
  "data": {
    "bookingId": "string",
    "eventId": "string"
  },
  "createdAt": "string (ISO date)"
}
```

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "status": "error",
  "code": "string",
  "message": "string",
  "details": {}
}
```

Common error codes:

- `INVALID_REQUEST` - Missing or invalid parameters
- `AUTHENTICATION_REQUIRED` - User is not authenticated
- `PERMISSION_DENIED` - User does not have permission
- `RESOURCE_NOT_FOUND` - Requested resource not found
- `VALIDATION_ERROR` - Input validation failed
- `PAYMENT_ERROR` - Payment processing error
- `SERVER_ERROR` - Internal server error

## Authentication

All API endpoints except public ones (login, register, public event listings) require authentication using JWT tokens.

Authentication is provided via the `Authorization` header:

```
Authorization: Bearer {token}
```

## Rate Limiting

API requests are rate-limited to prevent abuse:

- Authentication endpoints: 10 requests per minute
- Other endpoints: 60 requests per minute

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1620000000
```

## Versioning

The API is versioned using URL path versioning:

```
/api/v1/events
```

The current version is v1.
