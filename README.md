# CabMate 🚗

A modern, intuitive carpooling web application built with React and Supabase that connects drivers and passengers for shared rides.

## 🌟 What CabMate Can Do

CabMate is a comprehensive ride-sharing platform that enables users to:

### 🔍 **Find Rides**
- **Smart Location Search**: Search for rides using Google Maps-powered location autocomplete
- **Route-Based Matching**: Find rides based on proximity to your origin and destination (within 5km radius)
- **Quick Route Selection**: Pre-configured common routes for popular destinations (Station to Hostel, Airport to Hostel)
- **Real-Time Updates**: Live updates when new rides are created that match your search criteria
- **Intelligent Swapping**: Easily swap "From" and "To" locations with one click

### 🚗 **Create & Manage Rides**
- **Easy Ride Creation**: Create rides with precise location selection using Google Maps
- **Flexible Scheduling**: Set departure times with date and time picker
- **Capacity Management**: Specify number of available seats
- **Cost Sharing**: Set cost per seat for fair expense sharing
- **Real-Time Tracking**: Monitor seat availability and passenger requests

### 👥 **Passenger Management**
- **Join Requests**: Send requests to join rides with one click
- **Approval System**: Drivers can approve or manage pending passenger requests
- **Passenger List**: View all approved passengers for transparency
- **Status Tracking**: See your request status (pending, approved) in real-time

### 📱 **User Experience**
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Material-UI Interface**: Clean, modern interface following Google's Material Design
- **Smart Notifications**: Toast notifications for actions and status updates
- **Session Management**: Secure authentication with Supabase Auth

### 👤 **Profile & Account Management**
- **User Profiles**: Create and manage your profile with full name and contact info
- **Secure Authentication**: Email-based login with password reset functionality
- **My Rides Dashboard**: View all rides you've created and joined in one place
- **Ride History**: Track your carpooling activity

### 🗺️ **Location Features**
- **Google Maps Integration**: Powered by Google Maps API for accurate location services
- **Address Autocomplete**: Smart address suggestions as you type
- **Coordinate Precision**: GPS coordinates stored for exact pickup/dropoff locations
- **Location Display**: Both full addresses and short display names for clarity

## 🚀 Key Features

- **Real-Time Collaboration**: Live updates across all users using Supabase real-time subscriptions
- **Progressive Web App**: Installable PWA with offline-ready capabilities
- **Secure Backend**: Supabase handles authentication, database, and real-time features
- **Mobile-First Design**: Optimized for mobile use with responsive layouts
- **Fast Performance**: Built with Vite for lightning-fast development and production builds

## 🛠️ Technology Stack

- **Frontend**: React 19, Material-UI, React Router
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Maps**: Google Maps JavaScript API
- **Build Tool**: Vite
- **PWA**: Vite PWA Plugin
- **Deployment**: Ready for Vercel, Netlify, or any static hosting

## 📋 Prerequisites

Before running CabMate, you'll need:

1. **Node.js** (v18 or higher)
2. **Google Maps API Key** with Places API enabled
3. **Supabase Project** with the following setup:
   - Authentication enabled
   - Database tables configured (see Database Schema below)
   - RLS policies configured

## ⚙️ Environment Setup

Create a `.env` file in the root directory with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## 🗄️ Database Schema

CabMate requires the following Supabase tables:

### `profiles` table
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `rides` table
```sql
CREATE TABLE rides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES auth.users(id) NOT NULL,
  from_address TEXT NOT NULL,
  from_display TEXT,
  from_lat FLOAT NOT NULL,
  from_lng FLOAT NOT NULL,
  to_address TEXT NOT NULL,
  to_display TEXT,
  to_lat FLOAT NOT NULL,
  to_lng FLOAT NOT NULL,
  departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
  seats_available INTEGER NOT NULL DEFAULT 1,
  cost_per_seat DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `ride_passengers` table
```sql
CREATE TABLE ride_passengers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ride_id, user_id)
);
```

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/EmperorsReign05/CabMate.git
   cd CabMate
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - Fill in your Supabase and Google Maps API credentials

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Visit the application**:
   Open [http://localhost:5173](http://localhost:5173) in your browser

## 🎯 How to Use CabMate

### For Passengers:
1. **Search for Rides**: Use the search form on the homepage to find rides
2. **Request to Join**: Click on any ride to view details and request to join
3. **Track Status**: Monitor your request status in the ride details
4. **Manage Profile**: Update your profile information for better connections

### For Drivers:
1. **Create Rides**: Use the "+" button to create new rides
2. **Manage Requests**: Review and approve passenger requests from ride details
3. **Track Rides**: View all your created rides in "My Rides"
4. **Update Availability**: Seats automatically update as passengers are approved

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you have any questions or need help setting up CabMate, please:
- Check the documentation above
- Open an issue on GitHub
- Contact the development team

---

**Built with ❤️ for the carpooling community**
