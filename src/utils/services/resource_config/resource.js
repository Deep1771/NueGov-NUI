const constructUrl = (requestUrl, params = {}) => {
  let requestParams = [];
  let queryParams = {};
  let urlArr = requestUrl.split(":");
  let staticPath = urlArr[0];
  let dynamicPath = urlArr
    .slice(1)
    .map((path) => {
      let arr = path.split("/");
      requestParams.push(arr[0]);
      return Object.keys(params).includes(arr[0])
        ? arr.length > 1
          ? params[arr[0]] + "/"
          : params[arr[0]]
        : "";
    })
    .join("");
  Object.keys(params).map((a) => {
    if (!requestParams.includes(a)) queryParams[a] = params[a];
  });
  return {
    requestUrl: staticPath.concat(dynamicPath),
    params: queryParams,
  };
};

export default (base, ax) => {
  let http = ax;
  const create = (input, data) => {
    let { requestUrl, params } = constructUrl(base, input);
    return http({ url: requestUrl, method: "POST", data, params });
  };

  const createData = (input, data, formData) => {
    let { requestUrl, params } = constructUrl(base, input);
    return http({
      url: requestUrl,
      method: "POST",
      data,
      file: formData,
      params,
    });
  };

  const get = (input) => {
    let { requestUrl, params } = constructUrl(base, input);
    return http({ url: requestUrl, method: "GET", params });
  };

  const gethandOffData = (input, data) => {
    let { requestUrl, params } = constructUrl(base, input);
    return http({ url: requestUrl, method: "POST", data, params });
  };

  const getNotificationLogs = (input, data) => {
    let { requestUrl, params } = constructUrl(base, input);
    return http({ url: requestUrl, method: "POST", data, params });
  };

  const markAllNotificationRead = (input, data) => {
    let { requestUrl, params } = constructUrl(base, input);
    return http({ url: requestUrl, method: "PUT", data, params });
  };

  const captureEvent = (input, data) => {
    let { requestUrl, params } = constructUrl(base, input);
    return http({ url: requestUrl, method: "POST", data, params });
  };

  const getReport = (input, data) => {
    let { requestUrl, params } = constructUrl(base, input);
    return http({
      url: requestUrl,
      method: "PUT",
      // responseType: "blob",
      data,
      params,
    });
  };

  const getTemplate = (input) => {
    let { requestUrl, params } = constructUrl(base, input);
    return http({
      url: requestUrl,
      method: "GET",
      responseType: "blob",
      params,
    });
  };

  const query = (input) => {
    let { requestUrl, params } = constructUrl(base, input);
    return http({ url: requestUrl, method: "GET", params });
  };

  const remove = (input) => {
    let { requestUrl, params } = constructUrl(base, input);
    return http({ url: requestUrl, method: "DELETE", params });
  };

  const update = (input, data) => {
    let { requestUrl, params } = constructUrl(base, input);
    return http({ url: requestUrl, method: "PUT", data, params });
  };

  const updateMany = (input, data) => {
    let params = {};
    return http({ url: "/", method: "PUT", data, params });
  };

  const deleteMany = (input, data) => {
    let params = {};
    return http({ url: "/", method: "DELETE", data, params });
  };

  const resource = {
    create,
    createData,
    get,
    getReport,
    getTemplate,
    query,
    remove,
    update,
    updateMany,
    deleteMany,
    gethandOffData,
    getNotificationLogs,
    markAllNotificationRead,
    captureEvent,
  };
  return Object.assign(resource);
};
