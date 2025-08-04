# AI Text Summarizer

A sleek, single-page web application that uses the OpenAI API to summarize text. It features a modern, minimalist design with multiple themes and provides various ways to input text, including pasting, file upload, and voice-to-text.

## Features

*   **Secure API Key:** The OpenAI API key is handled by a secure backend function, never exposing it to the browser.
*   **Multiple Inputs:**
    *   Paste text directly.
    *   Upload text files (`.txt`, `.md`).
    *   Use your voice to dictate text.
*   **Modern UI/UX:** A clean, two-panel layout with the input on the left and the summarized output on the right. The interface is designed to be intuitive and aesthetically pleasing.
*   **Theme Selector:** Switch between three distinct color palettes:
    1.  **Default:** A modern, minimalist theme inspired by Apple's design philosophy.
    2.  **BCG:** An elite, professional theme modeled after the Boston Consulting Group's branding.
    3.  **Tiffany:** A high-end, elegant theme inspired by Tiffany & Co.'s iconic style.

## Technology Stack

The project uses a simple and robust technology stack, focusing on security and ease of deployment.

*   **Frontend:** Vanilla HTML5, CSS3, and JavaScript. No frameworks are needed, keeping it lightweight and fast.
*   **Backend:** A serverless function (e.g., using Netlify or Vercel) to act as a secure proxy to the OpenAI API.
*   **API:** OpenAI API for text summarization.

## Secure API Key Architecture

To protect your OpenAI API key, this project uses a client-server architecture where the frontend (your webpage) does **not** communicate with the OpenAI API directly.

1.  **Client Request:** The user enters text on the webpage, and the JavaScript sends this text to our own backend serverless function.
2.  **Secure Backend Function:** The serverless function receives the text. It then securely retrieves the `OPENAI_API_KEY` from an environment variable (which is hidden and protected by the hosting provider).
3.  **OpenAI API Call:** The backend function calls the OpenAI API, including the secret key and the user's text.
4.  **Response to Client:** The backend function receives the summary from OpenAI and sends it back to the user's browser to be displayed.

This ensures the API key remains secret and is never exposed in the public-facing code on GitHub or in the user's browser.

## Development Milestones

The project will be built in three focused milestones:

*   **Milestone 1: Build the Core MVP (Minimum Viable Product)**
    *   Create the full UI layout with the default "Steve Jobs" inspired theme.
    *   Build the secure serverless function to handle OpenAI API calls.
    *   Implement the core functionality: paste text, get a summary, and display it.

*   **Milestone 2: Implement Advanced Input Methods**
    *   Add file upload functionality.
    *   Integrate the browser's Web Speech API for voice-to-text input.

*   **Milestone 3: Add Theming and Final Polish**
    *   Implement the theme selector with the BCG and Tiffany color palettes.
    *   Conduct a final UI/UX review and polish the application.

## Local Development Setup

To run this project locally, you will need to:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install Netlify CLI (or Vercel CLI):** This allows you to run the serverless function locally.
    ```bash
    npm install netlify-cli -g
    ```

3.  **Create an environment file:** Create a file named `.env` in the root of the project and add your OpenAI API key:
    ```
    OPENAI_API_KEY=your_secret_api_key_here
    ```
    *Note: The `.gitignore` file should be configured to ignore the `.env` file.*

4.  **Run the development server:**
    ```bash
    netlify dev
    ```
    This will start a local server, and you can view the application in your browser.

## Deployment

Deploying this application is straightforward with services like Netlify or Vercel.

1.  Push your code to a GitHub repository.
2.  Connect your repository to your Netlify/Vercel account.
3.  **Crucially, set the `OPENAI_API_KEY` environment variable in your hosting provider's settings dashboard.** This is how the live serverless function will access your key securely.
4.  Deploy the site.
