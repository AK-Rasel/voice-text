import { useState, useEffect, useRef } from "react";
import { FaMicrophone, FaStop } from "react-icons/fa";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const VoiceToText = () => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const { transcript, resetTranscript } = useSpeechRecognition();
  const timeoutRef = useRef(null);

  const startRecording = () => {
    SpeechRecognition.startListening({ continuous: true });
    setIsRecording(true);
    resetTranscript();
    setMessage("");

    // Set a timeout to stop recording after 30 seconds if no typing occurs
    timeoutRef.current = setTimeout(() => {
      endRecording();
    }, 30000);
  };

  const endRecording = () => {
    SpeechRecognition.stopListening();
    setIsRecording(false);

    // Clear the timeout when recording stops
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    setMessage(transcript);
  }, [transcript]);

  const textHandleChange = (e) => {
    setMessage(e.target.value);
    endRecording(); // Stop recording when user types
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!isRecording && message) {
      speakText(message);
    }
  }, [isRecording, message]);

  return (
    <div>
      {/* Animated Bars */}
      <div className={`bars-container h-60 ${isRecording ? "show" : "hide"}`}>
        <div className="bars">
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      </div>
      <div className="flex gap-5">
        {/* Button */}
        <div>
          {isRecording ? (
            <button
              onClick={endRecording}
              className="btn rounded-xl btn-xs sm:btn-sm md:btn-md"
            >
              <FaStop className="text-lg" />
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="btn rounded-xl btn-xs sm:btn-sm md:btn-md"
            >
              <FaMicrophone className="text-2xl" />
            </button>
          )}
        </div>
        {/* Text Area */}
        <textarea
          className="border rounded-md px-5 place-content-center w-96 resize-none"
          placeholder="Speech"
          value={message}
          onChange={textHandleChange}
          onFocus={endRecording} // Stop recording when textarea is focused
        />
      </div>
    </div>
  );
};

export default VoiceToText;
