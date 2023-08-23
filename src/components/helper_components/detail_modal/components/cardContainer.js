import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { dot } from "dot-object";
import {
  deleteEntity,
  entity,
} from "utils/services/api_services/entity_service";
import { UserFactory } from "utils/services/factory_services";
import { get, isDefined } from "utils/services/helper_services/object_methods";
import { textExtractor } from "utils/services/helper_services/system_methods";
import {
  DisplayCard,
  DisplayDialog,
  DisplayIconButton,
  DisplayText,
} from "components/display_components";
import { BubbleLoader, Banner } from "components/helper_components/";
import { SystemIcons } from "utils/icons";

const useStyles = makeStyles({
  card: {
    display: "flex",
    flexDirection: "column",
    pointer: "cursor",
    flex: 1,
  },
  cardBody: {
    display: "flex",
    flex: 11,
    margin: "8px",
    flexDirection: "column",
    alignContent: "flex-start",
    overflowY: "auto",
    contain: "strict",
  },
  cardFooter: {
    display: "flex",
    flex: 1,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  container: {
    display: "flex",
    flex: 1,
    flexWrap: "wrap",
    alignContent: "flex-start",
    overflowY: "auto",
    contain: "strict",
    width: "100%",
    height: "100%",
  },
  containerFooter: {
    display: "flex",
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
});

export const CardContainer = ({
  onEdit,
  fieldmeta,
  filterParams,
  queryParams,
}) => {
  const { app_cardContent, sys_topLevel } = get(
    fieldmeta,
    "sys_entityAttributes"
  );

  //States
  const [data, setData] = useState([]);
  const [dialog, setDialog] = useState({ dialog: false });
  const [loading, setLoading] = useState(true);

  const classes = useStyles();
  const { checkDeleteAccess, checkWriteAccess } = UserFactory();

  //Icons
  const { Edit, Delete, Visibility, Copy } = SystemIcons;

  const hasWriteAccess = checkWriteAccess(queryParams);
  const hasDeleteAccess = checkDeleteAccess(queryParams);

  //Global variables
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

  if (app_cardContent && Object.keys(app_cardContent).length) {
    if (isTitle) description.splice(0, 0, app_cardContent.titleField[0]);
  }

  //Getters
  const getTitle = (item) => {
    let definition = sys_topLevel
      ? sys_topLevel.find((e) => e.name === item.name)
      : "";
    let appTitle = get(item, "title");
    let metadataTitle = get(definition, "title");
    return appTitle ? appTitle : metadataTitle;
  };

  const getValue = (item, eachDoc) => {
    if (!item.path) {
      let definition = sys_topLevel.find((e) => e.name === item.name);
      let isDataExist = get(eachDoc, `sys_entityAttributes.${item.name}`);
      let value = isDataExist || "";
      let txt = textExtractor(value, { ...item, ...definition });
      if (isDataExist && isDefined(txt)) return txt.toString();
      else return "";
    } else {
      return get(eachDoc, `sys_entityAttributes.${item.path}`, "").toString();
    }
  };

  //Custom methods
  const fetchData = async () => {
    let filterParameters = dot(filterParams);
    let queryObj = { ...queryParams, ...filterParameters, skip: 0, limit: 100 };
    let data_res = await entity.get(queryObj);
    setData(data_res);
    setLoading(false);
  };

  const deleteCard = async (event, eachCard) => {
    setDialog({ dialog: false });
    await deleteEntity
      .remove({
        ...queryParams,
        id: eachCard._id,
        templateName: fieldmeta.sys_entityAttributes.sys_templateName,
      })
      .then(fetchData());
  };

  const openSaveDialog = (event, eachCard) => {
    let saveModal = {
      dialog: true,
      title: "Sure to delete ?",
      msg: "This data will be deleted, it cannot be undone",
      confirmLabel: "YES",
      onConfirm: () => deleteCard(event, eachCard),
    };
    setDialog(saveModal);
  };

  //useEffects
  useEffect(() => {
    fetchData();
  }, []);

  //Render functions
  const renderCard = (eachDoc) => {
    return (
      <div
        style={{
          height: "200px",
          width: "295px",
          margin: "10px",
          display: "flex",
        }}
      >
        <DisplayCard
          className={classes.card}
          raised={true}
          systemVariant={"default"}
        >
          {renderCardBody(eachDoc)}
          {renderCardFooter(eachDoc)}
        </DisplayCard>
      </div>
    );
  };

  const renderCardBody = (eachDoc) => {
    return (
      <div className={classes.cardBody}>
        {description &&
          description.length > 0 &&
          description.map((item, index) => {
            return renderSection(item, eachDoc);
          })}
      </div>
    );
  };

  const renderCardFooter = (eachCard) => {
    return (
      <div className={classes.cardFooter}>
        {hasWriteAccess && (
          <DisplayIconButton
            systemVariant="primary"
            onClick={(e) => onEdit(eachCard, "clone")}
          >
            <Copy fontSize="small" />
          </DisplayIconButton>
        )}
        <DisplayIconButton
          systemVariant="primary"
          onClick={(e) => onEdit(eachCard, hasWriteAccess ? "edit" : "read")}
        >
          {hasWriteAccess ? (
            <Edit fontSize="small" />
          ) : (
            <Visibility fontSize="small" />
          )}
        </DisplayIconButton>
        {hasDeleteAccess && (
          <DisplayIconButton
            systemVariant="primary"
            onClick={(e) => openSaveDialog(e, eachCard)}
          >
            <Delete fontSize="small" />
          </DisplayIconButton>
        )}
      </div>
    );
  };

  const renderSection = (item, eachDoc) => {
    let title = getTitle(item),
      value = getValue(item, eachDoc);
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          margin: "0px 0px 5px 0px",
        }}
      >
        <DisplayText> {title} </DisplayText>
        {title && <DisplayText variant="h1">{value}</DisplayText>}
      </div>
    );
  };

  return (
    <div className={classes.container}>
      {loading ? (
        <BubbleLoader />
      ) : data.length ? (
        data.map((eachData) => renderCard(eachData))
      ) : (
        <Banner
          src="https://assetgov-icons.s3-us-west-2.amazonaws.com/Reactimages/nodatafound.png"
          iconSize="150px"
        />
      )}
      {
        <DisplayDialog
          open={dialog.dialog}
          title={dialog.title}
          message={dialog.msg}
          confirmLabel={dialog.confirmLabel}
          onConfirm={dialog.onConfirm}
          onCancel={() => {
            setDialog({ dialog: false });
          }}
          style={{ zIndex: 10010 }}
        />
      }
    </div>
  );
};

export default CardContainer;
