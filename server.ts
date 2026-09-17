import { GoogleGenAI, Type } from "@google/genai";
import express from "express";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // LINE Webhook Endpoint for fetching Group ID
  app.post("/webhook", async (req, res) => {
    try {
      const events = req.body.events;
      
      // Respond with 200 OK immediately to verify the webhook for LINE
      if (!events || events.length === 0) {
        return res.status(200).send("OK");
      }

      // To reply, we need the Channel Access Token. 
      // It can be passed via environment variable or query parameter in the Webhook URL (e.g. /webhook?token=YOUR_TOKEN)
      const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || req.query.token as string;

      for (const event of events) {
        if (event.type === "message" && event.message.type === "text") {
          const text = event.message.text.trim();
          
          if (text === "!groupid" || text === "ขอรหัสกลุ่ม") {
            const groupId = event.source.groupId;
            const replyToken = event.replyToken;

            if (groupId && replyToken && channelAccessToken) {
              const replyMessage = `รหัส Group ID ของกลุ่มนี้คือ: ${groupId}\nให้นำรหัสนี้ไปใส่ในหน้า System Connections ได้เลยค่ะ`;

              // Using native fetch instead of @line/bot-sdk to avoid extra dependencies
              await fetch("https://api.line.me/v2/bot/message/reply", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${channelAccessToken}`
                },
                body: JSON.stringify({
                  replyToken: replyToken,
                  messages: [
                    {
                      type: "text",
                      text: replyMessage
                    }
                  ]
                })
              });
            } else if (!groupId) {
               // If it's a direct message, it has a userId instead of groupId
               const userId = event.source.userId;
               if (userId && replyToken && channelAccessToken) {
                  await fetch("https://api.line.me/v2/bot/message/reply", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${channelAccessToken}`
                    },
                    body: JSON.stringify({
                      replyToken: replyToken,
                      messages: [{ type: "text", text: `นี่คือแชทส่วนตัว ไม่ใช่กลุ่ม\nUser ID ของคุณคือ: ${userId}` }]
                    })
                  });
               }
            } else if (!channelAccessToken) {
              console.warn("Webhook received but no Channel Access Token configured. Set LINE_CHANNEL_ACCESS_TOKEN env var or pass ?token= in webhook URL.");
            }
          }
        }
      }
      res.status(200).send("OK");
    } catch (error) {
      console.error("Webhook Error:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // API Route for LINE Notifications
  app.post("/api/notify", async (req, res) => {
    try {
      const { message, notifyToken, channelAccessToken, userId } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      let lineNotifySuccess = false;
      let lineOASuccess = false;
      const errors = [];

      // 1. Send via LINE Notify (if token provided)
      if (notifyToken) {
        try {
          const notifyParams = new URLSearchParams();
          notifyParams.append('message', message);
          
          const notifyRes = await fetch('https://notify-api.line.me/api/notify', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${notifyToken}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: notifyParams
          });

          if (!notifyRes.ok) {
            errors.push(`LINE Notify failed: ${notifyRes.statusText}`);
          } else {
            lineNotifySuccess = true;
          }
        } catch (err: any) {
          errors.push(`LINE Notify error: ${err.message}`);
        }
      }

      // 2. Send via LINE OA Messaging API (if channel access token & user id provided)
      if (channelAccessToken && userId) {
        try {
          const oaRes = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${channelAccessToken}`
            },
            body: JSON.stringify({
              to: userId,
              messages: [
                {
                  type: "text",
                  text: message
                }
              ]
            })
          });

          if (!oaRes.ok) {
            const errorBody = await oaRes.text();
            errors.push(`LINE OA failed: ${errorBody}`);
          } else {
            lineOASuccess = true;
          }
        } catch (err: any) {
          errors.push(`LINE OA error: ${err.message}`);
        }
      }

      res.json({
        success: lineNotifySuccess || lineOASuccess,
        lineNotifySuccess,
        lineOASuccess,
        errors
      });
    } catch (error: any) {
      console.error("API Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });


  // API Route for Quotation Extraction
  app.post("/api/extract-quotation", async (req, res) => {
    try {
      const { fileData, mimeType } = req.body;
      if (!fileData || !mimeType) {
        return res.status(400).json({ error: "fileData and mimeType are required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server" });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      let response;
      let retries = 5;
      let delay = 3000;
      
      while (retries > 0) {
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.7-flash",
        contents: [
          {
            inlineData: {
              data: fileData,
              mimeType: mimeType
            }
          },
          {
            text: "Extract the following details from this Thai quotation document: Date (วันที่), Quotation Number (เลขที่), Customer (ลูกค้า/ชื่อโรงพยาบาล), Job Name (ชื่องาน), Description (รายละเอียด), Total Amount (จำนวนเงินรวมทั้งสิ้น), and Reference/Job Type (อ้างอิง - ระบุว่าเป็น PM หรือ CM)."
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING, description: "Date of the quotation (วันที่)" },
              quotationNumber: { type: Type.STRING, description: "Quotation number (เลขที่)" },
              customerName: { type: Type.STRING, description: "Customer name or hospital name (ลูกค้า / ชื่อโรงพยาบาล)" },
              jobName: { type: Type.STRING, description: "Job name or project name (ชื่องาน)" },
              description: { type: Type.STRING, description: "Description or list of items (รายละเอียด)" },
              totalAmount: { type: Type.NUMBER, description: "Total amount including tax as a number (จำนวนเงินรวมทั้งสิ้น)" },
              jobType: { type: Type.STRING, description: "Job Type (usually PM or CM), extracted from 'อ้างอิง' (Reference)" }
            },
            required: ["date", "quotationNumber", "jobName", "description", "totalAmount"]
          }
        }
      });
          break; // Success
        } catch (err: any) {
          console.error("API Error during generation:", err.message || err);
          retries--;
          
          const is503 = err.status === 503 || String(err).includes("503") || String(err).includes("UNAVAILABLE");
          const is429 = err.status === 429 || String(err).includes("429") || String(err).includes("RESOURCE_EXHAUSTED") || String(err).includes("Quota exceeded");
          
          if (retries === 0 || (!is503 && !is429)) {
            throw err;
          }
          
          let waitTime = delay;
          if (is429) {
             // Try to extract the retry delay from the error message (e.g. "retry in 47.8s")
             const match = String(err.message).match(/retry in ([0-9.]+)s/);
             if (match && match[1]) {
                waitTime = Math.min((parseFloat(match[1]) * 1000) + 1000, 60000); // Wait requested time + 1s, max 60s
             } else {
                waitTime = 10000; // Default 10s wait for 429 if no specific time given
             }
          }
          
          console.log(`Retrying after ${waitTime}ms... (${retries} retries left)`);
          await new Promise(res => setTimeout(res, waitTime));
          
          if (is503) {
             delay *= 1.5; // Only exponentially increase the default delay for 503s
          }
        }
      }

      let text = response?.text || "{}";
      const data = JSON.parse(text);
      res.json(data);
    } catch (error: any) {
      console.error("Extraction error:", error.message || error);
      
      let errorMsg = error.message || "Failed to extract quotation";
      if (String(errorMsg).includes("503") || String(errorMsg).includes("UNAVAILABLE")) {
        errorMsg = "ระบบ AI กำลังมีผู้ใช้งานจำนวนมาก กรุณารอสักครู่แล้วลองอัปโหลดใหม่อีกครั้ง (AI Service is currently busy, please try again in a few seconds).";
      } else if (String(errorMsg).includes("429") || String(errorMsg).includes("RESOURCE_EXHAUSTED") || String(errorMsg).includes("Quota exceeded")) {
        errorMsg = "โควต้าการใช้งาน AI เต็มชั่วคราว กรุณารอสักประมาณ 1 นาทีแล้วลองใหม่อีกครั้ง (API Quota Exceeded)";
      }
      
      res.status(500).json({ error: errorMsg });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
