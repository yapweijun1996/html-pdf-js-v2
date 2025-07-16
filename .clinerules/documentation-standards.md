## Brief overview
This document outlines the standards for project documentation, ensuring that the `README.md` file serves as a reliable and up-to-date source of information for all developers.

## README.md Maintenance
- **Keep Documentation in Sync with Code:** Whenever a significant change is made to the project's logic, API, or requirements, the `README.md` must be updated to reflect it.
- **Document API Changes:** Any modifications to how a library is used, such as changing function names or configuration options, must be clearly documented in the usage or API section of the README.
  - **Trigger Case:** When `html-to-pdf.js` was refactored, the `chartSelector` option was replaced with the more flexible `renderSelectors` array. This type of change must be immediately documented in the `README.md` so other developers know how to use the new API.
- **Explain Core Concepts:** The README should provide a high-level explanation of how the project works, its features, and its limitations. This helps new developers get up to speed quickly.
