import React from "react";
import { DisplayText } from "components/display_components";

const Issues = (props) => {
  return (
    <div style={{ margin: 5 }}>
      <DisplayText variant="h2" style={{ fontSize: 18 }}>
        Found Configuration issues.
      </DisplayText>
    </div>
  );
};

export default Issues;
