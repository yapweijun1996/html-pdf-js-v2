# HTML to PDF Generator

This project is a simple, vanilla JavaScript solution for converting an HTML element into a downloadable PDF file. It is designed to be self-contained and easy to use without any build tools or package managers.

## Features

- **HTML to PDF Conversion:** Converts a specified HTML element to a PDF document.
- **Dynamic Dependency Loading:** Loads required libraries (`jspdf` and `html2canvas`) from a CDN.
- **Customizable Options:** Allows passing options to configure the PDF output, such as filename and canvas scaling.
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
      const options = {
        filename: 'my-document.pdf'
      };
      await window.htmlToPdf.generate(content, options);
    });
    ```

## Configuration Options

The `generate` function accepts an `options` object to customize the PDF output. The following properties are available:

| Option        | Type   | Default               | Description                                                                                                                            |
|---------------|--------|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| `filename`    | string | `'download.pdf'`      | The name of the downloaded PDF file.                                                                                                   |
| `margin`      | array  | `[10, 10, 10, 10]`    | An array representing the top, right, bottom, and left margins in `mm`.                                                                |
| `autoPaging`  | string | `'text'`              | The automatic paging mode. See jsPDF documentation for more details.                                                                   |
| `width`       | number | `210`                 | The width of the content area in the PDF, in `mm`. Defaults to A4 width.                                                               |
| `windowWidth` | number | `element.scrollWidth` | The width of the source HTML element in pixels. This is used with `width` to calculate the scale. A larger value makes the content smaller. |
| `scale`       | number | `0.26`                | The scale for `html2canvas` rendering. A higher value can improve the quality of rendered images (like charts) but increases file size. |
| `usePageSizeFromHtml` | boolean | `false` | If `true`, the PDF page size will be set to the exact dimensions of the HTML element, resulting in a 1:1 scale. This overrides other scaling options. |

### Example with Custom Scaling

```javascript
const options = {
  filename: 'custom-scaled-doc.pdf',
  // Make the content appear larger in the PDF
  windowWidth: 1400, 
  // Improve image quality
  scale: 0.5 
};
await window.htmlToPdf.generate(content, options);
```

### Example with 1:1 Exact Scaling

To generate a PDF that is the exact same size as your HTML content without any scaling, use the `usePageSizeFromHtml` option.

```javascript
const options = {
  filename: 'exact-scale-doc.pdf',
  usePageSizeFromHtml: true
};
await window.htmlToPdf.generate(content, options);
```

## Dependencies

This project relies on the following third-party libraries, which are loaded dynamically from a CDN:

- **[jsPDF](https://github.com/parallax/jsPDF)**: A library to generate PDFs in JavaScript.
- **[html2canvas](https://html2canvas.hertzen.com/)**: Used by jsPDF as a fallback to render complex elements like charts as images.
- **[Chart.js](https://www.chartjs.org/)**: Used in `demo001.html` to render the demo chart.
