/*
 * ===============================================
 * Module        : applyCoverPages.js
 * ===============================================
 *
 * Author        : Rishabh Garai
 * Email         : rishabhgarai33@gmail.com
 *
 * Description   : Embeds two specific pages from a source PDF onto a custom
 *                 cover template layout. This is typically used to apply a
 *                 predefined cover format to personalized book content before print.
 *
 * External Dependencies:
 * -----------------------------------------------
 * pdf-lib                : For PDF manipulation and embedding pages
 *
 * Node.js Built-in Modules:
 * -----------------------------------------------
 * fs                     : Reads the template PDF from disk
 * path                   : Constructs the file path to the cover template
 *
 * Function:
 * -----------------------------------------------
 * applyCoverPages(buffer)
 * - Loads a static cover template
 * - Embeds page 16 (left) and page 0 (right) from input buffer
 * - Places them into the cover layout using predefined positions
 *
 * Last Modified : 12 June 2025
 * Modified By   : Rishabh Garai
 * ===============================================
 */
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export async function applyCoverPages(buffer) {
  // Load cover template PDF (from public/pdfs/cover_image.pdf)
  const coverTemplatePath = path.join(process.cwd(), 'public', 'pdfs', 'cover_image.pdf');
  const coverTemplateBytes = fs.readFileSync(coverTemplatePath);
  const coverPdf = await PDFDocument.load(coverTemplateBytes);

  // Load source content PDF (from buffer)
  const sourcePdf = await PDFDocument.load(buffer);

  // Create a new PDF to modify and return
  const outputPdf = await PDFDocument.create();

  // Copy the template page from cover
  const [templatePage] = await outputPdf.copyPages(coverPdf, [0]);
  const page = outputPdf.addPage(templatePage);
  const BLEEDX= 2*27;
  const BLEEDY = 5.5 * 28.3465;
  const IMG_WIDTH = 582.525 +15;
  const IMG_HEIGHT = 582.525 + 30;

  // Get content pages (16 and 0)
  const [page16, page0] = await outputPdf.copyPages(sourcePdf, [16, 0]);
  const [embed16] = await outputPdf.embedPages([page16]);
  const [embed0] = await outputPdf.embedPages([page0]);

    // Draw page 16 (left)
  page.drawPage(embed16, {
    x: BLEEDX + 13,
    y: BLEEDY + 10,
    width: IMG_WIDTH,
    height: IMG_HEIGHT,
  });

  // Draw page 0 (right)  28.346
  page.drawPage(embed0, {
    x:  BLEEDX + IMG_WIDTH + 32,
    y: BLEEDY + 10,
    width: IMG_WIDTH,
    height: IMG_HEIGHT,
  });

  const finalBytes = await outputPdf.save();
  return finalBytes; // 🔁 ready to send or store
}
