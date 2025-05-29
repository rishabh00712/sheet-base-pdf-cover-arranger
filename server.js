import express from 'express';
import axios from 'axios';
import { google } from 'googleapis';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { authenticate } from './utils/googleAuth.js';
import { applyCoverPages } from './utils/generateSpreadPdfCover.js';
import { Readable } from 'stream';
import 'dotenv/config'
const app = express();
const PORT = 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(bodyParser.json());

// Utility to extract file ID from Google Drive share link
function extractFileId(link) {
  const match = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

// ✅ Clean up original Drive file name
function sanitizeFileName(name) {
  if (!name) return 'Processed_File.pdf';

  return name
    .replace(/(_\d{8}_\d{6}(_\d+)?)+\.pdf$/i, '') // remove trailing _timestamp_0000.pdf
    .replace(/\.pdf+$/i, '')                      // remove any trailing .pdf/.pdf.pdf
    .trim() + '.pdf';                             // ensure one clean .pdf
}

// ✅ Main endpoint
app.post('/handle-preview', async (req, res) => {
  console.log("i am here")
  const { link, row } = req.body;

  if (!link || !row) {
    return res.status(400).json({ error: 'Missing preview link or row number.' });
  }

  const fileId = extractFileId(link);
  if (!fileId) {
    return res.status(400).json({ error: 'Invalid Google Drive link format.' });
  }

  try {
    // Step 1: Auth
    const auth = await authenticate();
    const drive = google.drive({ version: 'v3', auth });

    // Step 2: Get original file name from Drive
    const fileMeta = await drive.files.get({
      fileId,
      fields: 'name'
    });

    const rawName = fileMeta.data.name || `Processed_Row_${row}.pdf`;
    const originalName = sanitizeFileName(rawName);

    // Step 3: Download public PDF
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
    const originalBuffer = Buffer.from(response.data);

    // Step 4: Generate spread PDF
    const processedBuffer = await applyCoverPages(originalBuffer);

    // Step 5: Upload to Google Drive folder
    const fileMetadata = {
      name: originalName,
      parents: ['11Y1ZfQMoyXq-b5yrucr9htx8lKa26q4n'] // 🔁 Replace with your folder ID
    };

    const media = {
  mimeType: 'application/pdf',
  body: Readable.from([processedBuffer])

};


    const uploadRes = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id'
    });

    const uploadedFileId = uploadRes.data.id;

    // Step 6: Make the uploaded file public
    await drive.permissions.create({
      fileId: uploadedFileId,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    const publicUrl = `https://drive.google.com/file/d/${uploadedFileId}/view?usp=sharing`;

    console.log(`✅ Uploaded & Shared File for row ${row}: ${publicUrl}`);
      res.json({
      link: publicUrl,
      row: row
  });
  } catch (err) {
    console.error('❌ Failed to handle preview:', err.message);
    res.status(500).json({ error: 'Failed to process and upload PDF.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
