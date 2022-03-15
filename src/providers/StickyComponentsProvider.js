import * as React from 'react';

const StickyComponentsContext = React.createContext(null);

export const StickyComponentsProvider = (
  {
    children,
  }) => {
  const [visible, setVisible] = React.useState({
    statistics: false,
    workRestBar: false,
  });

  const providerValue = {
    visible,
    setVisible,
  };

  return (
    <StickyComponentsContext.Provider value={providerValue}>
      {children}
    </StickyComponentsContext.Provider>
  );
};

export const useStickyComponentsContext = () => {
  const context = React.useContext(StickyComponentsContext);
  if (!context) {
    throw new Error("useStickyComponentsContext must be used within StickyComponentsProvider");
  }
  return context;
};
