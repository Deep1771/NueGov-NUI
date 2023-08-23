export const LegendToggle = (controlDiv, toggleLegend) => {
  var controlUI = document.createElement("span");
  controlUI.style.backgroundColor = "#fff";
  controlUI.style.border = "2px solid #fff";
  controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
  controlUI.style.cursor = "pointer";
  controlUI.style.padding = "5px 5px 5px 5px";
  controlUI.style.textAlign = "center";
  controlUI.style.color = "#000";
  controlUI.className = "material-icons";
  controlUI.innerHTML = "layers";
  controlDiv.title = "Toggle Legend";
  controlDiv.id = "legendToggle";
  controlDiv.appendChild(controlUI);

  // Setup the click event listeners: simply set the map to Chicago.
  controlUI.addEventListener("click", toggleLegend);
};

export const TrafficLayerToggle = (controlDiv, toggleTrafficLayer) => {
  var controlUI = document.createElement("span");
  controlUI.style.backgroundColor = "#fff";
  controlUI.style.border = "2px solid #fff";
  controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
  controlUI.style.cursor = "pointer";
  controlUI.style.padding = "5px 5px 5px 5px";
  controlUI.style.textAlign = "center";
  controlUI.style.color = "#000";
  controlUI.className = "material-icons";
  controlUI.innerHTML = "traffic";
  controlDiv.title = "Toggle Traffic Layer";
  controlDiv.appendChild(controlUI);

  // Setup the click event listeners: simply set the map to Chicago.
  controlUI.addEventListener("click", toggleTrafficLayer);
};

export const ResetFilters = (
  controlDiv,
  fixedShape,
  triggerSearch,
  mapControl,
  polygon,
  previousView
) => {
  var controlUI = document.createElement("span");
  controlUI.style.backgroundColor = "#fff";
  controlUI.style.border = "2px solid #fff";
  controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
  controlUI.style.cursor = "pointer";
  controlUI.style.padding = "5px 5px 5px 5px";
  controlUI.style.textAlign = "center";
  controlUI.style.color = "#000";
  controlUI.className = "material-icons";
  controlUI.innerHTML = "cancel";
  controlDiv.appendChild(controlUI);
  controlDiv.id = "reset-filter";
  controlDiv.title = "Reset Filter";

  // Setup the click event listeners: simply set the map to Chicago.
  controlUI.addEventListener("click", () => {
    fixedShape.current = null;
    let buttonIndex;
    mapControl.controls[window.google.maps.ControlPosition.TOP_RIGHT].forEach(
      (button, index) => {
        if (button.id === "reset-filter") {
          buttonIndex = index;
        }
      }
    );
    mapControl.controls[window.google.maps.ControlPosition.TOP_RIGHT].removeAt(
      buttonIndex
    );
    triggerSearch();
    mapControl.setCenter(previousView.previousLatLong);
    mapControl.setZoom(previousView.previousZoom);

    if (polygon) {
      polygon.setMap(null);
      document.getElementById("drawpolygon").style.display = "block";
    }
  });
};

export const SearchButton = (controlDiv, triggerSearch) => {
  let controlUI = document.createElement("span");
  controlUI.style.backgroundColor = "#fff";
  controlUI.style.border = "2px solid #fff";
  controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
  controlUI.style.cursor = "pointer";
  controlUI.style.padding = "5px 5px 5px 5px";
  controlUI.style.textAlign = "center";
  controlUI.style.color = "#000";
  controlUI.className = "material-icons";
  controlUI.innerHTML = "search";
  controlDiv.appendChild(controlUI);

  controlDiv.title = "Search This Area";

  // Setup the click event listeners: simply set the map to Chicago.
  controlUI.addEventListener("click", () => triggerSearch());
};
