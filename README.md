# HTML to PDF Generator

This project is a simple, vanilla JavaScript solution for converting an HTML element into a downloadable PDF file. It is designed to be self-contained and easy to use without any build tools or package managers.

## Features

- **Hybrid PDF Generation:** Creates a PDF with selectable text and high-fidelity images, getting the best of both worlds.
- **Handles Complex Elements:** Can correctly render dynamic content like charts (`<canvas>`) or any other specified element as an image.
- **Configurable:** Use the `renderSelectors` option to specify which elements should be treated as images.
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
      /**
       * The `generate` function takes two arguments:
       * 1. The HTML element to convert.
       * 2. An options object.
       *
       * The `renderSelectors` option is an array of CSS selectors for any elements
       * that should be rendered as images (e.g., charts, complex divs).
       */
      const options = {
        filename: 'my-document.pdf',
        renderSelectors: ['#my-chart', '.some-other-element']
      };
      await window.htmlToPdf.generate(content, options);
    });
    ```

## How It Works: The Hybrid Approach

This script uses a hybrid approach to create high-quality PDFs:

1.  **Image Rendering:** For any element specified in `renderSelectors`, the script first captures it as a PNG image. It then replaces the element in the live DOM with a placeholder `<div>` of the exact same size. This is done to preserve the page layout.
2.  **Text Rendering:** It then uses `jsPDF.html()` to convert the modified HTML (with the placeholders) into a text-based PDF. This ensures all text is selectable and searchable.
3.  **Image Placement:** Finally, it adds the captured images back into the PDF at the locations of their corresponding placeholders.
4.  **DOM Restoration:** The script cleans up after itself by restoring the original elements to the live page.

## Dependencies

This project relies on the following third-party libraries, which are loaded dynamically from a CDN:

- **[jsPDF](https://github.com/parallax/jsPDF)**: A library to generate PDFs in JavaScript.
- **[html2canvas](https://html2canvas.hertzen.com/)**: Used to capture a high-quality image of the HTML content.
- **[Chart.js](https://www.chartjs.org/)**: Used in `demo001.html` to render the demo chart.
