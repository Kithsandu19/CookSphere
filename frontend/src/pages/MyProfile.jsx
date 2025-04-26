import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MyProfile.css';

const MyProfile = () => {
    const navigate = useNavigate();

    const handleUploadMaterial = () => {
        navigate('/learning-materials');
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h2>My Profile</h2>
                <button className="primary-button" onClick={handleUploadMaterial}>
                    Upload Learning Material
                </button>
            </div>
            {/* Rest of your profile content */}
        </div>
    );
};

export default MyProfile; 