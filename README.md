# ShoreSquad 🌊

> Rally your crew, track weather, and hit the next beach cleanup with our dope map app!

## 🎯 Project Overview

ShoreSquad is a modern Progressive Web App (PWA) designed to mobilize young people for beach cleanup activities. The app combines social features, weather tracking, and interactive maps to make environmental action fun and connected.

## ✨ Features

### 🗺️ **Interactive Map**
- Real-time cleanup event discovery
- **Embedded Google Maps** showing next cleanup at Pasir Ris Beach
- Location-based event filtering
- Weather overlay integration
- Crew location sharing
- **Coordinates**: 1.381497, 103.955574 (Street View Asia)

### 🌤️ **Smart Weather Tracking**
- **Real-time conditions** from Singapore NEA API (data.gov.sg)
- **7-day forecast** with cleanup suitability indicators
- **Location-specific data** for Pasir Ris Beach area
- **Automatic fallback** to offline data when needed
- **Professional weather assessment** for safe cleanup planning

### 👥 **Social Community**
- Crew formation and management
- Event creation and joining
- Achievement tracking and badges
- Photo sharing and impact visualization

### 📱 **Progressive Web App**
- Offline functionality with Service Worker
- Push notifications for events
- Install prompt for native app experience
- Responsive mobile-first design

## 🎨 Design System

### Color Palette
- **Primary Ocean Blue**: `#2E86AB` - Trust, reliability, ocean connection
- **Vibrant Coral**: `#F24236` - Energy, urgency for environmental action  
- **Sandy Beige**: `#F6AE2D` - Warmth, beach vibes
- **Sea Foam Green**: `#55A3A3` - Nature, cleanliness, growth
- **Clean White**: `#FFFFFF` - Cleanliness, clarity
- **Deep Navy**: `#1E3A5F` - Depth, professionalism

### Typography
- **Primary**: Poppins (headings, bold elements)
- **Secondary**: Inter (body text, UI elements)

## 🚀 Getting Started

### Prerequisites
- Node.js (for development server)
- Modern web browser with JavaScript enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ShoreSquad
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

5. **Setup Google Maps (Optional)**
   - See `GOOGLE_MAPS_SETUP.md` for detailed instructions
   - Get a Google Maps API key for full functionality
   - The map will show basic functionality without an API key

### NPM Scripts
- `npm start` - Start Live Server on all interfaces (0.0.0.0:3000)
- `npm run dev` - Start development server with file watching
- `npm run serve` - Basic Live Server with default settings

## 📁 Project Structure

```
ShoreSquad/
├── css/
│   └── styles.css          # Main stylesheet with design system
├── js/
│   └── app.js             # Core application JavaScript
├── assets/                # Images, icons, and media files
├── index.html             # Main HTML file
├── manifest.json          # PWA manifest
├── sw.js                  # Service Worker for offline functionality
├── package.json           # Dependencies and scripts
├── .gitignore            # Git ignore rules
├── README.md             # This file
├── GOOGLE_MAPS_SETUP.md  # Google Maps API setup instructions
└── NEA_WEATHER_API.md    # Singapore NEA weather API documentation
```

## 🛠️ Technical Implementation

### JavaScript Features
- **ES6+ Modern Syntax**: Classes, arrow functions, async/await
- **Progressive Web App**: Service Worker, manifest, offline support
- **Real Weather API**: NEA Singapore data integration with fallbacks
- **Geolocation API**: Location-based features
- **Intersection Observer**: Performance-optimized animations
- **Local Storage**: User preferences and offline data
- **Fetch API**: Efficient data loading with error handling

### CSS Features
- **CSS Custom Properties**: Comprehensive design system
- **Mobile-First Design**: Responsive breakpoints
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Optimized animations and transitions
- **Modern Layout**: CSS Grid and Flexbox

### Accessibility Features
- Semantic HTML5 structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Reduced motion preferences
- Focus indicators
- Skip links

## 🌐 Browser Support

- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Mobile**: iOS Safari 14+, Chrome Mobile 88+
- **PWA Features**: Service Worker supported browsers
- **Fallbacks**: Graceful degradation for older browsers

## 🔧 Development

### Live Reloading
The project uses Live Server for development with automatic reloading when CSS or JS files change.

### Performance Optimization
- Lazy loading for images
- Debounced scroll events
- Resource preloading
- Minification ready
- Service Worker caching

### PWA Features
- Offline functionality
- Install prompt
- Push notifications
- Background sync
- App-like experience

## 🧪 Testing

Currently using manual testing. Future enhancements will include:
- Unit tests for JavaScript functions
- Integration tests for user flows
- Accessibility testing
- Performance auditing

## 📱 Mobile Experience

ShoreSquad is designed mobile-first with:
- Thumb-friendly navigation
- Bottom navigation bar
- Swipe gestures ready
- Touch-optimized controls
- Responsive images
- Fast loading times

## 🌱 Environmental Impact

ShoreSquad aims to:
- Mobilize community action for ocean cleanup
- Gamify environmental responsibility
- Track and visualize collective impact
- Build lasting eco-conscious habits
- Connect like-minded individuals

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Weather data integration ready for OpenWeatherMap API
- Map functionality ready for Google Maps or Mapbox
- Icon system using emoji for universal compatibility
- Design inspiration from ocean conservation movements

## 🔮 Future Enhancements

- **Real weather API integration**
- **Advanced map features** with custom markers and clustering
- Photo upload and sharing
- Gamification system with points/badges
- Push notification system
- User authentication
- Database integration
- Admin panel for event management
- Analytics dashboard
- **Multiple cleanup locations** with route planning

---

**Made with 💚 for our oceans** 🌊

*ShoreSquad - Where community meets conservation*