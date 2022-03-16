import * as React from 'react';

const WidthContext = React.createContext(null);

export const WidthProvider = (
  {
    children,
  }) => {
  const [width, setWidth] = React.useState(null);
  const [tableWidth, setTableWidth] = React.useState(null);
  React.useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleResize = () => {
    setWidth(window.innerWidth);
  };

  const providerValue = {
    width,
    tableWidth,
    setTableWidth,
  };

  return (
    <WidthContext.Provider value={providerValue}>
      {children}
    </WidthContext.Provider>
  );
};

export const useWidthContext = () => {
  const context = React.useContext(WidthContext);
  if (!context) {
    throw new Error("useWidthContext must be used within WidthProvider");
  }
  return context;
};