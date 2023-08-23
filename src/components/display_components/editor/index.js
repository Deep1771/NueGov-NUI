import React from "react";
import AceEditor from "react-ace";
import { DisplayHelperText } from "../helper_text/";
import { SystemIcons } from "utils/icons";
import "brace/ext/searchbox";
import "brace/mode/html";
import "brace/mode/json";
import "brace/mode/javascript";
import "brace/mode/markdown";
import "brace/mode/text";
import "brace/theme/textmate";

export const DisplayEditor = React.forwardRef((props, ref) => {
  let { disable, errors, showError, value, ...rest } = props;

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
    >
      <AceEditor
        {...rest}
        readOnly={disable}
        value={value}
        style={{ backgroundColor: "inherit" }}
        ref={ref}
      />
      <div className="system-helpertext">
        {" "}
        {errors.length && showError
          ? errors.map((message, i) => (
              <DisplayHelperText key={i} icon={SystemIcons.Error}>
                {message.text}
              </DisplayHelperText>
            ))
          : ""}
      </div>
    </div>
  );
});

DisplayEditor.defaultProps = {
  errors: [],
  fontSize: 14,
  height: "100%",
  minLines: 7,
  showError: true,
  showPrintMargin: false,
  theme: "textmate",
  width: "100%",
  wrapEnabled: true,
};
