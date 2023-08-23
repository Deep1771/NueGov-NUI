import React from "react";

import {
  DisplayCard,
  DisplayText,
  DisplayIconButton,
} from "components/display_components/";
import Skeleton from "@material-ui/lab/Skeleton";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";

export const ProfilePageSkeleton = () => {
  return (
    <div style={{ flex: 1, display: "flex", margin: "1%" }}>
      <div style={{ flex: 3, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 3, display: "flex" }}>
          <DisplayCard
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              margin: "1%",
              elevation: "21",
              borderRadius: "5px",
            }}
          >
            <div style={{ flex: 3, display: "flex" }}>
              <div style={{ flex: 1 }} />
              <div
                style={{ flex: 1.3, display: "flex", flexDirection: "column" }}
              >
                <div
                  style={{
                    flex: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Skeleton
                    variant="circle"
                    style={{
                      fontSize: "14pt",
                      height: "75%",
                      width: "85%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <b style={{ color: "grey" }}> NG </b>
                  </Skeleton>
                </div>
                <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                  <Skeleton variant="rect" style={{ flex: 1, height: "60%" }} />
                </div>
              </div>
              <div style={{ flex: 1 }} />
            </div>
            <div style={{ flex: 2, display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Skeleton
                  variant="rect"
                  style={{ height: "50%", width: "80%" }}
                />
              </div>
              <div
                style={{ flex: 1, display: "flex", justifyContent: "center" }}
              >
                <Skeleton
                  variant="rect"
                  style={{ height: "40%", width: "60%" }}
                />
              </div>
              <div
                style={{ flex: 1, display: "flex", justifyContent: "center" }}
              >
                <Skeleton
                  variant="rect"
                  style={{ height: "60%", width: "45%" }}
                />
              </div>
            </div>
          </DisplayCard>
        </div>
        <div style={{ flex: 5.5, display: "flex", margin: "1% 0 0 0" }}>
          <DisplayCard
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              margin: "1%",
            }}
          >
            <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <Skeleton
                variant="rect"
                style={{ height: "60%", width: "60%", marginLeft: "5%" }}
              />
            </div>
            <div style={{ flex: 9, display: "flex", flexDirection: "column" }}>
              {[5, 7, 6, 9, 6, 8, 7].map((e) => (
                <div
                  style={{
                    height: "10%",
                    display: "flex",
                    flexDirection: "column",
                    margin: "2% 2% 2% 5%",
                  }}
                >
                  <div
                    style={{ flex: 1, display: "flex", alignItems: "center" }}
                  >
                    <Skeleton
                      variant="rect"
                      style={{ height: "75%", width: "40%" }}
                    />
                  </div>
                  <div
                    style={{ flex: 1, display: "flex", alignItems: "center" }}
                  >
                    <Skeleton
                      variant="rect"
                      style={{ height: "80%", width: `calc(${e}*10%)` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </DisplayCard>
        </div>
      </div>
      <div style={{ flex: 9, display: "flex", margin: "0 0 0 1%" }}>
        <DisplayCard
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            margin: "0.5%",
          }}
        >
          <div style={{ flex: 1, display: "flex" }}>
            <div
              style={{
                flex: 1,
                fontSize: "14pt",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DisplayText color={"primary"} variant={"subtitle1"}>
                Application Access
              </DisplayText>
            </div>
            {/* 'Feedback & suggestions', */}
            {["Account Settings", "About"].map((e) => (
              <div
                style={{
                  flex: 0.9,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DisplayText variant={"subtitle1"}>{e}</DisplayText>
              </div>
            ))}
            {/* <div style={{flex:1}}/> */}
          </div>
          <div style={{ flex: 9, display: "flex", flexDirection: "column" }}>
            {[1, 2, 3].map((e) => (
              <DisplayCard
                style={{
                  height: "30%",
                  display: "flex",
                  flexDirection: "column",
                  margin: "2% 2% 0 2%",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ width: "30%", display: "flex" }}>
                    <div
                      style={{
                        width: "30%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Skeleton
                        variant="circle"
                        style={{ height: "70%", width: "50%" }}
                      />
                    </div>
                    <div
                      style={{
                        width: "70%",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Skeleton
                        variant="rect"
                        style={{ height: "50%", width: "75%" }}
                      />
                    </div>
                  </div>
                  <div style={{ width: "20%", display: "flex" }}>
                    <div
                      style={{
                        width: "80%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Skeleton
                        variant="rect"
                        style={{ height: "50%", width: "60%" }}
                      />
                    </div>
                    <div
                      style={{
                        width: "20%",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <DisplayIconButton disabled>
                        <ExpandLessIcon />
                      </DisplayIconButton>
                    </div>
                  </div>
                </div>
                <div
                  style={{ flex: 3, display: "flex", flexDirection: "column" }}
                >
                  <div style={{ flex: 0.3 }} />
                  <div style={{ flex: 3, display: "flex" }}>
                    <div style={{ flex: 0.1 }} />
                    {[1, 2, 3, 4].map((e) => (
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          justifyContent: "space-around",
                          flexDirection: "column",
                        }}
                      >
                        {[5, 3, 6, 7, 4].map((e) => (
                          <Skeleton
                            variant="text"
                            style={{
                              width: `calc(${e}*10%)`,
                              height: "15%",
                              margin: "0 0 3% 10%",
                            }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </DisplayCard>
            ))}
          </div>
        </DisplayCard>
      </div>
    </div>
  );
};
