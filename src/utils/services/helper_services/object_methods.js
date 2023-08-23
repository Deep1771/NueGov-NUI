export const get = ({ ...obj } = {}, path, def = undefined) => {
  let arr = path.split(".");
  arr.map((a) => (obj = obj && obj[a] ? obj[a] : def));
  return obj;
};

export const removeNullifyValues = (object) => {
  Object.entries(object).forEach(([k, v]) => {
    if (v && typeof v === "object") {
      removeNullifyValues(v);
    }
    if (
      (v && typeof v === "object" && !Object.keys(v).length) ||
      v === null ||
      v === undefined ||
      v === ""
    ) {
      if (Array.isArray(object)) {
        object.splice(k, 1);
      } else {
        delete object[k];
      }
    }
  });
  return object;
};

export const isDefined = (variable) =>
  !(typeof variable === "undefined" || variable === null || variable === "");
