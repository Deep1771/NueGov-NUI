import { useEffect, useState } from "react";

export const UsePosition = () => {
  const [position, setPosition] = useState({});
  const [error, setError] = useState(null);

  const onChange = ({ coords }) => {
    setPosition({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  };
  const onError = (error) => {
    setError(error.message);
  };

  useEffect(() => {
    const geo = navigator.geolocation;
    if (!geo) {
      setError("Geolocation is not supported");
      return;
    }
    let watcher = geo.getCurrentPosition(onChange, onError, {
      timeout: Infinity,
      enableHighAccuracy: true,
      maximumAge: Infinity,
    });
    return () => geo.clearWatch(watcher);
  }, []);

  return { ...position, error };
};
