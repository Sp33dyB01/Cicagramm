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
<<<<<<< HEAD
          <img 
            src={`/api/images/${user.pfp}` || defaultAvatar} 
            alt="User Profile" 
            className="w-40 h-40 rounded-full object-cover"
=======
          <img
            src={`/api/images/${user.pfp}`}
            alt="User Profile"
            className="profile-large-pic"
>>>>>>> 9381403777546a0142d37ee76bca46435356e51e
            onError={(e) => {
              e.currentTarget.src = avatarImg
              e.currentTarget.onerror = null;
            }}
          />
        </div>

        <div className="profile-details">
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <h2>{user.name}</h2>
          <p>{user.rBemutat}</p>
          <p>Üdvözöllek a profil oldaladon!</p>
        </div>
      </div>

      {/* Tabs */}
      <div>
        <nav className="flex">
          <button 
            onClick={() => setActiveTab('uploads')}
            className={`py-2 px-4 font-semibold border-gray-800 border-2 ${activeTab === 'uploads' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
          >
            Saját feltöltések
          </button>
          <button 
            onClick={() => setActiveTab('favorites')}
            className={`py-2 px-4 font-semibold border-gray-800 border-2 ml-[-2px] ${activeTab === 'favorites' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
          >
            Kedvencek
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="border-gray-800 border-2 p-4">
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