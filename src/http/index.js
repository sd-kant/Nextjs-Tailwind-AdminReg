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
      config.headers = {
        'Authorization': `Bearer ${token}`,
      }
    }
    const lang = localStorage.getItem("kop-v2-lang") || 'en';
    config.headers = {
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
  return new Promise((resolve, reject) => {
    instance.post("/auth/login", body)
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
}

export const createCompany = (body) => {
  return new Promise((resolve, reject) => {
    instance.post("/organization", body)
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
}

export const updateCompany = (id, body) => {
  return new Promise((resolve, reject) => {
    instance.patch(`/organization/${id}`, body)
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
}

export const registerMultipleUsers = (body) => {
  return new Promise((resolve, reject) => {
    instance.post("/user/create/batch", body)
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
}

export const createTeam = (body) => {
  return new Promise((resolve, reject) => {
    instance.post("/team", body)
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
}

export const inviteRegisteredUsersToTeam = (body) => {
  return new Promise((resolve, reject) => {
    instance.post("team/invite", body)
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
}

export const inviteRegisteredUsersToTeamAsAdmin = (body) => {
  return new Promise((resolve, reject) => {
    instance.post("team/invite/admin", body)
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
}

export const queryAllOrganizations = () => {
  return new Promise((resolve, reject) => {
    instance.get("organization")
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
}

export const queryTeamsByToken = () => {
  return new Promise((resolve, reject) => {
    instance.post("team/queryAll", {})
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
}

export const queryTeams = () => {
  return new Promise((resolve, reject) => {
    instance.get("team")
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
}

export const sendRegistrationEmail = (data) => {
  return new Promise((resolve, reject) => {
    instance.post("email/reSend", data)
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
}

export const sendPasswordRecoveryEmail = (data, mode) => {
  return new Promise((resolve, reject) => {
    instance.post(`user/reset/password/sendEmail/${mode}`, data)
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
}

export const queryTeamMembers = (teamId) => {
  return new Promise((resolve, reject) => {
    instance.get(`team/${teamId}/members`, {})
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
}

export const removeTeamMember = (userId) => {
  return new Promise((resolve, reject) => {
    instance.post(`team/remove/user/${userId}`, {})
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
}

export const deleteUser = (userId) => {
  return new Promise((resolve, reject) => {
    instance.post(`user/remove/${userId}`, {})
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
}

export const modifyTeamMember = (payload) => {
  return new Promise((resolve, reject) => {
    instance.post(`team/updateUserInfo`, payload)
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
}

export const updateUser = user => {
  return new Promise((resolve, reject) => {
    instance.patch(`user`, user)
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
};

export const createUser = user => {
  return new Promise((resolve, reject) => {
    instance.post(`user`, user)
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
};

export const createUserByAdmin = (orgId, user) => {
  return new Promise((resolve, reject) => {
    instance.post(`organization/${orgId}/user`, user)
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
};

export const updateUserByAdmin = (orgId, userId, user) => {
  return new Promise((resolve, reject) => {
    instance.patch(`organization/${orgId}/user/${userId}`, user)
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
};

export const inviteTeamMember = (teamId, payload) => {
  return new Promise((resolve, reject) => {
    instance.patch(`team/${teamId}/members`, payload)
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
};

export const requestResetPassword = username => {
  return new Promise((resolve, reject) => {
    instance.get(`/auth/forgot/${username}`)
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
};

export const resetPasswordV2 = payload => {
  return new Promise((resolve, reject) => {
    instance.patch(`/auth/token`, payload)
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
};

export const getCompany = id => {
  return new Promise((resolve, reject) => {
    instance.get(`/organization/${id}`)
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
};

export const requestSmsCode = phoneNumber => {
  return new Promise((resolve, reject) => {
    instance.get(`/auth/loginCode/${phoneNumber}`)
      .then(res => {
        resolve(res);
      })
      .catch(e => {
        reject(e);
      })
  });
};

export const retrieveCredentials = (token) => {
  return get(`/user/byToken?token=` + token);
}

export const resetPassword = (body, token) => {
  return post("/user/update/password", body, token);
}

export const getMyProfileWithToken = token => {
  return get("/user", token);
}

export const setMyProfileWithToken = (body, token) => {
  return patch("/user", body, token);
}
