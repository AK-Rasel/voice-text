import { useState, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import RecordRTC, { invokeSaveAsDialog } from 'recordrtc';

const VoiceToTextAndTextToVoice = () => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const { transcript, resetTranscript } = useSpeechRecognition();
  const recorder = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [recordings, setRecordings] = useState([]);

  const startRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);
      recorder.current = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType: RecordRTC.StereoAudioRecorder,
        desiredSampRate: 16000,
      });
      recorder.current.startRecording();
      SpeechRecognition.startListening({ continuous: false });
      setIsRecording(true);
    } else {
      console.error('getUserMedia not supported on your browser!');
    }
  };

  const endRecording = () => {
    SpeechRecognition.stopListening();
    setIsRecording(false);
    if (recorder.current) {
      recorder.current.stopRecording(() => {
        const audioBlob = recorder.current.getBlob();
        invokeSaveAsDialog(audioBlob, 'recording.wav');
        saveRecording(audioBlob);
        if (mediaStream) {
          mediaStream.getTracks().forEach((track) => track.stop());
          setMediaStream(null);
        }
      });
    }
  };

  const saveRecording = (blob) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      const recordings = JSON.parse(localStorage.getItem('recordings')) || [];
      if (recordings.length >= 10) {
        recordings.shift();
      }
      recordings.push(base64data);
      localStorage.setItem('recordings', JSON.stringify(recordings));
      setRecordings(recordings);
    };
  };

  const getRecordings = () => {
    const recordings = JSON.parse(localStorage.getItem('recordings')) || [];
    setRecordings(recordings);
  };

  const playRecording = (base64data) => {
    const audio = new Audio(base64data);
    audio.play();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message);
  };

  const clearText = () => {
    resetTranscript();
    setMessage('');
  };

  const speakText = () => {
    const utterance = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    setMessage(transcript);
    getRecordings();
  }, [transcript]);

  return (
    <div className="m-5 p-5 border border-gray-300 rounded-lg max-w-lg">
      <h2 className="text-xl font-bold mb-4">Voice to Text and Text to Voice Rasel</h2>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Voice Text"
        className="w-full h-24 p-2 border border-gray-300 rounded mb-4"
      />
      <div>
        <button
          onClick={startRecording}
          className={`m-2 p-2 rounded ${isRecording ? 'bg-gray-400' : 'bg-green-500'} text-white`}
          disabled={isRecording}
        >
          Start Recording
        </button>
        <button
          onClick={endRecording}
          className={`m-2 p-2 rounded ${isRecording ? 'bg-green-500' : 'bg-gray-400'} text-white`}
          disabled={!isRecording}
        >
          End Recording and Download
        </button>
        <button
          onClick={copyToClipboard}
          className="m-2 p-2 bg-gray-500 text-white rounded"
        >
          Copy
        </button>
        <button
          onClick={clearText}
          className="m-2 p-2 bg-gray-500 text-white rounded"
        >
          Clear
        </button>
        <button
          onClick={speakText}
          className="m-2 p-2 bg-blue-500 text-white rounded"
        >
          Speak
        </button>
      </div>
      <div>
        <h3 className="text-lg font-bold mt-4">Saved Recordings</h3>
        {recordings.map((recording, index) => (
          <div key={index} className="flex items-center justify-between mt-2">
            <span>Recording {index + 1}</span>
            <button
              onClick={() => playRecording(recording)}
              className="m-2 p-2 bg-blue-500 text-white rounded"
            >
              Play
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoiceToTextAndTextToVoice;
