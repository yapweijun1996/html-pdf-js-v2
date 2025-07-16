(function(window) {
    'use strict';

    /**
     * --- WHY THIS SCRIPT EXISTS ---
     * This script provides a robust solution for converting an HTML element into a text-selectable PDF,
     * while also correctly handling complex elements like charts (<canvas>) or other specified containers
     * by rendering them as images.
     *
     * The core problem this solves is that jsPDF's `html()` method is great for text but often fails to
     * render dynamic or graphical content correctly. This script implements a hybrid approach to get
     * the best of both worlds: selectable text and high-fidelity images.
     */

    // --- STATE MANAGEMENT ---
    // These variables track the loading state of external dependencies (jsPDF, html2canvas)
    // to ensure they are only loaded once.
    let dependenciesLoaded = false;
    let dependencyPromise = null;

    // --- DEPENDENCY LOADING with Promises and Error Handling ---
    /**
     * Dynamically loads a script from a URL.
     * @param {string} url - The URL of the script to load.
     * @returns {Promise} - A promise that resolves when the script is loaded or rejects on error.
     */
    function loadScript(url) {
        return new Promise((resolve, reject) => {
            // Avoid re-loading the same script if it's already on the page.
            if (document.querySelector(`script[src="${url}"]`)) {
                resolve();
                return;
            }
            let script = document.createElement("script");
            script.type = "text/javascript";
            script.src = url;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
            document.head.appendChild(script);
        });
    }

    /**
     * Loads all required dependencies for PDF generation.
     * It's designed to be idempotent, meaning it can be called multiple times but will only
     * execute the loading process once.
     * @returns {Promise} - A promise that resolves when all dependencies are ready.
     */
    function loadDependencies() {
        if (dependencyPromise) {
            return dependencyPromise;
        }
        dependencyPromise = new Promise((resolve, reject) => {
            if (dependenciesLoaded) {
                resolve();
                return;
            }
            const dependencies = [
                { name: 'jspdf', url: 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js' },
                { name: 'html2canvas', url: 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js' }
            ];
            const loadPromises = dependencies.map(dep => {
                const libObject = dep.name === 'jspdf' ? window.jspdf : window[dep.name];
                return libObject ? Promise.resolve() : loadScript(dep.url);
            });
            Promise.all(loadPromises)
                .then(() => {
                    dependenciesLoaded = true;
                    resolve();
                })
                .catch(error => {
                    console.error("Error loading dependencies:", error);
                    dependencyPromise = null; // Allow retrying on failure
                    reject(error);
                });
        });
        return dependencyPromise;
    }

    // --- CORE PDF GENERATION FUNCTION ---
    /**
     * Generates a PDF from a given HTML element.
     * @param {HTMLElement} element - The root element to convert into a PDF.
     * @param {object} options - Configuration options.
     * @param {string} options.filename - The name of the downloaded PDF file.
     * @param {string[]} options.renderSelectors - An array of CSS selectors for elements that should be rendered as images.
     */
    async function generate(element, options) {
        // --- CONFIGURATION MERGING ---
        // Merge user options with defaults to create a final configuration object.
        // This provides sensible defaults while allowing for deep customization.
        const pdfOptions = {
            filename: 'download.pdf',
            renderSelectors: [],
            // Default jsPDF options
            jsPDF: {
                orientation: 'p',
                unit: 'px',
                format: 'a4'
            },
            // Default html-to-pdf options
            html: {
                autoPaging: 'text',
                margin: [53, 53, 53, 53],
                x: 0,
                y: 0,
                windowWidth: element.scrollWidth,
                width: element.clientWidth
            },
            ...options
        };

        // Find all elements that need to be rendered as images based on the selectors.
        const elementsToRender = [];
        pdfOptions.renderSelectors.forEach(selector => {
            element.querySelectorAll(selector).forEach(el => elementsToRender.push(el));
        });

        // This array will hold information needed to restore the DOM later.
        const originalElements = [];

        try {
            // Ensure jsPDF and html2canvas are loaded before proceeding.
            await loadDependencies();

            const { jsPDF } = window.jspdf;
            // Initialize jsPDF with the merged options.
            const pdf = new jsPDF(pdfOptions.jsPDF);

            /**
             * --- THE HYBRID RENDERING PROCESS ---
             * This is the core logic of the script, broken into four main steps.
             *
             * The key challenge is that when jsPDF renders the HTML to text, it can disrupt the layout.
             * If we remove an element (like a chart) to render it separately as an image, the space
             * it occupied might collapse, causing the text to reflow and the image to be misplaced
             * when we add it back.
             *
             * To solve this, we use a "placeholder" technique.
             */

            // STEP 1: Capture images and replace elements with placeholders.
            // We do this first, while the original elements are still in the DOM and fully rendered.
            for (const el of elementsToRender) {
                let imgData;
                if (el.tagName === 'CANVAS') {
                    // For canvases, we can directly get the image data.
                    imgData = el.toDataURL('image/png');
                } else {
                    // For other elements (divs, images), we use html2canvas to rasterize them.
                    const canvas = await window.html2canvas(el);
                    imgData = canvas.toDataURL('image/png');
                }

                // Create a placeholder div with the exact same dimensions as the original element.
                const rect = el.getBoundingClientRect();
                const placeholder = document.createElement('div');
                placeholder.style.width = `${rect.width}px`;
                placeholder.style.height = `${rect.height}px`;

                // Store all necessary info to restore the element later, including the captured image data.
                originalElements.push({
                    parent: el.parentElement,
                    original: el,
                    placeholder: placeholder,
                    imgData: imgData // Store the valid image data here.
                });

                // Swap the original element with the placeholder to preserve the layout.
                el.parentElement.replaceChild(placeholder, el);
            }

            // STEP 2: Render the main HTML content.
            // Now that the graphical elements are replaced by correctly-sized placeholders,
            // we can safely render the HTML to the PDF. The layout will be preserved.
            await pdf.html(element, pdfOptions.html);

            // STEP 3: Add the stored images to the PDF.
            // Now we loop through our stored items and add the captured images
            // into the positions occupied by our placeholders.
            for (const item of originalElements) {
                const { placeholder, imgData } = item; // Use the stored image data.

                const placeholderRect = placeholder.getBoundingClientRect();
                const containerRect = element.getBoundingClientRect();

                // Calculate the precise (x, y) coordinates for the image.
                const x = placeholderRect.left - containerRect.left + 53; // Add left margin
                const y = placeholderRect.top - containerRect.top + 53;  // Add top margin
                const width = placeholderRect.width;
                const height = placeholderRect.height;

                pdf.addImage(imgData, 'PNG', x, y, width, height);
            }

            // All done, save the final PDF.
            pdf.save(pdfOptions.filename);

        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert('Could not generate PDF. Please check the console for errors.');
        } finally {
            // STEP 4: Restore the DOM.
            // This is a crucial cleanup step. We swap the placeholders back with the
            // original elements, so the live page returns to its initial state.
            originalElements.forEach(({ parent, original, placeholder }) => {
                if (parent && placeholder.parentElement) {
                    parent.replaceChild(original, placeholder);
                }
            });
        }
    }

    // Expose the public API to the global window object.
    window.htmlToPdf = {
        generate: generate
    };

})(window);
