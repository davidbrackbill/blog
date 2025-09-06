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
    const { hour } = req.query;
    
    if (!hour) {
      return res.status(400).json({ error: 'Hour parameter is required' });
    }

    const paddedHour = hour.toString().padStart(2, "0");
    const windborneUrl = `https://a.windbornesystems.com/treasure/${paddedHour}.json`;

    // Fetch the data from Windborne
    const response = await fetch(windborneUrl);
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Failed to fetch data: ${response.statusText}` 
      });
    }

    const data = await response.json();
    
    // Return the data with CORS headers
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Windborne proxy error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}