import * as React from 'react';

const NotificationContext = React.createContext(null);

export const NotificationProvider = (
  {
    children,
  }) => {
  const [notifications, setNotifications] = React.useState([
    /*{
      id: 1,
      title: 'Kristina Duran was successfully moved to Factory Second Floor!',
      variant: 'success',
    },
    {
      id: 2,
      title: 'Kristina Duran was successfully moved to Factory Second Floor!',
      variant: 'success',
    },*/
  ]);

  const addNotification = (title, variant = 'success') => {
    setNotifications(prevState => [...prevState, {
      id: new Date().getTime(),
      title,
      variant,
    }])
  };

  const removeNotification = id => {
    setNotifications(prevState => prevState?.filter(it => it.id !== id) || []);
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
