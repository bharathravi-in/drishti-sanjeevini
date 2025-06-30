# 🌟 DRiSHTi SANjEEViNi - Building Communities That Care

A modern, full-featured social platform designed to connect people who need help with those who want to help, fostering genuine community support and meaningful connections.

## ✨ Features

### 🔐 Authentication & Profiles
- **Secure Authentication** with Supabase Auth
- **Role-based System**: Seekers (need help) and Supporters (offer help)
- **Rich User Profiles** with photos, interests, and location
- **Profile Completion** tracking and guidance

### 📱 Social Features
- **Post Creation** with text, images, and videos
- **Interactive Feed** with infinite scroll
- **Comments & Replies** with threaded conversations
- **Like System** with real-time updates
- **Follow System** to connect with community members

### 🔍 Discovery & Exploration
- **Advanced Search** with filters by interests, location, and content type
- **Trending Posts** based on engagement metrics
- **Interest-based Filtering** to find relevant content
- **User Discovery** to find like-minded community members

### 💬 Communication
- **Private Messaging** between users
- **Real-time Notifications** for likes, comments, and follows
- **Notification Center** with read/unread status

### 🛡️ Safety & Moderation
- **Content Reporting** system with multiple categories
- **Admin Dashboard** for content moderation
- **Row Level Security** (RLS) for data protection
- **Privacy Controls** and secure data handling

### 📊 Analytics (Admin)
- **User Engagement Metrics** and growth tracking
- **Content Analytics** with top contributors
- **Community Health** monitoring
- **Real-time Statistics** dashboard

### 🌍 Accessibility & Internationalization
- **Multi-language Support** (English, Hindi, Arabic)
- **RTL Language Support** for Arabic
- **Dark/Light Theme** with system preference detection
- **Responsive Design** for all device sizes

## 🚀 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hot Toast** for notifications
- **Vite** for development and building

### Backend
- **Supabase** for database, authentication, and storage
- **PostgreSQL** with Row Level Security
- **Real-time Subscriptions** for live updates
- **Edge Functions** for server-side logic

### Key Libraries
- `@supabase/supabase-js` - Database and auth client
- `lucide-react` - Beautiful icons
- `react-hot-toast` - Toast notifications

## 📁 Project Structure

```
src/
├── components/
│   ├── analytics/          # Admin analytics dashboard
│   ├── auth/              # Authentication forms
│   ├── explore/           # Search and discovery
│   ├── follows/           # Follow system
│   ├── layout/            # App layout and navigation
│   ├── messaging/         # Private messaging
│   ├── notifications/     # Notification system
│   ├── posts/             # Post creation and feed
│   ├── profile/           # User profiles
│   └── ui/                # Reusable UI components
├── context/               # React contexts
├── lib/                   # Supabase configuration
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Environment Variables
Create a `.env` file with:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd drishthi-sanjeevini

# Install dependencies
npm install

# Start development server
npm run dev
```

### Database Setup
1. Create a new Supabase project
2. Run the migration files in `supabase/migrations/` in order
3. Set up storage buckets for media and profile assets
4. Configure Row Level Security policies

## 🗄️ Database Schema

### Core Tables
- **users** - User profiles and authentication
- **posts** - User-generated content
- **comments** - Post comments with threading
- **likes** - Post likes and reactions
- **follows** - User follow relationships
- **notifications** - Real-time notifications
- **reports** - Content moderation reports
- **messages** - Private messaging

### Key Features
- **Row Level Security** on all tables
- **Real-time subscriptions** for live updates
- **Optimized indexes** for performance
- **Foreign key constraints** for data integrity

## 🎨 Design System

### Colors
- **Primary**: Green (#059669) - Community and growth
- **Secondary**: Blue (#2563EB) - Trust and support
- **Accent**: Purple (#7C3AED) - Creativity and connection

### Typography
- **Headings**: Bold, clear hierarchy
- **Body**: Readable with proper line spacing
- **UI Text**: Consistent sizing and weights

### Components
- **Cards**: Consistent shadow and border radius
- **Buttons**: Multiple variants with hover states
- **Forms**: Accessible with proper validation
- **Navigation**: Intuitive with clear active states

## 🌐 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy with automatic builds

### Supabase Configuration
1. Ensure all migrations are applied
2. Configure storage buckets
3. Set up email templates (optional)
4. Enable real-time features

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Storage buckets created
- [ ] RLS policies enabled
- [ ] Email authentication configured
- [ ] Domain configured (if custom)

## 🔒 Security Features

### Authentication
- **Secure password requirements**
- **Email verification** (configurable)
- **Session management** with automatic refresh

### Data Protection
- **Row Level Security** on all tables
- **Input validation** and sanitization
- **CORS configuration** for API security
- **Rate limiting** on sensitive operations

### Privacy
- **Granular privacy controls**
- **Data encryption** in transit and at rest
- **Audit logging** for admin actions
- **GDPR compliance** considerations

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Use consistent naming conventions
3. Write meaningful commit messages
4. Test thoroughly before submitting

### Code Style
- Use Prettier for formatting
- Follow ESLint rules
- Use semantic HTML
- Maintain accessibility standards

## 📱 Mobile Experience

### Responsive Design
- **Mobile-first** approach
- **Touch-friendly** interactions
- **Optimized performance** on mobile devices
- **Progressive Web App** features

### Navigation
- **Bottom navigation** on mobile
- **Swipe gestures** for natural interaction
- **Optimized layouts** for small screens

## 🔮 Future Enhancements

### Planned Features
- **Video calling** for community support
- **Event organization** and management
- **Skill sharing** marketplace
- **Community challenges** and goals
- **Integration** with local services

### Technical Improvements
- **Offline support** with service workers
- **Push notifications** for mobile
- **Advanced analytics** with charts
- **Performance optimizations**

## 📞 Support

### Getting Help
- Check the documentation first
- Search existing issues
- Create detailed bug reports
- Join our community discussions

### Contact
- **Email**: support@drishtisanjeevini.com
- **Community**: [Discord/Slack link]
- **Documentation**: [Docs link]

---

## 🙏 Acknowledgments

Built with love for communities that care. Special thanks to:
- **Supabase** for the amazing backend platform
- **Tailwind CSS** for the beautiful design system
- **React** community for excellent tooling
- **Open source contributors** who make this possible

---

**DRiSHTi SANjEEViNi** - *Building Communities That Care* 💚

*Made with ❤️ for stronger, more connected communities*