import { useState, useEffect, useRef } from "react";
import { FaMicrophone, FaStop } from "react-icons/fa";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const VoiceToText = () => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const { transcript, resetTranscript } = useSpeechRecognition();
  const timeoutRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    resetTranscript();
    setMessage("");
    audioChunksRef.current = [];

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      setAudioBlob(audioBlob);
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);
    };

    mediaRecorderRef.current.start();
    SpeechRecognition.startListening({ continuous: true });
    setIsRecording(true);

    timeoutRef.current = setTimeout(() => {
      endRecording();
    }, 30000);
  };

  const endRecording = () => {
    SpeechRecognition.stopListening();
    setIsRecording(false);

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    setMessage(transcript);
  }, [transcript]);

  const textHandleChange = (e) => {
    setMessage(e.target.value);
    endRecording();
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

  const sendDataToServer = async () => {
    if (!audioBlob) {
      console.error("Audio blob is not available");
      return;
    }

    const formData = new FormData();
    formData.append("text", message);
    formData.append("audio", new File([audioBlob], "recording.wav"));

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("Data sent successfully");
      } else {
        console.error("Failed to send data");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendDataToServer();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [message, audioBlob]);

  return (
    <div>
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
        <textarea
          className="border rounded-md px-5 place-content-center w-96 resize-none"
          placeholder="Speech"
          value={message}
          onChange={textHandleChange}
          onFocus={endRecording}
        />
      </div>
      {audioUrl && (
        <a href={audioUrl} download="recording.wav">
          <button className="btn rounded-xl btn-xs sm:btn-sm md:btn-md">
            Download Audio
          </button>
        </a>
      )}
    </div>
  );
};

export default VoiceToText;
