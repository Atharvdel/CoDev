import React, { useState } from 'react';
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
      toast.error('ROOM ID & username is required');
      return;
    }
    navigate(`/editor/${roomId}`, {
      state: { username },
    });
  };

  const handleInputEnter = (e) => {
    if (e.code === 'Enter') {
      joinRoom();
    }
  };

  return (
    <>
      <Helmet>
        <title>SynCode - Real-time Collaborative Code Editor</title>
        <meta name="description" content="Join or create a room to start collaborative coding in real-time with SynCode" />
      </Helmet>
      
      <div className="homePageWrapper">
        <div className="formWrapper">
          <img className="homePageLogo" src="/syncode.png" alt="SynCode Logo" />
          
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
            <a onClick={createNewRoom} className="createNewBtn" href="">
              new room
            </a>
          </span>
        </div>
      </div>
    </>
  );
};

export default Home;
