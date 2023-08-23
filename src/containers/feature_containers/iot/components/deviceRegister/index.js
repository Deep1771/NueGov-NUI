import React, { useState } from "react";
import LinearProgress from "@material-ui/core/LinearProgress";
import ComputerIcon from "@material-ui/icons/Computer";
import VpnLockIcon from "@material-ui/icons/VpnLock";
import DeviceHubIcon from "@material-ui/icons/DeviceHub";
import Button from "@material-ui/core/Button";
import { TextField } from "@material-ui/core";

import { IOT } from "utils/services/api_services/iot_service";

let DeviceRegister = () => {
  let [form, setForm] = useState({
    ip: null,
    username: null,
    password: null,
  });
  let [message, setMessage] = useState(false);
  let [isLoding, setLoding] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "auto",
        width: "20vw",
        backgroundColor: "#fafafa",
        alignItems: "center",
        justifyContent: "center",
        margin: 20,
        padding: 20,
      }}
    >
      <span style={{ fontSize: 24, fontWeight: "700", marginBottom: 10 }}>
        Register Device
      </span>
      {isLoding && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginTop: 15,
          }}
        >
          <ComputerIcon style={{ color: "#2c3e50" }} />
          <div style={{ width: 25, marginLeft: 10, marginRight: 10 }}>
            <LinearProgress />
          </div>
          <VpnLockIcon style={{ color: "#2980b9" }} />
          <div style={{ width: 25, marginLeft: 10, marginRight: 10 }}>
            <LinearProgress />
          </div>
          <DeviceHubIcon style={{ color: "#8e44ad" }} />
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ marginTop: 10, marginBottom: 10 }}>
          <TextField
            size="small"
            label={"IP"}
            value={form.ip}
            onChange={(event) => {
              setForm({
                ...form,
                ip: event.target.value,
              });
            }}
          />
        </div>
        <div style={{ marginTop: 10, marginBottom: 10 }}>
          <TextField
            size="small"
            label={"Username"}
            value={form.username}
            onChange={(event) => {
              setForm({
                ...form,
                username: event.target.value,
              });
            }}
          />
        </div>
        <div style={{ marginTop: 10, marginBottom: 10 }}>
          <TextField
            size="small"
            label={"Password"}
            value={form.password}
            onChange={(event) => {
              setForm({
                ...form,
                password: event.target.value,
              });
            }}
          />
        </div>
      </div>
      {!message && (
        <div style={{ marginTop: 10, marginBottom: 10 }}>
          <Button
            disabled={isLoding}
            onClick={async () => {
              setLoding(true);
              let response = await IOT.create(
                {
                  appname: "NueGov",
                  modulename: "IOT",
                  entityname: "IOTCamera",
                },
                form
              );
              setLoding(false);
              setMessage(response.message);
            }}
            elevation={0}
            variant="contained"
            color={"primary"}
            label={"Setup"}
          >
            Setup
          </Button>
        </div>
      )}

      {message === "Device Registered" && (
        <div style={{ marginTop: 10, marginBottom: 10 }}>
          <Button
            disabled={isLoding}
            onClick={async () => {
              setLoding(true);
              let response = await IOT.create(
                {
                  appname: "NueGov",
                  modulename: "IOT",
                  entityname: "IOTCamera",
                },
                form
              );
              setLoding(false);
              setMessage(response.message);
            }}
            elevation={0}
            variant="contained"
            color={"secondary"}
            label={"Setup"}
          >
            Retry
          </Button>
        </div>
      )}
      {message && <div>{message}</div>}
    </div>
  );
};

export default DeviceRegister;
