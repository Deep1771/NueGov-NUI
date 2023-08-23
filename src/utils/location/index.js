import React, { useReducer } from "react";
let LocationContext = React.createContext();
let initialState = null;

function reducer(state = initialState, action) {
  switch (action.type) {
    case "SET_LOCATION": {
      return action.location;
    }
  }
}

export function LocationProvider({ children }) {
  let [location, dispatchLocation] = useReducer(reducer, initialState);
  navigator.geolocation.watchPosition(
    (position) => {
      dispatchLocation({
        type: "SET_LOCATION",
        location: position,
      });
    },
    (error) => {
      console.log(
        "Could not fetch high accuracy location, trying for lower accuracy...",
        error
      );
      navigator.geolocation.getCurrentPosition(
        (position) => {
          dispatchLocation({
            type: "SET_LOCATION",
            location: position,
          });
        },
        () => {
          console.log("Could not fetch location");
        },
        {
          enableHighAccuracy: false,
        }
      );
    },
    {
      enableHighAccuracy: true,
    }
  );
  return (
    <LocationContext.Provider value={location}>
      {children}
    </LocationContext.Provider>
  );
}

export default LocationContext;
