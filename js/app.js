/**
 * ShoreSquad - Beach Cleanup Community App
 * Modern, performance-focused JavaScript with PWA features
 */

class ShoreSquadApp {
  constructor() {
    this.isOnline = navigator.onLine;
    this.currentLocation = null;
    this.events = [];
    this.weatherData = null;
    this.deferredPrompt = null;
    
    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    this.bindEvents();
    this.checkGeolocation();
    this.loadMockData();
    this.setupPWA();
    this.updateDateTime();
    this.optimizePerformance();
    
    console.log('🌊 ShoreSquad initialized successfully!');
  }

  /**
   * Bind all event listeners
   */
  bindEvents() {
    // Navigation
    this.setupNavigation();
    
    // Buttons
    this.bindButton('#get-started-btn', this.handleGetStarted.bind(this));
    this.bindButton('#find-events-btn', this.findNearbyEvents.bind(this));
    this.bindButton('#enable-location-btn', this.requestLocation.bind(this));
    
    // Map controls
    this.bindMapControls();
    
    // Event filters
    this.bindEventFilters();
    
    // PWA install
    this.bindButton('#install-app-btn', this.installApp.bind(this));
    this.bindButton('#dismiss-install-btn', this.dismissInstallPrompt.bind(this));
    
    // Network status
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // PWA install prompt
    window.addEventListener('beforeinstallprompt', this.handleInstallPrompt.bind(this));
    
    // Intersection Observer for animations
    this.setupScrollAnimations();
  }

  /**
   * Setup responsive navigation
   */
  setupNavigation() {
    const navToggle = document.querySelector('.nav__toggle');
    const navMenu = document.querySelector('.nav__menu');
    
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('nav__menu--open');
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
          navToggle.setAttribute('aria-expanded', 'false');
          navMenu.classList.remove('nav__menu--open');
        }
      });
      
      // Close menu on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          navToggle.setAttribute('aria-expanded', 'false');
          navMenu.classList.remove('nav__menu--open');
        }
      });
    }

    // Bottom navigation highlighting
    this.setupBottomNavigation();
  }

  /**
   * Setup bottom navigation active states
   */
  setupBottomNavigation() {
    const bottomNavItems = document.querySelectorAll('.bottom-nav__item');
    const sections = document.querySelectorAll('section[id]');
    
    // Highlight current section
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const targetId = entry.target.id;
          bottomNavItems.forEach(item => {
            item.classList.remove('bottom-nav__item--active');
            if (item.getAttribute('href').includes(targetId)) {
              item.classList.add('bottom-nav__item--active');
            }
          });
        }
      });
    }, {
      threshold: 0.3
    });
    
    sections.forEach(section => observer.observe(section));
  }

  /**
   * Bind event listener to element
   */
  bindButton(selector, handler) {
    const element = document.querySelector(selector);
    if (element) {
      element.addEventListener('click', handler);
    }
  }

  /**
   * Setup map controls
   */
  bindMapControls() {
    const controls = document.querySelectorAll('.map-control');
    controls.forEach(control => {
      control.addEventListener('click', () => {
        // Toggle active state
        controls.forEach(c => c.setAttribute('aria-pressed', 'false'));
        control.setAttribute('aria-pressed', 'true');
        
        // Handle map layer changes
        const controlType = control.id.replace('show-', '').replace('-btn', '');
        this.toggleMapLayer(controlType);
      });
    });
  }

  /**
   * Toggle map layers (placeholder functionality)
   */
  toggleMapLayer(layer) {
    console.log(`🗺️ Toggling ${layer} layer`);
    
    // Simulate map layer changes
    const mapPlaceholder = document.querySelector('.map-placeholder__content p');
    if (mapPlaceholder) {
      const layerTexts = {
        events: 'Showing cleanup events...',
        weather: 'Showing weather data...',
        crews: 'Showing crew locations...'
      };
      mapPlaceholder.textContent = layerTexts[layer] || 'Interactive map loading...';
    }
  }

  /**
   * Setup event filtering
   */
  bindEventFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active state
        filterButtons.forEach(b => b.classList.remove('filter-btn--active'));
        btn.classList.add('filter-btn--active');
        
        // Filter events
        const filter = btn.dataset.filter;
        this.filterEvents(filter);
      });
    });
  }

  /**
   * Filter events based on criteria
   */
  filterEvents(filter) {
    console.log(`🔍 Filtering events by: ${filter}`);
    
    let filteredEvents = this.events;
    
    switch (filter) {
      case 'this-week':
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        filteredEvents = this.events.filter(event => 
          new Date(event.date) <= weekFromNow
        );
        break;
        
      case 'weekend':
        filteredEvents = this.events.filter(event => {
          const eventDate = new Date(event.date);
          const day = eventDate.getDay();
          return day === 0 || day === 6; // Sunday or Saturday
        });
        break;
        
      case 'my-crews':
        filteredEvents = this.events.filter(event => 
          event.userJoined || event.crewMember
        );
        break;
        
      default: // 'all'
        filteredEvents = this.events;
    }
    
    this.renderEvents(filteredEvents);
  }

  /**
   * Handle get started button click
   */
  handleGetStarted() {
    console.log('🚀 Get started clicked');
    
    // Smooth scroll to events section
    const eventsSection = document.getElementById('events');
    if (eventsSection) {
      eventsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    
    // Show welcome notification
    this.showNotification('Welcome to ShoreSquad! 🌊', 'success');
  }

  /**
   * Find nearby events using geolocation
   */
  async findNearbyEvents() {
    console.log('📍 Finding nearby events...');
    
    if (!this.currentLocation) {
      await this.requestLocation();
    }
    
    if (this.currentLocation) {
      // Filter events by proximity (mock implementation)
      const nearbyEvents = this.events.filter(event => {
        const distance = this.calculateDistance(
          this.currentLocation,
          { lat: event.latitude, lng: event.longitude }
        );
        return distance <= 50; // Within 50km
      });
      
      this.renderEvents(nearbyEvents);
      this.showNotification(`Found ${nearbyEvents.length} events near you! 📍`, 'success');
      
      // Scroll to events
      document.getElementById('events')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    }
  }

  /**
   * Request user's location
   */
  async requestLocation() {
    if (!navigator.geolocation) {
      this.showNotification('Geolocation is not supported by this browser.', 'error');
      return;
    }

    return new Promise((resolve, reject) => {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          console.log('📍 Location acquired:', this.currentLocation);
          this.showNotification('Location enabled! 🎯', 'success');
          this.updateWeatherForLocation();
          resolve(this.currentLocation);
        },
        (error) => {
          console.error('Geolocation error:', error);
          let message = 'Unable to get your location. ';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message += 'Please enable location permissions.';
              break;
            case error.POSITION_UNAVAILABLE:
              message += 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              message += 'Location request timed out.';
              break;
          }
          
          this.showNotification(message, 'error');
          reject(error);
        },
        options
      );
    });
  }

  /**
   * Check if geolocation is available
   */
  checkGeolocation() {
    if (navigator.geolocation) {
      // Auto-request location if previously granted
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          this.requestLocation();
        }
      });
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(coord1, coord2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(coord2.lat - coord1.lat);
    const dLng = this.toRadians(coord2.lng - coord1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(coord1.lat)) * Math.cos(this.toRadians(coord2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  /**
   * Convert degrees to radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Load mock data for demo purposes
   */
  loadMockData() {
    // Mock events data
    this.events = [
      {
        id: 1,
        title: 'Bondi Beach Cleanup',
        date: '2024-12-08',
        time: '09:00',
        location: 'Bondi Beach, Sydney',
        latitude: -33.8915,
        longitude: 151.2767,
        participants: 24,
        organizer: 'Sydney Shore Squad',
        description: 'Join us for a morning cleanup at beautiful Bondi Beach!',
        userJoined: true
      },
      {
        id: 2,
        title: 'Manly Cove Community Clean',
        date: '2024-12-14',
        time: '10:00',
        location: 'Manly Cove, Sydney',
        latitude: -33.7969,
        longitude: 151.2840,
        participants: 18,
        organizer: 'Northern Beaches Crew',
        description: 'Weekend cleanup with the local community. All welcome!',
        userJoined: false
      },
      {
        id: 3,
        title: 'Coogee Coastal Care',
        date: '2024-12-15',
        time: '08:30',
        location: 'Coogee Beach, Sydney',
        latitude: -33.9249,
        longitude: 151.2578,
        participants: 32,
        organizer: 'Eastern Suburbs Squad',
        description: 'Early bird cleanup session. Coffee and pastries provided!',
        userJoined: false,
        crewMember: true
      }
    ];

    // Mock weather data
    this.weatherData = {
      current: {
        temperature: 22,
        condition: '☀️',
        description: 'Sunny',
        wind: 15,
        humidity: 65,
        uvIndex: 6
      },
      forecast: [
        { day: 'Today', temp: 22, condition: '☀️', status: 'perfect' },
        { day: 'Tomorrow', temp: 20, condition: '⛅', status: 'good' },
        { day: 'Wednesday', temp: 18, condition: '🌧️', status: 'poor' },
        { day: 'Thursday', temp: 25, condition: '☀️', status: 'perfect' },
        { day: 'Friday', temp: 23, condition: '⛅', status: 'good' }
      ]
    };

    this.renderEvents(this.events);
    this.renderWeather();
  }

  /**
   * Render events to the DOM
   */
  renderEvents(events) {
    const eventsGrid = document.getElementById('events-grid');
    const eventsLoading = document.getElementById('events-loading');
    
    if (!eventsGrid) return;

    // Show loading
    if (eventsLoading) {
      eventsLoading.setAttribute('aria-hidden', 'false');
    }

    // Simulate loading delay
    setTimeout(() => {
      eventsGrid.innerHTML = events.map(event => `
        <article class="event-card" data-event-id="${event.id}">
          <div class="event-card__header">
            <div class="event-card__date">
              <span class="event-card__day">${this.formatDate(event.date, 'day')}</span>
              <span class="event-card__month">${this.formatDate(event.date, 'month')}</span>
            </div>
            <div class="event-card__status ${event.userJoined ? 'event-card__status--joined' : ''}">
              ${event.userJoined ? '✓ Joined' : '+ Join'}
            </div>
          </div>
          
          <div class="event-card__content">
            <h3 class="event-card__title">${event.title}</h3>
            <div class="event-card__details">
              <div class="event-card__detail">
                <span class="event-card__icon">📍</span>
                <span>${event.location}</span>
              </div>
              <div class="event-card__detail">
                <span class="event-card__icon">⏰</span>
                <span>${event.time}</span>
              </div>
              <div class="event-card__detail">
                <span class="event-card__icon">👥</span>
                <span>${event.participants} going</span>
              </div>
            </div>
            <p class="event-card__description">${event.description}</p>
          </div>
          
          <div class="event-card__actions">
            <button class="btn btn--primary btn--small" onclick="app.joinEvent(${event.id})">
              ${event.userJoined ? 'View Details' : 'Join Event'}
            </button>
            <button class="btn btn--text btn--small" onclick="app.shareEvent(${event.id})">
              Share
            </button>
          </div>
        </article>
      `).join('');

      // Hide loading
      if (eventsLoading) {
        eventsLoading.setAttribute('aria-hidden', 'true');
      }

      // Add event card styles
      this.addEventCardStyles();
    }, 800);
  }

  /**
   * Join an event
   */
  joinEvent(eventId) {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.userJoined = !event.userJoined;
      event.participants += event.userJoined ? 1 : -1;
      
      this.showNotification(
        event.userJoined ? 
          `Joined "${event.title}"! 🎉` : 
          `Left "${event.title}"`, 
        'success'
      );
      
      this.renderEvents(this.events);
    }
  }

  /**
   * Share an event
   */
  shareEvent(eventId) {
    const event = this.events.find(e => e.id === eventId);
    if (!event) return;

    const shareData = {
      title: `ShoreSquad: ${event.title}`,
      text: `Join us for a beach cleanup! ${event.description}`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
      navigator.clipboard.writeText(shareText).then(() => {
        this.showNotification('Event details copied to clipboard! 📋', 'success');
      });
    }
  }

  /**
   * Add dynamic event card styles
   */
  addEventCardStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .event-card {
        background: white;
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-base);
        padding: var(--spacing-6);
        transition: transform var(--transition-base), box-shadow var(--transition-base);
        border-left: 4px solid var(--color-primary);
      }
      
      .event-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-xl);
      }
      
      .event-card__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--spacing-4);
      }
      
      .event-card__date {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: var(--color-primary);
        color: white;
        padding: var(--spacing-2);
        border-radius: var(--radius-base);
        min-width: 50px;
      }
      
      .event-card__day {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        line-height: 1;
      }
      
      .event-card__month {
        font-size: var(--font-size-xs);
        text-transform: uppercase;
        opacity: 0.9;
      }
      
      .event-card__status {
        padding: var(--spacing-1) var(--spacing-3);
        background: var(--color-gray-100);
        color: var(--color-gray-600);
        border-radius: var(--radius-full);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
      }
      
      .event-card__status--joined {
        background: var(--color-success);
        color: white;
      }
      
      .event-card__title {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        margin-bottom: var(--spacing-3);
        color: var(--color-gray-900);
      }
      
      .event-card__details {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
        margin-bottom: var(--spacing-3);
      }
      
      .event-card__detail {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        color: var(--color-gray-600);
        font-size: var(--font-size-sm);
      }
      
      .event-card__icon {
        width: 16px;
        text-align: center;
      }
      
      .event-card__description {
        color: var(--color-gray-600);
        font-size: var(--font-size-sm);
        line-height: 1.5;
        margin-bottom: var(--spacing-4);
      }
      
      .event-card__actions {
        display: flex;
        gap: var(--spacing-3);
      }
    `;
    
    // Only add if not already added
    if (!document.querySelector('#event-card-styles')) {
      style.id = 'event-card-styles';
      document.head.appendChild(style);
    }
  }

  /**
   * Render weather information
   */
  renderWeather() {
    if (!this.weatherData) return;

    const { current, forecast } = this.weatherData;

    // Update current weather
    this.updateElement('#current-weather-icon', current.condition);
    this.updateElement('#current-temp', current.temperature);
    this.updateElement('#current-wind', `${current.wind} km/h`);
    this.updateElement('#current-humidity', `${current.humidity}%`);
    this.updateElement('#current-uv', current.uvIndex);

    // Update cleanup status
    const cleanupStatus = this.getCleanupStatus(current);
    this.updateElement('#cleanup-status', cleanupStatus.message);
    const statusElement = document.getElementById('cleanup-status');
    if (statusElement) {
      statusElement.className = `cleanup-status cleanup-status--${cleanupStatus.level}`;
    }

    // Render forecast
    const forecastContainer = document.getElementById('weather-forecast');
    if (forecastContainer) {
      forecastContainer.innerHTML = forecast.map(day => `
        <div class="weather-card weather-card--forecast">
          <h4 class="weather-card__day">${day.day}</h4>
          <div class="weather-card__forecast-icon">${day.condition}</div>
          <div class="weather-card__forecast-temp">${day.temp}°C</div>
          <div class="cleanup-status cleanup-status--${day.status}">
            ${this.getStatusEmoji(day.status)} ${this.getStatusText(day.status)}
          </div>
        </div>
      `).join('');
    }
  }

  /**
   * Get cleanup status based on weather
   */
  getCleanupStatus(weather) {
    if (weather.temperature > 30 || weather.uvIndex > 8) {
      return { level: 'poor', message: 'Too hot - stay hydrated! ☀️🥵' };
    } else if (weather.wind > 25) {
      return { level: 'poor', message: 'Too windy - wait for calmer weather 💨' };
    } else if (weather.temperature < 10) {
      return { level: 'ok', message: 'Chilly - dress warmly! 🧥' };
    } else if (weather.temperature >= 18 && weather.temperature <= 25 && weather.wind < 20) {
      return { level: 'good', message: 'Perfect for cleanup! 🌟' };
    } else {
      return { level: 'ok', message: 'Good conditions 👍' };
    }
  }

  /**
   * Get status emoji
   */
  getStatusEmoji(status) {
    const emojis = {
      perfect: '🌟',
      good: '👍',
      ok: '⚠️',
      poor: '❌'
    };
    return emojis[status] || '❓';
  }

  /**
   * Get status text
   */
  getStatusText(status) {
    const texts = {
      perfect: 'Perfect',
      good: 'Good',
      ok: 'Okay',
      poor: 'Poor'
    };
    return texts[status] || 'Unknown';
  }

  /**
   * Update weather based on current location
   */
  updateWeatherForLocation() {
    if (!this.currentLocation) return;

    // Simulate API call to get location-specific weather
    console.log('🌤️ Updating weather for location:', this.currentLocation);
    
    // For demo, just update the location name
    const locationElement = document.querySelector('.weather-card__location');
    if (locationElement) {
      locationElement.textContent = 'Your Location';
    }
  }

  /**
   * Update element content safely
   */
  updateElement(selector, content) {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = content;
    }
  }

  /**
   * Format date
   */
  formatDate(dateString, format) {
    const date = new Date(dateString);
    
    switch (format) {
      case 'day':
        return date.getDate().toString();
      case 'month':
        return date.toLocaleDateString('en-US', { month: 'short' });
      default:
        return date.toLocaleDateString();
    }
  }

  /**
   * Update date and time
   */
  updateDateTime() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
      const now = new Date();
      dateElement.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    // Update every minute
    setInterval(() => {
      this.updateDateTime();
    }, 60000);
  }

  /**
   * Setup scroll-triggered animations
   */
  setupScrollAnimations() {
    const animatedElements = document.querySelectorAll(
      '.feature-card, .weather-card, .hero__content'
    );

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  }

  /**
   * Show notification to user
   */
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
      <span class="notification__message">${message}</span>
      <button class="notification__close" aria-label="Close notification">&times;</button>
    `;

    // Add styles if not already present
    this.addNotificationStyles();

    // Add to DOM
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    const timeout = setTimeout(() => {
      this.removeNotification(notification);
    }, 5000);

    // Handle close button
    const closeBtn = notification.querySelector('.notification__close');
    closeBtn.addEventListener('click', () => {
      clearTimeout(timeout);
      this.removeNotification(notification);
    });

    // Animate in
    requestAnimationFrame(() => {
      notification.classList.add('notification--show');
    });
  }

  /**
   * Remove notification
   */
  removeNotification(notification) {
    notification.classList.remove('notification--show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  /**
   * Add notification styles
   */
  addNotificationStyles() {
    if (document.querySelector('#notification-styles')) return;

    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        padding: var(--spacing-4);
        display: flex;
        align-items: center;
        gap: var(--spacing-3);
        z-index: var(--z-modal);
        transform: translateX(100%);
        transition: transform var(--transition-base);
        max-width: 400px;
        border-left: 4px solid var(--color-primary);
      }
      
      .notification--show {
        transform: translateX(0);
      }
      
      .notification--success {
        border-left-color: var(--color-success);
      }
      
      .notification--error {
        border-left-color: var(--color-secondary);
      }
      
      .notification__message {
        flex: 1;
        color: var(--color-gray-800);
        font-weight: var(--font-weight-medium);
      }
      
      .notification__close {
        background: none;
        border: none;
        font-size: var(--font-size-xl);
        color: var(--color-gray-400);
        cursor: pointer;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-base);
        transition: color var(--transition-fast);
      }
      
      .notification__close:hover {
        color: var(--color-gray-600);
        background: var(--color-gray-100);
      }
      
      @media (max-width: 640px) {
        .notification {
          left: 20px;
          right: 20px;
          max-width: none;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Setup Progressive Web App features
   */
  setupPWA() {
    // Handle install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('PWA is installed and running in standalone mode');
    }
  }

  /**
   * Handle PWA install prompt
   */
  handleInstallPrompt(e) {
    e.preventDefault();
    this.deferredPrompt = e;
    this.showInstallPrompt();
  }

  /**
   * Show PWA install prompt
   */
  showInstallPrompt() {
    const installPrompt = document.getElementById('install-prompt');
    if (installPrompt && this.deferredPrompt) {
      installPrompt.setAttribute('aria-hidden', 'false');
    }
  }

  /**
   * Install PWA
   */
  async installApp() {
    if (!this.deferredPrompt) return;

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      console.log(`PWA install ${outcome}`);
      
      if (outcome === 'accepted') {
        this.showNotification('ShoreSquad installed successfully! 📱', 'success');
      }
      
      this.deferredPrompt = null;
      this.dismissInstallPrompt();
    } catch (error) {
      console.error('PWA install failed:', error);
    }
  }

  /**
   * Dismiss install prompt
   */
  dismissInstallPrompt() {
    const installPrompt = document.getElementById('install-prompt');
    if (installPrompt) {
      installPrompt.setAttribute('aria-hidden', 'true');
    }
  }

  /**
   * Handle online event
   */
  handleOnline() {
    this.isOnline = true;
    console.log('📶 Back online');
    this.showNotification('You\'re back online! 📶', 'success');
  }

  /**
   * Handle offline event
   */
  handleOffline() {
    this.isOnline = false;
    console.log('📴 Gone offline');
    this.showNotification('You\'re offline. Some features may be limited. 📴', 'info');
  }

  /**
   * Optimize performance
   */
  optimizePerformance() {
    // Lazy load images when implemented
    this.setupLazyLoading();
    
    // Debounce scroll events
    this.debounceScrollEvents();
    
    // Preload critical resources
    this.preloadCriticalResources();
  }

  /**
   * Setup lazy loading for images
   */
  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const images = document.querySelectorAll('img[data-src]');
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    }
  }

  /**
   * Debounce scroll events
   */
  debounceScrollEvents() {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Handle scroll-based functionality here
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  /**
   * Preload critical resources
   */
  preloadCriticalResources() {
    // Preload fonts
    const fontLinks = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
      'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap'
    ];
    
    fontLinks.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      document.head.appendChild(link);
    });
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ShoreSquadApp();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShoreSquadApp;
}