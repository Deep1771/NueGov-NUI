import React from "react";
//import META from "./utils/meta";
import { RenderTable } from "./table_view";
import { RenderCart } from "./cart_view";

export const SystemLineItem = (props) => {
  let { fieldmeta } = props || {};
  return fieldmeta?.view?.toUpperCase() == "CART" ? (
    <RenderCart {...props} />
  ) : (
    <RenderTable {...props} />
  );
};
