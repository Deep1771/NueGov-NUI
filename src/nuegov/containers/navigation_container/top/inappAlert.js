import React, { useState, useEffect } from "react";
import {
  Fade,
  Popper,
  Paper,
  Link,
  ClickAwayListener,
} from "@material-ui/core";
import { useInAppStyles } from "./style";
import { UserFactory } from "utils/services/factory_services";
import {
  DisplayButton,
  DisplayCard,
  DisplayText,
  DisplayDivider,
  DisplayAvatar,
  DisplayGrid,
  DisplayModal,
} from "components/display_components";
import {
  getEntityIcon,
  getAvatarText,
} from "utils/services/helper_services/system_methods";
import { DetailContainer } from "containers/composite_containers/detail_container/";
import { ContainerWrapper } from "components/wrapper_components";
import { mailLogs } from "utils/services/api_services/notificationlogs_service";
import { eventTracker } from "utils/services/api_services/event_services";
import { BubbleLoader, Banner } from "components/helper_components/";
import {
  entity,
  entityConvertion,
} from "utils/services/api_services/entity_service";
import { GlobalFactory } from "utils/services/factory_services";
import { bulkActions } from "utils/services/api_services/bulk_actions";

export const InAppNotification = (props) => {
  let { isOpen, inappanchorEl, setIsOpen, setInappData } = props;
  const [notificationData, setData] = useState([]);
  const [openDetailPage, setDetailpage] = useState(false);
  const [clickedData, setClickedData] = useState(null);
  const [linkState, setLinkState] = useState("Unread");
  const [isloading, setLoading] = useState(false);

  const {
    getAppStructure,
    getAgencyId,
    getId,
    getUserDocument,
    isNJAdmin,
    checkWriteAccess,
    checkReadAccess,
  } = UserFactory();
  const { setSnackBar } = GlobalFactory();
  const classes = useInAppStyles();
  let { username } = getUserDocument;

  const init = async (options) => {
    let { dataCount } = options;
    let updateCount = dataCount;
    delete options["dataCount"];

    // await eventTracker.captureEvent("", {
    //   name: "vinayak",
    //   place: "chittur"
    // })
    //   .then((result) => {
    //     console.log("reuslt is -> ", result);
    //   })
    //   .catch((err) => {
    //     console.log("error is -> ", err);
    //   })

    if (!isNJAdmin()) {
      options = {
        ...options,
        "sys_entityAttributes.agencyInfo.id": getAgencyId,
      };
    }

    //adding all the required payload for notificationlogs
    options = {
      ...options,
      "sys_entityAttributes.userInfo.id": getId,
      "sys_entityAttributes.inAppNotification": true,
      //need to bring only inapp notification data, drive from notification template.
    };

    let mailData = await mailLogs
      .getNotificationLogs("", { ...options })
      .then((res) => {
        if (res && res.length > 0) {
          setData(res);
          if (updateCount) {
            setInappData(res.length);
          }
        } else {
          setData([]);
        }
      })
      .catch((err) => {
        console.log("error while getting the notification logs -> ", err);
        setData([]);
      });
  };

  const handleMsgClick = async (eachData) => {
    let { _id, sys_gUid, sys_entityAttributes } = eachData || {};
    let { docId, docGroupName } = sys_entityAttributes || {};
    let templateparams = {
      id: docId,
    };
    let app_module = getAppStructure?.map((app_el) => {
      app_el.modules.map((mod_el) => {
        mod_el.entities.map((entity_el) => {
          if (entity_el.groupName === docGroupName) {
            //  console.log("the appname -> ",app_el.name);
            //  console.log("the modulename -> ",mod_el.name);
            //  console.log("the entityname -> ",entity_el);
            templateparams["appname"] = app_el.name;
            templateparams["modulename"] = mod_el.name;
            templateparams["groupname"] = entity_el.groupName;
            templateparams["entityname"] = entity_el.groupName;
          }
        });
      });
    });
    setClickedData({ ...templateparams });
    let writeAccess = checkReadAccess(templateparams);
    let newData = {
      ...eachData,
      sys_entityAttributes: {
        ...eachData.sys_entityAttributes,
        isRead: true,
      },
    };

    //updating the red notification
    if (writeAccess) {
      setDetailpage(true);
      linkState !== "Read" &&
        (await entity
          .update(
            {
              entityname: "NotificationLog",
              appname: "NJAdmin",
              modulename: "NJ-SysTools",
              id: _id,
            },
            { ...newData }
          )
          .then((res) => {
            console.log("am updating notification when clicked");
            let initOptions = {
              dataCount: false,
            };
            if (linkState !== "All") {
              initOptions = {
                ...initOptions,
                "sys_entityAttributes.isRead":
                  linkState === "Read" ? true : false,
              };
            }
            init(initOptions);
          })
          .catch((er) => {
            console.log("er -> ", er);
          }));
    } else {
      setSnackBar({
        message: `Permission Denied to open ${docGroupName} data`,
        severity: "error",
      });
    }
  };

  const getTimeInfo = (val) => {
    let today = new Date();
    let givendate = new Date(val);
    let result;
    if (
      today.getDate() === givendate.getDate() &&
      today.getDay() === givendate.getDay() &&
      today.getFullYear() === givendate.getFullYear()
    ) {
      result = givendate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    } else {
      result = givendate.toLocaleDateString("en-US");
    }
    return result;
  };

  const getMode = (data) => {
    let { appname, modulename, entityname } = data || {};
    let writeAccess = checkWriteAccess({ appname, modulename, entityname });
    return writeAccess ? "edit" : "read";
  };

  const handleLinkClick = (name) => {
    setLinkState(name);

    let initOptions = {
      dataCount: false,
    };
    if (name !== "All") {
      initOptions = {
        ...initOptions,
        "sys_entityAttributes.isRead": name === "Read" ? true : false,
      };
    }
    init(initOptions);
  };

  const rendarLinks = () => {
    let linksList = [
      {
        name: "All",
        id: "All",
        color: "",
      },
      {
        name: "Read",
        id: "Read",
        color: "primary",
      },
      {
        name: "Unread",
        id: "Unread",
        color: "secondary",
      },
    ];
    return linksList.map((el) => {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginRight: ".8rem",
          }}
        >
          <Link
            component="button"
            color={el.color}
            onClick={() => handleLinkClick(el.name)}
            underline={el.name === linkState ? "always" : ""}
          >
            {el.name}
          </Link>
        </div>
      );
    });
  };

  const rendarEachCard = (eachData) => {
    let { timeInfo, docGroupName, inAppDescription, docId, subject, isRead } =
      eachData?.sys_entityAttributes || {};
    let entityIcon = getEntityIcon(docGroupName);

    return (
      <DisplayCard
        // raised={true}
        elevation={0}
        style={{
          padding: "8px",
          // margin: ".1rem",
          flexShrink: 1,
          cursor: "pointer",
          height: "auto",
          // width: "435px",
          display: "flex",
          justifyContent: "center",
          borderBottom: "1px solid #E1F5FE",
          background: isRead ? "white" : "#E1F5FE",
        }}
        onClick={() => {
          handleMsgClick(eachData);
        }}
      >
        <div className="card_Div" style={{ display: "flex", flex: 1 }}>
          <div style={{ display: "flex", flex: 1 }}>
            <DisplayAvatar
              style={{ width: "32px", height: "32px", background: "#E1F5FE" }}
              alt={getAvatarText(docGroupName)}
              src={getEntityIcon(docGroupName)}
            />
          </div>
          <div
            style={{
              display: "flex",
              flex: 9,
              flexDirection: "column",
              width: "380px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <DisplayText
                variant="body2"
                style={{
                  color: isRead ? "" : "#283593",
                  fontWeight: 450,
                  fontSize: "12px",
                }}
              >
                {subject}
              </DisplayText>
              <DisplayText
                variant="caption"
                style={{ color: isRead ? "" : "#283593", fontSize: "10px" }}
              >
                {getTimeInfo(timeInfo)}
              </DisplayText>
            </div>
            <div
              style={{
                display: "flex",
                marginTop: ".2rem",
                width: "380px",
                flexWrap: "wrap",
              }}
            >
              <DisplayText
                variant="caption"
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  // whiteSpace: "wrap",
                  // whiteSpace: "pre",
                  flexShrink: 1,
                  fontWeight: 300,
                  fontSize: "11px",
                }}
              >
                {!["undefined", undefined, null, ""].includes(
                  inAppDescription
                ) && inAppDescription.replace(/<[^>]+>/g, "")}
              </DisplayText>
            </div>
          </div>
        </div>
      </DisplayCard>
    );
  };

  const handleMarkAllRead = async () => {
    console.log("make all as red", notificationData);
    setLoading(true);
    setLinkState("All");
    let options;

    if (!isNJAdmin()) {
      options = {
        "sys_entityAttributes.agencyInfo.id": getAgencyId,
      };
    }

    //adding all the required payload for notificationlogs
    options = {
      ...options,
      "sys_entityAttributes.userInfo.id": getId,
      "sys_entityAttributes.inAppNotification": true,
      "sys_entityAttributes.isRead": false,
    };

    await mailLogs
      .markAllNotificationRead("", { ...options })
      .then((res) => {
        console.log("res -> ", res);
      })
      .catch((err) => {
        console.log("err -> ", err);
      });

    setTimeout(() => {
      init({ dataCount: false });
      setLoading(false);
    }, 2000);
  };

  useEffect(() => {
    let initOptions = {
      dataCount: true,
      "sys_entityAttributes.isRead": false,
    };
    init(initOptions);
    setLinkState("Unread");
  }, []);

  useEffect(() => {
    if (isOpen) {
      let initOptions = {
        dataCount: false,
        "sys_entityAttributes.isRead": false,
      };
      init(initOptions);
    } else {
      setLinkState("Unread");
    }
  }, [isOpen]);

  const renadarInAppNotification = () => {
    return (
      <ClickAwayListener
        onClickAway={() => {
          setIsOpen(true);
        }}
      >
        <Popper
          open={isOpen}
          anchorEl={inappanchorEl}
          transition
          style={{ zIndex: 100 }}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <DisplayCard className={classes.main_card} raised elevation={3}>
                <div className={classes.main_container}>
                  <div className={classes.app_header}>
                    <DisplayText
                      style={{
                        margin: "0 0 0 .6rem",
                        fontSize: "18px",
                        fontWeight: "500",
                      }}
                    >
                      Notifications
                    </DisplayText>
                    <div style={{ display: "flex" }}>{rendarLinks()}</div>
                  </div>
                  <DisplayDivider />
                  <div className={classes.app_body}>
                    {isloading ? (
                      <BubbleLoader />
                    ) : (
                      <DisplayGrid container direction="column" lg>
                        {notificationData?.length > 0 ? (
                          notificationData?.map((eachData) => {
                            return (
                              <DisplayGrid item>
                                {rendarEachCard(eachData)}
                              </DisplayGrid>
                            );
                          })
                        ) : (
                          <Banner
                            src="https://nueassist-icon.s3.us-west-2.amazonaws.com/icons/facesheet.svg"
                            iconSize="65px"
                            msg="No Notifications"
                            fontSize="16"
                          />
                        )}
                      </DisplayGrid>
                    )}
                  </div>
                  <DisplayDivider />
                  <div
                    className={classes.app_footer}
                    style={{
                      justifyContent:
                        linkState === "Unread" && notificationData.length > 0
                          ? "space-between"
                          : "flex-end",
                    }}
                  >
                    {linkState === "Unread" && notificationData.length > 0 && (
                      <Link
                        component="button"
                        style={{ marginLeft: ".6rem" }}
                        onClick={() => handleMarkAllRead()}
                      >
                        Mark All Read
                      </Link>
                    )}
                    <DisplayButton
                      style={{ display: "flex", justifyContent: "flex-end" }}
                      onClick={() => {
                        setIsOpen(!isOpen);
                      }}
                    >
                      Close
                    </DisplayButton>
                  </div>
                </div>
              </DisplayCard>
            </Fade>
          )}
        </Popper>
      </ClickAwayListener>
    );
  };

  return (
    <div className="main_div_now">
      {isOpen && renadarInAppNotification()}
      <div>
        <DisplayModal open={openDetailPage} fullWidth={true} maxWidth="xl">
          <div
            style={{
              height: "85vh",
              width: "100%",
              display: "flex",
              flex: 1,
            }}
          >
            <ContainerWrapper>
              <div style={{ height: "98%", width: "98%", padding: "1%" }}>
                <DetailContainer
                  appname={clickedData?.appname}
                  modulename={clickedData?.modulename}
                  groupname={clickedData?.groupname}
                  mode={getMode(clickedData)}
                  id={clickedData?.id}
                  onClose={(e) => {
                    setDetailpage(false);
                    setClickedData(null);
                  }}
                  saveCallback={() => {
                    setDetailpage(false);
                    setClickedData(null);
                  }}
                />
              </div>
            </ContainerWrapper>
          </div>
        </DisplayModal>
      </div>
    </div>
  );
};
