import React, { useState, useEffect } from "react";

import { selfService } from "utils/services/api_services/custom_field_service";
import {
  DisplaySelect,
  DisplayText,
  DisplayModal,
  DisplayButton,
  DisplayInput,
  DisplayIconButton,
  DisplayCheckbox,
  DisplayDialog,
} from "../../display_components";
import {
  UserFactory,
  GlobalFactory,
  ThemeFactory,
} from "utils/services/factory_services";
import { VideoPlayer } from "../video_player";
import { SystemIcons } from "utils/icons";
import { isDefined } from "utils/services/helper_services/object_methods";
import { useCustomFieldStyles } from "./styles";
import { ToolTipWrapper } from "components/wrapper_components";
import { globalProps } from "components/system_components/global-props";
import { useStateValue } from "utils/store/contexts";

const AttachCustomField = (props) => {
  let {
    customFieldFlag = false,
    onClose,
    metadata = {},
    agencyInfo = {},
    entityInfo = {},
    // setUpdatedMetadata
  } = props || {};

  const [{ importState }, dispatch] = useStateValue();

  const { getContextualHelperData, setSnackBar } = GlobalFactory();

  const { isNJAdmin } = UserFactory();

  const { CloseOutlined, Help } = SystemIcons;

  const classes = useCustomFieldStyles();
  const { getVariantObj } = ThemeFactory();
  const { dark } = getVariantObj("primary");
  const { showHelper = false } = agencyInfo?.sys_entityAttributes || {};

  const helperData = getContextualHelperData("CUSTOMFIELD_SCREEN");

  const [openHelp, setHelp] = useState(false);
  const [payload, setPayload] = useState({});
  const [keyExistError, setKeyExistError] = useState(false);
  const [flag, setFlag] = useState(false);
  const [dialog, setDialog] = useState({ dialog: false });

  let { sys_topLevel = [], sys_filterFields = [] } =
    metadata?.sys_entityAttributes || {};

  const modalBodySelectFields = [
    {
      title: "Select Section",
      placeHolder: "Section Section",
      description: "Select the Section from dropdown to add a field",
      labelKey: "title",
      valueKey: "name",
      testId: "customfield-select-section",
      valuesFieldName: "sections",
      type: "section",
    },
    {
      title: "Select Field Type",
      placeHolder: "Select Field type from dropdown",
      description: "",
      labelKey: "title",
      valueKey: "name",
      testId: "customfield-select-fieldType",
      valuesFieldName: "fieldTypes",
      type: "fieldType",
      enableOn: "section",
    },
  ];

  const checkForVideoLinks = () => {
    let videoLinks = helperData?.videoLinks.filter((e) =>
      isDefined(e.link)
    ).length;
    return videoLinks > 0;
  };

  const getSections = () => {
    let sections = [];
    sections = sys_topLevel
      ?.filter((eachField) => {
        let { type = "", marker = "start" } = eachField || {};
        if (type === "SECTION" && marker === "start") return true;
        else return false;
      })
      ?.map((each) => {
        return {
          name: each.name,
          title: each.title,
        };
      });

    return sections;
  };

  const getFieldTypes = () => {
    return [
      {
        name: "TEXTAREA",
        title: "Text Area",
      },
      {
        name: "TEXTBOX",
        title: "Text Box",
      },
      {
        name: "DATE",
        title: "Date - (MM/dd/yyyy)",
      },
    ];
  };

  const getFieldValues = (type) => {
    switch (type) {
      case "sections":
        return getSections();
      case "fieldTypes":
        return getFieldTypes();
      default:
        return [];
    }
  };

  const constructPayload = (value, type, action) => {
    let payloadObj = payload || {};
    if (type === "labelKey") {
      let valueInString = constructCamelCase(value);
      let keyExist = sys_topLevel?.find(
        (eachField) => eachField?.name === valueInString
      );
      if (keyExist) setKeyExistError(true);
      else setKeyExistError(false);
    }

    if (action === "clear") {
      payloadObj = {
        ...payloadObj,
        dummyKey: true,
      };
      delete payloadObj?.[type];

      setPayload(payloadObj);
    } else {
      payloadObj = {
        ...payloadObj,
        [type]: value,
      };
      setPayload(payloadObj);
    }
  };

  const constructFilterField = (props) => {
    let { type, name } = props || {};
    let filterFieldObj = {
      name: name,
      strict_match: false,
      path: `sys_entityAttributes.${name}`,
    };
    switch (type) {
      case "TEXTBOX":
      case "TEXTAREA":
        {
          filterFieldObj = {
            ...filterFieldObj,
            type: "TEXTSEARCH",
          };
        }
        break;
      case "DATE":
        {
          filterFieldObj = {
            ...filterFieldObj,
            type: "DATE",
          };
        }
        break;
    }
    return filterFieldObj;
  };

  const checkForDisablity = () => {
    if (keyExistError) return true;
    else {
      if (payload.hasOwnProperty("labelKey")) return false;
      else return true;
    }
  };

  const constructCamelCase = (str) => {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index == 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, "");
  };

  const handleFieldCreation = async () => {
    setSnackBar({
      open: true,
      message: "Processing... please wait",
    });
    let newFieldInfo = {
      name: constructCamelCase(payload?.labelKey),
      title: payload?.labelKey,
      type: payload?.fieldType,
      required: payload?.required || false,
      visible: true,
      displayOnCsv: true,
      canUpdate: true,
      audit: true,
      customField: true,
    };

    if (payload?.fieldType === "DATE") {
      newFieldInfo = {
        ...newFieldInfo,
        format: "MM/dd/yyyy",
      };
    }

    let topLevelFields = sys_topLevel || [];
    let filterFields = sys_filterFields || [];
    let originalLength = topLevelFields?.length || 0;
    let placementIndex = 0;
    let newFilterField = constructFilterField({
      type: payload?.fieldType,
      name: newFieldInfo?.name,
    });

    topLevelFields = sys_topLevel?.map((eachField, index) => {
      let { type = "", marker = "start", name = "" } = eachField || {};
      if (type === "SECTION" && marker === "end" && name === payload?.section) {
        placementIndex = index;
      }
      return eachField;
    });

    filterFields.push(newFilterField);

    if (placementIndex > 0)
      topLevelFields.splice(placementIndex, 0, newFieldInfo);

    if (originalLength < topLevelFields?.length) {
      let updatedMetadata = {
        ...metadata,
        sys_entityAttributes: {
          ...metadata.sys_entityAttributes,
          sys_topLevel: topLevelFields,
          sys_filterFields: filterFields,
        },
      };

      let result = await selfService
        .update(
          { id: metadata?._id },
          {
            metadata: updatedMetadata,
            entityInfo: entityInfo,
            agencyInfo: {
              id: agencyInfo?._id,
              sys_gUid: agencyInfo?.sys_gUid,
            },
            fieldInfo: {
              sectionName: payload?.section,
              fieldName: newFieldInfo?.name,
              fieldTitle: newFieldInfo?.title,
            },
          }
        )
        .then((res) => {
          if (res?.success) {
            setSnackBar({
              open: true,
              message: "Sucessfully added custom field",
              severity: "success",
            });
            dispatch({
              type: "SET_TEMPLATE_OBJECT",
              payload: updatedMetadata,
            });
            // setUpdatedMetadata(updatedMetadata)
          } else {
            setSnackBar({
              open: true,
              message: "Failed to add custom field",
              severity: "error",
            });
          }
          onClose();
        })
        .catch((e) => {
          let { data = {} } = e || {};
          if (!data?.success) {
            setSnackBar({
              open: true,
              message: "Failed to add custom field",
              severity: "error",
            });
          }
          onClose();
        });
    }
  };

  const openDialog = () => {
    let continueModal = {
      dialog: true,
      title: "Sure want to create a field ?",
      msg: "Your changes will be saved",
      confirmLabel: "Continue",
      onConfirm: handleFieldCreation,
    };
    setDialog(continueModal);
  };

  const renderCustomFieldBody = () => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: "1",
        }}
      >
        {modalBodySelectFields?.map((each) => {
          let values = getFieldValues(each?.valuesFieldName);
          return (
            <div style={{ padding: "10px 5px" }}>
              <DisplayText>{each?.title}</DisplayText>
              <DisplaySelect
                hiddenLabel
                labelKey={each?.labelKey}
                valueKey={each?.valueKey}
                testId={each?.testId}
                variant={"filled"}
                values={values}
                onChange={(value) => {
                  constructPayload(value, each?.type);
                }}
                showNone={false}
                disabled={
                  each?.enableOn
                    ? !payload.hasOwnProperty(each?.enableOn)
                    : false
                }
                InputProps={{
                  ...globalProps.InputProps,
                  style: {
                    ...globalProps.InputProps.style,
                    padding: "0px 10px",
                  },
                }}
                {...globalProps}
              />
              <DisplayText className={classes.description} variant="caption">
                {each?.description}
              </DisplayText>
            </div>
          );
        })}
        <div style={{ padding: "10px 5px" }}>
          <DisplayText>Enter Label</DisplayText>
          <DisplayInput
            testId={"customfield-input"}
            value={payload?.labelKey ? payload?.labelKey : ""}
            onChange={(val) => {
              if (["", null, undefined].includes(val)) val = "";
              let clearValue = val === "" || !val?.length ? "clear" : "";
              constructPayload(val, "labelKey", clearValue);
            }}
            onClear={() => constructPayload("", "labelKey", "clear")}
            variant={"outlined"}
            size="small"
            placeholder="Enter Field label here"
            {...globalProps}
            disabled={payload?.hasOwnProperty("fieldType") ? false : true}
          />
          <DisplayText
            className={classes.description}
            variant="caption"
            style={{ color: keyExistError ? "red" : "black" }}
          >
            {keyExistError ? "field already exists" : "description"}
          </DisplayText>
        </div>
        <div style={{ padding: "10px 5px" }}>
          <DisplayCheckbox
            label={<DisplayText> Make it Required field </DisplayText>}
            onChange={(value) => constructPayload(value, "required")}
          />
        </div>
      </div>
    );
  };

  useEffect(() => {
    setFlag(!flag);
  }, [JSON.stringify(payload)]);

  return (
    <>
      <DisplayModal open={customFieldFlag} fullWidth={true} maxWidth={"md"}>
        <div className={classes.modal_container}>
          <div
            className={classes.modal_header}
            style={{ backgroundColor: dark.bgColor }}
          >
            <DisplayText variant="h6" style={{ color: "white" }}>
              Custom Fields
              {(isNJAdmin() ||
                (helperData && checkForVideoLinks() && showHelper)) && (
                <DisplayIconButton onClick={() => setHelp(true)}>
                  <ToolTipWrapper title="Help" placement="bottom-start">
                    <Help style={{ color: "white", fontSize: "20px" }} />
                  </ToolTipWrapper>
                </DisplayIconButton>
              )}
            </DisplayText>

            <DisplayIconButton
              systemVariant="default"
              onClick={onClose}
              testid="customField-close"
            >
              <CloseOutlined />
            </DisplayIconButton>
          </div>
          <div className={classes.modal_body}>{renderCustomFieldBody()}</div>
          <hr />
          <div className={classes.modal_footer}>
            <div
              style={{
                display: "flex",
                flex: 1,
                justifyContent: "flex-end",
                alignItems: "flex-end",
              }}
            >
              <DisplayButton
                variant="outlined"
                size="small"
                onClick={() => {
                  onClose();
                }}
                systemVariant={false ? "default" : "primary"}
                style={{ color: "red", borderColor: "red" }}
              >
                Cancel
              </DisplayButton>
              <DisplayButton
                disabled={checkForDisablity()}
                variant="contained"
                size="small"
                onClick={() => {
                  openDialog();
                }}
                systemVariant={false ? "default" : "primary"}
              >
                {"Create Field  >"}
              </DisplayButton>
              <DisplayDialog
                testid={"customField"}
                open={dialog.dialog}
                title={dialog.title}
                message={dialog.msg}
                confirmLabel={dialog.confirmLabel}
                onConfirm={dialog.onConfirm}
                onCancel={() => setDialog({ dialog: false })}
                {...dialog}
              />
            </div>
          </div>
        </div>
      </DisplayModal>
      {openHelp && (
        <VideoPlayer
          handleModalClose={() => setHelp(false)}
          screenName={"REPORTS_SCREEN"}
          helperData={helperData}
        />
      )}
    </>
  );
};

export default AttachCustomField;
