import React from "react";
import { DisplayFormLabel } from "components/display_components/";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";

// const useStyles = makeStyles({
//     root : {
//         fontSize : 14,
//         color : 'primary'
//     }
// })
export const SystemLabel = ({ children, ...rest }) => {
  // const classes = useStyles();
  return <DisplayFormLabel {...rest}>{children}</DisplayFormLabel>;
};

export default GridWrapper(SystemLabel);
