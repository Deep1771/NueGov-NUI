import { useStateValue } from "../../store/contexts";
import { get } from "../helper_services/object_methods";

export const ThemeFactory = () => {
  const { themeState } = useStateValue()[0];
  const { activeTheme } = themeState;
  const { sys_entityAttributes } = activeTheme;
  const { themeObject } = sys_entityAttributes;
  const { variants, componentStyles } = themeObject;

  const getVariantForComponent = (displayComp, variant) => {
    let variantColors = get(variants, variant);
    if (!variantColors) variantColors = get(variants, "default");
    let themeObj = { colors: variantColors };
    let compStyles = get(componentStyles, displayComp);
    if (compStyles) themeObj["local"] = compStyles;
    return themeObj;

    // else {
    //     let {colorProps,...rest} = compStyles;
    //     return !colorProps ?  compStyles
    //     : {...{"colorProps" : substituteColors(colorProps,variantColors)},
    //         rest }
    // }
  };

  const getAllVariants = variants;

  const getVariantObj = (variant) => get(variants, variant);

  const substituteColors = (colorObj, variantObj) => {
    let tempObj = {};
    Object.entries(colorObj).map(
      ([key, val]) => (tempObj[key] = get(variantObj, val))
    );
    return tempObj;
  };

  const getAllClasses = (path) => {
    return get(themeObject, path);
  };
  const services = {
    getAllClasses,
    getAllVariants,
    getVariantObj,
    getVariantForComponent,
    substituteColors,
  };
  return { ...services };
};

export default ThemeFactory;
