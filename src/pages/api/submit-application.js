export const prerender = false;

const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxAbncBLvvvXVk6fzgQ0BbQE6VzGmk2c1Ailu4N-m-9riXC_-ai5ZMC8RJZxOqSp8xD/exec';
const GOOGLE_SCRIPT_URL = import.meta.env.GOOGLE_SCRIPT_URL || DEFAULT_SCRIPT_URL;

export async function POST({ request }) {
  try {
    const data = await request.json();

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data),
      redirect: 'follow',
    });

    const responseText = await response.text();
    console.log("Google Apps Script Backend Response:", responseText);

    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      if (responseText.trim().startsWith('http://') || responseText.trim().startsWith('https://')) {
        parsedResult = { status: 'success', fileUrl: responseText.trim() };
      } else {
        const match = responseText.match(/\{[\s\S]*\}/);
        if (match) {
          parsedResult = JSON.parse(match[0]);
        } else {
          throw new Error(`Invalid response from submission service: ${responseText.substring(0, 100)}`);
        }
      }
    }

    if (parsedResult.status === 'error' || parsedResult.result === 'error') {
      return new Response(JSON.stringify({ error: parsedResult.message || 'Submission service returned an error' }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: 'Success', result: parsedResult }), { status: 200 });

  } catch (error) {
    console.error("Submission backend error:", error);
    return new Response(JSON.stringify({ error: error.message || 'Submission failed' }), { status: 500 });
  }
}
