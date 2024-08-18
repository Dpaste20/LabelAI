import React, { useState } from 'react';
import '../styles/HomeUI.css';
import { Upload, Moon, Sun, X } from 'lucide-react';
import Dropzone from 'react-dropzone';
import MessageUI from './MessageUI';
import { useTheme } from './ThemeContext';

function HomeUI() {
  const [selectedImage, setSelectedImage] = useState(null);
  const { darkMode, toggleDarkMode } = useTheme();

  const handleImageUpload = (acceptedFiles) => {
    setSelectedImage(acceptedFiles[0]);
  };

  const handleUnselectImage = (e) => {
    e.stopPropagation(); 
    setSelectedImage(null);
  };

  return (
    <div className={`home-container ${darkMode ? 'dark' : ''}`}>
      <button onClick={toggleDarkMode} className="theme-toggle-button">
        {darkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>
      <div className="upload-box">
        <Dropzone onDrop={handleImageUpload}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()} className="dropzone">
              <input {...getInputProps()} />
              {!selectedImage ? (
                <div className="upload-placeholder">
                  <Upload size={48} className="upload-icon" />
                  <p>Drop an image or click to upload</p>
                </div>
              ) : (
                <div className="image-container">
                  <img src={URL.createObjectURL(selectedImage)} alt="Uploaded" className="uploaded-image" />
                  <button onClick={handleUnselectImage} className="unselect-button">
                    <X size={24} />
                  </button>
                </div>
              )}
            </div>
          )}
        </Dropzone>
      </div>
      <div className="message-box">
        <MessageUI selectedImage={selectedImage} />
      </div>
    </div>
  );
}

export default HomeUI;