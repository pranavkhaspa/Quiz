import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { YoutubeTranscript } from 'youtube-transcript';
import cors from 'cors'; // Import the cors middleware

dotenv.config();

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors()); // This will allow requests from any origin. For production, you might want to configure specific origins.

app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to extract JSON from AI response
function extractJsonArrayFromString(str) {
  if (!str) return null;
  // Look for a JSON array ([...]) or a markdown code block containing a JSON array
  const match = str.match(/```json\s*(\[[\s\S]*?\])\s*```|(\[[\s\S]*\])/);
  if (match) {
    // If ```json [...] ``` is found, take the content inside.
    // Otherwise, if [...] is found (and it's the second capturing group), take that.
    return match[1] || match[2];
  }
  // Fallback: if the string itself starts with '[' and ends with ']', assume it's the JSON array
  if (str.trim().startsWith('[') && str.trim().endsWith(']')) {
    return str.trim();
  }
  return null; // Return null if no clear JSON array is found
}

app.post('/api/generate-mcq', async (req, res) => {
  const { videoUrl } = req.body;

  if (!videoUrl) {
    return res.status(400).json({ error: 'videoUrl is required' });
  }

  let transcriptText;
  try {
    // Extract transcript
    const transcript = await YoutubeTranscript.fetchTranscript(videoUrl);
    if (!transcript || transcript.length === 0) {
      return res.status(404).json({ error: 'No transcript found or transcript is empty for this video.' });
    }
    transcriptText = transcript.map(entry => entry.text).join(' ');
  } catch (error) {
    console.error("Error fetching YouTube transcript:", error);
    // Check for common youtube-transcript error messages
    if (error.message && (error.message.includes('disabled') || error.message.includes('No transcript found'))) {
        return res.status(404).json({ error: `Failed to fetch transcript: ${error.message}` });
    }
    return res.status(500).json({ error: 'Failed to fetch YouTube transcript.' });
  }

  try {
    // Generate prompt
    const prompt = `
      Based on the following transcript from a YouTube video, generate 5 multiple choice questions.
      Return ONLY an array of JSON objects in the format:
      [
        {
          question: "...",
          options: ["a", "b", "c", "d"],
          answer: "a" // The correct option letter (e.g., "a", "b", "c", or "d")
        }
      ]
      Ensure the output is a valid JSON array string and nothing else.
      Make sure each question has exactly 4 options.
      Each option should be a string.

      Transcript:
      ${transcriptText}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const jsonString = extractJsonArrayFromString(responseText);

    if (!jsonString) {
      console.error("Failed to extract JSON array from Gemini response. Raw response:", responseText);
      return res.status(500).json({ error: 'AI did not return a valid JSON array structure.' });
    }

    let questions;
    try {
      questions = JSON.parse(jsonString);
       // Basic validation of the question structure
      if (!Array.isArray(questions) || questions.some(q => !q?.question || !Array.isArray(q?.options) || q?.options.length !== 4 || !q?.answer)) { // Added optional chaining for safety and checked options length
        console.error("Parsed JSON is not in the expected question format. Parsed data:", questions);
        return res.status(500).json({ error: 'AI returned data in an unexpected format or structure.' });
      }
       // Optional: Validate if answer is one of the options letters
       if (questions.some(q => !['a', 'b', 'c', 'd'].includes(q?.answer?.toLowerCase()))) {
         console.warn("AI returned an answer key that is not 'a', 'b', 'c', or 'd'. Review AI prompt or response validation.");
         // You might choose to error out here or just log a warning. For now, just a warning.
       }


    } catch (err) {
      console.error("Failed to parse extracted JSON from Gemini response:", err);
      console.error("Extracted JSON string was:", jsonString);
      return res.status(500).json({ error: 'Failed to parse AI response as JSON.' });
    }

    res.json({ questions });

  } catch (error) {
    console.error("Error generating MCQs with Gemini or processing response:", error);
    // Check if it's a Gemini API specific error if the library provides such details
    // For now, a general error message.
    res.status(500).json({ error: 'Something went wrong while generating MCQs with the AI.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});