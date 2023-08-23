import React, { useEffect, useRef } from "react";
import mapStyles from "utils/constants/mapStyles";

export const Maploader = ({ geojson, icon }) => {
  const googleContainerRef = useRef(null);
  let googleMap;

  useEffect(() => {
    googleMap = createGoogleMap();
    googleMap.data.addGeoJson(geojson);
    if (icon)
      googleMap.data.setStyle({
        icon: icon,
      });
    if (geojson) {
      let firstFeature = geojson.features[0];
      let type = firstFeature.geometry.type;
      if (type === "Point") {
        let coords = firstFeature.geometry.coordinates;
        googleMap.setCenter({ lat: coords[1], lng: coords[0] });
      } else if (type === "LineString") {
        let coords = firstFeature.geometry.coordinates[0];
        googleMap.setCenter({ lat: coords[1], lng: coords[0] });
      } else {
        let coords = firstFeature.geometry.coordinates[0][0];
        googleMap.setCenter({ lat: coords[1], lng: coords[0] });
      }
    }
  }, [geojson]);

  const createGoogleMap = () => {
    let map = new window.google.maps.Map(googleContainerRef.current, {
      zoom: 8,
      center: { lat: -33.865143, lng: 151.2099 },
      styles: mapStyles,
    });
    return map;
  };

  return (
    <div
      id="google-map"
      ref={googleContainerRef}
      style={{ width: "100%", height: "100%" }}
    />
  );
};
