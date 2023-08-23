import React from "react";
import { DisplayCard, DisplayGrid } from "components/display_components";
import Skeleton from "@material-ui/lab/Skeleton";

export const ImportsSkeleton = ({ importMode }) => {
  return (
    <div
      style={{
        flexGrow: 1,
        marginBottom: "20px",
        display: "flex",
        contain: "strict",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          height: "100%",
          width: "100%",
          overflow: "auto",
        }}
        className="hide_scroll"
      >
        <DisplayGrid container spacing={3}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(
            (ed, i) => (
              <DisplayGrid
                key={i}
                item
                xs={12}
                sm={importMode === "update" ? 12 : 6}
                md={importMode === "update" ? 12 : 4}
                lg={importMode === "update" ? 12 : 3}
                xl={importMode === "update" ? 12 : 3}
                style={{ minHeight: "100px", display: "flex" }}
              >
                <DisplayCard style={{ background: "white", height: "265px" }}>
                  <DisplayGrid
                    container
                    style={{
                      margin: "10px",
                      minHeight: "150px",
                      position: "relative",
                    }}
                  >
                    <DisplayGrid item xs={8}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          flexWrap: "wrap",
                          gap: "20px",
                        }}
                      >
                        {[1, 2, 3, 4, 5, 6].map(() => {
                          return (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                gap: "20px",
                                width: "21vw",
                              }}
                            >
                              <Skeleton
                                variant="rect"
                                style={{
                                  flex: 1,
                                  width: "40%",
                                }}
                              />
                              <Skeleton
                                variant="rect"
                                style={{
                                  flex: 1,
                                  width: "40%",
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </DisplayGrid>
                  </DisplayGrid>
                </DisplayCard>
              </DisplayGrid>
            )
          )}
        </DisplayGrid>
      </div>
    </div>
  );
};
