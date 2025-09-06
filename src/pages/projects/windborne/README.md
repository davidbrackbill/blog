# Windborne Balloon Tracker

Query our live constellation API

The current positions of our global sounding balloons are at https://a.windbornesystems.com/treasure/00.json.
01.json is the state an hour ago, 03.json is from three hours ago, etc, up to 23H ago.
The outputs are undocumented and may sometimes be corrupted—sorryy ¯\(ツ)/¯.
You should robustly extract the available flight history for our constellation
Find another existing public dataset/API and combine these two into something!

The world is your oyster—have fun with it 🤔
This should be the meat of the project, explore and find something interesting and cool to you!
What insights or problems could you tackle with both of these data feeds?
Remember, our API is live, so whatever you build should update dynamically with the latest 24H of data.
Add a sentence to the notes explaining why you chose the external api/dataset you did!
Host your creation on a publicly accessible URL

We can't wait to see what you build!
this should be the actual interative webpage, not a static github repo link to the src
If you have questions, submit them via a POST request (just include a way for us to contact you!). We will not respond to comments on this gist.

# Ideas

  Weather & Climate:
  - OpenWeatherMap API - correlate balloon positions with weather conditions
  - NOAA weather station data - compare with ground-based measurements
  - NASA Earth Observation data - atmospheric conditions, cloud coverage
  - AccuWeather API - forecast data to predict balloon trajectories

  Aviation & Transportation:
  - OpenSky Network - real-time aircraft positions (compare air traffic density)
  - FlightAware API - commercial flight patterns and altitudes
  - ADS-B Exchange - aircraft tracking data

  Geographic & Environmental:
  - Natural Earth data - terrain elevation, population density
  - World Bank Open Data - economic/demographic data by region
  - Air quality APIs (PurpleAir, AirNow) - pollution correlations
  - Earthquake data (USGS) - seismic activity vs balloon behavior

  Oceanographic:
  - NOAA buoy data - ocean conditions for coastal balloon tracking
  - Tide data APIs - coastal atmospheric effects

  Space Weather:
  - NOAA Space Weather data - solar activity effects on upper atmosphere
  - NASA space weather APIs

  Most promising combinations:
  1. Weather correlation - Show how balloons move with jet streams and weather patterns
  2. Air quality monitoring - Use balloons as mobile air quality sensors
  3. Flight safety - Visualize balloon positions relative to aircraft traffic
  4. Climate research - Track atmospheric patterns and seasonal changes

  The weather APIs would likely give the richest insights since these are atmospheric balloons designed for meteorological purposes.

## API Research Findings (2025)

After researching the actual fetchable datasets and limitations, here's what's realistically available:

### Weather & Climate APIs (Most Viable)

**OpenWeatherMap API** ✅ **Excellent free tier**
- Free: 60 calls/minute, 1,000 daily calls (One Call API 3.0)
- Supports any coordinates globally - perfect for balloon positions
- Recommend calling once per 10 minutes per location (matches balloon data frequency)
- Best for: Real-time weather correlation with balloon movements
- **Documentation:** https://openweathermap.org/api
- **One Call API 3.0:** https://openweathermap.org/api/one-call-3
- **Sign up:** https://openweathermap.org/appid

**NOAA Weather APIs** ✅ **Completely free**  
- National Weather Service API: Unlimited but rate-limited, no token required
- Climate Data Online: 5 req/sec, 10,000/day with free token
- Aviation Weather API: 100 req/min (redesigned in 2025)
- Best for: Historical weather patterns and ground station comparisons
- **NWS API:** https://www.weather.gov/documentation/services-web-api
- **Climate Data Online:** https://www.ncdc.noaa.gov/cdo-web/webservices/v2
- **Aviation Weather:** https://aviationweather.gov/data/api/

**NASA Earth Observation** ✅ **Free with registration**
- 100+ petabytes of atmospheric data through multiple APIs
- Global Imagery Browse Services (GIBS) for satellite imagery
- POWER project for meteorological data at any global location
- Best for: Upper atmospheric conditions and satellite correlation
- **Main Portal:** https://www.earthdata.nasa.gov/
- **API Documentation:** https://www.earthdata.nasa.gov/engage/open-data-services-software/earthdata-developer-portal
- **POWER Project:** https://power.larc.nasa.gov/
- **GIBS API:** https://www.earthdata.nasa.gov/engage/open-data-services-software/earthdata-developer-portal/gibs-api

**AccuWeather API** ❌ **Very limited free tier**
- Only 50 calls/day free, then $25-500/month required
- Not viable for meaningful balloon tracking integration

### Aviation & Transportation APIs (Mostly Paid)

**OpenSky Network** ⚠️ **Free but with 2025 restrictions**
- Free for research/non-commercial use only
- Requires OAuth2 authentication (changed March 2025)
- 1-hour historical data, 5-second resolution
- Best for: Academic projects comparing balloon vs aircraft traffic

**FlightAware AeroAPI** ⚠️ **Free for personal/academic only**
- Personal/academic use free, commercial $100+/month
- Global flight tracking with real-time and historical data
- Best for: Flight safety visualization projects

**ADS-B Exchange** ❌ **No longer free**
- Discontinued free tier in March 2025
- Now paid-only through RapidAPI (10,000 req/month basic plan)
- Not viable for free projects

### Recommended Implementation Strategy

**Phase 1: Weather Correlation (Free)**
- OpenWeatherMap for current conditions at balloon positions
- NOAA historical data for weather pattern analysis
- Show how balloons track jet streams and weather fronts

**Phase 2: Atmospheric Insights (Free)**  
- NASA Earth observation data for upper atmospheric conditions
- Correlate balloon altitude changes with atmospheric layers
- Visualize balloon paths over satellite weather imagery

**Phase 3: Enhanced Features (If Budget Available)**
- FlightAware integration for flight safety visualization
- AccuWeather for enhanced forecasting capabilities

The weather APIs provide the richest free data sources and align perfectly with the meteorological purpose of these atmospheric balloons.
