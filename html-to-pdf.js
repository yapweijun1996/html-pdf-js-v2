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

    // --- CORE PDF GENERATION FUNCTION with Simplified Hybrid Approach ---
    async function generate(element, options) {
        try {
            await loadDependencies();

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'pt',
                format: 'a4'
            });

            const pdfOptions = {
                filename: 'download.pdf',
                chartSelector: null, // e.g., '#revenueChart'
                ...options
            };

            const chartCanvas = pdfOptions.chartSelector ? element.querySelector(pdfOptions.chartSelector) : null;
            
            // If a chart exists, we handle it separately.
            // We get its position and hide its parent container for the main render.
            let chartContainer = null;
            if (chartCanvas) {
                chartContainer = chartCanvas.parentElement;
                chartContainer.style.display = 'none';
            }

            // --- Text-based rendering for main content ---
            await pdf.html(element, {
                autoPaging: 'text',
                margin: [40, 40, 40, 40],
                x: 0,
                y: 0,
                windowWidth: element.scrollWidth,
                width: element.clientWidth
            });

            // --- Add the chart image directly from canvas ---
            if (chartCanvas) {
                // Unhide the container to get original position
                chartContainer.style.display = 'block';

                const chartImgData = chartCanvas.toDataURL('image/png');
                
                // Calculate position to add the chart
                const chartRect = chartCanvas.getBoundingClientRect();
                const containerRect = element.getBoundingClientRect();
                
                const x = chartRect.left - containerRect.left + 40; // + margin
                const y = chartRect.top - containerRect.top + 40; // + margin
                
                const width = chartRect.width * 0.75; // 1px = 0.75pt
                const height = chartRect.height * 0.75;

                pdf.addImage(chartImgData, 'PNG', x, y, width, height);
            }

            pdf.save(pdfOptions.filename);

        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert('Could not generate PDF. Please check the console for errors.');
        } finally {
            // Ensure chart container is visible again if something fails
            const chartCanvas = options.chartSelector ? element.querySelector(options.chartSelector) : null;
            if (chartCanvas) {
                chartCanvas.parentElement.style.display = 'block';
            }
        }
    }

    // Expose the public API
    window.htmlToPdf = {
        generate: generate
    };

})(window);
