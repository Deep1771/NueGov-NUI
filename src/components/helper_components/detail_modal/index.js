import React, { useEffect, useState, useMemo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { entityTemplate } from "utils/services/api_services/template_service";
import { CardContainer } from "./components";
import { DetailContainer } from "containers/composite_containers/detail_container";
import {
  ThemeFactory,
  UserFactory,
  GlobalFactory,
} from "utils/services/factory_services";
import {
  DisplayButton,
  DisplayText,
  DisplayIconButton,
} from "components/display_components";
import { BubbleLoader } from "components/helper_components";
import { ToolTipWrapper } from "components/wrapper_components";
import { SystemIcons } from "utils/icons";
import { useStateValue } from "utils/store/contexts";
import { VideoPlayer } from "../video_player";

const useStyles = makeStyles({
  header: ({ colors, local }) => ({
    backgroundColor: colors.dark.bgColor,
    color: colors.dark.text,
    display: "flex",
    flex: 1,
    opacity: 0.9,
    alignItems: "center",
    padding: "0px 5px 0px 5px",
  }),
  footer: {
    display: "flex",
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  container: {
    display: "flex",
    alignContent: "flex-start",
    padding: "10px",
  },
});
export const DetailModal = (props) => {
  const {
    onClose,
    queryParams,
    filterParams = {},
    systemVariant,
    formdata,
  } = props;
  const { appname, modulename, entityname } = queryParams;
  const { Help } = SystemIcons;

  //Factory constants
  const { getContextualHelperData } = GlobalFactory();
  const { getVariantForComponent } = ThemeFactory();
  const { checkWriteAccess, getAgencyDetails } = UserFactory();
  const { sys_entityAttributes } = getAgencyDetails;
  const { showHelper } = sys_entityAttributes;

  //States
  const [fillcontainer, setContainer] = useState("cardContainer");
  const [fieldmeta, setFieldmeta] = useState();
  const [mode, setMode] = useState("new");
  const [selected, setSelected] = useState(null);
  const [openHelp, setHelp] = useState(false);
  const [{ contextualHelperState }] = useStateValue();

  //Global variables
  const defaultVariant = systemVariant ? systemVariant : "primary";
  const classes = useStyles(
    getVariantForComponent("SUMMARY_HEADER", defaultVariant)
  );
  const helperData = getContextualHelperData("LIFECYCLE_SCREEN");

  //Custom methods
  const fetchMetaData = async (queryParams) => {
    let fieldmeta_res = await entityTemplate.get({
      appname,
      modulename,
      groupname: entityname,
    });
    setFieldmeta(fieldmeta_res);
  };

  //Handler methods
  const closeCallback = (e) => {
    setContainer("cardContainer");
    setMode("new");
    setSelected(null);
  };

  const onEdit = (eachCard, mode) => {
    setMode(mode);
    setSelected(eachCard._id);
    setContainer("detailContainer");
  };

  const onNewClick = () => {
    setMode("new");
    setSelected(null);
    setContainer("detailContainer");
  };

  const saveCallback = (e) => {
    setMode("new");
    setSelected(null);
    setContainer("cardContainer");
  };

  //useEffects
  useEffect(() => {
    fetchMetaData(queryParams);
  }, []);

  //Render methods
  const renderContainer = () => {
    let obj = {};
    if (mode == "new") obj.data = formdata;
    return (
      <div
        className={classes.container}
        style={{
          flex: fillcontainer === "cardContainer" ? 10 : 11,
          height: "100%",
          overflow: "auto",
        }}
        // className="hide_scroll"
      >
        {!fieldmeta ? (
          <BubbleLoader />
        ) : fillcontainer === "cardContainer" ? (
          <CardContainer
            onClose={onClose}
            fieldmeta={fieldmeta}
            queryParams={queryParams}
            filterParams={filterParams}
            onEdit={onEdit}
          />
        ) : (
          <DetailContainer
            appname={appname}
            modulename={modulename}
            groupname={entityname}
            mode={mode}
            id={selected}
            options={{
              hideTitleBar: true,
              hideNavButtons: true,
            }}
            {...obj}
            saveCallback={saveCallback}
            onClose={closeCallback}
          />
        )}
      </div>
    );
  };

  const renderHeader = () => {
    return (
      <div className={classes.header}>
        <div
          style={{
            display: "flex",
            flex: 1,
            justifyContent: "flex-start",
            padding: "0px 0px 0px 8px",
          }}
        >
          <DisplayText variant="h6" style={{ fontFamily: "inherit" }}>
            {fieldmeta?.sys_entityAttributes?.sys_friendlyName ||
              queryParams.entityname}
          </DisplayText>
          {helperData && showHelper && (
            <DisplayIconButton onClick={() => setHelp(true)}>
              <ToolTipWrapper title="Help" placement="bottom-start">
                <Help style={{ color: "white", fontSize: "20px" }} />
              </ToolTipWrapper>
            </DisplayIconButton>
          )}
        </div>
        <div style={{ display: "flex", flex: 1, justifyContent: "flex-end" }}>
          {checkWriteAccess({ appname, modulename, entityname }) && (
            <DisplayButton
              style={{ color: "#ffffff" }}
              size="small"
              disabled={fillcontainer === "detailContainer" && !selected}
              onClick={onNewClick}
            >
              {" "}
              Create New{" "}
            </DisplayButton>
          )}
        </div>
      </div>
    );
  };

  const renderFooter = () => {
    return (
      <div className={classes.footer}>
        <DisplayButton onClick={onClose} testid="component-close">
          {" "}
          CLOSE{" "}
        </DisplayButton>
      </div>
    );
  };

  let handleModalClose = () => {
    setHelp(false);
  };

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        height: "85vh",
        flexDirection: "column",
      }}
      className="hide_scroll"
    >
      {renderHeader()}
      {renderContainer()}
      {fillcontainer === "cardContainer" && renderFooter()}
      {openHelp && (
        <VideoPlayer
          handleModalClose={handleModalClose}
          helperData={helperData}
        />
      )}
    </div>
  );
};

export default DetailModal;
