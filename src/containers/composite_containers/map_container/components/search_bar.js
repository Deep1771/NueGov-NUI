import React, { useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import Icon from "@material-ui/core/Icon";
import SearchIcon from "@material-ui/icons/Search";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    flex: 1,
    width: 400,
    borderRadius: "0 0 0 0",
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
}));

function CustomizedInputBase({ mapControl }) {
  const classes = useStyles();
  let inputRef = useRef(null);

  useEffect(() => {
    let gmapSearchBox = new window.google.maps.places.SearchBox(
      inputRef.current
    );
    gmapSearchBox.addListener("places_changed", () => {
      let places = gmapSearchBox.getPlaces();
      let value = inputRef.current.value;
      let regex = /^\d+(,\d+)*$/;
      let bounds = new window.google.maps.LatLngBounds();
      if (value.match(regex)) {
        let latlng = {
          lat: parseFloat(value.split(",")[0]),
          lng: parseFloat(value.split(",")[1]),
        };
        let point = new window.google.maps.LatLng(latlng);
        bounds.extend(point);
      } else {
        places.forEach(function (place) {
          try {
            if (!place.geometry) {
              return;
            }
            if (place.geometry.viewport) {
              // Only geocodes have viewport.
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
          } catch (e) {
            console.log(e);
          }
        });
      }
      mapControl.fitBounds(bounds);
    });
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Paper className={classes.root}>
        <Icon aria-label="search">
          <SearchIcon />
        </Icon>
        <InputBase
          className={classes.input}
          placeholder={"Search Google Maps"}
          inputProps={{ "aria-label": "search google maps" }}
          inputRef={inputRef}
        />
      </Paper>
    </div>
  );
}

export default function renderSearchBar(domNode, googleMap) {
  ReactDOM.render(<CustomizedInputBase mapControl={googleMap} />, domNode);
}
