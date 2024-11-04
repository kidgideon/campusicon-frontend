// ImageViewer.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ImageViewer.css';

const ImageViewer = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get the image URL from the query parameter
    const queryParams = new URLSearchParams(location.search);
    const imageUrl = queryParams.get('url');
    const handleClose = () => {
        navigate(-1); // Navigate back to the previous page
    };

    return (
        <div className="image-viewer">
            <button className="close-button" onClick={handleClose}>X</button>
            {imageUrl ? (
                <img src={imageUrl} alt="View" className="centered-image" />
            ) : (
                <p style={{ color: 'white' }}>Image not found.</p>
            )}
        </div>
    );
};

export default ImageViewer;
