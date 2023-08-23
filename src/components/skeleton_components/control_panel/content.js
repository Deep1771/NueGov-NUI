import React from "react";
import { DisplayCard, DisplayGrid } from "components/display_components";
import Skeleton from "@material-ui/lab/Skeleton";

export const ContentSkeleton = () => {
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
                sm={6}
                md={4}
                lg={4}
                xl={3}
                style={{ minHeight: "100px", display: "flex" }}
              >
                <DisplayCard>
                  <DisplayGrid
                    container
                    style={{
                      margin: "10px",
                      minHeight: "150px",
                      position: "relative",
                    }}
                  >
                    <DisplayGrid container item xs={3}>
                      <Skeleton
                        variant="circle"
                        style={{
                          fontSize: "14pt",
                          height: "60px",
                          width: "60px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      ></Skeleton>
                    </DisplayGrid>
                    <DisplayGrid item xs={6}>
                      <Skeleton
                        variant="rect"
                        style={{
                          flex: 1,
                          height: "10%",
                          width: "70%",
                          margin: "3%",
                        }}
                      />
                      <Skeleton
                        variant="rect"
                        style={{
                          flex: 1,
                          height: "10%",
                          width: "100%",
                          margin: "3%",
                        }}
                      />
                      <Skeleton
                        variant="rect"
                        style={{
                          flex: 1,
                          height: "10%",
                          width: "100%",
                          margin: "3%",
                        }}
                      />
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
