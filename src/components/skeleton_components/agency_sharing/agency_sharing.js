import React from "react";
import Skeleton from "@material-ui/lab/Skeleton";
import {
  DisplayButton,
  DisplayCheckbox,
  DisplaySwitch,
  DisplayText,
} from "./../../display_components";

export const AgencySharingSkeleton = () => {
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        margin: "0 1.7% 1.7% 1.7%",
      }}
    >
      <div style={{ display: "flex", flex: 1.7, flexDirection: "column" }}>
        <div style={{ display: "flex", flex: 3.5, flexDirection: "column" }}>
          <Skeleton style={{ width: "25%", display: "flex", flex: 1 }} />

          <div style={{ display: "flex", flex: 0.5, alignItems: "center" }}>
            <DisplayText>Transitive</DisplayText>
            <DisplaySwitch />
          </div>
        </div>
        <div style={{ display: "flex", flex: 2 }}>
          <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
            <DisplayText>ALL</DisplayText>
          </div>
          <div style={{ flex: 2 }} />
          <div style={{ display: "flex", flex: 11 }}>
            <DisplayText style={{ marginRight: "8%" }}>R</DisplayText>
            <DisplayText>W</DisplayText>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flex: 6, flexDirection: "column" }}>
        <div style={{ display: "flex", flex: 1 }}>
          <Skeleton style={{ width: "40%" }} />
        </div>
        <div style={{ display: "flex", flex: 2 }}>
          {[1, 2].map((e) => (
            <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
              <Skeleton style={{ width: "90%", flex: 1 }} />
              <Skeleton style={{ width: "90%", flex: 1 }} />
            </div>
          ))}
        </div>{" "}
        <br />
        <div style={{ display: "flex", flex: 1 }}>
          <Skeleton style={{ width: "40%" }} />
        </div>
        <div style={{ display: "flex", flex: 4 }}>
          {[1, 2].map((e) => (
            <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
              {[1, 2, 3, 4].map((e) => (
                <Skeleton style={{ width: "90%", flex: 1 }} />
              ))}
            </div>
          ))}
        </div>{" "}
        <br />
        <div style={{ display: "flex", flex: 1 }}>
          <Skeleton style={{ width: "40%" }} />
        </div>
        <div style={{ display: "flex", flex: 2 }}>
          {[1, 2].map((e) => (
            <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
              <Skeleton style={{ width: "90%", flex: 1 }} />
              <Skeleton style={{ width: "90%", flex: 1 }} />
            </div>
          ))}
        </div>{" "}
        <br />
      </div>

      <div style={{ display: "flex", flex: 0.5, flexDirection: "row-reverse" }}>
        <DisplayButton style={{ marginRight: "2%" }}> SAVE </DisplayButton>
        <DisplayButton style={{ marginRight: "2%" }}> CLOSE </DisplayButton>
      </div>
    </div>
  );
};
