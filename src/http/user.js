import { get } from './index';

export const gerUserData = () => {
  return get('/user/data');
};

export const getUserAlerts = () => {
  return get('/alert/user');
};

export const getUserOrganization = (orgId) => {
  return get(`/organization/${orgId}`);
};
