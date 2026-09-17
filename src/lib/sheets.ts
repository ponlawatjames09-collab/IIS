export async function getOrCreateDatabaseSheet(accessToken: string): Promise<string> {
  // 1. Search for existing sheet
  const searchUrl = new URL('https://www.googleapis.com/drive/v3/files');
  searchUrl.searchParams.append('q', "name='AppUsersDatabase' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  searchUrl.searchParams.append('fields', 'files(id, name)');

  const searchRes = await fetch(searchUrl.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!searchRes.ok) {
    throw new Error('Failed to search for existing database sheet');
  }

  const searchData = await searchRes.json();
  
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // 2. Create new sheet if it doesn't exist
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: 'AppUsersDatabase',
      },
      sheets: [
        {
          properties: {
            title: 'Users',
            gridProperties: { rowCount: 1000, columnCount: 3 },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    throw new Error('Failed to create database sheet');
  }

  const createData = await createRes.json();
  const sheetId = createData.spreadsheetId;

  // 3. Add headers to the new sheet
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Users!A1:C1?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: 'Users!A1:C1',
      majorDimension: 'ROWS',
      values: [['Name', 'Email', 'Password']],
    }),
  });

  return sheetId;
}

export async function appendUserRow(accessToken: string, sheetId: string, name: string, email: string, password: string) {
  const appendRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Users!A:C:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [[name, email, password]],
    }),
  });

  if (!appendRes.ok) {
    throw new Error('Failed to register user');
  }
}

export async function getUsers(accessToken: string, sheetId: string): Promise<any[]> {
  const getRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Users!A:C`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!getRes.ok) {
    throw new Error('Failed to fetch users');
  }

  const data = await getRes.json();
  const rows = data.values || [];
  
  if (rows.length === 0) return [];

  // Skip header row
  return rows.slice(1).map((row: any) => ({
    name: row[0],
    email: row[1],
    password: row[2],
  }));
}
