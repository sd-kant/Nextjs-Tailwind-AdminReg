import { post } from './index';

export const uploadBulkUserList = (orgId, file) => {
  const form = new FormData();
  form.append('data', file);
  return post(`/organization/${orgId}/pair`, form);
};
