"use client";
import React, { useState, useRef } from "react";
import Spinner6 from "./components/Spinner";

const MAX_FILE_SIZE_MB = 10; // Maximum file size in MB

const ImageUploader = () => {
  const [image, setImage] = useState(null); // Uploaded image URL
  const [loading, setLoading] = useState(false);
  const [processedImage, setProcessedImage] = useState(null); // Processed image with frame
  const [fileSize, setFileSize] = useState(null); // File size of the uploaded image
  const [errorMessage, setErrorMessage] = useState(null); // Error message for large files
  const [selectedLanguage, setSelectedLanguage] = useState(""); // Track selected language
  const fileInputRef = useRef(null); // Ref for the file input

  // Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image")) {
      const fileSizeMB = file.size / (1024 * 1024); // Convert bytes to MB
      setFileSize(fileSizeMB.toFixed(2)); // Show file size up to 2 decimal places

      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        // If file size exceeds the limit, show an error and reset the image
        setErrorMessage(
          `File size exceeds ${MAX_FILE_SIZE_MB} MB. Please upload a smaller image.`
        );
        setImage(null);
        setProcessedImage(null);
        return;
      }

      setErrorMessage(null); // Clear any existing error message
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result); // Set uploaded image URL
        setProcessedImage(null); // Reset processed image if a new file is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Language Selection
  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value); // Set the selected language
    setErrorMessage(null);
  };

  // Submit Image to the API for Processing
  const handleProcessImage = async () => {
    if (!selectedLanguage) {
      setErrorMessage("Please select a language for the banner.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Banner-Language": selectedLanguage, // Add selected language to headers
        },
        body: JSON.stringify({ image }),
      });
      const data = await response.json();
      setProcessedImage(data.image);
      setLoading(false); // Set processed image from server
    } catch (error) {
      console.error("Error processing image:", error);
      setLoading(false);
    }
  };

  // Download the Processed Image
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = processedImage;
    link.download = "framed-image.png";
    link.click();
  };

  // Clear the file input, uploaded image, and processed image
  const handleClearImage = () => {
    setImage(null);
    setProcessedImage(null);
    setFileSize(null);
    setErrorMessage(null);
    setSelectedLanguage(""); // Clear selected language
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input field
    }
  };

  return (
    <div className="flex container mt-2 md:mt-10 justify-around flex-col md:flex-row md:mx-auto gap-2 p-4 text-center">
      <div className="basis-2/3 rounded-lg border shadow-2xl p-8">
        <h1 className="text-3xl font-bold p-4">We Support Geeta Jain</h1>

        {/* File Input */}
        <form className="w-full md:w-[80%] rounded-lg" method="post">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            ref={fileInputRef} // Attach ref to input
            className="block w-full border text-sm rounded-lg text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-300 file:text-black hover:file:bg-blue-800 hover:file:text-white"
          />
        </form>

        {/* Display File Size or Error Message */}
        {fileSize && !errorMessage && (
          <p className="text-gray-600 mt-2">Image size: {fileSize} MB</p>
        )}
        {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}

        <div className="flex justify-around flex-col md:flex-row">
          <div className="">
            <div className="mt-8 flex justify-center border-2 rounded-lg items-center min-h-[300px] overflow-hidden w-[300px]">
              {!image && !errorMessage && (
                <h2 className="text-lg font-semibold text-gray-600">
                  Your Image
                </h2>
              )}
              {image && (
                <div className="flex flex-col">
                  <div className="">
                    <img
                      src={image}
                      alt="Uploaded Preview"
                      className="shadow-lg w-full rounded-lg min-h-[300px] object-cover h-[300px]"
                    />
                  </div>
                </div>
              )}
            </div>

            {image && (
              <div className="mt-4">
                <div>
                  <h1 className="w-full font-semibold text-left pl-2">
                    Select Language
                  </h1>
                  <select
                    value={selectedLanguage}
                    onChange={handleLanguageChange}
                    className="border rounded-md p-2 w-full font-semibold text-gray-600"
                  >
                    <option
                      value=""
                      className="text-center font-semibold text-gray-500"
                      disabled
                    >
                      Choose Banner Text Language
                    </option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Gujarati">Gujarati</option>
                  </select>
                </div>
                <div className="flex justify-around mt-4">
                  <div>
                    {loading ? (
                      <Spinner6 />
                    ) : (
                      <button
                        onClick={handleProcessImage}
                        disabled={
                          loading ||
                          (processedImage !== null && selectedLanguage === "")
                        }
                        className="mt-4 rounded-lg bg-[#FFAA33] py-2 px-4 font-semibold text-[#261D79]"
                      >
                        {processedImage == null || selectedLanguage !== ""
                          ? "Add Banner"
                          : "Completed"}
                      </button>
                    )}
                  </div>
                  <div>
                    <button
                      onClick={handleClearImage}
                      className="mt-4 rounded-lg bg-red-500 py-2 px-4 hover:bg-red-500/80 font-semibold text-white"
                    >
                      Remove Image
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Display Processed Image */}
          {processedImage && (
            <div className="flex flex-col items-center">
              <div className="mt-8 flex justify-center items-center min-h-[300px] rounded-lg overflow-hidden w-[300px]">
                <img
                  src={processedImage}
                  alt="Processed with Frame"
                  className="border border-gray-300 rounded-full transition-all shadow-lg w-full min-h-[300px] object-cover h-[300px] shadow-lg"
                />
              </div>
              {!loading && (
                <button
                  onClick={handleDownload}
                  className="mt-4 rounded-lg bg-green-400 py-2 px-4 hover:opacity-80 font-semibold text-black"
                >
                  Download
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <div
        className="basis-1/3 rounded-lg w-full md:w-[90%]"
        style={{ backgroundImage: "var(--gradient)" }}
      >
        <h1 className="text-3xl font-bold pt-10 text-white">Steps</h1>
        <div className="p-4">
          <div className="px-10 py-4 shadow-xl bg-gray-200/50 rounded-lg">
            <ul className="text-black font-medium text-lg list-decimal text-left">
              <li>Click on the choose file button and select an image.</li>
              <li>Preview the Image and click on the Add Banner button.</li>
              <li>Wait for the process to complete.</li>
              <li>Download the processed image.</li>
            </ul>
          </div>
        </div>
        <div className="mt-10">
          <h1 className="pl-10 text-left text-lg font-bold text-white">
            Sample Output:
          </h1>
          <div className="flex justify-center">
            <div className="my-2 min-h-[200px] rounded-lg overflow-hidden w-[200px]">
              <img
                src={"/sample.png"}
                alt="Sample Output Image"
                className="border border-gray-300 rounded-full transition-all shadow-lg w-full min-h-[200px] object-cover h-[200px] shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
