import React from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";

export const DisplayPhoneNumber = (props) => {
  return <PhoneInput {...props} />;
};

DisplayPhoneNumber.defaultProps = {
  onlyCountries: ["us"],
  enableSearch: true,
  prefix: "+",
  enableAreaCodeStretch: true,
  country: "us",
  enableAreaCodes: true,
  enableTerritories: true,
  countryCodeEditable: true,
};
