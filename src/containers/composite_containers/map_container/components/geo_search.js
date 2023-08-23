import React from "react";
import ReactDOM from "react-dom";

const GeoSearch = ({
  mapControl,
  callTriggerSearch,
  addResetFilters,
  fixedShape,
  setSnackBar,
}) => {
  let drawingManager = new window.google.maps.drawing.DrawingManager({
    drawingControl: false,
    map: mapControl,
  });

  const drawPolygon = () => {
    setSnackBar({
      message: "Draw an area and search geo-fence by click-dragging",
      severity: "info",
    });
    try {
      fixedShape.current = null;
      drawingManager.setDrawingMode("polygon");
      drawingManager.setOptions({
        polygonOptions: {
          strokeColor: "#000000",
          zIndex: 0,
        },
      });
      window.google.maps.event.addListener(
        drawingManager,
        "polygoncomplete",
        (polygon) => {
          let previousView = {
            previousLatLong: mapControl.center,
            previousZoom: mapControl.zoom,
          };
          drawingManager.setDrawingMode(null);
          let bounds = new window.google.maps.LatLngBounds();
          let path = polygon.getPath().getArray();
          path = path.map((point) => {
            bounds.extend(point);
            return [point.lng(), point.lat()];
          });
          if (
            path[0][0] !== path[path.length - 1][0] ||
            path[0][1] !== path[path.length - 1][1]
          ) {
            path.push(path[0]);
          }
          if (fixedShape.current === null) {
            let resetFilterDiv = document.createElement("div");
            resetFilterDiv.style.paddingRight = "10px";
            resetFilterDiv.style.paddingTop = "10px";
            addResetFilters(resetFilterDiv, polygon, previousView, "reset");
            resetFilterDiv.index = 4;
            mapControl.controls[
              window.google.maps.ControlPosition.TOP_RIGHT
            ].push(resetFilterDiv);
          }
          // polygon.setMap(null);
          fixedShape.current = path;
          callTriggerSearch("geoFence");
          mapControl.fitBounds(bounds);

          document.getElementById("drawpolygon").style.display = "none";
        }
      );
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div
      onClick={drawPolygon}
      title={`Draw an area and search geo-fence by click-dragging`}
      // class="material-icons"
      style={{
        backgroundColor: "#fff",
        border: "2px solid #fff",
        boxShadow: "0 2px 6px rgba(0,0,0,.3)",
        cursor: "pointer",
        textAlign: "center",
        color: "#000",
      }}
    >
      <img
        src="https://assetgov-icons.s3.us-west-2.amazonaws.com/reacticons/polygonicon.svg"
        alt="GeoFence"
        height="30px"
        width="35px"
      ></img>
    </div>
  );
};

export default function renderGeoSearch(
  domNode,
  mapControl,
  callTriggerSearch,
  addResetFilters,
  fixedShape,
  setSnackBar
) {
  ReactDOM.render(
    <GeoSearch
      mapControl={mapControl}
      callTriggerSearch={callTriggerSearch}
      addResetFilters={addResetFilters}
      fixedShape={fixedShape}
      setSnackBar={setSnackBar}
    />,
    domNode
  );
}
