import React, { useState } from 'react';
import Results from './results';

const Quiz = () => {
  const [questionBank, setQuestionBank] = useState([]);
  const [useranswers, setuseranswers] = useState([]);
  const [currentquestion, setcurrentquestion] = useState(0);
  const [isquizfinished, setisquizfinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    // Reset quiz state in case of a second attempt
    setQuestionBank([]);
    setuseranswers([]);
    setcurrentquestion(0);
    setisquizfinished(false);
    setQuizStarted(false); // Keep the form visible until questions are loaded

    try {
      // *** FIX: Use the full URL for the backend server ***
      const res = await fetch('https://quiz-dm2f.onrender.com/api/generate-mcq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl }),
      });

      // *** FIX: Check if the response is OK (status 200-299) before parsing as JSON ***
      if (!res.ok) {
        const errorBody = await res.text(); // Get response body as text for better debugging
        console.error('HTTP Error Response:', res.status, errorBody);
        throw new Error(`HTTP error! status: ${res.status}, message: ${errorBody}`);
      }

      const data = await res.json();

      if (!data || !Array.isArray(data.questions) || data.questions.length === 0) {
         // Handle cases where the server returned 200 but the questions array is empty or missing
         console.warn('Server returned no questions or invalid data format:', data);
         alert('Successfully connected to server, but no questions were generated. Please check the video URL or try a different video.');
         return; // Stop execution if no questions
      }

      setQuestionBank(data.questions);
      // *** FIX: Use optional chaining and default to 0 if questions is null/undefined ***
      setuseranswers(new Array(data.questions?.length || 0).fill(null));
      setQuizStarted(true); // Now set quizStarted to true as we have questions

    } catch (err) {
      console.error('Failed to fetch questions:', err);
      // *** FIX: Include the error message in the alert ***
      alert(`Failed to load questions. Error: ${err.message}. Please check the video URL and ensure your backend server is running on port 3000.`);
    } finally {
      setLoading(false);
    }
  };

  const handleselectoption = (option) => {
    const newuseranswers = [...useranswers];
    newuseranswers[currentquestion] = option;
    setuseranswers(newuseranswers);
  };

  const gotonext = () => {
    if (currentquestion === questionBank.length - 1) {
      setisquizfinished(true);
    } else {
      setcurrentquestion(currentquestion + 1);
    }
  };

  const gotoprev = () => {
    if (currentquestion > 0) {
      setcurrentquestion(currentquestion - 1);
    }
  };

  const restartquiz = () => {
    // Reset state to show the input form again
    setVideoUrl('');
    setQuestionBank([]);
    setuseranswers([]);
    setcurrentquestion(0);
    setisquizfinished(false);
    setQuizStarted(false);
  };

  const selectedanswer = useranswers[currentquestion];

  // STEP 1: Show input form
  if (!quizStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-2xl mb-4 font-semibold text-quizzy">Enter YouTube Video URL</h1>
        <input
          className="w-full max-w-md p-2 mb-4 border border-gray-400 rounded"
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="e.g., https://www.youtube.com/watch?v=..."
        />
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" // Added disabled styles
          onClick={fetchQuestions}
          disabled={!videoUrl || loading}
        >
          {loading ? 'Loading...' : 'Start Quiz'}
        </button>
         {/* Optional: Add loading indicator text below button */}
         {loading && <p className="mt-2 text-gray-600">Fetching transcript and generating questions...</p>}
      </div>
    );
  }

  // STEP 2: Show results
  if (isquizfinished) {
    return (
      <Results
        useranswers={useranswers}
        questionBank={questionBank}
        restartquiz={restartquiz}
      />
    );
  }

   // Handle case where quizStarted is true but questionBank is somehow empty
   if (questionBank.length === 0) {
       return (
            <div className="flex flex-col items-center justify-center h-screen p-4">
                <p className="text-xl text-red-600 mb-4">Error: No questions were loaded.</p>
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={restartquiz}
                >
                  Try Another Video
                </button>
            </div>
       );
   }


  // STEP 3: Show quiz UI (only if quizStarted and questions exist)
  return (
    <div className='flex justify-center'>
      <div id="card" className="h-auto w-auto flex-col justify-center px-4 py-4 m-5 bg-ghosty-100 rounded-2xl">
        <div id="title" className='flex-col items-center px-10 py-4'>
          <span className='text-xl bold text-quizzy text-redy-100 p-3'>QUIZ GAME</span>
          <div id="line" className='w-auto h-0.5 bg-ashyy-100 overflow-hidden'></div>
        </div>

        <div id="questions">
          <div id="question" className='p-2 text-xl'>
            {/* Display current question number */}
            <p className="text-sm text-gray-600 mb-2">Question {currentquestion + 1} of {questionBank.length}</p>
            {questionBank[currentquestion]?.question}
          </div>

          <div id="optionns">
            {/* *** FIX: Use '.options' (plural) instead of '.option' (singular) *** */}
            {/* Also changed map parameter name to 'option' for clarity */}
            {questionBank[currentquestion]?.options.map((option, i) => (
              <button
                key={i}
                className={
                  "h-auto w-full rounded-xl m-2 text-left p-4 " +
                  (selectedanswer === option ? "border bg-gray-400 border-blue-500" : "bg-gray-300 hover:bg-gray-400") // Added hover style
                }
                onClick={() => handleselectoption(option)}
              >
                {option}
              </button>
            ))}
          </div>

          <div id="nav" className='w-auto h-auto flex justify-between items-center m-3 px-5'>
            <button
              className='h-auto w-auto bg-ashyy-100 px-4 py-2 rounded-3xl hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed' // Added disabled styles
              onClick={gotoprev}
              disabled={currentquestion === 0}
            >
              Previous
            </button>
            <button
              className='h-auto w-auto bg-ashyy-100 px-4 py-2 rounded-3xl hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed' // Added disabled styles
              onClick={gotonext}
              disabled={selectedanswer === null} // Disable if no answer is selected
            >
              {currentquestion === questionBank.length - 1 ? "Submit" : "Go Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
