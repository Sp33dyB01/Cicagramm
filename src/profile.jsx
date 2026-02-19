import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import avatarImg from "./assets/avatar.png"; // Make sure the path matches MainApp.jsx
import "./profile.css";


const Profile = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('uploads');

  return (
    <div className="profile-container p-4">

      {/* Profile Picture Section */}
      <div className="flex items-center space-x-4 mb-8">
        <div className="profile-image-wrapper">
          <img 
            src={`/api/images/${user.pfp}` || defaultAvatar} 
            alt="User Profile" 
            className="w-40 h-40 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.src = avatarImg
              e.currentTarget.onerror = null;
            }}
          />
        </div>

        <div className="profile-details">
          <h2 className="text-2xl font-bold">{user.name}</h2>
          
           <p>{user.rBemutat || "Még nincs rövid bemutatkozás"}</p>
          
        </div>
      </div>

      {/* Tabs */}
      <div>
        <nav className="flex border-b border-gray-200 profile-tabs">
          <button
            
            onClick={() => setActiveTab('uploads')}
            className={`py-2 px-4 font-semibold ${activeTab === 'uploads' ? 'text-gray-800 border-b-2 border-white-800' : 'text-gray-500'} gob`}
             
            
          >
            Saját feltöltések
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`py-2 px-4 font-semibold ${activeTab === 'favorites' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-500'} gob`}
          >
            Kedvencek
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'uploads' && (
          <div>
            <h3 className="text-xl">Saját feltöltések</h3>
            {/* Placeholder for user's uploaded content */}
            <p>Itt fognak megjelenni a feltöltött képeid.</p>
          </div>
        )}
        {activeTab === 'favorites' && (
          <div>
            <h3 className="text-xl">Kedvencek</h3>
            {/* Placeholder for user's favorite content */}
            <p>Itt fognak megjelenni a kedvenc képeid.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;