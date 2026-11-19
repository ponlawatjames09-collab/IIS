/**
 * Ready-to-deploy Google Apps Script (Code.gs) template for No-Login Real-Time Sync
 * between IIS Call Service and Google Sheets / Google Drive.
 */
export const GOOGLE_APPS_SCRIPT_CODE = `// ==========================================================
// IIS Call Service — Google Apps Script Bridge (Code.gs)
// Deploy as: Web app
// Execute as: Me
// Who has access: Anyone
// ==========================================================

function doGet(e) {
  return jsonOut_({
    ok: true,
    service: "IIS Call Service Bridge",
    status: "active",
    timestamp: new Date().toISOString()
  });
}

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : "{}";
    var req = JSON.parse(raw);
    var action = req.action;
    var payload = req.payload || {};

    switch (action) {
      case "ping":
        return jsonOut_({
          ok: true,
          data: { message: "Apps Script Bridge connected", timestamp: new Date().toISOString() }
        });

      case "getMetadata":
        return handleGetMetadata_(payload);

      case "getValues":
        return handleGetValues_(payload);

      case "batchGetValues":
        return handleBatchGetValues_(payload);

      case "updateValues":
        return handleUpdateValues_(payload);

      case "appendValues":
        return handleAppendValues_(payload);

      case "clearValues":
        return handleClearValues_(payload);

      case "addSheet":
        return handleAddSheet_(payload);

      case "createSpreadsheet":
        return handleCreateSpreadsheet_(payload);

      case "createDriveFolder":
        return handleCreateDriveFolder_(payload);

      case "uploadFile":
        return handleUploadFile_(payload);

      default:
        return jsonOut_({ ok: false, status: 400, error: "Unknown action: " + action });
    }
  } catch (err) {
    return jsonOut_({
      ok: false,
      status: 500,
      error: err && err.message ? err.message : String(err)
    });
  }
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function colToIndex_(colStr) {
  var col = String(colStr || "A").toUpperCase();
  var idx = 0;
  for (var i = 0; i < col.length; i++) {
    idx = idx * 26 + (col.charCodeAt(i) - 64);
  }
  return idx - 1; // 0-based
}

function parseA1Range_(ss, rangeStr) {
  var sheetName = null;
  var a1Part = String(rangeStr || "A1").trim();
  var bangIdx = a1Part.indexOf("!");
  if (bangIdx !== -1) {
    sheetName = a1Part.substring(0, bangIdx).trim();
    if (sheetName.charAt(0) === "'" && sheetName.charAt(sheetName.length - 1) === "'") {
      sheetName = sheetName.substring(1, sheetName.length - 1).replace(/''/g, "'");
    }
    a1Part = a1Part.substring(bangIdx + 1).trim();
  }

  var colonParts = a1Part.split(":");
  var startToken = colonParts[0] || "A1";
  var endToken = colonParts.length > 1 ? colonParts[1] : startToken;

  var startMatch = startToken.match(/^([A-Za-z]+)(\\d*)$/);
  var endMatch = endToken.match(/^([A-Za-z]+)?(\\d*)$/);

  var startCol = startMatch ? colToIndex_(startMatch[1]) : 0;
  var startRow = (startMatch && startMatch[2]) ? parseInt(startMatch[2], 10) : 1;

  var endCol = (endMatch && endMatch[1]) ? colToIndex_(endMatch[1]) : null;
  var endRow = (endMatch && endMatch[2]) ? parseInt(endMatch[2], 10) : null;

  var sheet = sheetName ? ss.getSheetByName(sheetName) : ss.getSheets()[0];
  return {
    sheet: sheet,
    sheetName: sheetName || (sheet ? sheet.getName() : ""),
    a1Part: a1Part,
    startCol: startCol,
    startRow: startRow,
    endCol: endCol,
    endRow: endRow
  };
}

function readSheetValues_(ss, rangeStr) {
  var parsed = parseA1Range_(ss, rangeStr);
  if (!parsed.sheet) {
    return { found: false, sheetName: parsed.sheetName, values: [] };
  }

  var sheet = parsed.sheet;
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow === 0 || lastCol === 0) {
    return { found: true, sheetName: parsed.sheetName, values: [] };
  }

  var actualEndRow = parsed.endRow ? Math.min(parsed.endRow, lastRow) : lastRow;
  var actualEndCol = parsed.endCol !== null ? Math.min(parsed.endCol + 1, lastCol) : lastCol;

  if (actualEndRow < parsed.startRow || actualEndCol < parsed.startCol + 1) {
    return { found: true, sheetName: parsed.sheetName, values: [] };
  }

  var numRows = actualEndRow - parsed.startRow + 1;
  var numCols = actualEndCol - parsed.startCol;
  var rawValues = sheet.getRange(parsed.startRow, parsed.startCol + 1, numRows, numCols).getDisplayValues();

  // Trim trailing empty rows and trailing empty cells per row to match Sheets API v4
  var trimmed = rawValues.map(function (row) {
    var lastNonEmpty = -1;
    for (var c = row.length - 1; c >= 0; c--) {
      if (row[c] !== "" && row[c] !== null && row[c] !== undefined) {
        lastNonEmpty = c;
        break;
      }
    }
    return lastNonEmpty === -1 ? [] : row.slice(0, lastNonEmpty + 1);
  });

  var lastValidRow = -1;
  for (var r = trimmed.length - 1; r >= 0; r--) {
    if (trimmed[r].length > 0) {
      lastValidRow = r;
      break;
    }
  }

  return {
    found: true,
    sheetName: parsed.sheetName,
    values: lastValidRow === -1 ? [] : trimmed.slice(0, lastValidRow + 1)
  };
}

function handleGetMetadata_(payload) {
  var ss = SpreadsheetApp.openById(payload.spreadsheetId);
  var sheets = ss.getSheets().map(function (s) {
    return {
      properties: {
        title: s.getName(),
        sheetId: s.getSheetId()
      }
    };
  });
  return jsonOut_({
    ok: true,
    data: {
      spreadsheetId: ss.getId(),
      properties: { title: ss.getName() },
      sheets: sheets
    }
  });
}

function handleGetValues_(payload) {
  var ss = SpreadsheetApp.openById(payload.spreadsheetId);
  var res = readSheetValues_(ss, payload.range);
  if (!res.found) {
    return jsonOut_({
      ok: false,
      status: 404,
      error: "Tab '" + res.sheetName + "' not found"
    });
  }
  return jsonOut_({
    ok: true,
    data: {
      range: payload.range,
      values: res.values
    }
  });
}

function handleBatchGetValues_(payload) {
  var ss = SpreadsheetApp.openById(payload.spreadsheetId);
  var ranges = payload.ranges || [];
  var valueRanges = ranges.map(function (r) {
    var res = readSheetValues_(ss, r);
    return {
      range: r,
      values: res.found ? res.values : []
    };
  });
  return jsonOut_({
    ok: true,
    data: {
      spreadsheetId: ss.getId(),
      valueRanges: valueRanges
    }
  });
}

function handleUpdateValues_(payload) {
  var ss = SpreadsheetApp.openById(payload.spreadsheetId);
  var parsed = parseA1Range_(ss, payload.range);
  if (!parsed.sheet) {
    return jsonOut_({
      ok: false,
      status: 404,
      error: "Tab '" + parsed.sheetName + "' not found"
    });
  }
  var values = payload.values || [];
  if (values.length === 0) {
    return jsonOut_({ ok: true, data: { updatedRows: 0 } });
  }
  var maxCols = 0;
  for (var i = 0; i < values.length; i++) {
    if (values[i].length > maxCols) maxCols = values[i].length;
  }
  var normalized = values.map(function (row) {
    var copy = row.slice();
    while (copy.length < maxCols) copy.push("");
    return copy;
  });

  parsed.sheet
    .getRange(parsed.startRow, parsed.startCol + 1, normalized.length, maxCols)
    .setValues(normalized);

  return jsonOut_({
    ok: true,
    data: { updatedRows: normalized.length }
  });
}

function handleAppendValues_(payload) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var ss = SpreadsheetApp.openById(payload.spreadsheetId);
    var parsed = parseA1Range_(ss, payload.range);
    if (!parsed.sheet) {
      return jsonOut_({
        ok: false,
        status: 404,
        error: "Tab '" + parsed.sheetName + "' not found"
      });
    }
    var values = payload.values || [];
    if (values.length === 0) {
      return jsonOut_({ ok: true, data: { appendedRows: 0 } });
    }
    var maxCols = 0;
    for (var i = 0; i < values.length; i++) {
      if (values[i].length > maxCols) maxCols = values[i].length;
    }
    var normalized = values.map(function (row) {
      var copy = row.slice();
      while (copy.length < maxCols) copy.push("");
      return copy;
    });

    var nextRow = parsed.sheet.getLastRow() + 1;
    parsed.sheet
      .getRange(nextRow, 1, normalized.length, maxCols)
      .setValues(normalized);

    return jsonOut_({
      ok: true,
      data: { appendedRows: normalized.length, startRow: nextRow }
    });
  } finally {
    lock.releaseLock();
  }
}

function handleClearValues_(payload) {
  var ss = SpreadsheetApp.openById(payload.spreadsheetId);
  var parsed = parseA1Range_(ss, payload.range);
  if (!parsed.sheet) {
    return jsonOut_({ ok: false, status: 404, error: "Tab not found" });
  }
  parsed.sheet.getRange(parsed.a1Part).clearContent();
  return jsonOut_({ ok: true, data: { clearedRange: payload.range } });
}

function handleAddSheet_(payload) {
  var ss = SpreadsheetApp.openById(payload.spreadsheetId);
  var existing = ss.getSheetByName(payload.title);
  if (!existing) {
    existing = ss.insertSheet(payload.title);
  }
  return jsonOut_({
    ok: true,
    data: { title: existing.getName(), sheetId: existing.getSheetId() }
  });
}

function handleCreateSpreadsheet_(payload) {
  var title = payload.title || "Service Job Hub - 2026";
  var sheetTitles = payload.sheetTitles || ["JAN2026"];
  var headers = payload.headers || null;

  var ss = SpreadsheetApp.create(title);
  var defaultSheet = ss.getSheets()[0];
  defaultSheet.setName(sheetTitles[0]);
  if (headers && headers.length > 0) {
    defaultSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  for (var i = 1; i < sheetTitles.length; i++) {
    var s = ss.insertSheet(sheetTitles[i]);
    if (headers && headers.length > 0) {
      s.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return jsonOut_({
    ok: true,
    data: { spreadsheetId: ss.getId(), url: ss.getUrl() }
  });
}

function handleCreateDriveFolder_(payload) {
  var folderName = payload.folderName || "Service Job Sheets PDF";
  var parent = payload.parentFolderId ? DriveApp.getFolderById(payload.parentFolderId) : DriveApp;
  var folders = parent.getFoldersByName(folderName);
  var folder = folders.hasNext() ? folders.next() : parent.createFolder(folderName);
  return jsonOut_({
    ok: true,
    data: { id: folder.getId(), name: folder.getName() }
  });
}

function handleUploadFile_(payload) {
  var bytes = Utilities.base64Decode(payload.base64Data);
  var blob = Utilities.newBlob(bytes, payload.mimeType || "application/octet-stream", payload.name || "file");
  var file;
  if (payload.parentFolderId) {
    var folder = DriveApp.getFolderById(payload.parentFolderId);
    file = folder.createFile(blob);
  } else {
    file = DriveApp.createFile(blob);
  }
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (sharingErr) {
    // Ignore if domain policy prevents public sharing
  }
  return jsonOut_({
    ok: true,
    data: {
      id: file.getId(),
      name: file.getName(),
      webViewLink: file.getUrl()
    }
  });
}
`;
