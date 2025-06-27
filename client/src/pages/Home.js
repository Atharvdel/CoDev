import React, { useState, useEffect } from 'react';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    toast.success('Created a new room');
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error('Room ID & username are required');
      return;
    }

    if (username.length < 2) {
      toast.error('Username must be at least 2 characters long');
      return;
    }

    if (username.length > 20) {
      toast.error('Username must be less than 20 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      toast.error('Username can only contain letters, numbers, hyphens, and underscores');
      return;
    }

    navigate(`/editor/${roomId}`, {
      state: { username: username.trim() },
    });
  };

  const handleInputEnter = (e) => {
    if (e.code === 'Enter') {
      joinRoom();
    }
  };

  // Add sparkle effect on mouse move
  const handleMouseMove = (e) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const sparkle = document.createElement('div');
    sparkle.style.position = 'absolute';
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    sparkle.style.width = '4px';
    sparkle.style.height = '4px';
    sparkle.style.background = '#00ff41';
    sparkle.style.borderRadius = '50%';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.animation = 'sparkle 1s ease-out forwards';
    sparkle.style.zIndex = '1000';
    
    container.appendChild(sparkle);
    
    setTimeout(() => sparkle.remove(), 1000);
  };

  return (
    <>
      <Helmet>
        <title>CoDev - Real-time Collaborative Code Editor</title>
        <meta name="description" content="Join or create a room to start collaborative coding in real-time with CoDev" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
      </Helmet>
      
      <div className="homePageWrapper">
        <div className="formWrapper">
          {/* Animated CoDev Logo */}
          <div 
            className="codev-logo-container" 
            onMouseMove={handleMouseMove}
          >
            <div className="circuit-bg"></div>
            <div className="particles">
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
            </div>
            <div className="codev-logo-text">CoDev</div>
          </div>
          
          <div className="inputGroup">
            <input
              type="text"
              className="inputBox"
              placeholder="Enter Room ID"
              onChange={(e) => setRoomId(e.target.value)}
              value={roomId}
              onKeyUp={handleInputEnter}
            />
            
            <input
              type="text"
              className="inputBox"
              placeholder="Enter Username"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              onKeyUp={handleInputEnter}
            />
            
            <button className="btn joinBtn" onClick={joinRoom}>
              Join Room
            </button>
          </div>
          
          <span className="createInfo">
            If you don't have an invite then create{' '}
            <span onClick={createNewRoom} className="createNewBtn">
              new room
            </span>
          </span>
        </div>
      </div>
    </>
  );
};

export default Home;
