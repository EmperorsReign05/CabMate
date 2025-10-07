<p align="center">
A modern, responsive carpooling web application designed to replace chaotic WhatsApp groups with a structured, safe, and user-friendly platform for students to find, create, and share rides.
</p>

✨ Core Features
CabMate is packed with features designed specifically for the needs of college students:

Secure User Authentication: Full sign-in and sign-up functionality, with password reset capabilities.

Dynamic Ride Search: An intuitive homepage where users can find available rides using a location autocomplete powered by the Google Maps API.

Personalized User Dashboard: A central hub for users to see a summary of their activity, including rides created, rides joined, and upcoming trips.

Request & Approval System: A complete workflow for users to request to join a ride, and for creators to view and approve those requests.

Safe & Inclusive Rides:

Ladies-Only Rides: Female students can create and join rides that are exclusively for women, enforced by gender selection in user profiles.

Profile Verification: Users must complete their profile with their name and gender before full participation.

In-App Ride Chat: A private, real-time chat for the creator and approved passengers of a ride, allowing for easy coordination without sharing personal contact details.

Contact Sharing: Once a passenger is approved, the creator and passenger can view each other's email and phone number for direct contact if needed.

Local Cab Directory: A dedicated page with contact information for fixed-rate local cab services, providing a reliable alternative when a carpool isn't available.

Modern, Responsive UI: A beautiful, mobile-first design with a soft gradient background and rounded, "floating" UI elements for a modern user experience.

🛠️ Tech Stack
This project is built with a modern, scalable tech stack:

Frontend: React (with Vite)

Backend & Database: Supabase (PostgreSQL) for user authentication, database, and real-time features.

UI Library: Material UI (MUI) for a comprehensive set of React components.

Maps & Geolocation: Google Maps Platform API for location search and autocomplete.

Routing: React Router for client-side navigation.

Deployment: Cloudflare Pages.

🚀 Getting Started
To get a local copy up and running, follow these simple steps.

Prerequisites
Node.js (v16 or later)

npm or yarn

A Supabase account

A Google Maps Platform account with the Places API enabled

Installation & Setup
Clone the repository:

Bash

git clone https://github.com/EmperorsReign05/CabMate.git
cd cabmate
Install NPM packages:

Bash

npm install
Set up your environment variables:
Create a new file named .env in the root of your project and add your Supabase and Google Maps API keys:

VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
Run the development server:

Bash

npm run dev
Your app should now be running on http://localhost:5173 (or another port if 5173 is in use).

Database Setup
The application relies on a specific Supabase database schema and Row Level Security (RLS) policies. You will need to run the SQL scripts we developed to create the tables (rides, profiles, ride_passengers, messages) and their corresponding policies and functions.

☁️ Deployment
This project is configured for easy deployment on Cloudflare Pages.

Framework Preset: React (Vite)

Build Command: npm run build

Build Output Directory: dist

Remember to set your Supabase and Google Maps keys as environment variables in your Cloudflare project settings. You will also need to add a _redirects file to the root of your project to handle client-side routing:

/* /index.html 200