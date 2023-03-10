export const apiBaseUrl = process.env.REACT_APP_KENZEN_BASE_URL || "https://master.dev.kenzen.com";
export const apiBaseCmsUrl = process.env.REACT_APP_KENZEN_BASE_CMS_URL || "https://cms.dev.kenzen.com";
export const apiCMSToken = process.env.REACT_APP_API_CMS_TOKEN || '';
console.log("Using base URL:", apiBaseUrl);
console.log("Using base CMS URL:", apiBaseCmsUrl);