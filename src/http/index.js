import axios from 'axios';
import { update } from 'lodash';
import { apiBaseUrl as baseUrl } from '../config';
import { toastr } from 'react-redux-toastr';
import i18n from '../i18nextInit';
import { logout } from '../views/layouts/MainLayout';
import axiosRetry from 'axios-retry';

const { ConcurrencyManager } = require('axios-concurrency');

const showErrorAndLogout = () => {
  toastr.error(i18n.t('msg token expired'), i18n.t('msg login again'));
  setTimeout(() => {
    logout();
  }, 1500);
};

const showNetworkError = () => {
  toastr.error('', i18n.t('no internet connection'));
};

const cachedBaseUrl = localStorage.getItem('kop-v2-base-url');

export const instance = axios.create({
  baseURL: cachedBaseUrl ?? baseUrl,
  timeout: 60000 // set 60s for long-polling
});

axiosRetry(instance, {
  retries: 10, // Number of retries
  retryCondition(error) {
    // Conditional check the error status code
    switch (error?.code) {
      case 'ERR_NETWORK':
        return true; // Retry request with response status code 404 or 429
      default:
        return false; // Do not retry the others
    }
  }
});

const MAX_CONCURRENT_REQUESTS = 50;

// init your manager.
const manager = ConcurrencyManager(instance, MAX_CONCURRENT_REQUESTS);

export function stopConcurrencyManager() {
  manager.detach();
}

// Request interceptor for API calls
instance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('kop-v2-token');

    if (token) {
      // check if Authorization already set
      if (!config.headers?.['Authorization']) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`
        };
      }
    }
    const lang = localStorage.getItem('kop-v2-lang') || 'en';
    config.headers = {
      ...config.headers,
      'Accept-Language': lang
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
var countingNetworkErr = 0;
// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  async function (error) {
    const originalRequest = error.config;
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (error?.code === 'ERR_NETWORK') {
      countingNetworkErr = countingNetworkErr + 1;
      if (countingNetworkErr > 10) {
        showNetworkError();
      }
      return Promise.reject(error);
    }
    countingNetworkErr = 0;
    if (['401'].includes(error.response?.status?.toString())) {
      // if token expired
      if (!originalRequest._retry) {
        const refreshToken = localStorage.getItem('kop-v2-refresh-token');
        if (refreshToken) {
          try {
            const deviceId = localStorage.getItem('kop-v2-device-id');
            const res = await post('/auth/refresh', {
              refreshToken,
              deviceId: `web:${deviceId}`
            });
            if (res.data?.accessToken) {
              localStorage.setItem('kop-v2-token', res.data?.accessToken);
              localStorage.setItem('kop-v2-refresh-token', res.data?.refreshToken);
              originalRequest.headers['Authorization'] = `Bearer ${res.data?.accessToken}`;
              originalRequest._retry = true;
              return instance(originalRequest);
            }
          } catch (e) {
            showErrorAndLogout();
          }
        } else {
          showErrorAndLogout();
        }
      } else {
        showErrorAndLogout();
      }
    }

    let errorObj = JSON.parse(JSON.stringify(error));
    update(errorObj, 'response', () => ({
      ...(error?.response ?? {})
    }));
    if (!error?.response?.data?.message) {
      update(errorObj, 'response.data.message', () => i18n.t('msg something went wrong'));
    }
    return Promise.reject(errorObj);
  }
);

export function get(url, token, customHeaders) {
  let headers = {};
  if (customHeaders) {
    headers = customHeaders;
  }
  if (token) {
    headers = {
      ...headers,
      Authorization: `Bearer ${token}`
    };
  }
  return new Promise((resolve, reject) => {
    instance
      .get(url, {
        headers: headers
      })
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
}

export function post(url, body, token, customHeaders, cancelToken) {
  let headers = {};
  if (customHeaders) {
    headers = customHeaders;
  }
  if (token) {
    headers = {
      ...headers,
      Authorization: `Bearer ${token}`
    };
  }
  return new Promise((resolve, reject) => {
    instance
      .post(url, body, {
        headers: headers,
        cancelToken: cancelToken
      })
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
}

function patch(url, body, token) {
  let headers = {};
  if (token) {
    headers = {
      Authorization: `Bearer ${token}`
    };
  }
  return new Promise((resolve, reject) => {
    instance
      .patch(url, body, {
        headers: headers
      })
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
}

function deleteRequest(url, token) {
  let headers = {};
  if (token) {
    headers = {
      Authorization: `Bearer ${token}`
    };
  }
  return new Promise((resolve, reject) => {
    instance
      .delete(url, {
        headers: headers
      })
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
}

export const login = (body) => {
  return post('/auth/login', body);
};

export const createCompany = (body) => {
  return post('/organization', body);
};

export const getCompanyById = (id) => {
  return get(`/organization/${id}`);
};

export const updateCompany = (id, body) => {
  return patch(`/organization/${id}`, body);
};

export const createTeam = (body) => {
  return post('/team', body);
};

export const updateTeam = (teamId, body) => {
  return patch(`/team/${teamId}`, body);
};

export const queryAllOrganizations = () => {
  return get('organization');
};

export const queryTeams = () => {
  return get('team');
};

export const sendRegistrationEmail = (data) => {
  return post('email/reSend', data);
};

export const queryTeamMembers = (teamId) => {
  return get(`team/${teamId}/members`);
};

export const queryMembersByTeamIds = (teamIds) => {
  return get(`team/members/${teamIds}`);
};

export const getTeamStats = (teamId) => {
  return get(`team/${teamId}/stats`);
};

export const getStatsByTeamIds = (teamIds) => {
  return get(`team/stats/${teamIds}`);
};

export const getTeamDevices = (teamId) => {
  return get(`team/${teamId}/devices`);
};

export const getDevicesByTeamIds = (teamIds) => {
  return get(`team/devices/${teamIds}`);
};

export const getTeamAlerts = (teamId, since) => {
  return get(`team/${teamId}/alerts`, null, {
    'If-None-Match': since
  });
};

export const getAlertsByTeamIDs = (teamIds, since) => {
  return get(`team/alerts/${teamIds}`, null, {
    'If-None-Match': since
  });
}

export const searchMembers = (keyword) => {
  return get(`user/find/${keyword}`);
};

export const searchMembersByPhone = (phoneNumber) => {
  return get(`user/phone/${phoneNumber}`);
};

export const searchMembersUnderOrganization = ({ keyword, organizationId }) => {
  return get(`organization/${organizationId}/user/find/${keyword}`);
};

export const getUsersUnderOrganization = ({ userType, organizationId }) => {
  return get(`organization/${organizationId}/user?userType=${userType}`);
};

export const removeTeamMember = (userId) => {
  return post(`team/remove/user/${userId}`, {});
};

export const removeTeam = (teamId) => {
  return deleteRequest(`team/${teamId}`);
};

export const deleteUser = ({ organizationId, userId }) => {
  return deleteRequest(`organization/${organizationId}/user/${userId}`);
};

export const reInviteOrganizationUser = ({ organizationId, userId }) => {
  return get(`organization/${organizationId}/user/${userId}/invite`);
};

export const reInviteTeamUser = ({ teamId, userId }) => {
  return get(`team/${teamId}/invite/${userId}`);
};

export const createUserByAdmin = (orgId, user) => {
  return post(`organization/${orgId}/user`, user);
};

export const updateUserByAdmin = (orgId, userId, user) => {
  return patch(`organization/${orgId}/user/${userId}`, user);
};

export const inviteTeamMemberV2 = (teamId, payload) => {
  return patch(`team/${teamId}/member`, payload);
};

export const requestResetPassword = (username) => {
  return get(`/auth/forgot/${username}`);
};

export const requestSmsCode = (phoneNumber) => {
  return get(`/auth/loginCode/${phoneNumber}`);
};

export const getMyProfileWithToken = (token) => {
  return get('/user', token);
};

export const setMyProfileWithToken = (body, token) => {
  return patch('/user', body, token);
};

export const subscribeDataEvents = ({ filter, orgId, horizon, cancelToken }) => {
  return post(`/organization/${orgId}/subscribe/${horizon}`, filter, null, null, cancelToken);
};

export const updateProfile = (body, token) => {
  return post('user/update/profile', body, token);
};

export const resetPasswordV2 = (payload) => {
  return patch('auth/token', payload);
};

export const updateProfileV2 = (payload, token) => {
  return patch('/user', payload, token);
};

export const unlockUser = ({ teamId, userId }) => {
  return patch(`/team/${teamId}/reset/${userId}`);
};

export const getProfileV2 = (token) => {
  return get('/user', token);
};

export const getMedicalQuestionsV2 = (token) => {
  return get('/questionnaire/medical', token);
};

export const getMedicalResponsesV2 = (token) => {
  return get('/questionnaire/medical/recent', token);
};

export const answerMedicalQuestionsV2 = (body, token) => {
  return post('/questionnaire', body, token);
};

export const recoverUsername = (email) => {
  return get(`/auth/forgot/username/${email}`);
};

export const recoverUsernameByPhoneNumber = (phoneNumber) => {
  return get(`/auth/forgot/username/phone/${phoneNumber}`);
};

export const lookupByUsername = (username) => {
  return get(`/master/lookup/username/${username}`);
};

export const lookupByPhone = (phone) => {
  return get(`/master/lookup/phone/${phone}`);
};

export const lookupByToken = (token) => {
  return get(`/master/lookup/token/${token}`);
};

export const lookupByEmail = (email) => {
  return get(`/master/lookup/email/${email}`);
};

export const resetPasswordWithToken = (body, token) => {
  return patch('/user/password', body, token);
};

export const getTeamMemberEvents = ({ teamId, userId, startDate, endDate }) => {
  return get(`/team/${teamId}/events/user/${userId}?startDate=${startDate}&endDate=${endDate}`);
};

export const getTeamMemberAlerts = ({ teamId, userId, since }) => {
  return get(`team/${teamId}/alerts/user/${userId}`, null, {
    'If-None-Match': since
  });
};

export const logoutAPI = () => {
  return get(`/user/logout`);
};

export const queryOrganizationWearTime = (orgId, data) => {
  return post(`/organization/${orgId}/data/wearTime`, data);
};

export const queryOrganizationAlertMetrics = (orgId, data) => {
  return post(`/organization/${orgId}/data/alertMetrics`, data);
};

export const queryOrganizationMaxCbt = (orgId, data) => {
  return post(`/organization/${orgId}/data/maxCbt`, data);
};

export const queryOrganizationMaxCbtAll = (orgId, data) => {
  return post(`/organization/${orgId}/data/maxCbtAll`, data);
};

export const queryOrganizationMaxHrAll = (orgId, data) => {
  return post(`/organization/${orgId}/data/maxHrAll`, data);
};

// export const queryOrganizationUsersInCBTZones = (orgId, data) => {
//   return post(`/organization/${orgId}/data/temperatureCategories`, data);
// };

export const queryOrganizationActiveUsers = (orgId, data) => {
  return post(`/organization/${orgId}/data/activeUsers`, data);
};

export const queryOrganizationSWRFluid = (orgId, data) => {
  return post(`/organization/${orgId}/data/fluidMetrics`, data);
};

export const queryOrganizationAlertedUserCount = (orgId, data) => {
  return post(`/organization/${orgId}/data/alertedUserCount`, data);
};

export const queryAmbientTempHumidity = (orgId, data) => {
  return post(`/organization/${orgId}/data/tempHumidityRange`, data);
};

export const getRiskLevels = () => {
  return get('risklevel');
};

export const queryOrganizationFluidMetricsByTeam = (orgId, data) => {
  return post(`/organization/${orgId}/data/fluidMetricsByTeam`, data);
};

export const queryOrganizationDeviceData = (orgId, data) => {
  return post(`/organization/${orgId}/data/devices`, data);
};

export const queryOrganizationTempCateData = (orgId, data) => {
  return post(`/organization/${orgId}/data/temperatureCategoriesByUser`, data);
};

// export const queryOrganizationCategoriesUsersInCBTZones = (orgId, data) => {
//   return post(`/organization/${orgId}/data/temperatureCategoriesAndAlerts`, data);
// };

export const queryOrganizationHeartRate = (orgId, data) => {
  return post(`/organization/${orgId}/data/heartRate`, data);
};

export const linkKenzenDevice = (deviceId) => {
  return patch(`/device/${deviceId}`);
};

export const linkMemberKenzenDevice = (teamId, userId, deviceId) => {
  return patch(`/team/${teamId}/device/${userId}/${deviceId}`);
};

export const verifyKenzenDevice = (deviceId) => {
  return get(`/device/${deviceId}/verify`);
};
