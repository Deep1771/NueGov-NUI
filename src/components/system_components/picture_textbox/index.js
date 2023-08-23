import React, { useState, useEffect, startTransition } from "react";
import { SystemTimeout } from "utils/services/helper_services/timeout";

import { Iterator } from "containers/composite_containers/detail_container/components/iterator";
import "./style.css";
import { DisplayHelperText, DisplayText } from "components/display_components";
import { SystemIcons } from "utils/icons";

export const SystemPictureTextbox = (props) => {
  const {
    callbackError,
    callbackValue,
    compIndex,
    data,
    fieldError,
    stateParams,
    formData,
    fieldmeta,
    testid,
  } = props;
  const {
    imageDetails,
    canUpdate,
    disable,
    defaultValue,
    name,
    placeHolder,
    required,
    title,
    validationRegEx,
    regExErrorMessage = "",
    type,
    description,
    linkUrl = "",
    fields = [],
    height,
    ...others
  } = fieldmeta;

  let { height: imgHeight, width: imgWidth } = imageDetails;
  if (imgHeight > 250) imgHeight = 250;
  if (imgWidth > 250) imgWidth = 250;
  const regexp = new RegExp(validationRegEx);

  const [error, setError] = useState();
  const [helperText, setHelperText] = useState();
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState({});

  const clearError = () => {
    callbackError(null, props);
    setError(false);
    setHelperText();
  };
  const dataInit = (data) => {
    setValue(data);
    callbackValue(data ? data : null, props);
    stateParams?.mode?.toUpperCase() === "CLONE" && validateData(data);
  };
  const showError = (msg) => {
    if (canUpdate && !disable) {
      callbackError(msg, props);
      setError(true);
      setHelperText(msg);
    }
  };

  useEffect(() => {
    callbackValue(value ? value : null, props);
  }, [value]);

  const onChange = (data, field) => {
    if (field?.fieldmeta?.name)
      setValue({ ...value, [field.fieldmeta.name]: data });
    if (required) {
      startTransition(() => {
        SystemTimeout(() => {
          validateData(data, true);
        }, 500);
      });
    }
    // callbackValue(data ? data : null, props);
  };

  const validateData = (value) => {
    if (value) {
      if (regexp.test(value)) {
        clearError();
      } else showError(regExErrorMessage || "Invalid data");
    } else {
      required ? showError("Required") : clearError();
    }
  };

  // USeEffects
  useEffect(() => {
    if (fieldError) showError(fieldError);
    if (required && !data) showError("Required");
    // dataInit(data ? data : defaultValue);
    setValue({
      ...data,
      url: imageDetails.url || "",
      description: description || "",
    });
    setMounted(true);
  }, []);

  useEffect(() => {
    if (fieldError) showError(fieldError);
    mounted && dataInit(data);
  }, [data, name]);

  return (
    <>
      <div
        style={{
          border: "1px solid #dfd8d8",
          width: "100%",
          height: height ? height + "px" : "",
        }}
      >
        <div className="system-comp-image-container">
          <div style={{ display: "flex", alignSelf: "start" }}>
            <DisplayText
              style={{
                color: "#5F6368",
                fontWeight: "400",
                fontSize: "12px",
                paddingBottom: "4px",
              }}
            >
              {fieldmeta.title}
            </DisplayText>
            &nbsp;&nbsp;
            {error && (
              <DisplayHelperText icon={SystemIcons.Error}>
                {/* ({helperText}) */}
              </DisplayHelperText>
            )}
          </div>
          <div
            style={{
              height: "250px",
              width: "inherit",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <img
              src={imageDetails?.url}
              height={imgHeight ? imgHeight : "250"}
              width={imgWidth ? imgWidth : "250"}
              style={{ alignSelf: "center" }}
            />
          </div>
          <h6 style={{ margin: "5px 1px", height: "25.5px" }}>
            {fieldmeta.description}
          </h6>
          {linkUrl && (
            <a
              href={linkUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                width: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {linkUrl}
            </a>
          )}
        </div>
        {fields &&
          fields.map((fieldData) => {
            return (
              <Iterator
                callbackError={callbackError}
                fieldmeta={{
                  ...fieldData,
                  colSpan: 1,
                }}
                callbackValue={(data, field) => {
                  onChange(data, field);
                }}
                compIndex={true}
                data={data && data[fieldData?.name]}
                stateParams={stateParams}
              />
            );
          })}
      </div>
    </>
  );
};
