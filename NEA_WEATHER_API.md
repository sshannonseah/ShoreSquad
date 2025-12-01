# NEA Weather API Integration 🌤️

## 🇸🇬 Singapore Weather Data Integration

ShoreSquad now uses **real-time weather data** from Singapore's National Environment Agency (NEA) via the data.gov.sg API platform to provide accurate weather information for beach cleanup planning.

## 📊 **Data Sources**

### Current Weather (Real-time):
- **Air Temperature** - From weather stations near Pasir Ris
- **Relative Humidity** - Moisture levels for comfort assessment  
- **Wind Speed & Direction** - Important for cleanup safety
- **UV Index** - Sun exposure guidance
- **Location**: East Coast stations (S50, S24, S06) prioritizing Pasir Ris area

### Weather Forecast (4-7 Days):
- **4-Day Official Forecast** from NEA
- **Temperature High/Low** - Daily temperature range
- **Weather Conditions** - Rain, sun, clouds, thunderstorms
- **Humidity Forecasts** - Expected moisture levels
- **Cleanup Suitability** - Automated assessment

## 🔗 **API Endpoints Used**

```
https://api.data.gov.sg/v1/environment/air-temperature
https://api.data.gov.sg/v1/environment/relative-humidity  
https://api.data.gov.sg/v1/environment/wind-speed
https://api.data.gov.sg/v1/environment/wind-direction
https://api.data.gov.sg/v1/environment/uv-index
https://api.data.gov.sg/v1/environment/4-day-weather-forecast
```

## ✅ **Features**

### 🎯 **Smart Cleanup Assessment**
- **Perfect** (🌟): 24-32°C, low humidity, light winds
- **Good** (👍): Moderate conditions, suitable for cleanup  
- **Okay** (⚠️): Manageable with precautions
- **Poor** (❌): Too hot, stormy, or extreme conditions

### 📱 **Real-time Updates**
- **Live data** refreshed on page load
- **Automatic fallback** to offline data if API unavailable
- **Location-specific** data for Pasir Ris Beach area
- **Timestamp** showing last update time

### 🌦️ **Comprehensive Forecast**
- **7-day outlook** with daily conditions
- **High/Low temperatures** for planning
- **Weather icons** based on actual NEA descriptions
- **Wind and humidity** details for each day
- **Cleanup recommendations** per day

## 🛠️ **Technical Implementation**

### **Error Handling**
- ✅ **API timeout protection** with 10-second limits
- ✅ **Graceful fallback** to cached/offline data
- ✅ **Multiple weather stations** for redundancy
- ✅ **User notifications** for data status

### **Performance**
- ✅ **Parallel API calls** for faster loading
- ✅ **Cached responses** to minimize API calls  
- ✅ **Lazy loading** weather data after page load
- ✅ **Mobile optimized** responsive forecast cards

### **Data Processing**
```javascript
// Example: Smart station selection
findNearestStation(data, ['S50', 'S24', 'S06']) // Pasir Ris priority

// Example: Weather icon mapping  
getWeatherIconFromForecast('Partly Cloudy') // Returns ⛅

// Example: Cleanup assessment
getCleanupStatusFromTemp(28, 'Fair') // Returns 'perfect'
```

## 📍 **Weather Station Coverage**

### **Primary Station: S50 (Pasir Ris)**
- **Location**: Closest to cleanup site
- **Data**: Temperature, humidity, wind, UV
- **Update Frequency**: Every 5 minutes

### **Backup Stations**:
- **S24 (Changi)**: Coastal East region
- **S06 (East Coast)**: Alternative East coverage

## 🎨 **User Experience**

### **Weather Card Design**
- **Glassmorphism** - Translucent cards with blur effects
- **Color-coded status** - Green (perfect), amber (okay), red (poor)
- **Responsive layout** - Adapts to mobile and desktop
- **Interactive forecast** - Hover effects and detailed info

### **Loading States**
- **Smooth transitions** during API calls
- **Progressive loading** with skeleton screens  
- **Error messaging** if weather data unavailable
- **Offline indicators** when using cached data

## 🔧 **Configuration**

### **API Settings**
```javascript
neaApiBase: 'https://api.data.gov.sg/v1'
weatherStations: {
  'pasir_ris': 'S50',
  'changi': 'S24', 
  'east_coast': 'S06'
}
```

### **Cleanup Thresholds**
- **Too Hot**: >35°C
- **Extreme UV**: >9 index
- **Too Windy**: >25 km/h
- **Perfect Range**: 24-32°C, <20 km/h, <85% humidity

## 🚀 **Benefits for ShoreSquad**

### **📈 Enhanced Planning**
- **Real conditions** help volunteers prepare appropriately
- **Safety guidance** prevents cleanup during dangerous weather
- **Optimal timing** recommendations for best cleanup conditions

### **🎯 **Community Engagement**
- **Professional data** builds trust in platform
- **Weather-aware** event suggestions
- **Local relevance** with Singapore-specific stations

### **📱 **Mobile Experience**  
- **Quick load** times with efficient API calls
- **Offline capability** for poor connectivity areas
- **Clear visuals** for easy weather assessment

## 🆘 **Troubleshooting**

### **Common Issues**
- **API Rate Limits**: Handled with request caching
- **Network Timeouts**: Automatic fallback to offline data  
- **Missing Stations**: Falls back to nearest available data
- **Malformed Data**: Validation and error handling included

### **Fallback Behavior**
When NEA API is unavailable, ShoreSquad shows:
- Generic Singapore weather patterns
- Conservative cleanup recommendations  
- Clear indication of offline status
- Encouragement to check again later

---

**Data Source**: Singapore National Environment Agency (NEA)  
**Platform**: data.gov.sg - Singapore Open Data Initiative  
**Update Frequency**: Real-time (5-15 minute intervals)  
**Coverage**: Singapore weather stations network

*Accurate weather data for safer, smarter beach cleanups! 🌊*