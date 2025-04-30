Product Requirements Document: NIBOG - India's Premier Children's Event Platform
Version: 1.2 (Expanded Scope & Enhanced Admin)
Date: 2025-04-10
Author: AI Assistant (incorporating detailed user feedback)
Status: Draft
1. Introduction
NIBOG aims to be India's leading and most trusted platform for discovering, booking, and managing engaging games and events for children aged 5 months to 12 years across various cities in India. It connects parents seeking high-quality, age-appropriate activities with meticulously organized events managed directly by NIBOG administrators. The platform prioritizes intuitive event discovery based on the child's age calculated at the time of the event and location, a seamless and secure booking/payment process, and highly efficient, flexible administrative tools for event lifecycle management. This PRD outlines the functional and non-functional requirements for NIBOG, leveraging Next.js and TypeScript for the frontend, and a robust, scalable backend infrastructure (e.g., Node.js with PostgreSQL/Prisma) for API services, data persistence, authentication, and AI integration.
2. Goals
Business Goals:
Establish NIBOG as India's #1 platform and brand for children's events and activities.
Maximize event participation and drive significant revenue.
Efficiently scale operations and event offerings across numerous Indian cities.
Cultivate a large, loyal community of engaged parents.
Optimize NIBOG's internal processes for creating, managing, and adapting event schedules with maximum flexibility.
Product Goals:
Provide parents with an exceptionally easy and reliable way to find precisely age-appropriate events for their children (5 months - 12 years) in their chosen city, considering the child's age on the event date.
Deliver a frictionless, secure, and trustworthy booking and payment experience.
Empower administrators with comprehensive tools to manage cities, venues, game templates, highly configurable event schedules and slots (including updates, pausing, cloning), bookings, users, and content.
Leverage AI for content enrichment (descriptions) and data-driven suggestions (e.g., pricing).
Build a highly scalable, maintainable, and futuristic platform capable of supporting significant growth and new features.
3. User Personas
Priya (Parent):
Demographics: 28-45 years old, parent of one or more children within the 5 month - 12 year age range, lives in a Tier 1 or Tier 2 Indian city, tech-savvy, seeks enriching experiences for her kids.
Needs: Find safe, fun, developmentally relevant activities; easily filter events by child's specific age eligibility for the event date, location, and type; simple and quick booking; a trustworthy platform with clear information; potentially find events for different aged siblings simultaneously.
Goals: Keep her child(ren) active and engaged; foster social skills; find weekend or after-school activities; ensure events offer good value; easily manage bookings.
Raj (NIBOG Admin / Operations Manager):
Role: NIBOG Operations Manager, City Manager, or Event Coordinator.
Needs: Rapidly define and manage game templates suitable for specific age brackets (5m-12y); add/manage cities and venues efficiently; create complex event schedules across multiple venues and dates with granular control over time slots, pricing, and capacity; easily update, pause, resume, clone, or cancel schedules/slots even after creation; manage participant bookings effectively (view lists per slot, update status); track event performance and finances; manage user accounts and permissions; potentially manage content and promotions.
Goals: Maximize venue utilization and event attendance; ensure smooth event delivery and high parent satisfaction; minimize administrative time and errors; maintain consistent brand quality; adapt quickly to changing demands or circumstances.
4. Functional Requirements
4.1 Core Logic: Dynamic Age Eligibility Calculation
CL1: The system MUST calculate a child's age in months (or years and months) based on their Date of Birth (DOB) relative to the specific date of an EventSchedule or EventSlot.
CL2: This calculated age MUST be used consistently for:
Filtering events shown to the user (FR1, FR2, FR9).
Validating eligibility before allowing booking (FR3, FR6).
Displaying relevant age suitability information (FR3).
CL3: This calculation needs to be performant, especially when filtering large lists of events (likely handled primarily by the backend API).
4.2 User Facing Application (Next.js Frontend)
FR1: Landing Page / Homepage
Prominently feature the NIBOG brand ("India's Biggest Children's Gaming Company" theme).
Display featured/upcoming events fetched from the backend API.
Mandatory City Selection: Users must select their city upfront to see relevant offerings.
Child DOB Input: Allow users to input their child's DOB (or select a registered child if logged in).
Dynamic Event Filtering: Based on selected city and child's DOB, fetch and display upcoming events for which the child will be within the game's defined age range on the event date (using CL1 & CL2 via API).
Visually appealing, trustworthy design using Tailwind CSS, Shadcn UI, Radix UI, with subtle, professional animations.
FR2: Event Discovery / Browsing
Browse available EventSchedules (active/upcoming) fetched via API, primarily filtered by the selected City.
Advanced Filtering:
Child Age Eligibility: Filter based on child's DOB, performing the dynamic age calculation (CL1) against event dates via the API.
Venue, Date Range, Game Category/Tags.
Search events by keywords (query sent to API).
Display events clearly, showing key info: Game Name, Venue, Date, Time Slots, Price, Target Age Range.
FR3: Event Detail Page
Show details of a selected EventSlot (via API): Game description (from GameTemplate), clearly stated Min/Max Age range (e.g., "Suitable for 18-24 months"), duration, price, date, start/end time, venue details (name, address, map link), real-time remaining spots.
Display Game and Venue media (photos/videos) from cloud storage (URLs via API).
"Book Now" button: Enabled only if spots are available AND the selected child meets the age criteria for the event date (client-side check + mandatory server-side validation via API using CL1 & CL2).
FR4: User Authentication (e.g., NextAuth.js, Passport.js)
(As specified in v1.1 - Registration, Login [Email/OTP/Google], Password Reset, Profile Mgt).
FR5: Child Profile Management
Logged-in users can add multiple Child profiles (Name, DOB (Mandatory & Validated), Optional Notes - encrypted). Stored securely, linked to the user.
Manage (View, Edit, Delete) child profiles via API calls.
FR6: Booking Flow
FR6.1 Slot Selection: User selects an available EventSlot.
FR6.2 Child Selection: User selects which registered child(ren) will attend. System performs age eligibility check (CL1 & CL2) for each selected child against the EventSlot date via API before proceeding. Display clear confirmation or error.
FR6.3 Promo Code: Apply valid PromoCode (validated via API).
FR6.4 Review: Clear summary: Event, Slot, Child(ren) with calculated age at event, Price, Discount, Final Amount.
FR6.5 Payment: Redirect to integrated Payment Gateway (Razorpay/PhonePe), initiated via backend API.
FR6.6 Confirmation: Display confirmation page; trigger backend for confirmation email/notification. Store Booking and BookingChildren details (including child_age_at_event).
FR7: User Dashboard
(As specified in v1.1 - Upcoming/Past Bookings, Profile/Children links, Cancellation option).
FR8: Static Pages
(As specified in v1.1 - Testimonials, Contact Us, About, FAQ). Content should reflect the expanded age range and branding.
FR9: Themed Event Pages (e.g., "Baby Olympics", "Toddler Tuesdays", "Adventure Kids [5-8y]")
Dedicated pages featuring events categorized under specific themes or age brackets.
Dynamically filters displayed events based on user's selected child's age eligibility for the event date (using CL1 & CL2 via API).
4.3 Admin Panel (Highly Flexible & Robust - Protected Next.js Routes / Separate App)
FR10: Secure Admin Access
(As specified in v1.1 - Role-based access control).
FR11: Admin Dashboard
Overview: Total Bookings, Revenue (filterable by date range, city), Upcoming Events, Slot Fill Rate (%), New Users, Popular Games/Venues, Low-Performing Slots. Data aggregated by backend API.
FR12: City Management
(As specified in v1.1 - CRUD for Cities).
FR13: Venue Management
(As specified in v1.1 - CRUD for Venues linked to City).
FR14: Game Template Management
CRUD for GameTemplates: Name, Description, Min/Max Age (months, covering 5-144 months), Duration, Categories/Tags, Media (uploads to cloud storage), Default Price Suggestion (can be AI-assisted), Status (Active/Inactive/Archived).
FR14.1 AI Description: Button to trigger backend Genkit flow for description generation.
FR14.2 AI Cost Suggestion: Button/field to trigger backend Genkit flow, potentially considering game factors, duration, age group, and maybe city tier.
FR15: Event Scheduling & Lifecycle Management (Core Admin Functionality)
Interface: Intuitive interface (e.g., Calendar view filterable by City/Venue, List view with robust filtering/sorting) for managing EventSchedules and EventSlots.
Creation (EventSchedule): Select GameTemplate, Venue, Date(s). System pre-fills details from templates. Set initial status (e.g., 'Draft', 'Scheduled').
Slot Definition (EventSlots): For each schedule, add multiple EventSlots: Start Time, End Time, Price (can override template suggestion), Max Participants (capacity). Slots are linked to the parent schedule.
Updating (High Flexibility):
Admins MUST be able to modify details of existing EventSchedules and EventSlots (e.g., change date, time, venue [with warnings if bookings exist], price, description override, game template used). System should log changes (audit trail). Define policy for notifying booked users if critical details change.
Admins MUST be able to increase or decrease max_participants for an EventSlot. Decreasing below current bookings should be handled gracefully (e.g., prevent or require manual intervention/cancellation).
Status Management:
Admins MUST be able to change the status of EventSchedules or individual EventSlots (e.g., 'Scheduled', 'Paused' [prevents new bookings], 'Cancelled', 'Completed').
Implement logic for cascading status changes (e.g., cancelling a schedule cancels its slots).
Define how 'Paused' status affects user visibility and booking attempts.
Cloning: Admins MUST be able to clone an existing EventSchedule (including its slots) to a new date or venue, facilitating recurring event setup.
Bulk Actions: Consider bulk actions like cancelling multiple slots/schedules, updating prices for similar slots, etc.
FR16: Booking Management
View all Bookings (API fetch).
Powerful Filtering/Searching: By Event Name, Slot Date/Time, Venue, City, User (Name/Email/Phone), Booking Date, Booking Status, Payment Status.
View Slot Participants: Easily view and export (CSV) a list of participants (Parent Name, Child Name, Child Age at Event, Contact) for a specific EventSlot.
Manual Status Updates: Mark bookings as 'Attended', 'No Show', Manually 'Cancelled' (e.g., for offline requests, triggering appropriate refund logic if applicable).
FR17: User Management
(As specified in v1.1 - View, Search, Filter Users; View Details; Assign/Revoke Admin; Activate/Deactivate).
FR18: Payment Management
(As specified in v1.1 - View Transactions, Status, Link to Gateway).
FR19: Discount/Promo Code Management
(As specified in v1.1 - CRUD for Promo Codes with flexible rules).
FR20: Testimonial Management
(As specified in v1.1 - Approve/Reject submitted testimonials).
FR21: Content Management
(As specified in v1.1 - Basic updates for static pages).
4.4 Backend & Integrations (Node.js/Express/NestJS, PostgreSQL, Genkit, etc.)
FR22: API Endpoints: Secure, well-documented RESTful or GraphQL API covering all frontend and admin functionalities. Implement robust validation, authorization (role checks), and error handling.
FR23: Payment Gateway Integration (Razorpay/PhonePe): (As specified in v1.1 - Initiation, Secure Webhook Handling, Transactional DB updates).
FR24: AI Integration (Genkit): (As specified in v1.1 - Deploy flows accessible by backend).
FR25: Background/Triggered Tasks: (As specified in v1.1 - Email/Notifications, Status updates, Cleanup jobs). Crucial for notifying users about event changes (updates, cancellations) initiated by admins.
5. Non-Functional Requirements
NFR1: Performance: (As specified in v1.1 - Fast Load Times, Responsive API, Efficient DB Queries, Caching). Pay special attention to the performance of age-based event filtering.
NFR2: Scalability: (As specified in v1.1 - Scalable Backend, DB, API design). Architecture should support adding many more cities, users, and events.
NFR3: Security: (As specified in v1.1 - Authentication, Authorization, DB Security, API Security, OWASP Top 10, Payment Security, Encryption). Add audit logging for critical admin actions (FR15, FR16, FR17).
NFR4: Usability & Accessibility:
Intuitive navigation for parents (easy filtering/booking) and highly efficient workflows for admins (managing complex schedules).
(As specified in v1.1 - Responsive Design, WCAG 2.1 AA, Clear Feedback).
NFR5: Maintainability: (As specified in v1.1 - Clean Code, Docs, Modularity, ORM).
NFR6: Reliability: (As specified in v1.1 - Error Handling, Logging, Idempotency, High Availability). Ensure transactional integrity when modifying slots/bookings/payments.
6. Data Model (Relational - e.g., PostgreSQL with Prisma)
(Updates and additions to v1.1 schema)
users: (No major changes, ensure roles field is robust).
children: dob (DATE, NOT NULL). notes (TEXT, NULLABLE, Encrypted).
cities: (No major changes).
venues: (No major changes).
game_templates:
min_age_months (INTEGER, NOT NULL, CHECK >= 5)
max_age_months (INTEGER, NOT NULL, CHECK > min_age_months AND <= 144) -- 12 years * 12 months
status (VARCHAR, default 'active') -- 'active', 'inactive', 'archived'
event_schedules:
status (VARCHAR, default 'scheduled') -- 'draft', 'scheduled', 'paused', 'cancelled', 'completed'
Add created_by_admin_id (FK -> users.user_id)
Add last_updated_by_admin_id (FK -> users.user_id)
event_slots:
current_participants (INTEGER, default 0, Use optimistic/pessimistic locking or atomic updates).
status (VARCHAR, default 'active') -- 'active', 'paused', 'cancelled', 'completed', 'full'
Add index on (schedule_id, start_time)
bookings:
status (VARCHAR, NOT NULL) -- Add states like 'pending_cancellation', 'refund_processing' if needed.
booking_children:
child_age_at_event (INTEGER, NOT NULL) -- In months.
Add UNIQUE constraint on (booking_id, child_id)
payments: (No major changes).
testimonials: (No major changes).
promo_codes: (No major changes).
admin_audit_log: (Promote from Future Consideration to Core)
log_id (PK, BIGSERIAL)
admin_user_id (FK -> users.user_id, NOT NULL)
action (VARCHAR, NOT NULL) -- e.g., 'create_schedule', 'update_slot_price', 'cancel_booking', 'pause_event'
target_entity_type (VARCHAR, NOT NULL) -- e.g., 'EventSchedule', 'EventSlot', 'Booking'
target_entity_id (VARCHAR, NOT NULL) -- The ID of the affected entity
timestamp (TIMESTAMPZ, default NOW())
details (JSONB, NULLABLE) -- Optional: Store before/after state or specific changes
Crucial Indexes: Add indexes on all Foreign Keys, status fields, date/time fields used in filtering (event_schedules.event_date, event_slots.start_time), users.email, users.phone, children.user_id, bookings.user_id, bookings.slot_id.
7. Design & UI/UX
Overall Aesthetic: Clean, modern, vibrant, trustworthy, and engaging. Reflect the brand goal of being India's premier platform. Child-friendly elements should be tasteful and professional.
User Facing: Prioritize simplicity and clarity. Make city selection, DOB input, and event discovery effortless. Booking flow must be seamless. Use high-quality imagery and consistent branding.
Admin Panel: Focus on efficiency and control. Design robust interfaces for managing schedules (calendars, lists with powerful filters/sorts/bulk actions). Dashboards should provide actionable insights at a glance. Use clear visual cues for different statuses (scheduled, paused, cancelled). Ensure complex actions (updating/cancelling events with bookings) have clear warnings and confirmation steps.
Technology: Utilize Tailwind CSS, Shadcn UI, Radix UI effectively for both user-facing and admin interfaces to ensure consistency and accessibility. Use purposeful animations for feedback and transitions.
Responsiveness: Flawless adaptation to mobile, tablet, and desktop for both user and admin interfaces.
8. Technical Stack
(Largely as specified in v1.1 - Next.js, Node.js/Express/NestJS, PostgreSQL, Prisma, NextAuth.js/Passport.js/Lucia, Cloud Storage, Genkit, Payment Gateway, Vercel/AWS/GCP/Render, Redis/BullMQ, Email Service, OTP Service, Logging/Monitoring).
Add: Consider a dedicated state management library if frontend complexity grows (Zustand, Redux Toolkit).
9. Testing Strategy
(As specified in v1.1 - Unit, Integration, E2E tests).
Add: Specific test cases for:
Dynamic age calculation logic across various DOBs and event dates (including edge cases like leap years).
All admin actions related to event lifecycle management (create, update price/capacity/time, pause, cancel, clone) and their impact on bookings and user notifications.
Concurrency testing for booking updates (current_participants).
Webhook handling robustness and idempotency.
Role-based access control for all admin APIs/routes.
Audit log entry creation for relevant admin actions.
10. Future Considerations / Potential Enhancements (Brainstorming)
Parent community forum/groups per city.
Advanced game/event reviews and ratings (with photos/videos).
Loyalty points system and rewards.
Waitlist functionality with automated notifications.
Social media integration (sharing events, login).
Push notifications (reminders, cancellations, waitlist openings).
Multi-lingual support (Hindi, regional languages).
Dedicated Staff/Instructor roles with limited permissions (e.g., check-in participants).
Subscription models / Multi-event passes.
Partner portal for third-party event organizers.
Advanced AI-driven analytics for admins (demand forecasting, optimal pricing).
Merchandise shop (NIBOG branded or event-related).
Gift cards / Vouchers.
Native Mobile App (iOS/Android).
Integration with school calendars or parenting platforms.
Ability for parents to book for multiple children in one flow more easily.
Package deals (e.g., book 5 events, get discount).
11. Release Criteria
All Functional Requirements (FR1-FR25, CL1-CL3) implemented and rigorously tested.
Core Admin functionalities (esp. FR15 - event lifecycle) are robust and intuitive.
Dynamic age calculation (CL1-CL3) works accurately in all relevant flows.
Non-Functional Requirements met (Performance, Security [incl. audit logs], Usability benchmarks).
Successful E2E testing of critical flows: Parent (City Select -> DOB -> Filter -> Book -> Pay), Admin (Create Game -> Schedule Event+Slots -> Update Slot -> View Bookings -> Cancel Slot -> Check Audit Log).
Payment gateway integration fully tested (incl. webhooks, refunds if applicable).
Secure Authentication/Authorization implemented for users and admins.
Deployment to a production-ready environment with monitoring.
Basic setup, API, DB schema, and key workflow documentation complete.