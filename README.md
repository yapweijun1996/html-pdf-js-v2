# HTML to PDF Generator

This project is a simple, vanilla JavaScript solution for converting an HTML element into a downloadable PDF file. It is designed to be self-contained and easy to use without any build tools or package managers.

## Features

- **HTML to PDF Conversion:** Converts a specified HTML element to a PDF document.
- **Dynamic Dependency Loading:** Loads required libraries (`jspdf` and `html2canvas`) from a CDN.
- **1:1 Pixel-Perfect Output:** Generates a PDF that is the exact same size as the source HTML content, with no scaling.
- **Dynamic Dependency Loading:** Loads required libraries (`jspdf` and `html2canvas`) from a CDN.
- **No Build Step Required:** Works directly in the browser without needing Node.js, npm, or any other build tools.

## File Structure

- **`index.html`**: The main entry point that links to all available demos.
- **`demo001.html`**: A demo page showcasing a business report with charts and tables.
- **`demo002.html`**: A demo page showcasing a standard invoice layout.
- **`html-to-pdf.js`**: The core JavaScript library that handles the PDF generation. It exposes a global `htmlToPdf` object with a `generate` method.

## How to Use

1.  **Open `index.html` in your browser.** This will show you a list of available demos.
2.  **Click on a demo link** to see it in action.
3.  **Click the "Download as PDF" button** on any demo page to generate the PDF.

To use the library in your own project:

1.  **Include the script:** Add the `html-to-pdf.js` script to your HTML file.
    ```html
    <script src="html-to-pdf.js"></script>
    ```

2.  **Create a button and content:** Add a button to trigger the download and an element that contains the content you want to convert.
    ```html
    <div id="my-content">...</div>
    <button id="download-btn">Download PDF</button>
    ```

3.  **Write the script:** Add a script to call the `htmlToPdf.generate` function.
    ```javascript
    const downloadBtn = document.getElementById('download-btn');
    const content = document.getElementById('my-content');

    downloadBtn.addEventListener('click', async function() {
      // You can optionally pass a filename
      const options = {
        filename: 'my-document.pdf'
      };
      await window.htmlToPdf.generate(content, options);
    });
    ```

## Dependencies

This project relies on the following third-party libraries, which are loaded dynamically from a CDN:

- **[jsPDF](https://github.com/parallax/jsPDF)**: A library to generate PDFs in JavaScript.
- **[html2canvas](https://html2canvas.hertzen.com/)**: Used to capture a high-quality image of the HTML content.
- **[Chart.js](https://www.chartjs.org/)**: Used in `demo001.html` to render the demo chart.
