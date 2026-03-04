import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/test", (req, res) => {
  console.log(">>> [SERVER] Received /api/test request");
  res.json({ message: "Server is alive" });
});

// API route for Discord Webhook
app.post("/api/send-wish", async (req, res) => {
  console.log(">>> [SERVER] Received /api/send-wish request");
  const { name } = req.body;
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.error("DISCORD_WEBHOOK_URL is not set");
    return res.status(500).json({ error: "Webhook configuration missing" });
  }

  try {
    console.log(">>> [SERVER] Sending to Discord webhook:", webhookUrl.substring(0, 30) + "...");
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `🎉 **${name || 'Someone'}** just sent a Holi wish from your website!`,
        embeds: [{
          title: "Happy Holi! 🎨",
          description: name ? `**${name}** clicked the 'Send Wishes' button.` : "A visitor clicked the 'Send Wishes' button.",
          color: 0xFF1493,
          timestamp: new Date().toISOString(),
          footer: {
            text: "Holi Festival 2026"
          }
        }]
      }),
    });

    console.log(">>> [SERVER] Discord response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`>>> [SERVER] Discord API error (${response.status}):`, errorText);
      return res.status(response.status).json({ 
        error: `Discord API error: ${response.status}`,
        details: errorText
      });
    }

    console.log(">>> [SERVER] Successfully sent to Discord");
    res.json({ message: "Thank you and same to you and your family from me" });
  } catch (error) {
    console.error(">>> [SERVER] Error sending to Discord:", error);
    res.status(500).json({ error: "Failed to send wish due to server error" });
  }
});

async function startServer() {
  const PORT = 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    // Note: Vercel handles routing via vercel.json, but this is good for local prod testing
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  // Only listen if not running as a Vercel function
  if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
