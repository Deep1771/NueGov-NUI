import { useEffect, useRef, useContext } from "react";
import React from "react";
import renderSearchBar from "./components/search_bar";
import renderGeoSearch from "./components/geo_search";
import {
  renderCurrentLocationMarker,
  renderGotoCurrentLocation,
} from "./components/current_location";
import { GlobalFactory } from "utils/services/factory_services";
import LocationContext from "utils/location";
import mapStyles from "utils/constants/mapStyles";

export let MapDisplayComponent = ({
  callTriggerSearch,
  addResetFilters,
  fixedShape,
  mapEvents,
  mapControl,
  drawingManager,
  setMapControl,
  mode,
  initialBounds,
  mapDefaults,
  geoFenceApplied = false,
}) => {
  const googleContainerRef = useRef(null);
  const { setSnackBar } = GlobalFactory();
  let googleMap;
  let location = useContext(LocationContext);
  const { coords, zoomLevel } = mapDefaults;

  useEffect(() => {
    googleMap = createGoogleMap();
    if (mapControl !== undefined) mapControl.current = googleMap;

    if (mapEvents !== undefined) {
      Object.entries(mapEvents).map(([k, v]) => {
        googleMap.addListener(k, v);
      });
    }

    if (drawingManager !== undefined)
      drawingManager.current = new window.google.maps.drawing.DrawingManager({
        drawingControl: false,
        map: mapControl,
      });

    if (setMapControl !== undefined) setMapControl(googleMap);
    let searchBarDiv = document.createElement("div");
    searchBarDiv.style.paddingTop = "10px";
    searchBarDiv.style.marginLeft = "0vw";
    searchBarDiv.index = 1;
    googleMap.controls[window.google.maps.ControlPosition.TOP_CENTER].push(
      searchBarDiv
    );
    renderSearchBar(searchBarDiv, googleMap);

    let geoFenceSearchDiv = document.createElement("div");
    geoFenceSearchDiv.id = "drawpolygon";
    geoFenceSearchDiv.index = 3;
    geoFenceSearchDiv.style.paddingRight = "10px";
    geoFenceSearchDiv.style.paddingTop = "10px";
    if (geoFenceApplied) geoFenceSearchDiv.style.display = "none";
    googleMap.controls[window.google.maps.ControlPosition.TOP_RIGHT].push(
      geoFenceSearchDiv
    );
    renderGeoSearch(
      geoFenceSearchDiv,
      googleMap,
      callTriggerSearch,
      addResetFilters,
      fixedShape,
      setSnackBar
    );

    return function () {
      window.google.maps.event.clearInstanceListeners(googleMap);
    };
  }, []);

  useEffect(() => {
    if (googleMap) {
      renderCurrentLocationMarker(googleMap, location);

      //curent loc
      let gotoLocationDiv = document.createElement("div");
      gotoLocationDiv.style.paddingRight = "10px";
      gotoLocationDiv.style.paddingTop = "10px";
      gotoLocationDiv.index = 2;
      googleMap.controls[window.google.maps.ControlPosition.TOP_RIGHT].push(
        gotoLocationDiv
      );
      renderGotoCurrentLocation(
        gotoLocationDiv,
        googleMap,
        location,
        setSnackBar
      );
    }
  }, [location]);

  const createGoogleMap = (ref) => {
    let map = new window.google.maps.Map(googleContainerRef.current, {
      // zoom: initialBounds !== null && initialBounds !== undefined ? initialBounds.getZoom() : 10,
      mapTypeControlOptions: {
        position: window.google.maps.ControlPosition.TOP_RIGHT,
      },
      fullscreenControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_BOTTOM,
      },
      styles: mapStyles,
      // center: initialBounds !== null && initialBounds !== undefined ? initialBounds.getCenter() : new window.google.maps.LatLng({lat: 39.742043, lng: -104.991531})
    });
    if ([null, undefined].includes(initialBounds)) {
      map.setZoom(zoomLevel);
      map.setCenter(new window.google.maps.LatLng(coords));
    } else {
      map.fitBounds(initialBounds);
    }
    return map;
  };

  let dim = {
    summary: {
      width: "100%",
      height: "100%",
    },
    detail: {
      width: "100%",
      height: "60vh",
    },
  };

  return (
    <div
      id="google-map"
      ref={googleContainerRef}
      style={{ width: dim[mode].width, height: dim[mode].height }}
    />
  );
};
