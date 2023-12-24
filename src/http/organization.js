import { post, get } from './index';

export const uploadBulkUserList = (orgId, file) => {
  const form = new FormData();
  form.append('data', file);
  return post(`/organization/${orgId}/pair`, form);
};

export const queryCreateHubProfile = (orgId, deviceId) => {
  return post(`/organization/${orgId}/hub/${deviceId}`);
};

export const queryGetAllHubProfiles = (orgId) => {
  return get(`/organization/${orgId}/hub`);
};
