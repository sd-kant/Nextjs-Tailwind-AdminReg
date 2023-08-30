import { get } from './index';
import moment from 'moment-timezone';

export const gerUserData = () => {
  return get('/user/data');
};

export const getUserAlerts = (startDate, endDate = moment.utc().format('YYYY-MM-DD')) => {
  return get(`/alert/user?startDate=${startDate}&endDate=${endDate}`);
};

export const getUserOrganization = (orgId) => {
  return get(`/organization/${orgId}`);
};

export const subscribeDataEvents = (horizon) => {
  return get(`/user/subscribe/${horizon}`);
};
