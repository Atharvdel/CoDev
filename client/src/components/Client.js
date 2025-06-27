import React from 'react';
import Avatar from 'react-avatar';

const Client = ({ username }) => {
  return (
    <div className="client">
      <Avatar 
        name={username} 
        size={36} 
        round="6px"
        textSizeRatio={1.75}
        maxInitials={2}
      />
      <span className="userName">{username}</span>
    </div>
  );
};

export default Client;
