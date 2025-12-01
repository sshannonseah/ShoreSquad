# Google Maps API Setup Instructions

## 🗺️ Setting Up Google Maps for ShoreSquad

To enable the Google Maps functionality showing the Pasir Ris beach cleanup location, you'll need to set up a Google Maps API key.

### 📋 Step-by-Step Setup

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Sign in with your Google account

2. **Create or Select a Project**
   - Create a new project or select an existing one
   - Name it something like "ShoreSquad Maps"

3. **Enable Maps Embed API**
   - Go to "APIs & Services" → "Library"
   - Search for "Maps Embed API"
   - Click on it and press "Enable"

4. **Create API Key**
   - Go to "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "API key"
   - Copy the generated API key

5. **Secure Your API Key (Recommended)**
   - Click on your API key to edit it
   - Under "Application restrictions", select "HTTP referrers (web sites)"
   - Add your domain(s):
     - `localhost:3000/*` (for development)
     - `your-domain.com/*` (for production)

6. **Update ShoreSquad Code**
   - Open `index.html`
   - Find the line with `YOUR_API_KEY_HERE`
   - Replace it with your actual API key

### 🔄 Alternative: No-API-Key Option

If you don't want to set up an API key right now, you can use this simplified embed URL (with some limitations):

```html
<iframe 
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.6754444!2d103.955574!3d1.381497!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMjInNTMuNCJOIDEwM8KwNTcnMjAuMSJF!5e1!3m2!1sen!2ssg!4v1234567890"
    width="100%" 
    height="400" 
    style="border:0;" 
    allowfullscreen="" 
    loading="lazy" 
    referrerpolicy="no-referrer-when-downgrade">
</iframe>
```

### 📍 Current Map Configuration

- **Location**: Pasir Ris Beach, Singapore
- **Coordinates**: 1.381497, 103.955574
- **Map Type**: Satellite view
- **Zoom Level**: 15 (good detail for beach area)

### 🔧 Customization Options

You can modify the map by changing these URL parameters:

- `maptype=satellite` → `roadmap`, `terrain`, `hybrid`
- `zoom=15` → Any number from 1 (world) to 20 (building level)
- `center=1.381497,103.955574` → Any latitude,longitude

### 💡 Tips

- The map will work without an API key for basic testing but may have limitations
- With an API key, you get better performance and no usage restrictions
- The embedded map shows the exact cleanup location with a visual pin marker
- The location is optimized for mobile viewing with responsive sizing

### 🆘 Troubleshooting

If the map doesn't load:
1. Check that your API key is correct
2. Verify that Maps Embed API is enabled
3. Make sure domain restrictions allow your site
4. Check browser console for error messages

---

**Location Details:**
- 📍 Pasir Ris Beach cleanup point
- 🌊 East Coast of Singapore  
- 🏖️ Popular beach area perfect for community cleanup
- 📱 Mobile-optimized map view