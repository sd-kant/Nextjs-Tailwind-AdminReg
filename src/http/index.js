import axios from "axios";
import {productionApiBaseUrl as baseUrl} from "../config";
import {toastr} from 'react-redux-toastr'
import i18n from '../i18nextInit';

export const instance = axios.create({
  baseURL: baseUrl,
  timeout: 30000,
});

// Request interceptor for API calls
instance.interceptors.request.use(
  async config => {
    const token = localStorage.getItem('kop-v2-token');

    if (token) {
      // check if Authorization already set
      if (!config.headers?.["Authorization"]) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${token}`,
        }
      }
    }
    const lang = localStorage.getItem("kop-v2-lang") || 'en';
    config.headers = {
      ...config.headers,
      'Accept-Language': lang,
    }
    return config;
  },
  error => {
    Promise.reject(error)
  });

// Add a response interceptor
instance.interceptors.response.use(function (response) {
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data
  if (response?.data?.status === 401) { // if token expired
    toastr.error(
      i18n.t("msg token expired"),
      i18n.t("msg login again"),
    );
    // TODO uncomment before deploying
    // setTimeout(() => {
    //   localStorage.clear();
    //   window.location.href = "/";
    // }, 1000);
  } else {
    return response;
  }
}, function (error) {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  return Promise.reject(error);
});

function get(url, token) {
  let headers = {};
  if (token) {
    headers = {
      "Authorization": `Bearer ${token}`,
    };
  }
  return new Promise((resolve, reject) => {
    instance.get(url, {
      headers: headers,
    })
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
}

function post(url, body, token) {
  let headers = {};
  if (token) {
    headers = {
      "Authorization": `Bearer ${token}`,
    };
  }
  return new Promise((resolve, reject) => {
    instance.post(url, body, {
      headers: headers,
    })
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
}

function patch(url, body, token) {
  let headers = {};
  if (token) {
    headers = {
      "Authorization": `Bearer ${token}`,
    };
  }
  return new Promise((resolve, reject) => {
    instance.patch(url, body, {
      headers: headers,
    })
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
}

export const login = (body) => {
  return post("/auth/login", body);
}

export const createCompany = (body) => {
  return post("/organization", body);
}

export const updateCompany = (id, body) => {
  return patch(`/organization/${id}`, body);
}

export const createTeam = (body) => {
  return post("/team", body);
}

export const queryAllOrganizations = () => {
  return get("organization");
}

export const queryTeams = () => {
  return instance.get("team");
}

export const sendRegistrationEmail = (data) => {
  return post("email/reSend", data);
}

export const queryTeamMembers = (teamId) => {
  return get(`team/${teamId}/members`);
}

export const searchMembers = keyword => {
  return get(`user/find/${keyword}`);
}

export const searchMembersUnderOrganization = ({keyword, organizationId}) => {
  return get(`organization/${organizationId}/user/find/${keyword}`);
}

export const getUsersUnderOrganization = ({userType, organizationId}) => {
  return get(`organization/${organizationId}/user?userType=${userType}`);
}

export const removeTeamMember = (userId) => {
  return post(`team/remove/user/${userId}`, {});
}

export const deleteUser = (userId) => {
  return post(`user/remove/${userId}`, {});
}

export const createUserByAdmin = (orgId, user) => {
  return post(`organization/${orgId}/user`, user);
};

export const updateUserByAdmin = (orgId, userId, user) => {
  return patch(`organization/${orgId}/user/${userId}`, user);
};

export const inviteTeamMember = (teamId, payload) => {
  return patch(`team/${teamId}/members`, payload);
};

export const requestResetPassword = username => {
  return get(`/auth/forgot/${username}`);
};

export const requestSmsCode = phoneNumber => {
  return get(`/auth/loginCode/${phoneNumber}`);
};

export const getMyProfileWithToken = token => {
  return get("/user", token);
}

export const setMyProfileWithToken = (body, token) => {
  return patch("/user", body, token);
}


export const updateProfile = (body, token) => {
  return post("user/update/profile", body, token);
}

export const resetPasswordV2 = payload => {
  return patch("auth/token", payload)
}

export const updateProfileV2 = (payload, token) => {
  return patch("/user", payload, token);
};

export const getProfileV2 = token => {
  return get("/user", token);
};

export const getMedicalQuestionsV2 = token => {
  return get("/questionnaire/medical", token);
};

export const getMedicalResponsesV2 = token => {
  return get("/questionnaire/medical/recent", token);
};

export const answerMedicalQuestionsV2 = (body, token) => {
  return post("/questionnaire", body, token)
}
