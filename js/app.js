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
    
    // NEA Singapore Weather API configuration
    this.neaApiBase = 'https://api.data.gov.sg/v1';
    this.weatherStations = {
      'pasir_ris': 'S50', // Nearest to Pasir Ris Beach
      'changi': 'S24',
      'east_coast': 'S06'
    };
    
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
    
    let filteredEvents = [...this.events]; // Create a copy
    const today = new Date();
    
    switch (filter) {
      case 'this-week':
        const weekFromNow = new Date();
        weekFromNow.setDate(today.getDate() + 7);
        filteredEvents = this.events.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= today && eventDate <= weekFromNow;
        });
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
        
      case 'all':
      default:
        filteredEvents = this.events;
    }
    
    console.log(`📊 Showing ${filteredEvents.length} of ${this.events.length} events`);
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
   * Load real data from APIs and mock events
   */
  async loadMockData() {
    // Load real weather data
    await this.loadRealWeatherData();
    
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
        description: 'Join us for a morning cleanup at beautiful Bondi Beach! We\'ll provide all equipment and refreshments.',
        userJoined: false
      },
      {
        id: 2,
        title: 'Pasir Ris Beach Cleanup',
        date: '2024-12-07',
        time: '08:00',
        location: 'Pasir Ris Beach, Singapore',
        latitude: 1.381497,
        longitude: 103.955574,
        participants: 32,
        organizer: 'East Coast Green Squad',
        description: 'Clean up our beautiful Pasir Ris Beach! Perfect for families and first-time volunteers.',
        userJoined: true
      },
      {
        id: 3,
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
        id: 4,
        title: 'Coogee Coastal Care',
        date: '2024-12-15',
        time: '08:30',
        location: 'Coogee Beach, Sydney',
        latitude: -33.9249,
        longitude: 151.2578,
        participants: 29,
        organizer: 'Eastern Suburbs Squad',
        description: 'Early bird cleanup session. Coffee and pastries provided!',
        userJoined: false,
        crewMember: true
      }
    ];

    this.renderEvents(this.events);
  }
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

    this.renderEvents(this.events);
  }

  /**
   * Render events to the DOM
   */
  renderEvents(events) {
    const eventsGrid = document.getElementById('events-grid');
    const eventsLoading = document.getElementById('events-loading');
    
    if (!eventsGrid) return;

    // Hide loading immediately since we have data
    if (eventsLoading) {
      eventsLoading.setAttribute('aria-hidden', 'true');
    }

    // Handle empty state
    if (!events || events.length === 0) {
      eventsGrid.innerHTML = `
        <div class="events__empty">
          <div class="events__empty-icon">🏖️</div>
          <h3>No events found</h3>
          <p>Try adjusting your filter or check back later for new cleanups!</p>
        </div>
      `;
      return;
    }

    // Render events immediately
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
          <button class="btn btn--primary btn--small" onclick="app.${event.userJoined ? 'viewEventDetails' : 'joinEvent'}(${event.id})">
            ${event.userJoined ? 'View Details' : 'Join Event'}
          </button>
          <button class="btn btn--text btn--small" onclick="app.shareEvent(${event.id})">
            Share
          </button>
        </div>
      </article>
    `).join('');

    // Add event card styles
    this.addEventCardStyles();
  }

  /**
   * Join an event
   */
  joinEvent(eventId) {
    const event = this.events.find(e => e.id === eventId);
    if (event && !event.userJoined) {
      event.userJoined = true;
      event.participants += 1;
      
      this.showNotification(`Joined "${event.title}"! 🎉`, 'success');
      this.renderEvents(this.events);
    }
  }

  /**
   * View event details
   */
  viewEventDetails(eventId) {
    const event = this.events.find(e => e.id === eventId);
    if (!event) return;

    // Create and show event details modal
    this.showEventDetailsModal(event);
  }

  /**
   * Show event details in a modal
   */
  showEventDetailsModal(event) {
    // Remove existing modal if any
    const existingModal = document.querySelector('.event-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'event-modal';
    modal.innerHTML = `
      <div class="event-modal__overlay" onclick="app.closeEventModal()"></div>
      <div class="event-modal__content">
        <div class="event-modal__header">
          <h3 class="event-modal__title">${event.title}</h3>
          <button class="event-modal__close" onclick="app.closeEventModal()" aria-label="Close modal">&times;</button>
        </div>
        
        <div class="event-modal__body">
          <div class="event-detail-grid">
            <div class="event-detail-item">
              <div class="event-detail__icon">📅</div>
              <div class="event-detail__content">
                <h4>Date & Time</h4>
                <p>${this.formatDate(event.date, 'full')} at ${event.time}</p>
              </div>
            </div>
            
            <div class="event-detail-item">
              <div class="event-detail__icon">📍</div>
              <div class="event-detail__content">
                <h4>Location</h4>
                <p>${event.location}</p>
              </div>
            </div>
            
            <div class="event-detail-item">
              <div class="event-detail__icon">👥</div>
              <div class="event-detail__content">
                <h4>Participants</h4>
                <p>${event.participants} volunteers signed up</p>
              </div>
            </div>
            
            <div class="event-detail-item">
              <div class="event-detail__icon">🏢</div>
              <div class="event-detail__content">
                <h4>Organizer</h4>
                <p>${event.organizer}</p>
              </div>
            </div>
          </div>
          
          <div class="event-description-section">
            <h4>About This Cleanup</h4>
            <p>${event.description}</p>
          </div>
          
          <div class="event-preparation-section">
            <h4>What to Bring</h4>
            <ul class="preparation-list">
              <li>📦 Reusable bags or containers</li>
              <li>🧤 Protective gloves (provided if needed)</li>
              <li>💧 Water bottle</li>
              <li>🧴 Sunscreen and hat</li>
              <li>📱 Phone for photos and check-in</li>
            </ul>
          </div>
          
          ${event.userJoined ? `
            <div class="event-status-joined">
              <div class="status-icon">✅</div>
              <div class="status-text">
                <h4>You're registered!</h4>
                <p>We'll send you a reminder 1 hour before the event starts.</p>
              </div>
            </div>
          ` : ''}
        </div>
        
        <div class="event-modal__footer">
          ${event.userJoined ? `
            <button class="btn btn--secondary" onclick="app.leaveEvent(${event.id})">
              Leave Event
            </button>
            <button class="btn btn--primary" onclick="app.shareEvent(${event.id})">
              Share Event
            </button>
          ` : `
            <button class="btn btn--secondary" onclick="app.closeEventModal()">
              Maybe Later
            </button>
            <button class="btn btn--primary" onclick="app.joinEventFromModal(${event.id})">
              Join This Cleanup
            </button>
          `}
        </div>
      </div>
    `;

    // Add modal to page
    document.body.appendChild(modal);

    // Add modal styles
    this.addEventModalStyles();

    // Animate in
    requestAnimationFrame(() => {
      modal.classList.add('event-modal--show');
    });

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close event details modal
   */
  closeEventModal() {
    const modal = document.querySelector('.event-modal');
    if (modal) {
      modal.classList.remove('event-modal--show');
      setTimeout(() => {
        modal.remove();
        document.body.style.overflow = '';
      }, 300);
    }
  }

  /**
   * Join event from modal
   */
  joinEventFromModal(eventId) {
    this.joinEvent(eventId);
    this.closeEventModal();
  }

  /**
   * Leave an event
   */
  leaveEvent(eventId) {
    const event = this.events.find(e => e.id === eventId);
    if (event && event.userJoined) {
      event.userJoined = false;
      event.participants = Math.max(0, event.participants - 1);
      
      this.showNotification(`Left "${event.title}"`, 'info');
      this.renderEvents(this.events);
      this.closeEventModal();
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
   * Render weather information with real NEA data
   */
  renderWeather() {
    if (!this.weatherData) return;

    const { current, forecast } = this.weatherData;

    // Update current weather
    this.updateElement('#current-weather-icon', current.condition);
    this.updateElement('#current-temp', current.temperature);
    this.updateElement('#current-wind', `${current.windSpeed} km/h ${current.windDirection || ''}`);
    this.updateElement('#current-humidity', `${current.humidity}%`);
    this.updateElement('#current-uv', current.uvIndex);

    // Update location
    const locationElement = document.querySelector('.weather-card__location');
    if (locationElement) {
      locationElement.textContent = current.location || 'Pasir Ris Area';
    }

    // Update cleanup status
    const cleanupStatus = this.getCleanupStatus(current);
    this.updateElement('#cleanup-status', cleanupStatus.message);
    const statusElement = document.getElementById('cleanup-status');
    if (statusElement) {
      statusElement.className = `cleanup-status cleanup-status--${cleanupStatus.level}`;
    }

    // Render 7-day forecast
    const forecastContainer = document.getElementById('weather-forecast');
    if (forecastContainer && forecast) {
      forecastContainer.innerHTML = forecast.map((day, index) => `
        <div class="weather-card weather-card--forecast" data-day="${index}">
          <div class="weather-card__forecast-header">
            <h4 class="weather-card__day">${day.day}</h4>
            <span class="weather-card__date">${day.date ? new Date(day.date).toLocaleDateString('en-SG', { month: 'short', day: 'numeric' }) : ''}</span>
          </div>
          <div class="weather-card__forecast-icon">${day.condition}</div>
          <div class="weather-card__forecast-temps">
            <span class="weather-card__temp-high">${day.tempHigh || day.temp}°</span>
            <span class="weather-card__temp-low">${day.tempLow || day.temp - 3}°</span>
          </div>
          <div class="weather-card__forecast-details">
            <div class="weather-detail--small">
              <span class="weather-detail__icon">💨</span>
              <span>${day.wind || 'Light'}</span>
            </div>
            ${day.humidity ? `
              <div class="weather-detail--small">
                <span class="weather-detail__icon">💧</span>
                <span>${day.humidity.high || day.humidity}%</span>
              </div>
            ` : ''}
          </div>
          <div class="cleanup-status cleanup-status--${day.status} cleanup-status--small">
            ${this.getStatusEmoji(day.status)} ${this.getStatusText(day.status)}
          </div>
          <p class="weather-card__description">${day.description || ''}</p>
        </div>
      `).join('');

      // Add forecast card styles
      this.addWeatherForecastStyles();
    }

    // Update last updated time
    const timestampElement = document.querySelector('.weather-timestamp');
    if (timestampElement && current.timestamp) {
      const lastUpdated = new Date(current.timestamp);
      timestampElement.textContent = `Updated: ${lastUpdated.toLocaleTimeString('en-SG', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    }
  }

  /**
   * Get cleanup status based on weather conditions
   */
  getCleanupStatus(weather) {
    const temp = weather.temperature;
    const humidity = weather.humidity;
    const windSpeed = weather.windSpeed;
    const uvIndex = weather.uvIndex;
    
    if (temp > 35) {
      return { level: 'poor', message: 'Too hot for cleanup! Stay hydrated ☀️🥵' };
    } else if (uvIndex > 9) {
      return { level: 'poor', message: 'Extreme UV - avoid midday cleanup ☀️⚠️' };
    } else if (windSpeed > 25) {
      return { level: 'poor', message: 'Too windy - wait for calmer weather 💨' };
    } else if (temp < 20) {
      return { level: 'ok', message: 'Cool weather - dress warmly! 🧥' };
    } else if (humidity > 90) {
      return { level: 'ok', message: 'Very humid - take breaks often 💧' };
    } else if (temp >= 24 && temp <= 32 && windSpeed < 20 && humidity < 85) {
      return { level: 'good', message: 'Perfect conditions for cleanup! 🌟' };
    } else {
      return { level: 'good', message: 'Good cleanup weather 👍' };
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
   * Load real weather data from NEA Singapore API
   */
  async loadRealWeatherData() {
    try {
      console.log('🌤️ Loading real weather data from NEA Singapore...');
      
      // Get current weather
      const currentWeather = await this.getCurrentWeather();
      
      // Get 7-day forecast
      const forecast = await this.getWeatherForecast();
      
      // Combine data
      this.weatherData = {
        current: currentWeather,
        forecast: forecast
      };
      
      this.renderWeather();
      console.log('✅ Weather data loaded successfully');
      
    } catch (error) {
      console.error('❌ Error loading weather data:', error);
      this.loadFallbackWeatherData();
    }
  }
  
  /**
   * Get current weather from NEA API
   */
  async getCurrentWeather() {
    const endpoints = [
      '/environment/air-temperature',
      '/environment/relative-humidity', 
      '/environment/wind-speed',
      '/environment/wind-direction',
      '/environment/uv-index'
    ];
    
    const weatherPromises = endpoints.map(endpoint => 
      this.fetchNeaData(endpoint)
    );
    
    const [tempData, humidityData, windSpeedData, windDirData, uvData] = 
      await Promise.all(weatherPromises);
    
    // Find data for Pasir Ris area (East region)
    const eastStation = this.findNearestStation(tempData, ['S50', 'S24', 'S06']);
    
    const temperature = this.getStationValue(tempData, eastStation) || 28;
    const humidity = this.getStationValue(humidityData, eastStation) || 70;
    const windSpeed = this.getStationValue(windSpeedData, eastStation) || 12;
    const windDir = this.getStationValue(windDirData, eastStation) || 'NE';
    const uvIndex = this.getStationValue(uvData, eastStation) || 6;
    
    return {
      temperature: Math.round(temperature),
      humidity: Math.round(humidity),
      windSpeed: Math.round(windSpeed),
      windDirection: windDir,
      uvIndex: Math.round(uvIndex),
      condition: this.getWeatherIcon(temperature, humidity, windSpeed),
      description: this.getWeatherDescription(temperature, humidity, windSpeed),
      location: 'Pasir Ris Area',
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Get 7-day weather forecast
   */
  async getWeatherForecast() {
    try {
      // NEA provides 4-day forecast
      const forecastData = await this.fetchNeaData('/environment/4-day-weather-forecast');
      
      if (!forecastData?.items?.[0]?.forecasts) {
        throw new Error('No forecast data available');
      }
      
      const forecasts = forecastData.items[0].forecasts;
      
      return forecasts.map((forecast, index) => {
        const date = new Date(forecast.date);
        const dayName = index === 0 ? 'Today' : 
                       index === 1 ? 'Tomorrow' : 
                       date.toLocaleDateString('en-SG', { weekday: 'short' });
        
        const tempHigh = forecast.temperature.high;
        const tempLow = forecast.temperature.low;
        const avgTemp = Math.round((tempHigh + tempLow) / 2);
        
        return {
          day: dayName,
          date: forecast.date,
          temp: avgTemp,
          tempHigh: tempHigh,
          tempLow: tempLow,
          condition: this.getWeatherIconFromForecast(forecast.forecast),
          description: forecast.forecast,
          humidity: forecast.relative_humidity,
          wind: forecast.wind?.speed_kmh || 'Light',
          status: this.getCleanupStatusFromTemp(avgTemp, forecast.forecast)
        };
      });
      
    } catch (error) {
      console.error('Error fetching forecast:', error);
      return this.generateFallbackForecast();
    }
  }
  
  /**
   * Fetch data from NEA API with error handling
   */
  async fetchNeaData(endpoint) {
    const url = `${this.neaApiBase}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }
  
  /**
   * Find nearest weather station to Pasir Ris
   */
  findNearestStation(data, preferredStations) {
    if (!data?.items?.[0]?.readings) return preferredStations[0];
    
    const readings = data.items[0].readings;
    
    for (const stationId of preferredStations) {
      const reading = readings.find(r => r.station_id === stationId);
      if (reading && reading.value !== null) {
        return stationId;
      }
    }
    
    // Fallback to any available station
    const availableReading = readings.find(r => r.value !== null);
    return availableReading?.station_id || preferredStations[0];
  }
  
  /**
   * Get weather value for specific station
   */
  getStationValue(data, stationId) {
    if (!data?.items?.[0]?.readings) return null;
    
    const reading = data.items[0].readings.find(r => r.station_id === stationId);
    return reading?.value;
  }
  
  /**
   * Get weather icon based on conditions
   */
  getWeatherIcon(temp, humidity, windSpeed) {
    if (humidity > 80 && temp < 26) return '🌧️';
    if (humidity > 70) return '⛅';
    if (temp > 32) return '☀️';
    if (windSpeed > 20) return '💨';
    return '☀️';
  }
  
  /**
   * Get weather icon from NEA forecast text
   */
  getWeatherIconFromForecast(forecast) {
    const text = forecast.toLowerCase();
    
    if (text.includes('rain') || text.includes('shower') || text.includes('thundery')) return '🌧️';
    if (text.includes('cloudy') || text.includes('overcast')) return '☁️';
    if (text.includes('partly cloudy') || text.includes('fair')) return '⛅';
    if (text.includes('hazy') || text.includes('mist')) return '🌫️';
    return '☀️';
  }
  
  /**
   * Get weather description
   */
  getWeatherDescription(temp, humidity, windSpeed) {
    if (temp > 32) return 'Hot';
    if (temp < 24) return 'Cool';
    if (humidity > 80) return 'Humid';
    if (windSpeed > 20) return 'Windy';
    return 'Pleasant';
  }
  
  /**
   * Get cleanup status from temperature and conditions
   */
  getCleanupStatusFromTemp(temp, forecast) {
    const text = forecast.toLowerCase();
    
    if (text.includes('thundery') || text.includes('heavy rain')) return 'poor';
    if (temp > 35) return 'poor';
    if (text.includes('rain') || text.includes('shower')) return 'ok';
    if (temp >= 25 && temp <= 32 && !text.includes('rain')) return 'perfect';
    return 'good';
  }
  
  /**
   * Load fallback weather data if API fails
   */
  loadFallbackWeatherData() {
    console.log('📱 Loading fallback weather data...');
    
    this.weatherData = {
      current: {
        temperature: 28,
        humidity: 75,
        windSpeed: 12,
        windDirection: 'NE',
        uvIndex: 6,
        condition: '⛅',
        description: 'Partly Cloudy',
        location: 'Pasir Ris Area (Offline)',
        timestamp: new Date().toISOString()
      },
      forecast: this.generateFallbackForecast()
    };
    
    this.renderWeather();
    this.showNotification('Using offline weather data 📴', 'info');
  }
  
  /**
   * Generate fallback 7-day forecast
   */
  generateFallbackForecast() {
    const days = ['Today', 'Tomorrow', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const conditions = ['☀️', '⛅', '🌧️', '☀️', '⛅', '☀️', '⛅'];
    const temps = [28, 26, 24, 30, 27, 29, 25];
    const statuses = ['perfect', 'good', 'ok', 'perfect', 'good', 'perfect', 'good'];
    
    return days.map((day, index) => ({
      day,
      temp: temps[index],
      tempHigh: temps[index] + 2,
      tempLow: temps[index] - 3,
      condition: conditions[index],
      description: 'Mixed conditions',
      status: statuses[index]
    }));
  }
  
  /**
   * Update weather based on current location
   */
  async updateWeatherForLocation() {
    if (!this.currentLocation) return;

    console.log('🌤️ Updating weather for location:', this.currentLocation);
    
    // Reload weather data for the new location
    await this.loadRealWeatherData();
    
    const locationElement = document.querySelector('.weather-card__location');
    if (locationElement) {
      locationElement.textContent = this.weatherData?.current?.location || 'Your Location';
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
      case 'full':
        return date.toLocaleDateString('en-SG', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
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

  /**
   * Add dynamic weather forecast styles
   */
  addWeatherForecastStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .weather-card--forecast {
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: var(--radius-lg);
        padding: var(--spacing-4);
        text-align: center;
        color: var(--color-white);
        min-width: 140px;
        transition: transform var(--transition-fast);
      }
      
      .weather-card--forecast:hover {
        transform: translateY(-2px);
        background: rgba(255, 255, 255, 0.25);
      }
      
      .weather-card__forecast-header {
        margin-bottom: var(--spacing-2);
      }
      
      .weather-card__day {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        color: var(--color-white);
        margin-bottom: var(--spacing-1);
      }
      
      .weather-card__date {
        font-size: var(--font-size-xs);
        color: rgba(255, 255, 255, 0.8);
      }
      
      .weather-card__forecast-icon {
        font-size: var(--font-size-3xl);
        margin: var(--spacing-2) 0;
        line-height: 1;
      }
      
      .weather-card__forecast-temps {
        display: flex;
        justify-content: center;
        gap: var(--spacing-2);
        margin-bottom: var(--spacing-2);
      }
      
      .weather-card__temp-high {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        color: var(--color-white);
      }
      
      .weather-card__temp-low {
        font-size: var(--font-size-base);
        color: rgba(255, 255, 255, 0.7);
      }
      
      .weather-card__forecast-details {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--spacing-2);
        font-size: var(--font-size-xs);
      }
      
      .weather-detail--small {
        display: flex;
        align-items: center;
        gap: var(--spacing-1);
        color: rgba(255, 255, 255, 0.8);
      }
      
      .weather-detail__icon {
        font-size: var(--font-size-sm);
      }
      
      .cleanup-status--small {
        font-size: var(--font-size-xs);
        padding: var(--spacing-1) var(--spacing-2);
        margin-bottom: var(--spacing-2);
      }
      
      .weather-card__description {
        font-size: var(--font-size-xs);
        color: rgba(255, 255, 255, 0.7);
        line-height: 1.3;
        margin-bottom: 0;
      }
      
      .weather-timestamp {
        text-align: center;
        color: rgba(255, 255, 255, 0.6);
        font-size: var(--font-size-xs);
        margin-top: var(--spacing-4);
      }
      
      @media (max-width: 640px) {
        .weather__forecast {
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: var(--spacing-3);
        }
        
        .weather-card--forecast {
          min-width: 120px;
          padding: var(--spacing-3);
        }
      }
    `;
    
    // Only add if not already added
    if (!document.querySelector('#weather-forecast-styles')) {
      style.id = 'weather-forecast-styles';
      document.head.appendChild(style);
    }
  }

  /**
   * Add event modal styles
   */
  addEventModalStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .event-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: var(--z-modal);
        opacity: 0;
        visibility: hidden;
        transition: all var(--transition-base);
      }
      
      .event-modal--show {
        opacity: 1;
        visibility: visible;
      }
      
      .event-modal__overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
      }
      
      .event-modal__content {
        position: relative;
        background: var(--color-white);
        border-radius: var(--radius-xl);
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        margin: 5vh auto;
        overflow: hidden;
        box-shadow: var(--shadow-xl);
        transform: translateY(20px);
        transition: transform var(--transition-base);
      }
      
      .event-modal--show .event-modal__content {
        transform: translateY(0);
      }
      
      .event-modal__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-6);
        border-bottom: 1px solid var(--color-gray-200);
        background: var(--color-gray-50);
      }
      
      .event-modal__title {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-gray-900);
        margin: 0;
      }
      
      .event-modal__close {
        background: none;
        border: none;
        font-size: var(--font-size-2xl);
        color: var(--color-gray-400);
        cursor: pointer;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-base);
        transition: all var(--transition-fast);
      }
      
      .event-modal__close:hover {
        background: var(--color-gray-200);
        color: var(--color-gray-600);
      }
      
      .event-modal__body {
        padding: var(--spacing-6);
        max-height: 60vh;
        overflow-y: auto;
      }
      
      .event-detail-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--spacing-4);
        margin-bottom: var(--spacing-6);
      }
      
      @media (min-width: 768px) {
        .event-detail-grid {
          grid-template-columns: 1fr 1fr;
        }
      }
      
      .event-detail-item {
        display: flex;
        align-items: flex-start;
        gap: var(--spacing-3);
        padding: var(--spacing-3);
        background: var(--color-gray-50);
        border-radius: var(--radius-lg);
      }
      
      .event-detail__icon {
        font-size: var(--font-size-xl);
        flex-shrink: 0;
        margin-top: 2px;
      }
      
      .event-detail__content h4 {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        color: var(--color-gray-700);
        margin: 0 0 var(--spacing-1) 0;
      }
      
      .event-detail__content p {
        font-size: var(--font-size-base);
        color: var(--color-gray-900);
        margin: 0;
        font-weight: var(--font-weight-medium);
      }
      
      .event-description-section,
      .event-preparation-section {
        margin-bottom: var(--spacing-6);
      }
      
      .event-description-section h4,
      .event-preparation-section h4 {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--color-gray-900);
        margin: 0 0 var(--spacing-3) 0;
      }
      
      .event-description-section p {
        color: var(--color-gray-700);
        line-height: 1.6;
        margin: 0;
      }
      
      .preparation-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      
      .preparation-list li {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        padding: var(--spacing-2) 0;
        color: var(--color-gray-700);
        border-bottom: 1px solid var(--color-gray-100);
      }
      
      .preparation-list li:last-child {
        border-bottom: none;
      }
      
      .event-status-joined {
        display: flex;
        align-items: center;
        gap: var(--spacing-3);
        padding: var(--spacing-4);
        background: var(--color-success);
        border-radius: var(--radius-lg);
        color: var(--color-white);
        margin-bottom: var(--spacing-4);
      }
      
      .status-icon {
        font-size: var(--font-size-2xl);
        flex-shrink: 0;
      }
      
      .status-text h4 {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        margin: 0 0 var(--spacing-1) 0;
        color: var(--color-white);
      }
      
      .status-text p {
        font-size: var(--font-size-sm);
        margin: 0;
        color: rgba(255, 255, 255, 0.9);
      }
      
      .event-modal__footer {
        display: flex;
        justify-content: flex-end;
        gap: var(--spacing-3);
        padding: var(--spacing-6);
        border-top: 1px solid var(--color-gray-200);
        background: var(--color-gray-50);
      }
      
      @media (max-width: 640px) {
        .event-modal__content {
          width: 95%;
          margin: 2vh auto;
          max-height: 95vh;
        }
        
        .event-modal__footer {
          flex-direction: column;
        }
        
        .event-modal__footer .btn {
          width: 100%;
        }
      }
    `;
    
    // Only add if not already added
    if (!document.querySelector('#event-modal-styles')) {
      style.id = 'event-modal-styles';
      document.head.appendChild(style);
    }
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