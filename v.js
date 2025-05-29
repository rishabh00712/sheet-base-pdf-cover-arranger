// generate-b64.js
import fs from 'fs';

const filePath = 'service-account.json'; // or path to your key file
const json = fs.readFileSync(filePath, 'utf8');

const encoded = Buffer.from(json).toString('base64');
console.log('✅ Copy this into your .env as GOOGLE_CREDENTIALS_BASE64:\n');
console.log(encoded);
