export const apiBaseUrl = process.env.REACT_APP_KENZEN_BASE_URL || "https://master.dev.kenzen.com";
export const apiBaseCmsUrl = process.env.REACT_APP_KENZEN_BASE_CMS_URL || "https://cms.dev.kenzen.com";
export const apiCMSToken = process.env.REACT_APP_API_CMS_TOKEN || 'd2b0d0a0c405bb3c37856f0639d27c12afb6da1f93ce516e178e8452832eefdca1da069408e1aa7f9ce6aa135256b86554a94cd63a569040f5fa9c3fd4e43cc5cf767402f62946552f5a65cdf38b4f725a119d127c02083b5d84683a040a2ea85787d2978ae29ae212d679a545016147e886bf15edb09190e263d16e8210c9d5';
console.log("Using base URL:", apiBaseUrl);