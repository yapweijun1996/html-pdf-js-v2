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
     * This function is designed to be idempotent, loading scripts only if they are not already present.
     * @param {boolean} needsHtml2Canvas - Whether html2canvas needs to be loaded for the current operation.
     * @returns {Promise} - A promise that resolves when all necessary dependencies are ready.
     */
    function loadDependencies(needsHtml2Canvas = false) {
        return new Promise((resolve, reject) => {
            const dependencies = [
                { name: 'jspdf', lib: window.jspdf, url: 'jspdf.umd.min.js' }
            ];

            if (needsHtml2Canvas) {
                dependencies.push({ name: 'html2canvas', lib: window.html2canvas, url: 'html2canvas.min.js' });
            }

            // Filter out dependencies that are already loaded.
            const scriptsToLoad = dependencies.filter(dep => !dep.lib);

            if (scriptsToLoad.length === 0) {
                resolve();
                return;
            }

            const loadPromises = scriptsToLoad.map(dep => loadScript(dep.url));

            Promise.all(loadPromises)
                .then(resolve)
                .catch(error => {
                    // Log the detailed error and reject with the original error for better debugging.
                    console.error("Failed to load one or more dependencies.", error);
                    reject(error);
                });
        });
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
        const pdfOptions = {
            filename: 'download.pdf',
            onProgress: () => {},
            renderSelectors: [],
            jsPDF: { orientation: 'p', unit: 'px', format: 'a4' },
            ...options
        };

        const onProgress = pdfOptions.onProgress;
        const capturedElements = [];

        try {
            onProgress('Loading dependencies...');
            const needsHtml2Canvas = pdfOptions.renderSelectors.length > 0;
            await loadDependencies(needsHtml2Canvas);
            onProgress('Dependencies loaded.');

            const { jsPDF } = window.jspdf;
            const elWidth = element.scrollWidth;
            const elHeight = element.scrollHeight;
            const pdf = new jsPDF({ ...pdfOptions.jsPDF, format: [elWidth, elHeight] });

            if (needsHtml2Canvas) {
                onProgress('Capturing elements to render as images...');
                const elementsToRender = element.querySelectorAll(pdfOptions.renderSelectors.join(','));
                for (const el of elementsToRender) {
                    const canvas = await window.html2canvas(el, { scale: 1 });
                    const placeholder = document.createElement('img');
                    placeholder.src = canvas.toDataURL('image/png');
                    placeholder.style.width = `${el.offsetWidth}px`;
                    placeholder.style.height = `${el.offsetHeight}px`;
                    
                    capturedElements.push({ original: el, placeholder });
                    el.style.display = 'none';
                    el.parentNode.insertBefore(placeholder, el);
                }
                onProgress('Element capture complete.');
            }

            onProgress('Rendering PDF from HTML...');
            await pdf.html(element, {
                width: elWidth,
                windowWidth: elWidth,
                callback: function(doc) {
                    onProgress('Restoring original elements...');
                    capturedElements.forEach(({ original, placeholder }) => {
                        original.style.display = '';
                        placeholder.parentNode.removeChild(placeholder);
                    });
                    onProgress('DOM restored.');

                    onProgress('Saving PDF...');
                    doc.save(pdfOptions.filename);
                    onProgress('PDF generation complete.');
                }
            });

        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert('Could not generate PDF. Please check the console for errors.');
            capturedElements.forEach(({ original, placeholder }) => {
                original.style.display = '';
                if (placeholder.parentNode) {
                    placeholder.parentNode.removeChild(placeholder);
                }
            });
        }
    }

    // Expose the public API to the global window object.
    window.htmlToPdf = {
        generate: generate
    };

})(window);
