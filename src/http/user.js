import { get } from './index';

export const gerUserData = () => {
  return get('/user/data');
};

export const getUserAlerts = (startDate) => {
  return get(`/alert/user?startDate=${startDate}`);
};

export const getUserOrganization = (orgId) => {
  return get(`/organization/${orgId}`);
};

export const subscribeDataEvents = (horizon) => {
  return get(`/user/subscribe/${horizon}`);
};
