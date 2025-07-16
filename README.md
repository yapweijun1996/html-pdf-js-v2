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
- **`demo001.html` - `demo006.html`**: Demo pages showcasing various layouts.
- **`html-to-pdf.js`**: The core JavaScript library that handles the PDF generation. It exposes a global `htmlToPdf` object with a `generate` method.

## Quickstart: How to Use

Follow these steps to add PDF generation to your project.

### 1. Include the Script

Add the `html-to-pdf.js` script to your HTML file. Make sure the path is correct.

```html
<script src="html-to-pdf.js"></script>
```

### 2. Create Your Content and a Trigger Button

Create the HTML content you want to convert and a button to trigger the PDF download.

```html
<!-- This is the content that will be converted to a PDF -->
<div id="my-content">
  <h1>My Document</h1>
  <p>This is some text that will be selectable in the PDF.</p>
  <!-- This chart will be rendered as an image to preserve its quality -->
  <canvas id="my-chart"></canvas>
</div>

<!-- This button will trigger the PDF generation -->
<button id="download-btn">Download PDF</button>
```

### 3. Write the Script to Generate the PDF

Add a script to call the `htmlToPdf.generate` function when the button is clicked.

```javascript
// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
  const downloadBtn = document.getElementById('download-btn');
  const content = document.getElementById('my-content');

  downloadBtn.addEventListener('click', async function () {
    console.log('Generating PDF...');

    // The generate function returns a Promise, so we use async/await
    try {
      await window.htmlToPdf.generate(content, {
        filename: 'my-document.pdf',
        renderSelectors: ['#my-chart'] // Specify elements to render as images
      });
      console.log('PDF generated successfully!');
    } catch (error) {
      console.error('An error occurred while generating the PDF:', error);
    }
  });
});
```

## API Overview

The library exposes a single global function: `window.htmlToPdf.generate(element, options)`.

-   **`element`** (Required)
    -   **Type:** `HTMLElement`
    -   **Description:** The HTML element you want to convert into a PDF.

-   **`options`** (Optional)
    -   **Type:** `Object`
    -   **Description:** An object containing configuration options.

### Options Details

| Option            | Type      | Default                 | Description                                                                                                                                 |
| ----------------- | --------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `filename`        | `String`  | `'document.pdf'`        | The name of the downloaded PDF file.                                                                                                        |
| `renderSelectors` | `Array`   | `[]`                    | An array of CSS selectors for elements that should be rendered as images (e.g., `<canvas>`, complex `<div>`s).                               |
| `page`            | `Object`  | `{...}`                 | An object to configure the PDF page settings. See `jsPDF` documentation for more details.                                                   |
| `page.margin`     | `Number`  | `15`                    | The margin (in mm) for all sides of the PDF page.                                                                                           |
| `page.orientation`| `String`  | `'portrait'`            | The page orientation. Can be `'portrait'` or `'landscape'`.                                                                                 |
| `page.format`     | `String`  | `'a4'`                  | The page format (e.g., `'a4'`, `'letter'`).                                                                                                 |

## Demo Walkthrough

The best way to learn is by example. Check out the included demo files:

-   **`demo001.html`**: Shows how to render a business report with a Chart.js chart. Notice how `renderSelectors: ['#myChart']` is used to ensure the chart is captured perfectly.
-   **`demo003.html`**: A standard invoice layout. This is a good example of a text-heavy document.
-   **`demo006.html`**: Demonstrates how to handle multiple complex elements by passing multiple selectors in the `renderSelectors` array.

To run them, open `index.html` in your browser and click the links.

## How It Works: The Hybrid Approach

This script uses a clever hybrid approach to create high-quality PDFs:

1.  **Capture Images:** It finds all elements matching the `renderSelectors` and captures them as PNG images using `html2canvas`.
2.  **Create Placeholders:** It replaces each of those elements in the live DOM with an empty `<div>` that has the exact same dimensions. This preserves the layout perfectly.
3.  **Render Text PDF:** It then uses `jsPDF.html()` to convert the modified HTML into a PDF. All text remains selectable and searchable.
4.  **Add Images Back:** It adds the captured images back into the PDF at the precise locations of their placeholders.
5.  **Restore the DOM:** Finally, it restores the original elements to the webpage, leaving it exactly as it was.

## Troubleshooting and Tips

-   **CORS Issues:** If you are loading images from other domains, you may run into CORS errors. Make sure the images are served with the correct `Access-Control-Allow-Origin` headers.
-   **Selectors Not Matching:** The CSS selectors in `renderSelectors` must be exact. Use your browser's developer tools to double-check the IDs and classes.
-   **Content Overflow:** If your content is wider than the PDF page, it may get cut off. You can switch to `'landscape'` orientation or adjust your CSS.

## Dependencies

This project relies on the following third-party libraries, which are loaded dynamically from a CDN:

-   **[jsPDF](https://github.com/parallax/jsPDF)**: A library to generate PDFs in JavaScript.
-   **[html2canvas](https://html2canvas.hertzen.com/)**: Used to capture a high-quality image of the HTML content.
