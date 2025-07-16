(function(window) {
    'use strict';

    // --- STATE MANAGEMENT ---
    let dependenciesLoaded = false;
    let dependencyPromise = null;

    // --- DEPENDENCY LOADING with Promises and Error Handling ---
    function loadScript(url) {
        return new Promise((resolve, reject) => {
            // Check if script already exists
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
                // Using latest stable versions from jsDelivr CDN
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
                    dependencyPromise = null; // Allow retrying
                    reject(error);
                });
        });

        return dependencyPromise;
    }

    // --- CORE PDF GENERATION FUNCTION with async/await ---
    async function generate(element, options) {
        try {
            await loadDependencies();
            
            const { jsPDF } = window.jspdf;
            
            // Default options
            const pdfOptions = {
                filename: 'download.pdf',
                margin: [10, 10, 10, 10], // top, right, bottom, left
                autoPaging: 'text',
                ...options
            };

            if (pdfOptions.usePageSizeFromHtml) {
                // --- 1:1 Scaling Logic (html2canvas -> jsPDF.addImage) ---
                const canvas = await window.html2canvas(element, {
                    scale: 1, // Capture at native resolution
                    useCORS: true
                });
                
                const imgData = canvas.toDataURL('image/png');
                const width = canvas.width;
                const height = canvas.height;

                // Create a PDF with the exact dimensions of the canvas
                const pdf = new jsPDF({
                    orientation: width > height ? 'l' : 'p',
                    unit: 'px',
                    format: [width, height]
                });

                pdf.addImage(imgData, 'PNG', 0, 0, width, height);
                pdf.save(pdfOptions.filename);

            } else {
                // --- Standard A4/Scaling Logic (jsPDF.html) ---
                const pdf = new jsPDF({
                    orientation: 'p',
                    unit: 'mm',
                    format: 'a4'
                });

                await pdf.html(element, {
                    callback: function(doc) {
                        doc.save(pdfOptions.filename);
                    },
                    margin: pdfOptions.margin,
                    autoPaging: pdfOptions.autoPaging,
                    x: 0,
                    y: 0,
                    width: pdfOptions.width || 210, // A4 width in mm
                    windowWidth: pdfOptions.windowWidth || element.scrollWidth,
                    html2canvas: {
                        scale: pdfOptions.scale || 0.26,
                        useCORS: true
                    }
                });
            }

        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert('Could not generate PDF. Please check the console for errors.');
        }
    }

    // Expose the public API
    window.htmlToPdf = {
        generate: generate
    };

})(window);
