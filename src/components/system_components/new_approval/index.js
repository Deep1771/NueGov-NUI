import React, { useState, useEffect } from "react";
import {
  DisplayButton,
  DisplayDialog,
  DisplayFormLabel,
  DisplayText,
} from "components/display_components/";
import { ToolTipWrapper } from "components/wrapper_components";
import { SystemHistory } from "components/system_components";
import { Iterator } from "containers/composite_containers/detail_container/components/iterator";
import { get } from "utils/services/helper_services/object_methods";
import { GlobalFactory, UserFactory } from "utils/services/factory_services";
import { useDetailData } from "containers/composite_containers/detail_container/detail_state";

export const SystemApprovals = (props) => {
  const { fieldmeta, callbackValue, callbackError, data, stateParams } = props;
  const { groupname } = stateParams;

  const {
    title,
    placeHolder,
    info,
    notes,
    values,
    disableDescription,
    hideDescription,
    fields,
    showHistory,
    requestorRoles = [],
    approverRoles = [],
    description,
    skipApprovalRules,
  } = fieldmeta;

  let [value, setValue] = useState({});
  const { setTriggerSave } = GlobalFactory();
  const { getUserInfo } = UserFactory();
  const { roleName } = getUserInfo();
  const [err, setErr] = useState([]);
  const [dialog, setDialog] = useState({ dialog: false });
  const { formData } = useDetailData();

  const handleChange = (value, field, index) => {
    let errIndex = err.length > 0 && err.findIndex((e) => e.index == index);
    if (value && err.length && errIndex > -1)
      err[errIndex] = { ...err[errIndex], value: false };
    setValue((preValue) => ({ ...preValue, [field.name]: value }));
  };

  const openSaveDialog = (i) => {
    let { dialogTitle, dialogMsg, buttonLabel, onAction } = i;
    let saveModal = {
      dialog: true,
      title: dialogTitle || "Sure to save ?",
      msg: dialogMsg || "Action cannot be undone",
      confirmLabel: buttonLabel || "Save",
      onConfirm: () => {
        onAction.map((e) => {
          if (e.level === "TOP")
            callbackValue(e["value"], { fieldmeta: { name: e["fieldname"] } });
          else if (e.level === "SELF")
            value = { ...value, [e.fieldname]: [e.value] };
          else {
          }
        });
        callbackValue({ ...value, id: i["id"], value: i["value"] }, props);
        setTriggerSave(groupname);
      },
      onCancel: () => {
        setDialog({ dialog: false });
      },
    };
    setDialog(saveModal);
  };

  const skipApprovalProcess = () => {
    if (skipApprovalRules) {
      let { type = "OR", fields } = skipApprovalRules;
      return fields?.reduce((approvalValue, rule) => {
        if (rule.value.includes(get(formData, rule.fieldPath, undefined)))
          approvalValue = true;
        else if (type === "AND") {
          approvalValue = false;
        } else {
        }
        return approvalValue;
      }, false);
    } else return false;
  };

  useEffect(() => {
    if (data) setValue(data);
  }, [data]);

  useEffect(() => {
    callbackValue(value, props);
  }, [value]);

  // useEffect(() => {
  //   setErr(formError.topLevel.length ? true : false);
  // }, [formError.topLevel]);

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {description && (
          <ToolTipWrapper title={description} placement="bottom-start">
            <div
              style={{
                whiteSpace: "pre",
                fontSize: "11px",
                opacity: "0.65",
                height: "16px",
                display: "flex",
                justifyContent: "flex-start",
                flex: 1,
              }}
            >
              <DisplayText
                style={{
                  fontSize: "11px",
                }}
              >
                {description}
              </DisplayText>
            </div>
          </ToolTipWrapper>
        )}
        {skipApprovalProcess() && fieldmeta?.autoApprovalMessage && (
          <div
            style={{
              whiteSpace: "pre",
              fontSize: "11px",
              opacity: "0.65",
              height: "16px",
              display: "flex",
              justifyContent: "flex-start",
              flex: 1,
              color: fieldmeta.autoApprovalMessage.color
                ? fieldmeta.autoApprovalMessage.color
                : "red",
            }}
          >
            <DisplayText
              style={{
                fontSize: "11px",
              }}
            >
              {fieldmeta.autoApprovalMessage.message
                ? fieldmeta.autoApprovalMessage.message
                : "This will be Auto-Approved"}
            </DisplayText>
          </div>
        )}
        {values?.length > 0 && (
          <div
            style={{
              display: "flex",
              flex: 1,
              justifyContent: "flex-end",
              padding: "0px 10px 0px 0px",
            }}
          >
            {values
              .filter(
                (v) =>
                  v?.visibleTo?.reduce((value, role) => {
                    if (fieldmeta[role]?.length && !value)
                      value = fieldmeta[role].includes(roleName);
                    return value;
                  }, false) &&
                  v?.visibleOn?.includes(
                    get(data ? data : undefined, "id", "undefined")
                  )
              )
              .map((i) => {
                let { variant, buttonTitle, toolTip } = i;
                return (
                  <DisplayFormLabel
                    style={{
                      fontWeight: 700,
                      fontSize: "18px",
                      color: "#212121",
                    }}
                    toolTipMsg={toolTip}
                  >
                    <DisplayButton
                      size="small"
                      variant="contained"
                      systemVariant={variant ? variant : "primary"}
                      onClick={() => {
                        openSaveDialog(i);
                      }}
                      disabled={
                        skipApprovalProcess() ||
                        err?.some((e) => e.value == true) ||
                        i?.disableOn.includes(
                          get(data ? data : undefined, "id", "undefined")
                        )
                      }
                    >
                      {buttonTitle}
                    </DisplayButton>
                  </DisplayFormLabel>
                );
              })}
          </div>
        )}
        {fields?.length > 0 && (
          <div
            style={{
              display: "flex",
              flex: 1,
              padding: "10px",
            }}
          >
            {fields.map((ef, index) => (
              <Iterator
                callbackError={(e) => {
                  if (e)
                    setErr((prevValue) => {
                      if (prevValue.findIndex((e) => e.index == index) == -1)
                        return [
                          ...prevValue,
                          { ...ef, index: index, value: true },
                        ];
                      else {
                        let errIndex = err.findIndex((e) => e.index == index);
                        prevValue[errIndex] = {
                          ...prevValue[errIndex],
                          value: true,
                        };
                        return prevValue;
                      }
                    });
                }}
                callbackValue={(e) => handleChange(e, ef, index)}
                // topLevelErrors={topLevelErrors}
                data={value[ef.name]}
                fieldError={null}
                fieldmeta={{
                  ...ef,
                  canUpdate:
                    !skipApprovalProcess() &&
                    ef?.visibleOn?.includes(
                      get(data ? data : undefined, "id", "undefined")
                    ) &&
                    ef?.canUpdate?.reduce((value, role) => {
                      if (fieldmeta[role]?.length)
                        value = fieldmeta[role].includes(roleName);
                      return value;
                    }, false),
                }}
                key={index}
                // sectionName={section}
                stateParams={stateParams}
                testid={stateParams.groupname + "-" + ef.name}
              />
            ))}
            <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
              {notes && (
                <>
                  <DisplayText
                    style={{
                      color: "#5F6368",
                      fontWeight: "400",
                      fontSize: "12px",
                      margin: "0px 0px 0px 15px",
                    }}
                  >
                    Notes
                  </DisplayText>
                  <ul>
                    {notes.map((n, i) => (
                      <li key={i}>
                        <DisplayText
                          style={{
                            color: "#666666",
                            fontWeight: "400",
                            fontSize: "14px",
                            margin: "0px 0px 0px 15px",
                          }}
                        >
                          {n}
                        </DisplayText>{" "}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            {showHistory && (
              <SystemHistory
                fieldmeta={{
                  name: "history",
                  title: "Approval History",
                  type: "HISTORY",
                  entityName: "History",
                  moduleName: "System Tools",
                  appName: "NJAdmin",
                  canUpdate: true,
                  skipReadMode: true,
                  approval: true,
                }}
                stateParams={stateParams}
              />
            )}
          </div>
        )}
        <DisplayDialog
          open={dialog.dialog}
          title={dialog.title}
          message={dialog.msg}
          confirmLabel={dialog.confirmLabel}
          onConfirm={dialog.onConfirm}
          onCancel={() => {
            setDialog({ dialog: false });
            setTriggerSave(false);
          }}
        />
      </div>
    </>
  );
};
