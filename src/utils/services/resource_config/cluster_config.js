const axios = require("axios");
const { CLUSTERER_URL } = require("./base_url");

const request = function (options) {
  const instance = axios.create({
    baseURL: CLUSTERER_URL,
    headers: {
      "x-access-token": sessionStorage.getItem("x-access-token"),
      "x-compress": true,
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
