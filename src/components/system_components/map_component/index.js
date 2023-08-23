import { useEffect, useRef, useCallback } from "react";
import React from "react";
import mapStyles from "utils/constants/mapStyles";
export let MapComponent = React.memo(
  ({
    marker,
    setAddressComponent,
    setCurrentPosition,
    stateParams,
    zoomLevel,
  }) => {
    const googleContainerRef = useRef(null);
    const searchRef = useRef(null);

    let geocoder = new window.google.maps.Geocoder();
    let googleMap;
    let searchTermStyle = {
      zIndex: " 20000 !important",
      width: "40%",
      marginTop: "20px",
      border: "3px solid #00B4CC",
      padding: "5px",
      height: "20px",
      borderRadius: "5px 5px 5px 5px",
      outline: "none",
    };

    const createGoogleMap = useCallback(
      (adressHide = false, positionHide = false) => {
        let position =
          marker && marker.length
            ? marker[marker.length - 1].position
            : { lat: 39.742043, lng: -104.991531 };
        geocoder.geocode({ location: position }, function (results, status) {
          if (status === "OK") {
            if (results[0]) {
              setAddressComponent &&
                !adressHide &&
                setAddressComponent(results);
              setCurrentPosition &&
                !positionHide &&
                setCurrentPosition(position);
            }
          }
        });
        return new window.google.maps.Map(googleContainerRef.current, {
          zoom: zoomLevel ? zoomLevel : 17,
          center: new window.google.maps.LatLng(position),
          styles: mapStyles,
        });
      },
      [JSON.stringify(marker)]
    );

    const markerPosition = (marker) => {
      let Position = { lat: marker.position.lat(), lng: marker.position.lng() };
      googleMap.panTo(Position);
      geocoder.geocode({ location: Position }, function (results, status) {
        if (status === "OK") {
          if (results[0]) {
            setAddressComponent(results);
            setCurrentPosition(Position);
          }
        }
      });
    };

    const searchBox = () => {
      let input = searchRef.current;
      input.index = 1;
      let gmapSearchBox = new window.google.maps.places.SearchBox(input);
      googleMap.controls[window.google.maps.ControlPosition.TOP_CENTER].push(
        input
      );
      let markers = [];
      gmapSearchBox.addListener("places_changed", () => {
        let places = gmapSearchBox.getPlaces();
        let bounds = new window.google.maps.LatLngBounds();
        places.forEach(function (place) {
          if (!place.geometry) {
            return;
          }
          markers.push(
            new window.google.maps.Marker({
              position: place.geometry.location,
              map: googleMap,
              title: place.name,
              draggable: place?.draggable ? place?.draggable : true,
              icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            })
          );
          markers.map((eachmarker) => {
            markerPosition(eachmarker);
            eachmarker.addListener("dragend", () => markerPosition(eachmarker));
          });

          if (place.geometry.viewport) {
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });
        googleMap.fitBounds(bounds);
        //    { stateParams.mode != 'READ'&&setAddressComponent(places)}
      });
    };

    useEffect(() => {
      googleMap = createGoogleMap();
      return function () {
        window.google.maps.event.clearInstanceListeners(googleMap);
      };
    }, []);

    useEffect(() => {
      if (marker.length) {
        marker.map((data) => {
          // if (!data.draggable) {
          //   googleMap = createGoogleMap();
          // }
          let addressHide = true,
            positionHide = true;
          googleMap = createGoogleMap(addressHide, positionHide);
          if (data.position && googleMap)
            var marker = new window.google.maps.Marker({
              position: data.position,
              map: googleMap,
              title: data.title,
              draggable: data.draggable,
              icon:
                data.color == "green"
                  ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                  : "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            });

          marker.addListener("dragend", () => markerPosition(marker));
          var bounds = new window.google.maps.LatLngBounds();
          if (marker?.length > 0) {
            for (var i = 0; i < marker?.length; i++) {
              bounds.extend(marker[i].position);
            }
            googleMap.setZoom(17);
          }
        });
      } else {
        googleMap = createGoogleMap();
      }
      //   if(setAddressComponent!=undefined)
      // {searchBox()}
    }, [marker]);

    useEffect(() => {
      if (setAddressComponent != undefined) {
        searchBox();
      }
    }, []);

    return (
      <div
        id="google-map"
        ref={googleContainerRef}
        style={{ width: "100%", height: "100%" }}
      >
        {setAddressComponent != undefined && (
          <input
            ref={searchRef}
            type="text"
            style={searchTermStyle}
            placeholder="Go to"
          />
        )}
      </div>
    );
  }
);
