import React from "react";
import {
  DisplayGrid,
  DisplayText,
  DisplayAvatar,
} from "components/display_components";
import {
  getAvatarText,
  getEntityIcon,
  getAppIcon,
} from "utils/services/helper_services/system_methods";

const AppAccess = (props) => {
  const { getDetails } = props;
  return (
    <DisplayGrid
      container
      style={{
        display: "flex",
        height: "100%",
        width: "auto",
        overflowY: "scroll",
        position: "absolute",
        "-webkit-overflow-scrolling": "auto",
        flexDirection: "row",
        alignContent: "flex-start",
        borderRadius: "12px",
      }}
      className=""
    >
      <DisplayGrid
        container
        style={{
          position: "sticky",
          padding: "1rem",
          top: 0,
          backgroundColor: "white",
          zIndex: 9,
        }}
      >
        <DisplayText
          style={{
            fontFamily: "inherit",
            fontWeight: 500,
          }}
          variant="h5"
        >
          Access Info
        </DisplayText>
        <hr style={{ border: "1px solid #ebebeb", width: "100%" }} />
      </DisplayGrid>
      <div style={{ padding: "0px 20px", overflow: "auto" }}>
        {getDetails.appStructure.map((app, i) => {
          return (
            <div style={{ overflowY: "auto" }}>
              {app.modules?.length &&
                app.modules.map((module, mindex) => {
                  return (
                    <DisplayGrid
                      container
                      item
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        height: "auto",
                        width: "auto",
                        paddingBottom: "0.5rem",
                      }}
                    >
                      <DisplayGrid
                        item
                        style={{
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          padding: "1rem",
                          flexDirection: "row",
                          flexWrap: "nowrap",
                        }}
                      >
                        <DisplayAvatar
                          style={{ width: "2rem", height: "2rem" }}
                          alt={getAvatarText(module.friendlyName)}
                          src={getAppIcon(module.name)}
                        />
                        <DisplayText
                          style={{
                            fontFamily: "inherit",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            padding: "0rem 0.5rem 0rem 0.5rem",
                          }}
                        >
                          {module.friendlyName}
                        </DisplayText>
                        <hr width="100%" color="#ebebeb" />
                      </DisplayGrid>

                      <DisplayGrid
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          flexWrap: "wrap",
                          paddingLeft: "2rem",
                        }}
                      >
                        {module?.entities?.length &&
                          module.entities.map((entity, eindex) => {
                            return (
                              <DisplayGrid
                                item
                                style={{
                                  textAlign: "left",
                                  display: "flex",
                                  width: "15rem",
                                  alignItems: "center",
                                  padding: "0.5rem ",
                                }}
                              >
                                <DisplayAvatar
                                  style={{ width: "2rem", height: "2rem" }}
                                  alt={getAvatarText(entity.friendlyName)}
                                  src={getEntityIcon(entity.groupName)}
                                />
                                <DisplayText
                                  style={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    color: "grey",
                                    paddingLeft: "0.2rem",
                                  }}
                                >
                                  {entity.friendlyName}{" "}
                                </DisplayText>
                              </DisplayGrid>
                            );
                          })}
                      </DisplayGrid>
                      <hr />
                    </DisplayGrid>
                  );
                })}
            </div>
          );
        })}
      </div>
    </DisplayGrid>
  );
};

export default AppAccess;
