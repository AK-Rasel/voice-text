import React, { useState, useEffect } from "react";
import { FaMicrophone, FaStop } from "react-icons/fa";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const VoiceToText = () => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const { transcript, resetTranscript } = useSpeechRecognition();

  const startRecording = () => {
    SpeechRecognition.startListening({ continuous: true });
    setIsRecording(true);

    resetTranscript();
    setMessage("");
  };

  const endRecording = () => {
    SpeechRecognition.stopListening();
    setIsRecording(false);
  };

  // const copyToClipboard = () => {
  //   navigator.clipboard.writeText(message);
  // };

  // const clearText = () => {
  //   resetTranscript();
  //   setMessage('');
  // };

  useEffect(() => {
    setMessage(transcript);
  }, [transcript]);

  const textHandleChange = (event) => {
    message(event.target.value);
    //input Adjust the height based on the scroll height
    event.target.style.height = "auto";
    event.target.style.height = `${event.target.scrollHeight}px`;
  };

  return (
    <div className="flex gap-5">
      {/* btn */}
      <div>
        {isRecording ? (
          <button
            onClick={endRecording}
            className="btn rounded-xl btn-xs sm:btn-sm md:btn-md "
          >
            <FaStop className="text-lg" />
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="btn rounded-xl btn-xs sm:btn-sm md:btn-md "
          >
            <FaMicrophone className="text-2xl" />
          </button>
        )}
      </div>
      {/* text area */}
      <textarea
        className="border rounded-md px-5 place-content-center w-96  resize-none"
        placeholder="Speech"
        value={message}
        onChange={textHandleChange}
        style={{ minHeight: "2rem" }} // Set minimum height
      />
    </div>
  );
};

export default VoiceToText;
