import React, { useState, useCallback } from "react";
import Tesseract from "tesseract.js";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, RefreshCw, AlertCircle } from "lucide-react";

export default function App() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setError("");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleExtractText = () => {
    if (!image) return;
    setLoading(true);
    setProgress(0);
    setError("");
    Tesseract.recognize(image, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          setProgress(parseInt(m.progress * 100));
        }
      },
    })
      .then(({ data: { text } }) => {
        setText(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        setError("An error occurred while extracting text. Please try again.");
      });
  };

  const handleReset = () => {
    setImage(null);
    setText("");
    setProgress(0);
    setLoading(false);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center tracking-tight">
            Image to Text OCR
          </h1>
          <p className="mt-2 text-indigo-100 text-center max-w-2xl mx-auto">
            Extract text from images with ease using our advanced OCR technology
          </p>
        </div>
        
        <div className="p-8">
          <div
            {...getRootProps()}
            className={`border-3 border-dashed rounded-xl p-8 transition duration-300 ease-in-out ${
              isDragActive
                ? "border-indigo-400 bg-indigo-50"
                : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center text-center">
              <Upload className="w-12 h-12 text-indigo-500 mb-4" />
              <p className="text-xl font-medium text-gray-700 mb-2">
                {isDragActive ? "Drop the image here" : "Drag & drop an image here"}
              </p>
              <p className="text-sm text-gray-500">or click to select a file</p>
            </div>
          </div>

          {image && (
            <div className="mt-8 space-y-4">
              <img
                src={image}
                alt="uploaded"
                className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
              />
              <div className="flex space-x-4">
                <button
                  onClick={handleExtractText}
                  className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <RefreshCw className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      Extracting... {progress}%
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <FileText className="mr-2 h-5 w-5" />
                      Extract Text
                    </span>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg shadow-md hover:bg-gray-300 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                  disabled={loading}
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {text && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Extracted Text:</h2>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 max-h-96 overflow-y-auto shadow-inner">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{text}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}