import React from "react";
import { ErrorFallback } from "./error_fallback";
export const PageNotFound = () => {
  return <ErrorFallback slug="page_not_found" />;
};
export default PageNotFound;
