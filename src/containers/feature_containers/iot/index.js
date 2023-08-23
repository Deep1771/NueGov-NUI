import React, { useState, useEffect } from "react";
import { Toolbar } from "@material-ui/core";
import { entity } from "utils/services/api_services/entity_service";
import { entityTemplate } from "utils/services/api_services/template_service";
import { DisplayButton } from "components/display_components";
import { makeStyles } from "@material-ui/core/styles";
import DeviceHubIcon from "@material-ui/icons/DeviceHub";

import DeviceRegister from "./components/deviceRegister";
import ListCamera from "./components/listCamera";

let Iot = (props) => {
  const useStyles = makeStyles((theme) => ({
    margin: {
      marginRight: theme.spacing(3),
      minWidth: theme.spacing(3),
    },
  }));
  const classes = useStyles();
  let [setup, showSetup] = useState(false);
  let [devices, showDevices] = useState(false);
  let [template, setTemplate] = useState(false);

  let [camera, cameraList] = useState([]);
  useEffect(() => {
    (async () => {
      let data = await entity.get({
        appname: "NueGov",
        modulename: "IOT",
        entityname: "IOTCamera",
        limit: 100,
        skip: 0,
      });
      let template = await entityTemplate.get({
        appname: "NueGov",
        modulename: "IOT",
        groupname: "IOTCamera",
      });
      setTemplate(template);
      cameraList(data);
    })();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Toolbar
        style={{
          display: "flex",
          backgroundColor: "#fafafa",
          justifyContent: "flex-end",
        }}
      >
        <DisplayButton
          onClick={() => {
            showSetup(!setup);
          }}
          startIcon={<DeviceHubIcon />}
          variant="text"
          className={classes.margin}
          display="inline"
        >
          Setup
        </DisplayButton>
        <DisplayButton
          onClick={() => {
            showDevices(!devices);
          }}
          startIcon={<DeviceHubIcon />}
          variant="text"
          className={classes.margin}
          display="inline"
        >
          Device List
        </DisplayButton>
      </Toolbar>
      {devices && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            margin: 5,
            overflow: "auto",
          }}
        >
          {camera.map((item, index) => {
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  margin: 3,
                  height: "20vh",
                  width: "15vw",
                  backgroundColor: "#ecf0f1",
                  flexDirection: "column",
                  padding: 5,
                }}
              >
                {template &&
                  template.sys_entityAttributes.app_cardContent.descriptionField.map(
                    (attribute, i) => {
                      return (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            marginTop: 2,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: "700",
                              marginRight: 3,
                            }}
                          >
                            {attribute.title}{" "}
                          </span>
                          <span style={{ fontSize: 12 }}>
                            {item.sys_entityAttributes[attribute.title]}{" "}
                          </span>
                        </div>
                      );
                    }
                  )}
                <DisplayButton
                  style={{
                    display: "flex",
                    alignSelf: "flex-end",
                    justifyContent: "flex-end",
                  }}
                >
                  Connect
                </DisplayButton>
              </div>
            );
          })}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ display: "flex", flex: 8 }}>
          <ListCamera />
        </div>
        {setup && (
          <div style={{ display: "flex", flex: 2, alignSelf: "flex-start" }}>
            <DeviceRegister />
          </div>
        )}
      </div>
      {/*
       */}
    </div>
  );
};

export default Iot;
