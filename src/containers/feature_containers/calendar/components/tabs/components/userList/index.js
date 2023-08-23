import React, { useState, useEffect } from "react";
import { isLightColor } from "../../../../helper";
import {
  Sync,
  syncParticipants,
  roster,
} from "utils/services/api_services/sync_services";
import {
  DisplaySnackbar,
  DisplayDivider,
  DisplayAvatar,
  DisplayButton,
  DisplayButtonGroup,
  DisplayText,
  DisplayCheckbox,
} from "components/display_components";
import runtimeStyler from "containers/feature_containers/calendar/services/styles";

let UserList = (props) => {
  let { type, properties } = props;
  let [isLoading, setLoading] = useState(false);
  let [avatarColor] = useState("#3498db");
  let [selectedCard, setCard] = useState([]);
  let [listItems, setListItems] = useState([]);
  let [snackMessage, setSnackMessage] = useState("Sync in progress");
  const [styles] = useState(runtimeStyler());

  let getUserList = (type) => {
    switch (type) {
      case "INVITE": {
        if (props.properties) {
          setLoading(true);
          Sync.create({}, { eventId: props.properties.id }).then((r) => {
            setListItems(r);
            setLoading(false);
          });
        }
        break;
      }

      case "PARTICIPANT": {
        setLoading(true);
        roster
          .get({
            appname: "Features",
            modulename: "Calendar",
            entityname: "Event",
            id: props.properties.id,
          })
          .then((response) => {
            try {
              if (response.length) {
                setListItems(response);
              }
            } catch (e) {}
            setLoading(false);
          });
        break;
      }
    }
  };

  let isSelected = (participant) => {
    let SelectedIdx = selectedCard
      .map((card, index) => {
        return card.sys_gUid;
      })
      .indexOf(participant.sys_gUid);
    if (SelectedIdx !== -1) {
      return {
        exist: true,
        idx: SelectedIdx,
      };
    } else {
      return {
        exist: false,
        idx: SelectedIdx,
      };
    }
  };

  useEffect(() => {
    getUserList(type);
  }, []);

  useEffect(() => {
    getUserList(type);
  }, [properties]);

  let defineStatus = (participant) => {
    if (type === "INVITE") {
      if (participant.isAttending == undefined) {
        return (
          <span style={{ fontStyle: "italic", color: "#34495e", fontSize: 12 }}>
            <DisplayText>Pending</DisplayText>
          </span>
        );
      } else if (participant.isAttending) {
        return (
          <span style={{ fontStyle: "italic", color: "#27ae60", fontSize: 12 }}>
            <DisplayText>Accepted</DisplayText>
          </span>
        );
      } else {
        return (
          <span style={{ fontStyle: "italic", color: "#c0392b", fontSize: 12 }}>
            <DisplayText>Declined</DisplayText>
          </span>
        );
      }
    } else {
      return (
        <span style={{ fontStyle: "italic", color: "#27ae60", fontSize: 12 }}>
          <DisplayText>Attended</DisplayText>
        </span>
      );
    }
  };

  return (
    <div>
      <DisplaySnackbar
        open={isLoading}
        autoHideDuration={15000}
        message={snackMessage}
        onClose={() => {
          setLoading(!isLoading);
        }}
      />

      <div
        style={{
          display: "flex",
          alignSelf: "center",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <DisplayText
            style={{ color: "#bdc3c7", fontSize: 12, textAlign: "center" }}
          >
            If you don't see updated user list{" "}
            <span>
              <DisplayText
                onClick={() => {
                  getUserList(type);
                }}
                style={{ color: "#3498db", fontSize: 12, cursor: "pointer" }}
              >
                {" "}
                try refreshing
              </DisplayText>
            </span>
          </DisplayText>
        </div>
        <hr />
        {type === "INVITE" && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
            }}
          >
            <DisplayText
              onClick={async () => {
                try {
                  setSnackMessage("Adding user as mandatory");
                  setLoading(true);
                  await syncParticipants.create(
                    {
                      appname: "Features",
                      modulename: "Calendar",
                      entityname: "Event",
                    },
                    { eventId: props.properties.id, participants: selectedCard }
                  );
                  setCard([]);
                  setSnackMessage("Mandatory invite successful");
                  getUserList(type);
                  setLoading(false);
                } catch (e) {
                  setSnackMessage("Something went wrong, try again.");
                  setLoading(false);
                }
              }}
              style={{
                cursor: "pointer",
                margin: 5,
                color: "#3498db",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Required
            </DisplayText>
            <DisplayDivider orientation={"vertical"} />
            <DisplayText
              onClick={async () => {
                try {
                  setSnackMessage("Creating Roster");
                  setLoading(true);
                  await roster.create(
                    {
                      appname: "Features",
                      modulename: "Calendar",
                      entityname: "Event",
                    },
                    { eventId: props.properties.id, participants: selectedCard }
                  );
                  setCard([]);
                  setSnackMessage("Switch to Roster tab to view rosters");
                  setLoading(false);
                } catch (e) {
                  setSnackMessage("Something went wrong, try again.");
                  setLoading(false);
                }
              }}
              style={{
                cursor: "pointer",
                margin: 5,
                color: "#3498db",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Attended
            </DisplayText>
            <DisplayDivider orientation={"vertical"} />
            <DisplayText
              onClick={() => {
                setCard([]);
              }}
              style={{
                cursor: "pointer",
                margin: 5,
                color: "#c0392b",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Cancel
            </DisplayText>
          </div>
        )}

        {listItems && listItems.length == 0 && (
          <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
            <img
              style={{
                height: "auto",
                width: "350px",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "20%",
              }}
              src="https://assetgov-icons.s3-us-west-2.amazonaws.com/Reactimages/nouser+.png"
            />
          </div>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        {listItems &&
          listItems.map((participant, index) => {
            try {
              return (
                <div key={index} style={styles.cardContainer}>
                  {type === "INVITE" && (
                    <DisplayCheckbox
                      checked={isSelected(participant).exist}
                      onChange={() => {
                        let object = isSelected(participant);
                        let { exist, idx } = object;
                        if (exist) {
                          setCard([
                            ...selectedCard.slice(0, idx),
                            ...selectedCard.slice(idx + 1),
                          ]);
                        } else {
                          setCard([...selectedCard, participant]);
                        }
                      }}
                    />
                  )}
                  <DisplayAvatar
                    style={{
                      backgroundColor: isSelected(participant).exist
                        ? "#e67e22"
                        : avatarColor,
                      transitionDuration: 1,
                      transitionDelay: 2,
                      transitionProperty: "all",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "inherit",
                        color: isLightColor(avatarColor),
                      }}
                    >
                      <DisplayText>{`${participant["firstName"]
                        .charAt(0)
                        .toUpperCase()}${participant["lastName"].charAt(
                        0
                      )}`}</DisplayText>
                    </span>
                  </DisplayAvatar>
                  <div
                    style={{
                      marginLeft: 10,
                      display: "flex",
                      flex: 1,
                      flexDirection: "column",
                    }}
                  >
                    <span
                      style={{ fontFamily: "inherit" }}
                    >{`${participant["firstName"]} ${participant["lastName"]}`}</span>
                    <span>
                      <DisplayText>{defineStatus(participant)}</DisplayText>
                    </span>
                  </div>
                </div>
              );
            } catch (e) {}
          })}
      </div>
    </div>
  );
};

export default UserList;
