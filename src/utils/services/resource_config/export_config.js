const axios = require("axios");
const { EXPORT_URL } = require("./base_url");

const request = function (options) {
  const instance = axios.create({
    baseURL: EXPORT_URL,
    headers: {
      "x-access-token": sessionStorage.getItem("x-access-token"),
      "x-compress": true,
      "ip-address": localStorage.getItem("geoLocation"),
      "browser-details": localStorage.getItem("browserDetails"),
    },
  });

  const onSuccess = function (response) {
    return response.data;
  };

  const onError = function (error) {
    return Promise.reject(error.response || error.message);
  };

  return instance(options).then(onSuccess).catch(onError);
};

export default request;
