# Analytics Dashboard - Personal Metrics Hub

## Project Title & Description

**Analytics Dashboard** is a web-based personal activity tracking and analytics application. It enables users to track daily activities, monitor productivity metrics, visualize data through interactive charts, set and track goals, and gain insights into their habits and performance patterns.

The application features a responsive dark-themed interface optimized for both desktop and mobile devices. All data is stored locally in the browser using localStorage, ensuring privacy and offline functionality.

## Problem Statement

Individuals face challenges in:
- Tracking and monitoring daily activities and time allocation
- Visualizing productivity patterns and trends over time
- Setting meaningful goals and tracking progress
- Gaining actionable insights from activity data
- Understanding time distribution across different categories
- Identifying peak performance periods

This dashboard addresses these challenges by providing a centralized platform for logging activities with detailed information, viewing real-time metrics, analyzing data through multiple visualization types, setting custom goals, filtering and searching historical data, and receiving personalized insights.

## Features Implemented

### Activity Management
- Add activities with date, time, category, name, duration, optional performance score (0-100), and notes
- Delete activities with confirmation
- Automatic sorting by date (newest first)
- Support for custom categories

### Key Metrics Dashboard
- Goals completed count
- Total hours tracked for selected time period
- Active streak (consecutive days with activities)
- Average performance score
- Period-over-period change indicators

### Data Visualizations
- **Timeline Chart**: Line graph showing daily activity hours or count with toggleable views
- **Category Distribution**: Pie chart showing time breakdown across categories
- **Performance Trends**: Bar chart displaying average scores (weekly/monthly aggregation)
- **Top Activities**: Bar chart showing top 5 most time-consuming activities

### Goal Management
- Create goals with name, target value, unit, and optional category filter
- Visual progress bars with completion percentage
- Delete goals with confirmation
- Dynamic progress calculation based on filtered time period

### Activity Log Table
- Comprehensive table view with date, category, activity name, duration, score, and actions
- Category filtering
- Search functionality (name, category, notes)
- Color-coded score and category badges

### Insights & Statistics
- Personalized insights: most active category, performance trends, activity frequency, streak information
- Statistics summary: total entries, most active day, peak hour, best category

### Data Filtering
- Date range selection (7 days, 30 days, 90 days, 1 year, all time)
- Real-time updates across all charts and metrics

### Data Persistence
- Automatic save to browser localStorage
- Data restoration on page refresh
- Fully client-side application

### Responsive Design
- Mobile-first approach with touch-friendly controls
- Adaptive grid layouts
- High-DPI display support
- Automatic resize handling

## DOM Concepts Used

### Element Selection
- `document.getElementById()`, `document.querySelector()`, `document.querySelectorAll()`

### Event Handling
- `addEventListener()` for DOMContentLoaded, click, change, input, submit, resize events
- Event delegation for dynamically created elements

### DOM Manipulation
- `createElement()`, `appendChild()`, `innerHTML`, `textContent`, `remove()`

### Class & Style Management
- `classList.add()`, `classList.remove()`, direct style property manipulation

### Form Handling
- Input value access/modification, form reset, `preventDefault()`, validation

### Canvas API
- `getContext('2d')`, `fillRect()`, `strokeRect()`, path drawing (`beginPath()`, `moveTo()`, `lineTo()`), `arc()`, text rendering (`fillText()`, `strokeText()`), high-DPI handling

### Element Properties
- `getBoundingClientRect()`, `options` property, `removeChild()`, `setAttribute()`/`getAttribute()`

### Data Attributes
- `dataset` property for configuration (e.g., `data-chart`, `data-type`)

### Window & Document Objects
- `window.devicePixelRatio`, `window.addEventListener('resize')`

### Local Storage API
- `localStorage.getItem()`, `localStorage.setItem()`, JSON serialization/deserialization

### Dynamic Content Rendering
- Dynamic table row creation, list/card building from arrays, conditional rendering, empty state handling

### Modal Management
- Class-based show/hide, event delegation for outside clicks, form reset on close

## Steps to Run the Project

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge) with ES6+ JavaScript support
- No additional dependencies required

### Running the Project

1. **Ensure all files are present**: `index.html`, `styles.css`, `script.js`, `README.md`

2. **Open the application**:
   - Double-click `index.html` to open in default browser, or
   - Right-click `index.html` → "Open with" → Select browser, or
   - Use browser's File → Open File → Navigate to `index.html`

3. **Optional - Local Server** (for development):
   - Python: `python -m http.server 8000` → visit `http://localhost:8000`
   - Node.js: `npm install -g http-server` → `http-server` in project directory
   - VS Code: Use "Live Server" extension

4. **Usage**:
   - Dashboard loads with empty state
   - Click "+ Add Data" to add first activity
   - Fill form and submit
   - Explore charts, metrics, and insights

### Browser Compatibility
- Chrome/Edge (latest), Firefox (latest), Safari (latest), Mobile browsers (iOS Safari, Chrome Mobile)

## Known Limitations

1. **Storage Constraints**: localStorage typically limited to 5-10MB; data is browser-specific and not synced across devices

2. **No Data Export/Import**: No built-in export to CSV/JSON or import functionality for data transfer

3. **Limited Validation**: Future dates and unrealistic duration values are not validated

4. **Fixed Chart Styling**: Chart colors and styles are not customizable; may become cluttered with large datasets

5. **Performance**: Rendering may slow with thousands of activities; no pagination for activity table; charts recalculate on every filter change

6. **No Undo/Redo**: Deleted activities cannot be recovered; no change history

7. **Mobile Limitations**: Date/time picker appearance varies; canvas charts may have issues on older mobile devices

8. **Single User**: No multi-user support; data stored per browser instance

9. **Limited Goal Features**: Goals cannot be edited (only deleted); no deadlines or notifications

10. **No Backup**: Data lost if browser cache is cleared; no cloud sync or backup mechanism

11. **Search Limitations**: Case-sensitive in some browsers; no advanced filters (date range, score range)

12. **Chart Responsiveness**: May not render optimally on screens < 320px; label overlap possible on mobile

---

**Note**: This is a client-side only application. All data remains on the user's device and is never transmitted to any server.
