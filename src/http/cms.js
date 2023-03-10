import axios from "axios";
import {apiBaseCmsUrl as baseUrl, apiCMSToken} from "../config";

export const instance = axios.create({
  baseURL: baseUrl,
  timeout: 20000,
});

// Request interceptor for API calls
instance.interceptors.request.use(
    async config => {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${apiCMSToken}`,
      };
      return config;
    },
    error => {
      return Promise.reject(error);
    });

function get(url, token, customHeaders) {
  let headers = {};
  if (customHeaders) {
    headers = customHeaders;
  }
  if (token) {
    headers = {
      ...headers,
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

/**
 * Posts by pagination
 * @param keyword
 * @param page
 * @param pageSize
 * @param categoryId
 * @returns {Promise<unknown>}
 */
export const queryNewsBlog = (keyword, page, pageSize, categoryId) => {
  return get(`api/posts?sort[0]=date%3Adesc&sort[1]=title&_q=${keyword ?? ''}&filters[$and][0][show_type][$ne]=cms&filters[categories][id][${categoryId ? '$in' : '$containsi'}]=${categoryId ?? ''}&pagination[page]=${page ?? 1}&pagination[pageSize]=${pageSize ?? 10}&populate=*`);
};

/**
 * Post by News Id
 * @returns {Promise<unknown>}
 * @param newsId
 */
export const queryNewsBlogDetail = (newsId) => {
  return get(`api/posts?filters[id][$eq]=${newsId ?? ''}&filters[$and][0][show_type][$ne]=cms&populate=*`);
};

/**
 * Total Categories
 * @returns {Promise<unknown>}
 */
export const queryCategories = () => {
  return get(`api/categories`);
};

/**
 * News per Author
 * @returns {Promise<unknown>}
 */
export const queryNewsBlogPerAuthor = (page, pageSize, authorId) => {
  return get(`api/posts?sort[0]=date%3Adesc&sort[1]=title&filters[$and][0][show_type][$ne]=cms&filters[admin_user][id][${authorId ? '$in' : '$containsi'}]=${authorId ?? ''}&pagination[page]=${page ?? 1}&pagination[pageSize]=${pageSize ?? 5}&populate=*`);
};
