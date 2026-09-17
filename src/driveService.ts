/**
 * Google Drive API service for creating folders and uploading PDF reports
 */

export const createDriveFolder = async (accessToken: string, folderName: string): Promise<string> => {
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
  try {
    // Standard multipart upload for file + metadata
    const metadata: any = {
      name: filename,
      mimeType: 'application/pdf',
    };

    if (parentFolderId) {
      metadata.parents = [parentFolderId];
    }

    const boundary = 'foo_bar_boundary';
    
    // Construct multipart form body
    const metadataPart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
    
    // Convert Blob to ArrayBuffer
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const pdfData = new Uint8Array(arrayBuffer);
    
    // We need to build a binary payload or upload metadata first, then update media.
    // However, Google Drive supports /upload/drive/v3/files?uploadType=multipart.
    // Let's build the multipart body cleanly as a Blob.
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
