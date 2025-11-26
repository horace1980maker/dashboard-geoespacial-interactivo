<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1YZXy9K7HTcoFH6P21NKHZs5dZw1sDlEk

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Configure your LLM provider in `.env.local`:
   
   **For Gemini (default):**
   ```
   LLM_PROVIDER=gemini
   GEMINI_API_KEY=your_gemini_api_key
   ```
   
   **For OpenAI:**
   ```
   LLM_PROVIDER=openai
   OPENAI_API_KEY=your_openai_api_key
   # Optional: For custom base URL (e.g., Azure OpenAI)
   OPENAI_BASE_URL=https://api.openai.com/v1
   ```
   
   **For Anthropic:**
   ```
   LLM_PROVIDER=anthropic
   ANTHROPIC_API_KEY=your_anthropic_api_key
   # Optional: For custom base URL
   ANTHROPIC_BASE_URL=https://api.anthropic.com/v1
   ```
   
   **Note:** For backward compatibility, `API_KEY` can still be used with Gemini provider.
3. Run the app:
   `npm run dev`
