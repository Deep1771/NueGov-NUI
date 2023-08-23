import * as utilities from "./utility";
import * as muiComponent from "./material-ui-component";
let tinycolor = require("tinycolor2");

let isLightColor = (color) => {
  if (tinycolor(color).isLight()) return "#000000";
  else return "#ffffff";
};

export { utilities, muiComponent, isLightColor };
