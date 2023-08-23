import React, { useState, useEffect } from "react";
//MaterialUi Component
import Slide from "@material-ui/core/Slide";
//Services
import { useParams } from "react-router";
import { runTimeService } from "utils/services/api_services/entity_service";
import { UserFactory } from "utils/services/factory_services";
//Custom Components
import {
  DisplayModal,
  DisplayIconButton,
  DisplayButton,
  DisplayGrid,
  DisplaySnackbar,
} from "components/display_components";
import { Iterator } from "containers/composite_containers/detail_container/components/iterator";
import { ToolTipWrapper } from "components/wrapper_components/tool_tip";
import { ContainerWrapper } from "components/wrapper_components/container";
//Icons
import { SystemIcons } from "utils/icons";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const BulkActions = (props) => {
  let {
    gridButton,
    open,
    onClose,
    entityTemplate,
    selectedItems,
    deSelect,
    refresh,
  } = props;
  let { sys_entityAttributes } = entityTemplate;
  let {
    modalMetadata,
    targetChildCollection,
    targetChildEntity,
    targetChildRefName,
    buttonName,
    dynamicModuleFile,
    dynamicModuleFunction,
    dynamicModuleName,
    notificationType,
    operationType,
    requestPattern,
  } = gridButton;
  let { modalTitle, sys_entityAttributesToDisplay } = modalMetadata;
  let selectedEntityMetadata = entityTemplate;
  //Factory Services
  let { appname, modulename, entityname } = useParams();
  let { getDetails } = UserFactory();
  //Icons
  let { Close, Info } = SystemIcons;
  //Local State
  const [fields, setFields] = useState();
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState({});
  const [message, setMessage] = useState("");
  const [userInfo, setUserInfo] = useState();

  //Custom Functions
  let init = () => {
    let newEntityData = sys_entityAttributes;
    newEntityData.sys_entityAttributes = {};
    newEntityData.sys_components = [];
    let metadataCopy = { ...selectedEntityMetadata.sys_entityAttributes };

    metadataCopy.sys_topLevel = [];
    sys_entityAttributesToDisplay.map((fieldObject) => {
      try {
        let index = selectedEntityMetadata.sys_entityAttributes.sys_topLevel
          .map((object) => {
            return object.name;
          })
          .indexOf(fieldObject.name);
        metadataCopy.sys_topLevel.push(
          selectedEntityMetadata.sys_entityAttributes.sys_topLevel[index]
        );
      } catch (e) {
        console.log(e);
      }
    });
    setFields(metadataCopy.sys_topLevel);
  };

  const setData = (fieldData, fieldProps) => {
    let { fieldmeta } = fieldProps;
    let { name } = fieldmeta;
    setFormData({ ...formData, [name]: fieldData });
  };

  const setError = (fieldError, fieldProps) => {
    let { fieldmeta } = fieldProps;
    let { name } = fieldmeta;
    setFormError({ ...formError, [name]: fieldError });
  };

  const clearMessage = () => setMessage(null);

  const handleClose = () => {
    onClose();
  };

  const handleMultipleActions = () => {
    let payload = {};
    payload["target_entity"] = targetChildEntity;
    payload["target_collection"] = targetChildCollection;
    payload["child_reference"] = targetChildRefName;
    payload["notificationType"] = notificationType;
    payload["operationType"] = operationType;
    payload["modalData"] = {};
    payload["modalData"]["sys_entityAttributes"] = formData;
    payload["agencyId"] = userInfo.sys_agencyId;
    payload["selectedIds"] = selectedItems.map((item) => item.sys_gUid);

    runTimeService
      .create(
        {
          appname: appname ? appname : "NueGov",
          modulename: modulename ? modulename : "Admin",
          entityname: entityname,
        },
        {
          dynamicModuleName: dynamicModuleName,
          dynamicModuleFile: dynamicModuleFile,
          dynamicModuleFunction: dynamicModuleFunction,
          requestPattern: requestPattern,
          request: payload,
        }
      )
      .then((result) => {
        setMessage("Successful. Documents Updated.");
        setTimeout(() => {
          onClose();
          deSelect([]);
          refresh();
        }, 3000);
      })
      .catch((error) => {
        setMessage("Something Went Wrong.");
      });
  };

  //Effect
  useEffect(() => {
    init();
    if (getDetails) {
      setUserInfo(getDetails);
    }
  }, []);

  return (
    <ContainerWrapper>
      <DisplayModal
        open={open}
        maxWidth={"md"}
        TransitionComponent={Transition}
        title={
          <div>
            {`${modalTitle}`}&nbsp;&nbsp;
            <ToolTipWrapper>
              <Info fontSize="small" />
            </ToolTipWrapper>
            <DisplayIconButton
              color="inherit"
              style={{ float: "right", color: "black" }}
              onClick={handleClose}
            >
              <Close />
            </DisplayIconButton>
          </div>
        }
      >
        <div style={{ padding: "0px 15px 10px 15px" }}>
          <DisplayGrid container style={{ diplay: "flex" }}>
            <DisplayGrid item>
              {fields &&
                fields.length &&
                fields.map((item, index) => {
                  return (
                    <Iterator
                      callbackError={setError}
                      callbackValue={setData}
                      data={null}
                      fieldError={null}
                      fieldmeta={item}
                      key={index}
                      stateParams={"EDIT"}
                    />
                  );
                })}
            </DisplayGrid>
          </DisplayGrid>
          <div style={{ textAlign: "right", padding: "10px" }}>
            <DisplayButton onClick={onClose}>Cancel</DisplayButton>&nbsp;
            <DisplayButton onClick={handleMultipleActions} disabled={!formData}>
              {buttonName}
            </DisplayButton>
          </div>
        </div>
      </DisplayModal>
      <DisplaySnackbar
        open={!!message}
        message={message}
        onClose={clearMessage}
      />
    </ContainerWrapper>
  );
};
