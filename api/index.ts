import { createExpressApp } from "../serverApp";

let cachedApp: ReturnType<typeof createExpressApp> | null = null;

export default function handler(req: any, res: any) {
  try {
    if (!cachedApp) {
      cachedApp = createExpressApp();
    }
    return cachedApp(req, res);
  } catch (err: any) {
    console.error("Vercel API bootstrap error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        ok: false,
        configured: false,
        error: err?.message || "Serverless API initialization failed"
      })
    );
  }
}
