/*
 * ===============================================
 * Module        : generate-b64.js
 * ===============================================
 *
 * Author        : Rishabh Garai
 * Email         : rishabhgarai33@gmail.com
 *
 * Description   : This utility script reads a Google service account JSON key file,
 *                 converts it to a base64-encoded string, and prints it to the console.
 *                 The output can be copied into a .env file as GOOGLE_CREDENTIALS_BASE64
 *                 for secure access in authentication workflows.
 *
 * Node.js Built-in Modules:
 * -----------------------------------------------
 * fs                      : Reads the JSON service account file
 *
 * Usage:
 * -----------------------------------------------
 * - Place your service-account.json file in the root directory
 * - Run: node generate-b64.js
 * - Copy the printed base64 string to your .env file
 *
 * Last Modified : 12 June 2025
 * Modified By   : Rishabh Garai
 * ===============================================
 */
// generate-b64.js
import fs from 'fs';

const filePath = 'service-account.json'; // or path to your key file
const json = fs.readFileSync(filePath, 'utf8');

const encoded = Buffer.from(json).toString('base64');
console.log('✅ Copy this into your .env as GOOGLE_CREDENTIALS_BASE64:\n');
console.log(encoded);
