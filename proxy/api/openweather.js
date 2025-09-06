export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { lat, lon, units = 'metric' } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'lat and lon parameters are required' });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'OpenWeather API key not configured' 
      });
    }

    const openWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;

    // Fetch the data from OpenWeather
    const response = await fetch(openWeatherUrl);
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Failed to fetch weather data: ${response.statusText}` 
      });
    }

    const data = await response.json();
    
    // Return the data with CORS headers
    res.status(200).json(data);
    
  } catch (error) {
    console.error('OpenWeather proxy error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}