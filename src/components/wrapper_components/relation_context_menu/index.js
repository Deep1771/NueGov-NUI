import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import SplitPane from "react-split-pane";
import { SystemIcons } from "utils/icons";
import {
  DisplayButton,
  DisplayIconButton,
} from "components/display_components";
import {
  ContainerWrapper,
  ToolTipWrapper,
} from "components/wrapper_components";
import { styles } from "./styles";

export const RelationContextMenuWrapper = (props) => {
  const {
    allowResize,
    children,
    onClose,
    options,
    title,
    visible,
    width,
    info,
    testid,
  } = props;
  const { Info } = SystemIcons;
  const [open, setOpen] = useState(false);
  const resizerStyle = {
    width: allowResize ? "3px" : "0px",
    cursor: "ew-resize",
  };
  const size = width ? `calc(100% - ${width})` : `60%`;

  //DOM OPS
  const contextElement = document.getElementById("context-menu");
  const rootElement = document.getElementById("root");

  useEffect(() => {
    if (contextElement) {
      rootElement.style.overflow = visible ? "hidden" : "auto";
      contextElement.style.display = visible ? "flex" : "none";
      setOpen(visible);
    }
  }, [visible]);

  const ContextPanel = () => {
    return visible ? (
      <SplitPane
        allowResize={allowResize}
        split="vertical"
        minSize={"150px"}
        defaultSize={size}
        resizerStyle={resizerStyle}
      >
        <div />
        <ContainerWrapper id="context-c" testid={testid}>
          {!options.hideTitlebar && (
            <div style={styles.titlebar}>
              <div style={styles.title}>
                {title}
                {info && (
                  <>
                    &nbsp;
                    <DisplayIconButton
                      systemVariant="info"
                      size="small"
                      onClick={() => {}}
                    >
                      <ToolTipWrapper
                        systemVariant="info"
                        placement="bottom-start"
                        title={info}
                      >
                        <Info fontSize="small" />
                      </ToolTipWrapper>
                    </DisplayIconButton>
                  </>
                )}
              </div>
              <div style={styles.action_btns}>
                <DisplayButton testid={`close`} onClick={onClose}>
                  CLOSE
                </DisplayButton>
              </div>
            </div>
          )}
          <div style={styles.content} testid={`contents`}>
            {children}
          </div>
        </ContainerWrapper>
      </SplitPane>
    ) : null;
  };

  const render = () =>
    contextElement &&
    ReactDOM.createPortal(open ? <ContextPanel /> : <></>, contextElement);

  return render();
};

RelationContextMenuWrapper.defaultProps = {
  allowResize: true,
  options: {
    hideTitlebar: false,
  },
};
