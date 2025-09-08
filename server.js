// server.js
const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = 3000;

// IPTV provider details
const IPTV_URL =
  "http://smarts-on.to:2095/get.php?username=flixoza12549&password=1261901950&type=m3u_plus&output=ts";

// Common User-Agents used by IPTV players
const userAgents = [
  "VLC/3.0.18 LibVLC/3.0.18",
  "IPTV SmartersPro",
  "Mozilla/5.0 (Linux; Android 9.0; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.119 Mobile Safari/537.36",
];

// helper: try fetching with different headers
async function fetchWithFallback(url) {
  for (const ua of userAgents) {
    try {
      console.log(`🔎 Trying with UA: ${ua}`);
      const response = await fetch(url, {
        headers: {
          "User-Agent": ua,
          Accept: "*/*",
          Connection: "keep-alive",
        },
      });

      if (response.ok) {
        console.log(`✅ Success with UA: ${ua}`);
        return response;
      } else {
        console.log(`❌ Failed with UA: ${ua}, Status: ${response.status}`);
      }
    } catch (err) {
      console.error(`⚠️ Error with UA: ${ua}`, err.message);
    }
  }
  throw new Error("All User-Agents failed");
}

// proxy playlist
app.get("/playlist.m3u", async (req, res) => {
  try {
    const response = await fetchWithFallback(IPTV_URL);
    let data = await response.text();

    // rewrite .ts links to go through proxy
    data = data.replace(/http:\/\/[^\s]+/g, (url) => {
      return `http://localhost:${PORT}/stream?url=${encodeURIComponent(url)}`;
    });

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.send(data);
  } catch (err) {
    console.error("Playlist proxy error:", err);
    res.status(500).send("Error fetching playlist");
  }
});

// proxy stream (.ts)
app.get("/stream", async (req, res) => {
  const channelUrl = req.query.url;
  if (!channelUrl) {
    return res.status(400).send("Missing ?url parameter");
  }

  try {
    const response = await fetchWithFallback(channelUrl);
    res.setHeader("Content-Type", "video/MP2T");
    response.body.pipe(res);
  } catch (err) {
    console.error("Stream proxy error:", err);
    res.status(500).send("Stream proxy error");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy running at http://localhost:${PORT}/playlist.m3u`);
});
