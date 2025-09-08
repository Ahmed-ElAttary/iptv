const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 8080;

// Original IPTV provider URL
const IPTV_URL =
  "http://smarts-on.to:2095/get.php?username=flixoza12549&password=1261901950&type=m3u_plus&output=ts";

// Endpoint to fetch and serve playlist
app.get("/playlist.m3u", async (req, res) => {
  try {
    const response = await axios.get(IPTV_URL, { responseType: "text" });

    // Optionally modify playlist content (branding, renaming, etc.)
    let playlist = response.data.replace(
      /smarts-on\.to:2095/g,
      req.headers.host // replace original domain with your server domain
    );

    res.setHeader("Content-Type", "audio/x-mpegurl");
    res.send(playlist);
  } catch (error) {
    console.error("Error fetching playlist:", error.message);
    res.status(500).send("Failed to fetch playlist");
  }
});

// Proxy for TS segments and streams
// Proxy for TS segments and streams
// Proxy for TS segments and streams
app.get(/^\/ts\/(.*)/, async (req, res) => {
  const fullPath = req.params[0]; // regex capture group
  try {
    const url = `http://smarts-on.to:2095/${fullPath}`;
    const response = await axios.get(url, { responseType: "stream" });
    response.data.pipe(res);
  } catch (error) {
    console.error("Error proxying TS:", error.message);
    res.status(500).send("Failed to proxy stream");
  }
});
app.listen(PORT, () => {
  console.log(
    `✅ IPTV Proxy Server running at http://localhost:${PORT}/playlist.m3u`
  );
});
