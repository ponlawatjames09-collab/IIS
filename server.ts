import { GoogleGenAI, Type } from "@google/genai";
import { JWT } from "google-auth-library";
import express from "express";
import fs from "fs";
import http from "http";
import https from "https";
import path from "path";
import { THAILAND_REGIONS, THAILAND_HOSPITALS_DATABASE, resolveHospitalLocation } from "./src/data/thailandHospitalData";

interface ServiceAccountCredentials {
  client_email: string;
  private_key: string;
  project_id?: string;
}

interface BridgeConfigStore {
  gasWebAppUrl: string;
  spreadsheetId: string;
  pmSpreadsheetId: string;
  cmOnCallSpreadsheetId: string;
  drivePdfFolderId: string;
  serviceAccount: ServiceAccountCredentials | null;
}

const BRIDGE_CONFIG_FILE = path.join(process.cwd(), ".bridge-config.json");

const EMBEDDED_SPREADSHEET_ID = "1s2VkerbQ7y0BeHBcdtzkXtsxzn-VR6ZMw2l0p9NCiP8";
const EMBEDDED_PM_SPREADSHEET_ID = "1wBbN1127iViI_0pXZU2RUoVeuSxQfZsI0qoIgxaaO4s";
const EMBEDDED_CM_ONCALL_SPREADSHEET_ID = "19c9vJhO4qMdCP1O7rwWP_aUZyTqQrTwnzWWxtH7zDdE";

const EMBEDDED_SERVICE_ACCOUNT: ServiceAccountCredentials = {
  project_id: "gen-lang-client-0960472031",
  client_email: "serviceiis@gen-lang-client-0960472031.iam.gserviceaccount.com",
  private_key: [
    "-----BEGIN PRIVATE KEY-----",
    "MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC154xi1HUjX/X+",
    "1o+CRqRH4E+SnzqGB4IAOS4bE133HovkgRg1QHp14Fhd3fFHEoO70qCc//4NtA6s",
    "9oBHsgFEkNWeVshGOnoi9c5Cq+zZINkRMH4sHR2r9iWlGy3zFK1V8pJn9/TThUZb",
    "2ffIpLxv2/XvkpyDveXbYZv5KSb18OqKHs9wDagP6qkeCYsJWJiBkJZqJWzl+7Vk",
    "zo7eMZ3rUNkQ+oQ/8XteZofC2leDGBqTvhNXHGKWqn+onjO6MWLUzZa80RSVVXnt",
    "NRJxHDjlOiB85KstUsj5W56JcF7NVr98jdN6WhV1J8N9A1cu8YsTSnzHnogbg7nR",
    "/cQFmk35AgMBAAECggEAMX9NMwNO0I5nGK33pOJmB2zhGiubuCbI2Bi3FAUEF59H",
    "P6llFfByoiqmwPwIkGdYUz5wF+iMj9wD9kqpA1lLgQXMKubAXmPBIkwykO/JZhfL",
    "GSNR4d0WWtmCyteHfFKPDAkSj5noE7p7N7kq9HznDaUT2dnSHwMITdbUo0rwYBF1",
    "ZKi4Ct9tYY9uqVxuB7SKsg1Ttj4y7tfAoJ9eVzuQPBGYBBxlElm7RCoqhDeL0xPk",
    "uhV7Q6G38pZW6lm6agWPZtf1MpxJM0a+GFpUqUaRm2TYIMcvVwU3giYsp3ZEY6b2",
    "UOyt+sZd3Dak1EzhuW7zvcwnSmuXBmxqPQvTISAuRQKBgQDpR8IGrI8YqxBKqWJb",
    "9H35HYeTN/3AXoagGZkdBmoa1OjuDmUhjmBRkKiQu4EKbTFe1cw2tsUWTkdCWtnc",
    "C8ZfuBaKpTg9q5NRWNf4kwxEDJEMPNuK+R/1gAF0Mr7qyeO6W9V7OREHvWdHaZ2I",
    "5N2zl5l6+NCe8Y2kExKBeCBgAwKBgQDHnt35C/fUuxMDISkjR4U3b0oeHlTZDxsr",
    "IyhAqr9wB2DW7l1/Tr9K7/zjqGMMP2DM2pwKSg0HdWNCzmzdMLGXdIWbSyebVIGN",
    "yKeBQr9z9sk2n1YywzL59KQZO3KfJxMKTCGDi15gaTTKpMsckJw63oephzczigHK",
    "Gbr67ykPUwKBgFXRBQqJfla3z1V3/GwRhCoZd99rkJis7V+GKzJnQq8+NbYla4St",
    "qLc4vRoJME5Snv/hLK/QCq7K+yHo5A4z8rURtpEoeIkPTjF1unWCOtfpu45B8Q2t",
    "2djpTx+c72jV/kV3NRCQjLhJL+4wZziN4RUJJvf7AlwGRnHeZkdklpxbAoGADDxH",
    "nMlIAokI7EsvC1OJ7dDreRcg2kEbyDQadoRAwawiGmp33qLEBOLa3FVo5MpJs6S+",
    "pb7ON6PRVrnyYEhoykDBI7iij9nJKxiec8TUmVYKFUgE742ZZUrCeC11pB2wBBSQ",
    "hVCYk04/hyA8tt6CRPV42UJJduZBn9Kd7F2WZbMCgYAAmkPH4o7h84iFzgCVmalM",
    "PpidMUOZHjHnEjwy6rixmCGvfPmJO89vMuI0TuIAOx2msWm0LVTUXlJ32htZgfLh",
    "sCTcTdyPcx0b40mPFa05LR9icIpMANB2eJXsPZ6kqhJJB+xkLV3zsY6K3jlRVvEE",
    "gRpuioHBtdbYqMjpc8ZHVw==",
    "-----END PRIVATE KEY-----",
    ""
  ].join("\n")
};

function parseServiceAccountJson(raw: string | undefined | null): ServiceAccountCredentials | null {
  if (!raw || !raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw.trim());
    if (parsed && typeof parsed.client_email === "string" && typeof parsed.private_key === "string") {
      return {
        client_email: parsed.client_email,
        private_key: parsed.private_key.replace(/\\n/g, "\n"),
        project_id: parsed.project_id
      };
    }
  } catch {
    return null;
  }
  return null;
}

function loadBridgeConfig(): BridgeConfigStore {
  let fileData: Partial<BridgeConfigStore> = {};
  try {
    if (fs.existsSync(BRIDGE_CONFIG_FILE)) {
      fileData = JSON.parse(fs.readFileSync(BRIDGE_CONFIG_FILE, "utf8")) || {};
    }
  } catch (err) {
    console.warn("Could not read .bridge-config.json:", err);
  }

  return {
    gasWebAppUrl: fileData.gasWebAppUrl || process.env.GAS_WEB_APP_URL || "",
    spreadsheetId: fileData.spreadsheetId || process.env.DEFAULT_SPREADSHEET_ID || EMBEDDED_SPREADSHEET_ID,
    pmSpreadsheetId: fileData.pmSpreadsheetId || process.env.DEFAULT_PM_SPREADSHEET_ID || EMBEDDED_PM_SPREADSHEET_ID,
    cmOnCallSpreadsheetId:
      fileData.cmOnCallSpreadsheetId ||
      process.env.DEFAULT_CM_ONCALL_SPREADSHEET_ID ||
      EMBEDDED_CM_ONCALL_SPREADSHEET_ID,
    drivePdfFolderId: fileData.drivePdfFolderId || process.env.DEFAULT_DRIVE_PDF_FOLDER_ID || "",
    serviceAccount:
      (fileData.serviceAccount && fileData.serviceAccount.client_email && fileData.serviceAccount.private_key
        ? fileData.serviceAccount
        : null) ||
      parseServiceAccountJson(process.env.GOOGLE_SERVICE_ACCOUNT_JSON) ||
      EMBEDDED_SERVICE_ACCOUNT
  };
}

function saveBridgeConfig(config: BridgeConfigStore) {
  try {
    fs.writeFileSync(BRIDGE_CONFIG_FILE, JSON.stringify(config, null, 2), "utf8");
  } catch (err) {
    console.warn("Could not persist .bridge-config.json:", err);
  }
}

let cachedServiceToken: { token: string; expiresAt: number; email: string } | null = null;

async function getServiceAccountAccessToken(sa: ServiceAccountCredentials): Promise<string> {
  if (
    cachedServiceToken &&
    cachedServiceToken.email === sa.client_email &&
    Date.now() < cachedServiceToken.expiresAt - 60_000
  ) {
    return cachedServiceToken.token;
  }

  const client = new JWT({
    email: sa.client_email,
    key: sa.private_key,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive"
    ]
  });

  const tokenRes = await client.getAccessToken();
  const token = tokenRes?.token;
  if (!token) {
    throw new Error("Failed to obtain access token from Service Account.");
  }

  cachedServiceToken = {
    token,
    email: sa.client_email,
    expiresAt: Date.now() + 50 * 60 * 1000
  };
  return token;
}

async function executeViaServiceAccount(
  sa: ServiceAccountCredentials,
  action: string,
  payload: any
): Promise<{ status: number; body: any }> {
  const token = await getServiceAccountAccessToken(sa);
  const authHeaders = { Authorization: `Bearer ${token}` };
  const jsonHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  switch (action) {
    case "ping":
      return {
        status: 200,
        body: { ok: true, data: { message: `Service Account ready (${sa.client_email})` } }
      };

    case "getMetadata": {
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${payload.spreadsheetId}`, {
        headers: authHeaders
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          status: res.status,
          body: { ok: false, status: res.status, error: data?.error?.message || `HTTP ${res.status}` }
        };
      }
      return { status: 200, body: { ok: true, data } };
    }

    case "getValues": {
      const range = encodeURIComponent(payload.range);
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${payload.spreadsheetId}/values/${range}`,
        { headers: authHeaders }
      );
      const data = await res.json();
      if (!res.ok) {
        return {
          status: res.status,
          body: { ok: false, status: res.status, error: data?.error?.message || `HTTP ${res.status}` }
        };
      }
      return { status: 200, body: { ok: true, data } };
    }

    case "batchGetValues": {
      const rangesQuery = (payload.ranges || [])
        .map((r: string) => `ranges=${encodeURIComponent(r)}`)
        .join("&");
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${payload.spreadsheetId}/values:batchGet?${rangesQuery}`,
        { headers: authHeaders }
      );
      const data = await res.json();
      if (!res.ok) {
        return {
          status: res.status,
          body: { ok: false, status: res.status, error: data?.error?.message || `HTTP ${res.status}` }
        };
      }
      return { status: 200, body: { ok: true, data } };
    }

    case "updateValues": {
      const range = encodeURIComponent(payload.range);
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${payload.spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
        {
          method: "PUT",
          headers: jsonHeaders,
          body: JSON.stringify({ values: payload.values || [] })
        }
      );
      const data = await res.json();
      if (!res.ok) {
        return {
          status: res.status,
          body: { ok: false, status: res.status, error: data?.error?.message || `HTTP ${res.status}` }
        };
      }
      return { status: 200, body: { ok: true, data } };
    }

    case "appendValues": {
      const range = encodeURIComponent(payload.range);
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${payload.spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({ values: payload.values || [] })
        }
      );
      const data = await res.json();
      if (!res.ok) {
        return {
          status: res.status,
          body: { ok: false, status: res.status, error: data?.error?.message || `HTTP ${res.status}` }
        };
      }
      return { status: 200, body: { ok: true, data } };
    }

    case "clearValues": {
      const range = encodeURIComponent(payload.range);
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${payload.spreadsheetId}/values/${range}:clear`,
        {
          method: "POST",
          headers: jsonHeaders
        }
      );
      const data = await res.json();
      if (!res.ok) {
        return {
          status: res.status,
          body: { ok: false, status: res.status, error: data?.error?.message || `HTTP ${res.status}` }
        };
      }
      return { status: 200, body: { ok: true, data } };
    }

    case "addSheet": {
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${payload.spreadsheetId}:batchUpdate`,
        {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({
            requests: [{ addSheet: { properties: { title: payload.title } } }]
          })
        }
      );
      const data = await res.json();
      if (!res.ok) {
        return {
          status: res.status,
          body: { ok: false, status: res.status, error: data?.error?.message || `HTTP ${res.status}` }
        };
      }
      return { status: 200, body: { ok: true, data } };
    }

    case "createSpreadsheet": {
      const sheetTitles: string[] = payload.sheetTitles || ["JAN2026"];
      const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          properties: { title: payload.title || "Service Job Hub - 2026" },
          sheets: sheetTitles.map((title) => ({ properties: { title } }))
        })
      });
      const created = await createRes.json();
      if (!createRes.ok) {
        return {
          status: createRes.status,
          body: { ok: false, status: createRes.status, error: created?.error?.message || "Failed to create spreadsheet" }
        };
      }
      if (payload.headers && payload.headers.length > 0) {
        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${created.spreadsheetId}/values:batchUpdate`,
          {
            method: "POST",
            headers: jsonHeaders,
            body: JSON.stringify({
              valueInputOption: "RAW",
              data: sheetTitles.map((t) => ({ range: `${t}!A1:BC1`, values: [payload.headers] }))
            })
          }
        );
      }
      return { status: 200, body: { ok: true, data: { spreadsheetId: created.spreadsheetId } } };
    }

    case "createDriveFolder": {
      const bodyPayload: any = {
        name: payload.folderName || "Service Job Sheets PDF",
        mimeType: "application/vnd.google-apps.folder"
      };
      if (payload.parentFolderId) bodyPayload.parents = [payload.parentFolderId];
      const res = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          status: res.status,
          body: { ok: false, status: res.status, error: data?.error?.message || "Failed to create folder" }
        };
      }
      return { status: 200, body: { ok: true, data } };
    }

    case "uploadFile": {
      const metadata: any = {
        name: payload.name || "file",
        mimeType: payload.mimeType || "application/octet-stream"
      };
      if (payload.parentFolderId) metadata.parents = [payload.parentFolderId];

      const boundary = "iis_service_bridge_boundary";
      const fileBuffer = Buffer.from(payload.base64Data || "", "base64");
      const metaPart = Buffer.from(
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${metadata.mimeType}\r\n\r\n`,
        "utf8"
      );
      const endPart = Buffer.from(`\r\n--${boundary}--`, "utf8");
      const multipartBody = Buffer.concat([metaPart, fileBuffer, endPart]);

      const res = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": `multipart/related; boundary=${boundary}`
          },
          body: multipartBody
        }
      );
      const data = await res.json();
      if (!res.ok) {
        return {
          status: res.status,
          body: { ok: false, status: res.status, error: data?.error?.message || "Failed to upload file" }
        };
      }
      return { status: 200, body: { ok: true, data } };
    }

    default:
      return { status: 400, body: { ok: false, status: 400, error: `Unknown action: ${action}` } };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // ==========================================
  // No-Login Google Bridge Config & Proxy APIs
  // ==========================================
  app.get("/api/bridge/config", (req, res) => {
    const cfg = loadBridgeConfig();
    const mode = cfg.gasWebAppUrl
      ? "gas"
      : cfg.serviceAccount
      ? "service_account"
      : "none";

    res.json({
      configured: mode !== "none",
      mode,
      gasWebAppUrl: cfg.gasWebAppUrl,
      hasServiceAccount: Boolean(cfg.serviceAccount),
      serviceAccountEmail: cfg.serviceAccount?.client_email || null,
      spreadsheetId: cfg.spreadsheetId,
      pmSpreadsheetId: cfg.pmSpreadsheetId,
      cmOnCallSpreadsheetId: cfg.cmOnCallSpreadsheetId,
      drivePdfFolderId: cfg.drivePdfFolderId
    });
  });

  app.post("/api/bridge/config", (req, res) => {
    try {
      const current = loadBridgeConfig();
      const {
        gasWebAppUrl,
        spreadsheetId,
        pmSpreadsheetId,
        cmOnCallSpreadsheetId,
        drivePdfFolderId,
        serviceAccountJson,
        clearServiceAccount
      } = req.body || {};

      const next: BridgeConfigStore = {
        gasWebAppUrl: typeof gasWebAppUrl === "string" ? gasWebAppUrl.trim() : current.gasWebAppUrl,
        spreadsheetId: typeof spreadsheetId === "string" ? spreadsheetId.trim() : current.spreadsheetId,
        pmSpreadsheetId: typeof pmSpreadsheetId === "string" ? pmSpreadsheetId.trim() : current.pmSpreadsheetId,
        cmOnCallSpreadsheetId:
          typeof cmOnCallSpreadsheetId === "string"
            ? cmOnCallSpreadsheetId.trim()
            : current.cmOnCallSpreadsheetId,
        drivePdfFolderId:
          typeof drivePdfFolderId === "string" ? drivePdfFolderId.trim() : current.drivePdfFolderId,
        serviceAccount: current.serviceAccount
      };

      if (clearServiceAccount) {
        next.serviceAccount = null;
        cachedServiceToken = null;
      } else if (typeof serviceAccountJson === "string" && serviceAccountJson.trim()) {
        const parsed = parseServiceAccountJson(serviceAccountJson);
        if (!parsed) {
          return res.status(400).json({
            error: "Service Account JSON ไม่ถูกต้อง (ต้องมี client_email และ private_key)"
          });
        }
        next.serviceAccount = parsed;
        cachedServiceToken = null;
      }

      saveBridgeConfig(next);

      const mode = next.gasWebAppUrl
        ? "gas"
        : next.serviceAccount
        ? "service_account"
        : "none";

      res.json({
        success: true,
        configured: mode !== "none",
        mode,
        gasWebAppUrl: next.gasWebAppUrl,
        hasServiceAccount: Boolean(next.serviceAccount),
        serviceAccountEmail: next.serviceAccount?.client_email || null,
        spreadsheetId: next.spreadsheetId,
        pmSpreadsheetId: next.pmSpreadsheetId,
        cmOnCallSpreadsheetId: next.cmOnCallSpreadsheetId,
        drivePdfFolderId: next.drivePdfFolderId
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to update bridge config" });
    }
  });

  function doRawHttpRequest(
    targetUrl: string,
    options: {
      method: "GET" | "POST";
      headers?: Record<string, string>;
      body?: string;
      timeoutMs?: number;
    }
  ): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(targetUrl);
      const transport = parsedUrl.protocol === "http:" ? http : https;

      const reqHeaders: Record<string, string> = {
        "User-Agent": "IIS-Service-Bridge/1.0",
        "Accept": "application/json, text/plain, */*",
        "Connection": "close",
        ...(options.headers || {})
      };

      if (options.body !== undefined) {
        reqHeaders["Content-Length"] = String(Buffer.byteLength(options.body, "utf8"));
      }

      const req = transport.request(
        {
          protocol: parsedUrl.protocol,
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || (parsedUrl.protocol === "http:" ? 80 : 443),
          path: parsedUrl.pathname + parsedUrl.search,
          method: options.method,
          agent: false, // Prevent undici/keep-alive ECONNRESET on Google Apps Script redirects
          headers: reqHeaders
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (chunk: Buffer) => chunks.push(chunk));
          res.on("end", () => {
            resolve({
              status: res.statusCode || 500,
              headers: res.headers,
              body: Buffer.concat(chunks).toString("utf8")
            });
          });
          res.on("error", reject);
        }
      );

      req.setTimeout(options.timeoutMs ?? 30000, () => {
        req.destroy(new Error("Request to Google Apps Script timed out"));
      });

      req.on("error", reject);
      if (options.body !== undefined) {
        req.write(options.body, "utf8");
      }
      req.end();
    });
  }

  function isTransientNetworkError(err: any): boolean {
    const code = err?.code || err?.cause?.code || "";
    const msg = String(err?.message || "").toLowerCase();
    return (
      code === "ECONNRESET" ||
      code === "ETIMEDOUT" ||
      code === "EPIPE" ||
      code === "ECONNREFUSED" ||
      code === "EAI_AGAIN" ||
      msg.includes("econnreset") ||
      msg.includes("socket hang up") ||
      msg.includes("timed out")
    );
  }

  async function postToAppsScript(targetGasUrl: string, bodyObj: { action: string; payload: any }) {
    const payloadStr = JSON.stringify(bodyObj);
    const isReadAction = ["ping", "getMetadata", "getValues", "batchGetValues"].includes(bodyObj.action);
    const maxAttempts = isReadAction ? 3 : 2;

    let lastErr: any = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        let res = await doRawHttpRequest(targetGasUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: payloadStr
        });

        let currentUrl = targetGasUrl;
        let redirectCount = 0;

        while (
          [301, 302, 303, 307, 308].includes(res.status) &&
          res.headers.location &&
          redirectCount < 5
        ) {
          const nextLocation = Array.isArray(res.headers.location)
            ? res.headers.location[0]
            : res.headers.location;
          const resolvedUrl = new URL(nextLocation, currentUrl).toString();

          if (resolvedUrl.includes("accounts.google.com")) {
            return {
              status: 403,
              body: "",
              isAuthRedirect: true
            };
          }

          // After GAS doPost executes, it redirects to script.googleusercontent.com/macros/echo for GET
          let getAttempt = 0;
          while (true) {
            try {
              res = await doRawHttpRequest(resolvedUrl, { method: "GET" });
              break;
            } catch (getErr: any) {
              getAttempt++;
              if (getAttempt >= 3 || !isTransientNetworkError(getErr)) throw getErr;
              await new Promise((r) => setTimeout(r, 250 * getAttempt));
            }
          }

          currentUrl = resolvedUrl;
          redirectCount++;
        }

        return { status: res.status, body: res.body, isAuthRedirect: false };
      } catch (err: any) {
        lastErr = err;
        if (attempt < maxAttempts && isTransientNetworkError(err)) {
          await new Promise((r) => setTimeout(r, 350 * attempt));
          continue;
        }
        throw err;
      }
    }

    throw lastErr || new Error("Failed to contact Google Apps Script");
  }

  app.post("/api/google-bridge", async (req, res) => {
    try {
      const { action, payload, gasWebAppUrl } = req.body || {};
      if (!action) {
        return res.status(400).json({ ok: false, error: "action is required" });
      }

      const cfg = loadBridgeConfig();
      const targetGasUrl = (typeof gasWebAppUrl === "string" && gasWebAppUrl.trim()) || cfg.gasWebAppUrl;

      // Priority 1: Google Apps Script Web App Bridge
      if (targetGasUrl) {
        if (targetGasUrl.endsWith("/dev")) {
          return res.status(200).json({
            ok: false,
            status: 403,
            error:
              "คุณกำลังใช้ลิงก์ /dev (สำหรับผู้พัฒนาเท่านั้น) — กรุณากด Deploy > New deployment > Web app (Who has access: Anyone) แล้วนำลิงก์ที่ลงท้ายด้วย /exec มาใช้งานแทน"
          });
        }

        const gasResult = await postToAppsScript(targetGasUrl, { action, payload: payload || {} });
        const rawText = gasResult.body || "";

        if (gasResult.isAuthRedirect || gasResult.status === 401 || rawText.trim().startsWith("<")) {
          return res.status(200).json({
            ok: false,
            status: 403,
            error:
              "Apps Script Web App ไม่สามารถเข้าถึงได้แบบสาธารณะ (HTTP " +
              gasResult.status +
              ") — กรุณาตรวจสอบในหน้า Apps Script ว่ากด Deploy > New deployment > Web app โดยตั้งค่า Execute as: Me และ Who has access: Anyone แล้วคัดลอกลิงก์ /exec ล่าสุดมาวางใหม่ (หากบัญชี Google Workspace องค์กรบล็อกการแชร์แบบ Anyone ให้สร้าง Apps Script บนบัญชี @gmail.com ส่วนตัว หรือใช้แท็บ Service Account JSON แทน)"
          });
        }

        let parsed: any;
        try {
          parsed = JSON.parse(rawText);
        } catch {
          return res.status(200).json({
            ok: false,
            status: 502,
            error: `Apps Script response is not valid JSON (HTTP ${gasResult.status}): ${rawText.slice(0, 200)}`
          });
        }

        if (!parsed.ok) {
          return res.status(200).json({
            ...parsed,
            ok: false,
            status: Number(parsed.status) || 500
          });
        }

        return res.json(parsed);
      }

      // Priority 2: Google Service Account
      if (cfg.serviceAccount) {
        const saResult = await executeViaServiceAccount(cfg.serviceAccount, action, payload || {});
        return res.status(200).json(saResult.body);
      }

      return res.status(200).json({
        ok: false,
        status: 503,
        errorCode: "BRIDGE_NOT_CONFIGURED",
        error:
          "ยังไม่ได้เชื่อมต่อ Apps Script Bridge หรือ Service Account — กรุณาไปที่ System Connections เพื่อวาง Web App URL"
      });
    } catch (err: any) {
      console.warn("Google Bridge Error:", err?.message || err);
      const isReset = isTransientNetworkError(err);
      res.status(200).json({
        ok: false,
        status: isReset ? 502 : 500,
        error: isReset
          ? `เชื่อมต่อ Google Apps Script ขัดข้องชั่วคราว (${err?.code || err?.cause?.code || "ECONNRESET"}) กรุณาลองใหม่อีกครั้งหรือตรวจสอบ Web App URL`
          : err.message || "Google Bridge proxy error"
      });
    }
  });

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

  // ==========================================
  // Thailand Hospital Map & Region APIs
  // ==========================================
  
  // 1. Get defined PM regions configuration
  app.get("/api/map/regions", (req, res) => {
    try {
      res.json({
        success: true,
        regions: THAILAND_REGIONS
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Get curated Thailand hospitals database
  app.get("/api/map/hospitals", (req, res) => {
    try {
      const regionFilter = req.query.region as string;
      let list = THAILAND_HOSPITALS_DATABASE;
      if (regionFilter && regionFilter !== 'All') {
        list = list.filter(h => h.region.toLowerCase() === regionFilter.toLowerCase());
      }
      res.json({
        success: true,
        total: list.length,
        hospitals: list
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Resolve location for batch of hospitals (from PM schedule records)
  app.post("/api/map/resolve-locations", (req, res) => {
    try {
      const items: Array<{ hospitalName: string; hintRegion?: string; metadata?: any }> = req.body.items || [];
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: "items array is required" });
      }

      const results = items.map(item => {
        const location = resolveHospitalLocation(item.hospitalName, item.hintRegion);
        return {
          hospitalName: item.hospitalName,
          hintRegion: item.hintRegion,
          location,
          metadata: item.metadata
        };
      });

      res.json({
        success: true,
        count: results.length,
        results
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Hardcoded Telegram Bot Configuration (Embedded directly in system, no per-device setting required)
  const TELEGRAM_BOT_TOKEN = "9053573002:AAHZovzwSjReuDpAiZ7eeBoaHetwWFZqSkk";
  const TELEGRAM_CHAT_ID = "-1004379656642";

  // API Route for Notifications (Telegram + LINE OA / LINE Notify)
  app.post("/api/notify", async (req, res) => {
    try {
      const { message, notifyToken, channelAccessToken, userId } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      let telegramSuccess = false;
      let lineNotifySuccess = false;
      let lineOASuccess = false;
      const errors: string[] = [];

      // 1. Always send via Embedded Telegram Bot
      if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        try {
          const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text: message
            })
          });

          if (!tgRes.ok) {
            const tgErrText = await tgRes.text();
            errors.push(`Telegram failed: ${tgErrText}`);
          } else {
            telegramSuccess = true;
          }
        } catch (err: any) {
          errors.push(`Telegram error: ${err.message}`);
        }
      }

      // 2. Send via LINE Notify (if token provided)
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

      // 3. Send via LINE OA Messaging API (if channel access token & user id provided)
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
        success: telegramSuccess || lineNotifySuccess || lineOASuccess,
        telegramSuccess,
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
