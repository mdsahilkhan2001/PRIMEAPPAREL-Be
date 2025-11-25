const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

exports.generatePDF = async (htmlContent, fileName) => {
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfPath = path.join(__dirname, '../public/pdfs', fileName);

        // Ensure directory exists
        const dir = path.dirname(pdfPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                bottom: '20px',
                left: '20px',
                right: '20px'
            }
        });

        await browser.close();
        return pdfPath;
    } catch (error) {
        console.error('PDF Generation Error:', error);
        throw error;
    }
};
