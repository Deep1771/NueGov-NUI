var TIMEOUT = null;

export const SystemTimeout = (callback, duration) => {
  clearTimeout(TIMEOUT);
  TIMEOUT = setTimeout(callback, duration);
};
