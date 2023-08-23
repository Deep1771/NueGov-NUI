import React, { useState, useEffect } from "react";
import { Menu, MenuItem } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import Divider from "@material-ui/core/Divider";
import { makeStyles } from "@material-ui/core/styles";
import { useStateValue } from "utils/store/contexts";
import { get, isDefined } from "utils/services/helper_services/object_methods";
import {
  textExtractor,
  mergeApprovalSection,
} from "utils/services/helper_services/system_methods";
import { UserFactory } from "utils/services/factory_services";
import { QuickFlow } from "../../detail_container/components/quick_flow";
import {
  DisplayButton,
  DisplayButtonGroup,
  DisplayCard,
  DisplayDialog,
  DisplayIconButton,
  DisplayText,
} from "components/display_components/";
import { switchUser } from "../../../user_containers/profile_page/loginas/switchUser";
import { SystemIcons } from "utils/icons";
import { HotButton } from "components/helper_components/";

const useStyles = makeStyles({
  card: {
    minHeight: "180px",
    display: "flex",
    flexDirection: "column",
    borderRadius: "0",
  },
  c_header: {
    flex: 1,
    padding: "10px 0 0 10px",
  },
  row_container: {
    display: "flex",
    padding: " 5px 0 0 0px",
  },
  c_body: {
    display: "flex",
    flex: 6,
  },
  c_values: {
    display: "flex",
    flexDirection: "column",
    flex: 7,
    width: "100%",
    padding: "15px",
  },
  c_footer: {
    display: "flex",
    justifyContent: "flex-end",
  },
  fieldName: {
    flex: 4,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  fieldValue: {
    flex: 6,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    contain: "strict",
  },
});
export const RelationCard = (props) => {
  let {
    entityDoc,
    entityTemplate,
    handleEdit,
    handleView,
    quickEntities,
    isLogin,
    isWrite,
    mode,
    childApp,
    childEntity,
    childModule,
    parentMeta,
    sys_hotButton,
    parentEntity,
  } = props;
  entityTemplate = mergeApprovalSection(entityTemplate, entityTemplate);
  const { app_cardContent, sys_topLevel, sys_hotButtons } = get(
    entityTemplate,
    "sys_entityAttributes"
  );
  const description =
    app_cardContent && Object.keys(app_cardContent).length
      ? [...app_cardContent.descriptionField]
      : [];
  const isTitle =
    app_cardContent &&
    app_cardContent.titleField &&
    app_cardContent.titleField.length
      ? true
      : false;

  const history = useHistory();
  const classes = useStyles(props);
  const { checkDataAccess } = UserFactory();
  const [{ userState }] = useStateValue();
  const { Launch } = SystemIcons;

  const [alert, setAlert] = useState(false);
  const [isQuickFlow, setQuickFlow] = useState(false);
  const [quickOptions, setOptions] = useState([]);
  const [menu, setMenu] = useState(false);
  const [relations, setRelations] = useState({});
  const { userData } = userState;

  const writeAccess = checkDataAccess({
    appname: childApp,
    modulename: childModule,
    entityname: childEntity,
    permissionType: "write",
    data: entityDoc,
    metadata: entityTemplate,
  });

  if (app_cardContent && Object.keys(app_cardContent).length) {
    if (app_cardContent.descriptionField.length > 4)
      description.splice(4, app_cardContent.descriptionField.length - 1);
    if (isTitle) description.splice(0, 0, app_cardContent.titleField[0]);
  }

  const getData = (item) => {
    let fieldTemplate =
      entityTemplate?.sys_entityAttributes?.sys_topLevel?.find(
        (ef) => ef.name === item.name
      ) || {};
    let data = entityDoc ? entityDoc.sys_entityAttributes[item.name] : "";
    let txt = textExtractor(data, fieldTemplate);
    return isDefined(txt) ? txt.toString() : "";
  };
  const handleMenuClick = (index) => {
    setMenu(false);
    let { appName, entity, module, path } = quickEntities[index];
    setRelations({
      appName,
      entity,
      module,
      path,
    });
    setQuickFlow(true);
  };

  const handleLoading = (value, fetchData) => {
    props.handleLoadingSkeleton &&
      props.handleLoadingSkeleton(value, fetchData);
  };

  const getMenu = (quickEntities) => {
    return (
      <Menu
        id="quick-menu"
        keepMounted
        anchorEl={menu}
        open={Boolean(menu)}
        onClose={(e) => setMenu(null)}
      >
        {quickEntities.map((item, index) => {
          return (
            <MenuItem onClick={(e) => handleMenuClick(index)}>
              {item.cardButton.title}
            </MenuItem>
          );
        })}
      </Menu>
    );
  };
  const getTitle = (item) => {
    let definition = sys_topLevel
      ? sys_topLevel.find((e) => e.name === item.name)
      : "";
    return definition ? definition.title : "";
  };

  const renderAlert = () => {
    return (
      <DisplayDialog
        testid={`loginas`}
        open={alert}
        title={`Login as - ${get(
          entityDoc,
          "sys_entityAttributes.username"
        )} ?`}
        message={"You can switch back later using exit icon in navigation bar"}
        onCancel={() => setAlert(false)}
        onConfirm={() => switchUser(history, entityDoc, userData)}
      />
    );
  };

  const renderCardBody = () => {
    return (
      <div className={classes.c_body}>
        <div className={classes.c_values}>
          {description.length > 0 &&
            description.map((item, index) => {
              return (
                <div className={classes.row_container} key={index}>
                  <DisplayText variant="h1" className={classes.fieldName}>
                    {getTitle(item)}
                  </DisplayText>
                  <DisplayText variant="h2" className={classes.fieldValue}>
                    {getData(item)}
                  </DisplayText>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  const renderQuickButton = () => {
    return (
      <div style={{ display: "flex", flex: 1, marginLeft: "10px" }}>
        <DisplayButton
          size="small"
          endIcon={<SystemIcons.ArrowDropDown />}
          onClick={(e) => setMenu(e.currentTarget)}
        >
          Create
        </DisplayButton>
        {getMenu(quickEntities)}
      </div>
    );
  };

  const renderFooter = () => {
    return (
      <div className={classes.c_footer}>
        {sys_hotButtons && sys_hotButton != false && (
          <div
            style={{
              display: "flex",
              flex: 1,
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <HotButton
              entityDoc={entityDoc}
              entityTemplate={entityTemplate}
              handleLoading={handleLoading}
              parentMeta={parentMeta}
              displayTitle={false}
              appname={childApp}
              modulename={childModule}
              entityname={childEntity}
              buttonStyle={{ minWidth: "120px", maxWidth: "120px" }}
            />
          </div>
        )}
        {quickEntities && quickEntities.length > 0 && renderQuickButton()}
        {isLogin && (
          <DisplayIconButton
            testid={`relation-loginas`}
            id={`loginas-${entityDoc._id}`}
            systemVariant="primary"
            size="medium"
            onClick={() => setAlert(true)}
          >
            <Launch />
          </DisplayIconButton>
        )}
        {mode === "edit" && isWrite && writeAccess && (
          <DisplayButton
            testid={`relation-edit`}
            id={`edit-${entityDoc._id}`}
            color="primary"
            onClick={(e) => handleEdit(entityDoc)}
          >
            EDIT
          </DisplayButton>
        )}
        <DisplayButton
          testid={`relation-view`}
          id={`view-${entityDoc._id}`}
          color="primary"
          size="small"
          onClick={(e) => handleView(entityDoc)}
        >
          VIEW
        </DisplayButton>
      </div>
    );
  };

  const renderQuickFlow = () => {
    if (isQuickFlow) {
      return (
        <QuickFlow
          appname={relations.appName}
          module={relations.module}
          entity={relations.entity}
          path={relations.path}
          quickFlow={{
            id: entityDoc._id,
            sys_gUid: entityDoc.sys_gUid,
          }}
          formData={entityDoc}
          mode={"NEW"}
          closeRenderQuickFlow={() => setQuickFlow(false)}
        />
      );
    }
  };
  return (
    <DisplayCard
      testid={`${parentEntity}-${entityDoc.sys_templateName}-${entityDoc._id}`}
      className={classes.card}
    >
      {renderAlert()}
      {renderCardBody()}
      <div>
        <Divider />
      </div>
      {renderFooter()}
      {renderQuickFlow()}
    </DisplayCard>
  );
};
