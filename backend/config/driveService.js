const { google } = require("googleapis");

// Create OAuth Drive Client using student's refresh token
const createDriveClient = (refreshToken) => {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:5000/auth/student/callback"
  );

  oAuth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return google.drive({
    version: "v3",
    auth: oAuth2Client,
  });
};

// Get or Create "SLRTCE Files" Folder
const getOrCreateFolder = async (drive) => {
  const folderName = "SLRTCE Files";

  const res = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
    fields: "files(id, name)",
  });

  if (res.data.files.length > 0) {
    return res.data.files[0].id;
  }

  const folder = await drive.files.create({
    resource: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    },
    fields: "id",
  });

  return folder.data.id;
};

module.exports = {
  createDriveClient,
  getOrCreateFolder,
};
