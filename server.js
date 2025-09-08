// server.js
const express = require("express");
const fetch = require("node-fetch"); // make sure node-fetch v2 is installed

const app = express();
const PORT = 3000;

// IPTV provider details
const IPTV_URL =
  "http://smarts-on.to:2095/get.php?username=flixoza12549&password=1261901950&type=m3u_plus&output=ts";

app.get("/playlist.m3u", async (req, res) => {
  try {
    const response = await fetch(IPTV_URL);

    if (!response.ok) {
      return res.status(response.status).send("Error fetching playlist");
    }

    let data = await response.text();

    // rewrite .ts links to go through proxy
    data = data.replace(/http:\/\/[^\s]+/g, (url) => {
      return `http://localhost:${PORT}/stream?url=${encodeURIComponent(url)}`;
    });

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.send(data);
  } catch (err) {
    console.error("Playlist proxy error:", err);
    res.status(500).send("Server error");
  }
});

app.get("/stream", async (req, res) => {
  const channelUrl = req.query.url;
  if (!channelUrl) {
    return res.status(400).send("Missing ?url parameter");
  }

  try {
    const response = await fetch(channelUrl);
    if (!response.ok) {
      return res.status(response.status).send("Error fetching stream");
    }

    res.setHeader("Content-Type", "video/MP2T");
    response.body.pipe(res);
  } catch (err) {
    console.error("Stream proxy error:", err);
    res.status(500).send("Stream proxy error");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy running at http://localhost:${PORT}/playlist.m3u`);
});
