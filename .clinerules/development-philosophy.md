## Brief overview
This document outlines the core development philosophy for this project. The main principle is to favor generic, reusable, and configurable solutions over hardcoded logic that is tied to a specific implementation.

## Development Workflow
- **Prioritize Flexibility:** Before implementing a feature, consider if it can be built in a more generic way. For example, instead of writing code for a single, specific element, design it to handle multiple elements or different types of elements.
- **Parameterize, Don't Hardcode:** Avoid hardcoding values like filenames, selectors, or configuration options directly in the code. Instead, pass them as options or parameters to functions.
  - **Trigger Case:** When we refactored `html-to-pdf.js`, we replaced the specific `chartSelector` with a more generic `renderSelectors` array. This is the preferred approach.
- **Architect for Reusability:** Aim to create functions and modules that can be reused in different parts of the application or even in future projects. The goal is to build a library of tools, not just a one-off script.

## Coding Best Practices
- **Single Responsibility Principle:** Functions should do one thing well. The final version of `html-to-pdf.js` is a good example, where the `generate` function orchestrates the process, but the logic is broken down into clear steps (capture, replace, render, add back, restore).
- **Clear and Intentional Naming:** Use descriptive names for variables and functions. For example, changing `chartSelector` to `renderSelectors` made the purpose of the option much clearer.
