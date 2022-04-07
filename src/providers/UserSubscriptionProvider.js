import * as React from 'react';
import {getTeamMemberEvents, getTeamMemberAlerts} from "../http";

const UserSubscriptionContext = React.createContext(null);

export const UserSubscriptionProvider = (
  {
    children,
  }) => {
  const [duration, setDuration] = React.useState(30); // 1, 7, or 30 days
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    // todo get alerts, events of user
    if (user?.id) {
      getData(user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const getData = (user) => {
    if (user?.id && user?.teamId) {
      const promises = [];
      const d = new Date();
      d.setDate(d.getDate() - duration);
      const a = getTeamMemberAlerts({teamId: user.teamId, userId: user.id, since: d.toISOString()});

      const b = getTeamMemberEvents({
        teamId: user.teamId,
        userId: user.id,
        startDate: getDateStr(new Date()),
        endDate: getDateStr(d),
      });

      promises.push(a, b);
      if (promises?.length > 0) {
        Promise.allSettled(promises)
          .then(results => {
            console.log("user events", results);
          })
          .finally(() => {});
      }
    }
  }

  const getDateStr = date => {
    const d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  const providerValue = {
    setUser,
  };

  return (
    <UserSubscriptionContext.Provider value={providerValue}>
      {children}
    </UserSubscriptionContext.Provider>
  );
};

export const useUserSubscriptionContext = () => {
  const context = React.useContext(UserSubscriptionContext);
  if (!context) {
    throw new Error("useUserSubscriptionContext must be used within UserSubscriptionProvider");
  }
  return context;
};