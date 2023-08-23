const axios = require("axios");
const { DELETE_URL } = require("./base_url");

const request = function (options) {
  const instance = axios.create({
    baseURL: DELETE_URL,
    headers: {
      "x-access-token": sessionStorage.getItem("x-access-token"),
      "x-compress": true,
      username: sessionStorage.getItem("username"),
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
