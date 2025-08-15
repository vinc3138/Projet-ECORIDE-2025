import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [message, setMessage] = useState('');

  const showMessage = (msg, duration = 5000) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), duration);
  };

  return (
    <NotificationContext.Provider value={{ message, showMessage }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
