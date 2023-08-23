import React, { useState, useEffect, useContext } from "react";
import { CircularProgress } from "@material-ui/core";
import { ThemeFactory } from "utils/services/factory_services";
import { SummaryGridContext } from ".";
import { GridSearch } from "./admin_header";
import { GridPagination } from "./admin_footer";
import { Grid } from "./admin_body.js";
import GridServices from "./utils/services";
import { DisplayText, DisplayProgress } from "components/display_components";

export const SummaryGridContainer = ({
  appname,
  modulename,
  entityname,
  editActionCallBack,
  renderThroughProps = false,
  writeAction,
  readRouteQuery,
  height,
  appliedFilter,
}) => {
  const [gridProps, dispatch] = useContext(SummaryGridContext);
  const { data, metadata, loader } = gridProps;
  const { getVariantForComponent } = ThemeFactory();
  const { getMetadata } = GridServices();
  const [loading, setLoading] = useState();

  const initGrid = async () =>
    getMetadata(appname, modulename, entityname, readRouteQuery);

  useEffect(() => {
    if (Object.keys(metadata ? metadata : {}).length) setLoading(false);
    else setLoading(true);
  }, [metadata]);

  useEffect(() => {
    dispatch({ type: "SET_LOADER", payload: { loader: true } });
    initGrid();
  }, [appname, modulename, entityname]);

  if (!loading)
    return (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: "0rem 1rem 0rem 1rem",
          backgroundColor: "#fdfdfd",
        }}
      >
        {data && (
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              width: "100%",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  flex: 4,
                  alignSelf: "center",
                  marginTop: ".4rem",
                }}
              ></div>
              <div style={{ display: "flex", flex: 6 }}>
                <GridSearch
                  editActionCallBack={editActionCallBack}
                  renderThroughProps={renderThroughProps}
                  writeAction={writeAction}
                  entityTemplate={metadata}
                  totalCount={data.length}
                  appliedFilter={appliedFilter}
                  appname={appname}
                  modulename={modulename}
                  entityname={entityname}
                />
              </div>
            </div>
            <div style={{ display: "flex", flex: 9, width: "100%" }}>
              {!loader ? (
                <Grid
                  editActionCallBack={editActionCallBack}
                  renderThroughProps={renderThroughProps}
                  writeAction={writeAction}
                  height={height}
                  appname={appname}
                  modulename={modulename}
                  entityname={entityname}
                />
              ) : (
                <CircularProgress
                  style={{
                    color: `${
                      getVariantForComponent("", "primary").colors.dark.bgColor
                    }`,
                    display: "flex",
                    justifyContent: "center",
                    alignSelf: "center",
                    flex: 1,
                  }}
                  size={50}
                />
              )}
            </div>
            <GridPagination
              appname={appname}
              modulename={modulename}
              entityname={entityname}
            />
          </div>
        )}
      </div>
    );
  else
    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <DisplayProgress />
        <br />
        <DisplayText style={{ color: "#666666" }}>Loading...</DisplayText>
      </div>
    );
};
export default SummaryGridContainer;
