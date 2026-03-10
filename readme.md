Property Rental & Booking Platform
A full-stack, SaaS-level property rental system designed to mirror the core functionality of platforms like Airbnb. This platform allows property owners (Hosts) to list stays, while Guests can search, filter, and securely book properties with integrated payment gateways.

::Tech Stack::
Frontend: React.js with Tailwind CSS
Backend: Node.js & Express.js 
Database: MySQL for structured relational data 
Authentication: JSON Web Tokens (JWT) with role-based access control.
Payments: Integrated Razorpay in Test Mode

🧩 Core Modules
1. Authentication & Security
User Lifecycle: Full registration, login, and logout flow.

JWT Auth: Secure stateless authentication for all API requests.

RBAC: Role-Based Access Control distinguishing between Users, Hosts, and Admins.

2. Property & Host Management
Listing Engine: Hosts can add or delete property listings.

Media: Can upload images of properties upto 10-MAX.

Configuration: Set dynamic pricing, rules, locations, and real-time availability.

3. Smart Search & Filters
Location-Based: Search by city or specific coordinates.

Granular Filters: Narrow results by price range, guest count and date availability.

4. Booking Engine & Payments
Availability Check: Real-time calendar verification to prevent double-booking.

Payment Integration: Secure checkout via Razorpay; bookings are only confirmed upon successful transaction.

Cancellation: Refund will be generated and status can be viewed

5. Review & Rating System
User Feedback: Guests can rate stays and leave text reviews after their visit.

Analytics: Automatic calculation of average property ratings for search ranking.

6. Admin Dashboard
User Management: Ability to approve, block user accounts.

Quality Control: Review and approve property listings before they go live.

Insights: Comprehensive dashboard featuring revenue charts and booking trends.

📂 Database Schema (MySQL)
The system utilizes a relational structure to ensure data integrity:

users: Stores profile and role information.

properties & property_images: Stores listing details and media links.

bookings & payments: Tracks financial and reservation history.

availability_calendar: Manages date-specific property status.

reviews & ratings: Stores user feedback.

::Getting Started::

Prerequisites
Node.js (v16+)

MySQL Server

Keep DB in local storage

Razorpay API Keys

Installation
Clone the repository:

Bash
git clone https://github.com/your-username/property-rental-system.git
Install Dependencies:

Bash
# In the root, backend, and frontend folders
npm install
Environment Variables:
Create a .env file in both backend and frontend folders (use .env.example as a template). Do not commit these files.

Run the App:

Bash
# Run backend
npm start
# Run frontend
npm run dev

Some Issues 
->Edge Case in the Booking logic, ex- Suppose a user check-in on 18 and checkout on 19 and some other user checkin on 20 and checkout on 21 then someOne should be able to checkin on 19 and chekout on 20 but checkout on 20 gets blocked due to logic as made. So this will be solved later.

->Images display of Properties are not dynamic, that needs to get changed

Some Improvements
->Edit Property Option is not there, this need to addOn

->Refund Generation Razorpay Inegration is pending, refunds are not getting processed for now they are just showing us the STATUS->PENDING in user Profile, so we need to improve that too 

->UI/UX designing can be improved along with media queries


