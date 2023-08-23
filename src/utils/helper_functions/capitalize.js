export const makeUpperCase = (string) => {
  try {
    let upperCased = string[0]?.toUpperCase() + string?.slice(1)?.toLowerCase();
    return upperCased === "undefined" ? " " : upperCased;
  } catch (e) {
    return "";
  }
};
