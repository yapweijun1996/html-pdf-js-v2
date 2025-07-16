## Brief overview
This document sets the commenting standard for the project. The primary goal is to write clear, educational comments that make the codebase easy to understand for all developers, especially those who are new to the project or are at a junior level.

## Commenting Philosophy
- **Explain the "Why", Not Just the "What":** Good code often explains what it does. Good comments should explain *why* it does it. Focus on clarifying the intent, the trade-offs, and the reasons behind non-obvious technical decisions.
- **Document High-Level Decisions:** Use comments to explain architectural choices. For example, if a specific library is chosen or a complex workaround is implemented, a comment should explain the context and justification.
- **Guide the Reader:** Use comments to walk through complex logic. The multi-step process in `html-to-pdf.js` (capture, replace, render, add back, restore) is a good example of where comments should break down the process into understandable steps.
- **Be a Mentor:** Write comments as if you are explaining the code to a new team member. The tone should be helpful and instructive.
