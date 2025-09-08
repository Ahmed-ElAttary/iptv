// server.js
const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = 3000;

const API_URL =
  "http://smarts-on.to:2095/player_api.php?username=flixoza12549&password=1261901950";

// Headers OTTPlayer sends
const OTT_HEADERS = {
  "User-Agent": "Ott Player",
  "Accept-Encoding": "gzip",
  Host: "smarts-on.to:2095",
};

// Proxy API
app.get("/api", async (req, res) => {
  try {
    const response = await fetch(API_URL, { headers: OTT_HEADERS });

    if (!response.ok) {
      return res.status(response.status).send("Error fetching API");
    }

    // OTTPlayer API returns JSON
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("API proxy error:", err);
    res.status(500).send("Server error");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy running at http://localhost:${PORT}/api`);
});
