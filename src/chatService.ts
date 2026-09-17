export const sendChatMessage = async (accessToken: string, email: string, message: string) => {
  try {
    // 1. Setup a space with the user
    const setupRes = await fetch('https://chat.googleapis.com/v1/spaces:setup', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        space: {
          spaceType: 'DIRECT_MESSAGE'
        },
        memberships: [
          {
            member: {
              name: `users/${email}`,
              type: 'HUMAN'
            }
          }
        ]
      })
    });

    if (!setupRes.ok) {
      const errText = await setupRes.text();
      throw new Error(`Failed to setup chat space: ${errText}`);
    }

    const spaceData = await setupRes.json();
    const spaceName = spaceData.name;

    // 2. Send the message to the space
    const msgRes = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: message
      })
    });

    if (!msgRes.ok) {
      const errText = await msgRes.text();
      throw new Error(`Failed to send chat message: ${errText}`);
    }
  } catch (err) {
    console.error('Error in sendChatMessage:', err);
    throw err;
  }
};
