import React, { useEffect, useState } from "react";
import CancelIcon from "@material-ui/icons/Cancel";
import Dialog from "@material-ui/core/Dialog";
import MiniCalendar from "../mini_calendar";
import { DetailPage } from "containers/composite_containers/detail_container/components/detail_page";
import Issues from "../calendar_issues";
import { entityTemplate } from "utils/services/api_services/template_service";
import {
  DisplayModal,
  DisplayText,
  DisplayButton,
} from "components/display_components";
import { AppBarWrapper } from "components/wrapper_components";

// import SysList from '../list';

let PopUp = (props) => {
  let { control, component, togglePopUp } = props;

  let handleClose = (type, data) => {
    if (type) {
      togglePopUp({
        isOpen: false,
        properties: { type: "event_more_options", data: data },
      });
    } else togglePopUp({ isOpen: false, properties: null, type: type });
  };

  let switchComponents = (component) => {
    switch (component) {
      case "MiniCalendar":
        return (
          <MiniCalendar
            togglePopUp={togglePopUp}
            navigate={control.properties}
          />
        );
      case "Alert":
        return (
          <Issues
            togglePopUp={togglePopUp}
            error={control.properties ? control.properties.error : ""}
          />
        );
      case "Detail":
        return (
          <DisplayModal
            fullWidth={true}
            open={true}
            maxWidth="sm"
            children={
              <div
                style={{
                  padding: 20,
                  flexDirection: "column",
                  height: "85vh",
                  width: "auto",
                  display: "flex",
                  flex: 1,
                  alignSelf: "center",
                }}
              >
                <DetailPage
                  data={{
                    sys_entityAttributes: {
                      date: control.properties?.date,
                    },
                  }}
                  metadata={props.metadata}
                  appname="Features"
                  modulename="Calendar"
                  groupname="Event"
                  mode={"new"}
                  onMoreOptions={() => {}}
                  saveCallback={(response, type) => {
                    if (type) {
                      let attachmentDetails = {
                        ...response.ops[0].sys_entityAttributes.eventtype,
                        id: response.insertedIds[0],
                      };
                      handleClose("event_more_options", attachmentDetails);
                    } else {
                      handleClose();
                    }
                  }}
                  onClose={() => {
                    handleClose();
                  }}
                  showToolbar="true"
                />
              </div>
            }
          />
        );
    }
  };

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={control.isOpen}
      disableRestoreFocus={true}
      disableEnforceFocus={true}
      disableRestoreFocus={true}
    >
      <div
        style={{
          flexDirection: "row",
          display: "flex",
          alignSelf: "flex-end",
          padding: 5,
        }}
        onClick={() => togglePopUp({ isOpen: false, properties: null })}
      >
        <CancelIcon style={{ color: "red" }} />
      </div>
      {switchComponents(component)}
    </Dialog>
  );
};

export default PopUp;
