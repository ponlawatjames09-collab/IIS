import { callGoogleBridge, shouldUseBridge } from './googleBridgeClient';

/**
 * Google Drive API service for creating folders and uploading PDF reports
 * Supports No-Login Bridge Mode (GAS / Service Account) and optional OAuth token.
 */

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result || '');
      const commaIdx = result.indexOf(',');
      resolve(commaIdx !== -1 ? result.slice(commaIdx + 1) : result);
    };
    reader.onerror = () => reject(reader.error || new Error('Failed to encode file to base64'));
    reader.readAsDataURL(blob);
  });

export const createDriveFolder = async (accessToken: string, folderName: string): Promise<string> => {
  if (shouldUseBridge(accessToken)) {
    const bridgeRes = await callGoogleBridge<{ id: string }>('createDriveFolder', { folderName });
    if (!bridgeRes.ok || !bridgeRes.data?.id) {
      throw new Error(`Failed to create Drive folder: ${bridgeRes.error || `HTTP ${bridgeRes.status}`}`);
    }
    return bridgeRes.data.id;
  }

  try {
    const res = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      })
    });

    if (!res.ok) {
      const errTxt = await res.text();
      throw new Error(`Failed to create Drive folder: ${errTxt}`);
    }

    const data = await res.json();
    return data.id;
  } catch (error) {
    console.error("Error creating Google Drive folder:", error);
    throw error;
  }
};

export const uploadPDFToDrive = async (
  accessToken: string,
  pdfBlob: Blob,
  filename: string,
  parentFolderId?: string
): Promise<{ id: string; webViewLink: string }> => {
  if (shouldUseBridge(accessToken)) {
    const base64Data = await blobToBase64(pdfBlob);
    const bridgeRes = await callGoogleBridge<{ id: string; webViewLink: string }>('uploadFile', {
      name: filename,
      mimeType: 'application/pdf',
      base64Data,
      parentFolderId
    });
    if (!bridgeRes.ok || !bridgeRes.data) {
      throw new Error(`Failed to upload PDF: ${bridgeRes.error || `HTTP ${bridgeRes.status}`}`);
    }
    return bridgeRes.data;
  }

  try {
    const metadata: any = {
      name: filename,
      mimeType: 'application/pdf',
    };

    if (parentFolderId) {
      metadata.parents = [parentFolderId];
    }

    const boundary = 'foo_bar_boundary';
    const metadataPart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const pdfData = new Uint8Array(arrayBuffer);

    const beforePart = new TextEncoder().encode(metadataPart + `--${boundary}\r\nContent-Type: application/pdf\r\n\r\n`);
    const afterPart = new TextEncoder().encode(`\r\n--${boundary}--`);

    const multipartBlob = new Blob([beforePart, pdfData, afterPart], { type: `multipart/related; boundary=${boundary}` });

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartBlob
    });

    if (!res.ok) {
      const errTxt = await res.text();
      throw new Error(`Failed to upload PDF: ${errTxt}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error uploading PDF to Google Drive:", error);
    throw error;
  }
};

export const uploadImageToDrive = async (
  accessToken: string,
  imageFile: File,
  parentFolderId?: string
): Promise<{ id: string; webViewLink: string }> => {
  if (shouldUseBridge(accessToken)) {
    const base64Data = await blobToBase64(imageFile);
    const bridgeRes = await callGoogleBridge<{ id: string; webViewLink: string }>('uploadFile', {
      name: imageFile.name,
      mimeType: imageFile.type || 'image/jpeg',
      base64Data,
      parentFolderId
    });
    if (!bridgeRes.ok || !bridgeRes.data) {
      throw new Error(`Failed to upload Image: ${bridgeRes.error || `HTTP ${bridgeRes.status}`}`);
    }
    return bridgeRes.data;
  }

  try {
    const metadata: any = {
      name: imageFile.name,
      mimeType: imageFile.type,
    };
    if (parentFolderId) {
      metadata.parents = [parentFolderId];
    }
    const boundary = 'foo_bar_boundary';
    const metadataPart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;

    const arrayBuffer = await imageFile.arrayBuffer();
    const imageData = new Uint8Array(arrayBuffer);

    const beforePart = new TextEncoder().encode(metadataPart + `--${boundary}\r\nContent-Type: ${imageFile.type}\r\n\r\n`);
    const afterPart = new TextEncoder().encode(`\r\n--${boundary}--`);

    const multipartBlob = new Blob([beforePart, imageData, afterPart], { type: `multipart/related; boundary=${boundary}` });
    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartBlob
    });
    if (!res.ok) {
      const errTxt = await res.text();
      throw new Error(`Failed to upload Image: ${errTxt}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error uploading Image to Google Drive:", error);
    throw error;
  }
};

