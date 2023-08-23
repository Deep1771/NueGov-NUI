import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Autocomplete } from "@material-ui/lab";
import { TextField, InputAdornment } from "@material-ui/core";
import { entity } from "utils/services/api_services/entity_service";
import { textExtractor } from "utils/services/helper_services/system_methods";
import { get } from "utils/services/helper_services/object_methods";

export const TableRefernceEditor = forwardRef((props, ref) => {
  const [options, setOptions] = useState([]);
  let { cellEditorParams } = props?.colDef || {};
  let { entityname, modulename, appname, title, displayFields } =
    cellEditorParams || {};

  const [value, setValue] = useState("");
  const [inputValue, setInputValue] = useState("");

  function onChangeHandler(e, value) {
    // console.log("onChangeHandler -> ", value);
    setValue(value);

    //updating line value in the main state
    let rowNode = props.api.getRowNode(props.rowIndex);
    rowNode.setDataValue(props.colDef.field, value);
  }

  function onInputChangeHandler(e, inputValue) {
    setInputValue(inputValue);
  }

  const getSimplifiedData = (result) => {
    let { displayFields } = cellEditorParams || [];

    if (result.length) {
      result = result?.map((item) => {
        let displayKeys = {};
        let fields = displayFields?.map((item1) => {
          if (
            [
              "DATE",
              "DATETIME",
              "DATERANGE",
              // "PAIREDLIST",
              "CHECKBOX",
              "LIST",
              "CURRENCY",
              "PHONENUMBER",
            ].includes(item1?.type)
          )
            displayKeys[item1?.name] = textExtractor(
              item["sys_entityAttributes"][item1.name],
              item1
            );
          else if (item1?.type === "AUTOFILL") {
            let displayName =
              item1.name.split(".")[item1.name.split(".").length - 1];
            displayKeys[displayName] = item["sys_entityAttributes"][
              "geoJSONLatLong"
            ]
              ? item["sys_entityAttributes"]["geoJSONLatLong"][displayName]
              : "";
          } else {
            if (item1?.name?.split(".")?.length > 1) {
              let fieldName = item1?.name?.split(".")[0];
              let displayName =
                item1?.name?.split(".")[item1?.name?.split(".")?.length - 1];
              displayKeys[displayName] = item["sys_entityAttributes"][fieldName]
                ? item["sys_entityAttributes"][fieldName][displayName]
                : "";
            } else
              displayKeys[item1?.name] =
                item["sys_entityAttributes"][item1?.name];
          }
        });

        return {
          id: item?._id,
          sys_gUid: item?.sys_gUid,
          ...displayKeys,
        };
      });

      if (displayFields?.length === 1) {
        let refField;
        if (displayFields[0]?.name?.includes("."))
          refField =
            displayFields[0]?.name?.split(".")[
              displayFields[0]?.name?.split(".")?.length - 1
            ];
        else refField = displayFields[0]?.name;
        result = result?.filter(
          (value) =>
            value[refField] !== "" &&
            value[refField] !== null &&
            value[refField] !== undefined
        );
        setOptions(result);
      } else {
        setOptions(result);
      }
    }
    return result;
  };

  const fetchPridications = async () => {
    let result = await entity.get({
      entityname: entityname,
      modulename: modulename,
      appname: appname,
      skip: 0,
      limit: 1000,
    });

    //get simplified data for reference
    getSimplifiedData(result);
  };

  useEffect(() => {
    fetchPridications();
  }, []);

  return (
    <div>
      <Autocomplete
        options={options}
        value={value}
        inputValue={inputValue}
        autoSelect={true}
        renderInput={(params) => <TextField {...params} variant="outlined" />}
        noOptionsText={`No ${title}`}
        onChange={onChangeHandler}
        onInputChange={onInputChangeHandler}
        getOptionLabel={(predictions) => {
          let fields = displayFields
            ?.map((f, idx) => {
              if (f?.type === "PAIREDLIST") {
                return f?.fields?.map((e) => `${f.name}.${e}.id`);
              }
              let fieldName =
                f?.name?.split(".")?.length > 1
                  ? f?.name?.split(".")[f?.name?.split(".")?.length - 1]
                  : f?.name;
              return fieldName;
            })
            ?.flat();
          if (Object.keys(predictions)?.length) {
            return fields
              ?.map((el) => get(predictions, el))
              ?.filter((e) => e)
              ?.join(" | ");
          } else {
            return "";
          }
        }}
      />
    </div>
  );
});
