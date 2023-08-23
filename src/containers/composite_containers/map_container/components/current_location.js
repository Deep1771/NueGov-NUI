import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

function renderCurrentLocationMarker(googleMap, location) {
  let outerMarkerOpts = {
    clickable: false,
    cursor: "pointer",
    draggable: false,
    flat: true,
    icon: {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: "white",
      fillOpacity: 0.8,
      scale: 12,
      strokeWeight: 0,
    },
    title: "Current location",
    zIndex: 2,
    map: googleMap,
  };

  let outerMarker = new window.google.maps.Marker(outerMarkerOpts);

  let innerMarkerOpts = {
    clickable: false,
    cursor: "pointer",
    draggable: false,
    flat: true,
    icon: {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: "blue",
      fillOpacity: 1,
      scale: 6,
      strokeColor: "white",
      strokeWeight: 2,
    },
    // This marker may move frequently - don't force canvas tile redraw
    optimized: false,
    title: "Current location",
    zIndex: 3,
    map: googleMap,
  };

  let innerMarker = new window.google.maps.Marker(innerMarkerOpts);

  let circleOpts = {
    clickable: false,
    strokeColor: "blue",
    strokeOpacity: 0.4,
    fillColor: "blue",
    fillOpacity: 0.1,
    strokeWeight: 0,
    zIndex: 5,
    map: googleMap,
  };

  let outerCircle = new window.google.maps.Circle(circleOpts);

  if (location) {
    let currentLocation = new window.google.maps.LatLng({
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    });
    innerMarker.setPosition(currentLocation);
    outerMarker.setPosition(currentLocation);
    outerCircle.setCenter(currentLocation);
    outerCircle.setRadius(location.coords.accuracy);
  }
}

function renderGotoCurrentLocation(
  domNode,
  googleMap,
  currentLocation,
  setSnackBar
) {
  const CurrentLocation = ({ mapControl }) => {
    const [location, setLocation] = useState();

    useEffect(() => {
      setLocation(currentLocation);
    }, [currentLocation]);

    const gotoCurrentLocation = () => {
      if (location) {
        const pos = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        };
        mapControl.setZoom(21);
        mapControl.setCenter(pos);
      } else {
        setSnackBar({
          message: "Could not fetch location, Please provide location access",
          severity: "error",
        });
      }
    };

    return (
      <span
        onClick={gotoCurrentLocation}
        title={`Your location`}
        class="material-icons"
        style={{
          backgroundColor: "#fff",
          border: "2px solid #fff",
          boxShadow: "0 2px 6px rgba(0,0,0,.3)",
          cursor: "pointer",
          padding: "5px",
          textAlign: "center",
          color: "#000",
        }}
      >
        my_location
      </span>
    );
  };
  ReactDOM.render(<CurrentLocation mapControl={googleMap} />, domNode);
}

export { renderCurrentLocationMarker, renderGotoCurrentLocation };
