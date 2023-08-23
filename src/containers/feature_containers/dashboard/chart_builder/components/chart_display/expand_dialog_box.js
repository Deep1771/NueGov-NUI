import React from "react";
import ChartIterator from "../../../chart_components/iterator";
import { DisplayModal, DisplayButton } from "components/display_components";
import { PaperWrapper } from "components/wrapper_components";

const ExpandDialogBox = (props) => {
  const { options, openDialog } = props;

  return (
    <DisplayModal fullWidth={true} maxWidth={"lg"} open={openDialog}>
      <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
        <div style={{ display: "flex", flex: 1, flexDirection: "row-reverse" }}>
          <DisplayButton
            systemVariant="secondary"
            style={{ margin: "10px 16px 5px 16px" }}
            onClick={options.onReject}
          >
            Close
          </DisplayButton>
        </div>
        <br></br>
        <div style={{ display: "flex", flex: 11 }}>
          <PaperWrapper
            elevation={2}
            style={{
              alignSelf: "center",
              height: "75vh",
              width: "100%",
              margin: "10px 20px 20px 20px",
            }}
          >
            <ChartIterator
              template={
                options.template ? options.template.sys_entityAttributes : {}
              }
            />
          </PaperWrapper>
        </div>
      </div>
    </DisplayModal>
  );
};
export default ExpandDialogBox;
