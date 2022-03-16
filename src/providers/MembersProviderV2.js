import * as React from 'react';

const MembersContextV2 = React.createContext(null);

export const MembersProviderV2 = (
  {
    children,
  }) => {
  const [selectedMembers, setSelectedMembers] = React.useState([]);

  const providerValue = {
    selectedMembers,
    setSelectedMembers,
  };

  return (
    <MembersContextV2.Provider value={providerValue}>
      {children}
    </MembersContextV2.Provider>
  );
};

export const useMembersContextV2 = () => {
  const context = React.useContext(MembersContextV2);
  if (!context) {
    throw new Error("useMembersContextV2 must be used within MembersProviderV2");
  }
  return context;
};