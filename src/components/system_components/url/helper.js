const replaceValue = (str, mapObj) => {
  var re = new RegExp(Object.keys(mapObj).join("|"), "gi");
  return str.replace(re, function (matched) {
    return mapObj[matched];
  });
};

const getUniqueId = () => {
  let uniqueId = "PB-" + Math.random().toString(36).slice(2);
  return uniqueId;
};

const getActualValues = (str, defaultValues) => {
  let { agencyName = "" } = defaultValues || {};
  let uniqueId = getUniqueId();
  let replaceObj = {
    "#{agencyname}": agencyName?.replace(/\s/g, ""),
    "#{uniqueId}": uniqueId,
  };

  let updatedValue = replaceValue(str, replaceObj);
  return [updatedValue, uniqueId];
};

const getAgencyInfo = (data) => {
  let { agencyuser = {} } = data?.sys_entityAttributes || {};
  let resultObj = {};
  if (agencyuser?.Name)
    resultObj = {
      name: agencyuser?.Name,
      found: true,
    };
  else
    resultObj = {
      found: false,
    };
  return resultObj;
};

export { getActualValues, getAgencyInfo };
