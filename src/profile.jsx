import React from "react";
import { useNavigate } from "react-router-dom";
import avatarImg from "./assets/avatar.png"; // Make sure the path matches MainApp.jsx
import "./profile.css";


const Profile = ({user}) => {
  const navigate = useNavigate();

  return (
    <div className="profile-container">

      {/* Profile Picture Section */}
      <div className="profile-info-section">
        <div className="profile-image-wrapper">
          <img 
            src={`/api/images/${user.pfp}`} 
            alt="User Profile" 
            className="profile-large-pic"
            onError={(e) => {
              e.currentTarget.src = avatarImg
              e.currentTarget.onerror = null;
            }}
          />
        </div>
        
        <div className="profile-details">
          <h2>{user.name}</h2>
          <p>Üdvözöllek a profil oldaladon!</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;