import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import ACTIONS from '../utils/Actions';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import {
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from 'react-router-dom';

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const reactNavigator = useNavigate();
  const [clients, setClients] = useState([]);
  const [currentLanguage, setCurrentLanguage] = useState('javascript');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      
      socketRef.current.on('connect', () => {
        setIsConnected(true);
        toast.success('Connected to server');
      });

      socketRef.current.on('disconnect', () => {
        setIsConnected(false);
        toast.error('Disconnected from server');
      });

      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      function handleErrors(e) {
        console.log('socket error', e);
        toast.error('Socket connection failed, try again later.');
        reactNavigator('/');
      }

      localStorage.setItem('username', location.state?.username);

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId, currentLanguage }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room.`);
          }

          setClients(clients);
          if (currentLanguage) {
            setCurrentLanguage(currentLanguage);
          }
          
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      socketRef.current.on(
        ACTIONS.DISCONNECTED,
        ({ socketId, username }) => {
          toast.success(`${username} left the room.`);
          setClients((prev) => {
            return prev.filter(
              (client) => client.socketId !== socketId
            );
          });
        }
      );

      // Listen for language changes to update title
      socketRef.current.on('language_change', ({ language }) => {
        setCurrentLanguage(language);
      });
    };

    init();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current?.off(ACTIONS.JOINED);
      socketRef.current?.off(ACTIONS.DISCONNECTED);
      socketRef.current?.off('language_change');
    };
  }, []);

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID copied to clipboard!');
    } catch (err) {
      toast.error('Could not copy the Room ID');
      console.error(err);
    }
  }

  function leaveRoom() {
    reactNavigator('/');
  }

  const getFileExtension = (lang) => {
    const extensions = {
      javascript: 'js',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      html: 'html',
      css: 'css',
    };
    return extensions[lang] || lang;
  };

  // Add sparkle effect on mouse move for sidebar logo
  const handleLogoMouseMove = (e) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const sparkle = document.createElement('div');
    sparkle.style.position = 'absolute';
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    sparkle.style.width = '3px';
    sparkle.style.height = '3px';
    sparkle.style.background = '#00ff41';
    sparkle.style.borderRadius = '50%';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.animation = 'sparkle 1s ease-out forwards';
    sparkle.style.zIndex = '1000';
    
    container.appendChild(sparkle);
    
    setTimeout(() => sparkle.remove(), 1000);
  };

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Helmet>
        <title>{`main.${getFileExtension(currentLanguage)} - Room ${roomId.slice(0, 8)} | CoDev`}</title>
        <meta name="description" content={`Collaborative coding session in ${currentLanguage} - Room ${roomId}`} />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
      </Helmet>

      <div className="mainWrap">
        <aside className="aside">
          <div className="logo">
            {/* Animated CoDev Logo for Sidebar */}
            <div 
              className="codev-logo-sidebar" 
              onMouseMove={handleLogoMouseMove}
            >
              <div className="circuit-bg-sidebar"></div>
              <div className="particles-sidebar">
                <div className="particle-sidebar"></div>
                <div className="particle-sidebar"></div>
                <div className="particle-sidebar"></div>
                <div className="particle-sidebar"></div>
                <div className="particle-sidebar"></div>
              </div>
              <div className="codev-logo-text-sidebar">CoDev</div>
            </div>
          </div>
          
          <div className="asideInner">
            <div>
              <h3 style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '14px', 
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%',
                  background: isConnected ? 'var(--accent-secondary)' : 'var(--accent-danger)'
                }}></span>
                Connected ({clients.length})
              </h3>
              
              <div className="clientsList">
                {clients.map((client) => (
                  <Client
                    key={client.socketId}
                    username={client.username}
                  />
                ))}
              </div>
            </div>
            
            <div className="sidebar-buttons">
              <button className="compactBtn copyBtn" onClick={copyRoomId}>
                📋 Copy Room ID
              </button>
              <button className="compactBtn leaveBtn" onClick={leaveRoom}>
                🚪 Leave Room
              </button>
            </div>
          </div>
        </aside>

        <div className="editorWrap">
          <Editor
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={(code) => {
              codeRef.current = code;
            }}
            onLanguageChange={setCurrentLanguage}
          />
        </div>
      </div>
    </>
  );
};

export default EditorPage;
