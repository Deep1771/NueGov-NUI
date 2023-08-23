import React, { useState, useEffect } from "react";
import "../access_new/style.css";
import Navbar from "./components/Navbar";
import Home from "../access_new/landing_page/nuegov_landing_page/Home";
import Signin from "./login_page";
import { Login } from "../access";
import { landing } from "utils/services/api_services/auth_service";
import { useLocation } from "react-router-dom";

export const Access = () => {
  const location = useLocation();
  const { from } = location.state || {};
  const [isLoading, setIsLoading] = useState(true);
  const [runtimeData, setRuntimeData] = useState({
    logo: "",
    poster: "",
    title: "",
    sub_text: "",
  });

  const getDnsConfigs = async () => {
    let url = window.location.href;
    return await landing.query({ url });
  };

  useEffect(() => {
    sessionStorage.removeItem("public-user");
    (async () => {
      let response = await getDnsConfigs();
      setRuntimeData(response);
      setIsLoading(false);
    })();
  }, []);

  if (!isLoading)
    if (runtimeData?.title === "NUEGOV") {
      if (from) {
        return (
          <div className="container">
            <div className="main_container">
              <Signin />
            </div>
          </div>
        );
      } else
        return (
          <div className="container">
            <Navbar />
            <div className="main_container">
              <Home />
            </div>
          </div>
        );
    } else return <Login runtimeData={runtimeData} />;
};
