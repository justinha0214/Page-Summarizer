// background.js — service worker (Gemini API)

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "CAPTURE_TAB") {
    captureAndSummarize(msg.context, msg.apiKey).then(sendResponse);
    return true;
  }
  if (msg.type === "SUMMARIZE_IMAGE") {
    summarizeBase64(msg.dataUrl, msg.context, msg.apiKey).then(sendResponse);
    return true;
  }
});

async function captureAndSummarize(context, apiKey) {
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(null, {
      format: "png",
      quality: 100
    });
    return await summarizeBase64(dataUrl, context, apiKey);
  } catch (err) {
    return { error: err.message };
  }
}

async function summarizeBase64(dataUrl, context, apiKey) {
  try {
    const base64 = dataUrl.split(",")[1];
    const mediaType = dataUrl.split(";")[0].split(":")[1] || "image/png";

    const systemPrompt = `You are a study assistant helping a student understand a textbook.
Your job is to look at a screenshot of a textbook page and extract the most important
points so the student can verify their comprehension.

Respond using this exact structure:

SUMMARY
<one or two sentences capturing the core idea of the page>

KEY POINTS
- <point 1>
- <point 2>
- <point 3>
(3-7 points; each a complete, standalone study note)

TERMS TO KNOW
- <term>: <definition>
(only if the page defines specific vocabulary; omit section entirely if none)

WATCH OUT FOR
<one sentence about a common misconception or tricky nuance, if any>

Keep language clear and student-friendly. Focus on concepts, definitions,
cause-effect relationships, and important facts or figures.`;

    const userText = context
      ? `Context: ${context}\n\nPlease summarize this textbook page.`
      : "Please summarize this textbook page.";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: mediaType,
                  data: base64
                }
              },
              { text: userText }
            ]
          }],
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.2
          }
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      return { error: data.error.message || "Gemini API error" };
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!text) return { error: "Empty response from Gemini. Please try again." };

    return { summary: text };
  } catch (err) {
    return { error: err.message };
  }
}
