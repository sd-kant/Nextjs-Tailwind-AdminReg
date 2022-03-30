import * as React from 'react';
import { v4 as uuidv4 } from 'uuid';

const NotificationContext = React.createContext(null);

export const NotificationProvider = (
  {
    children,
  }) => {
  const [notifications, setNotifications] = React.useState([]);

  const addNotification = (title, variant = 'success') => {
    setNotifications(prevState => [...prevState, {
      id: uuidv4(),
      title,
      variant,
    }])
  };

  const removeNotification = id => {
    setNotifications(prevState => prevState?.filter(it => it.id !== id));
  };

  const providerValue = {
    notifications,
    setNotifications,
    addNotification,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={providerValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext must be used within NotificationProvider");
  }
  return context;
};
