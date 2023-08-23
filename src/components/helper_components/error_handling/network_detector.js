import React, { useState, useEffect } from "react";
import { ErrorFallback } from "./error_fallback";

const NetworkDetector = ({ children }) => {
  const [isDisconnected, checkisDisconnected] = useState(false);
  useEffect(() => {
    handleConnectionChange();
    window.addEventListener("online", handleConnectionChange);
    window.addEventListener("offline", handleConnectionChange);
    return () => {
      window.removeEventListener("online", handleConnectionChange);
      window.removeEventListener("offline", handleConnectionChange);
    };
  }, []);

  const handleConnectionChange = () => {
    const condition = navigator.onLine ? "online" : "offline";
    if (condition === "online") {
      const webPing = setInterval(() => {
        fetch("//google.com", {
          mode: "no-cors",
        })
          .then(() => {
            checkisDisconnected(false);
            return clearInterval(webPing);
          })
          .catch(() => checkisDisconnected(true));
      }, 2000);
      return;
    } else return checkisDisconnected(true);
  };
  if (!isDisconnected) {
    return children;
  } else return <ErrorFallback slug="no_internet" />;
};

export default NetworkDetector;
