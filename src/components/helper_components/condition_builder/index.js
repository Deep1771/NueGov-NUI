import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core";
import { useStateValue } from "utils/store/contexts";
import { SystemTypeFactory } from "utils/services/factory_services";
import {
  DisplayAutocomplete,
  DisplayInput,
  DisplaySelect,
  DisplayGrid,
  DisplayButton,
  DisplaySwitch,
  DisplayIconButton,
} from "components/display_components";
import { SystemIcons } from "utils/icons";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
  },
});

const ConditionBuilder = (props) => {
  const { template, feature, onChange, defaultValue } = props;
  const { filterByFeature, getAcceptedTypes } = SystemTypeFactory();
  const [dataArr, setDataArr] = useState(defaultValue ? defaultValue : [{}]);
  const [loadOperator, setLoadOperator] = useState({ 0: false });
  const filteredTypes = filterByFeature(feature);
  const acceptedDirectives = getAcceptedTypes(
    template?.sys_entityAttributes?.sys_topLevel,
    feature
  );

  const { Delete } = SystemIcons;

  const getFormatInfo = (fieldName) => {
    let md = acceptedDirectives.find((e) => e.name === fieldName);
    let obj = filteredTypes.find((e) => {
      return e?.sys_entityAttributes?.directiveTypes.some(
        (d) => d.name === md?.type
      );
    })?.sys_entityAttributes;
    return { ...obj, fieldmeta: md };
  };

  useEffect(() => {
    onChange(dataArr);
  }, [dataArr]);

  const renderTypeIterator = (formatInfo, i) => {
    const { dataFormat, filterFormat, directiveTypes, fieldmeta } = formatInfo;
    switch (dataFormat) {
      case "STRING": {
        switch (filterFormat) {
          case "STRING": {
            return (
              <>
                <DisplayGrid item lg={4}>
                  <DisplayInput
                    style={{ display: "flex", flex: 1, marginTop: 16 }}
                    label={"Enter Value"}
                    variant="outlined"
                    defaultValue={dataArr[i]?.value || ""}
                    onChange={(e) => {
                      let arr = [...dataArr];
                      let obj = arr[i];
                      obj["value"] = e;
                      arr[i] = obj;
                      setDataArr(arr);
                    }}
                  />
                </DisplayGrid>
              </>
            );
          }

          case "ARRAY": {
            let directiveInfo = directiveTypes.find(
              (e) => e.name === fieldmeta.type
            );
            const { mappingField } = directiveInfo;
            const { arrayKey, labelKey, valueKey, path } =
              JSON.parse(mappingField);
            return (
              <>
                <DisplayGrid item lg={4}>
                  <DisplayAutocomplete
                    style={{ display: "flex", flex: 1 }}
                    label={"Select Value"}
                    variant="outlined"
                    limitTags={2}
                    options={fieldmeta[arrayKey]}
                    labelKey={labelKey}
                    selectedKey={valueKey}
                    displayChips={false}
                    multiple={dataArr[i]?.operator !== "EQUALS"}
                    defaultValue={dataArr[i]?.value}
                    onChange={(e, v, p) => {
                      let arr = [...dataArr];
                      let obj = arr[i];
                      obj["value"] = v;
                      arr[i] = obj;
                      setDataArr(arr);
                    }}
                  />
                </DisplayGrid>
              </>
            );
          }

          default:
            return null;
        }
      }

      case "NUMBER": {
        switch (dataArr[i]?.operator) {
          case "EQUALS": {
            return (
              <>
                <DisplayGrid item lg={4}>
                  <DisplayInput
                    style={{ display: "flex", flex: 1, marginTop: 16 }}
                    label={"Enter Value"}
                    variant="outlined"
                    type="NUMBER"
                    defaultValue={dataArr[i]?.value || ""}
                    onChange={(e) => {
                      let arr = [...dataArr];
                      let obj = arr[i];
                      obj["value"] = e;
                      arr[i] = obj;
                      setDataArr(arr);
                    }}
                  />
                </DisplayGrid>
              </>
            );
          }

          case "RANGE": {
            return (
              <>
                <DisplayGrid item lg={4}>
                  <div
                    style={{ flex: 1, display: "flex", flexDirection: "row" }}
                  >
                    <DisplayInput
                      style={{
                        display: "flex",
                        flex: 1,
                        marginTop: 16,
                        marginRight: 5,
                      }}
                      label={"Enter min value"}
                      placeholder={"Min Value"}
                      variant="outlined"
                      type="NUMBER"
                      defaultValue={dataArr[i]?.min || ""}
                      onChange={(e) => {
                        let arr = [...dataArr];
                        let obj = arr[i];
                        obj["min"] = e;
                        arr[i] = obj;
                        setDataArr(arr);
                      }}
                    />
                    <DisplayInput
                      style={{ display: "flex", flex: 1, marginTop: 16 }}
                      label={"Enter max value"}
                      placeholder={"Max Value"}
                      variant="outlined"
                      type="NUMBER"
                      defaultValue={dataArr[i]?.max || ""}
                      onChange={(e) => {
                        let arr = [...dataArr];
                        let obj = arr[i];
                        obj["max"] = e;
                        arr[i] = obj;
                        setDataArr(arr);
                      }}
                    />
                  </div>
                </DisplayGrid>
              </>
            );
          }

          default:
            return null;
        }
      }

      default:
        return null;
    }
  };

  const renderOperator = (fieldName, i) => {
    const formatInfo = getFormatInfo(fieldName);
    const { operators } = formatInfo;
    return (
      <>
        <DisplayGrid item lg={4}>
          <DisplayAutocomplete
            style={{ display: "flex", flex: 1 }}
            label={"Select operator"}
            labelKey={"title"}
            valueKey={"name"}
            variant="outlined"
            defaultValue={operators.find(
              (e) => e.name === dataArr[0]?.operator
            )}
            onlyValue={true}
            options={operators}
            onChange={(e) => {
              let arr = [...dataArr];
              let obj = arr[i];
              obj["operator"] = e.name;
              if (e.name === "EQUALS") obj["value"] = "";
              else obj["value"] = [];
              arr[i] = obj;
              setDataArr(arr);
            }}
          />
        </DisplayGrid>
        {dataArr[i]?.operator && renderTypeIterator(formatInfo, i)}
      </>
    );
  };

  const classes = useStyles();
  return (
    <div className={classes.container}>
      {dataArr.map((ed, i) => {
        const { fieldName } = ed;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              flexShrink: 1,
              width: "100%",
              flexDirection: "row",
            }}
          >
            <div style={{ flex: 9, display: "flex" }}>
              <DisplayGrid container alignItems="flex-start" spacing={2}>
                <DisplayGrid item lg={4}>
                  <DisplayAutocomplete
                    style={{ display: "flex", flex: 1 }}
                    label={"Select field"}
                    labelKey={"title"}
                    valueKey={"name"}
                    variant="outlined"
                    onlyValue={true}
                    defaultValue={acceptedDirectives.find(
                      (e) => e.name === dataArr[0]?.fieldName
                    )}
                    options={acceptedDirectives}
                    onChange={(e) => {
                      setLoadOperator({ ...loadOperator, i: true });
                      let arr = [...dataArr];
                      let obj = arr[i];
                      obj["fieldName"] = e.name;
                      obj["operator"] = "";
                      arr[i] = obj;
                      setDataArr(arr);
                      setTimeout(() => {
                        setLoadOperator({ ...loadOperator, i: false });
                      }, 100);
                    }}
                  />
                </DisplayGrid>
                {!loadOperator[i] && fieldName && renderOperator(fieldName, i)}
              </DisplayGrid>
            </div>
            <div
              style={{ flexShrink: 3, display: "flex", flexDirection: "row" }}
            >
              <DisplaySwitch
                checked={dataArr[i]?.active || false}
                onlyValue={true}
                onChange={(v) => {
                  let arr = [...dataArr];
                  let obj = arr[i];
                  obj["active"] = v;
                  arr[i] = obj;
                  setDataArr(arr);
                }}
              />
              <DisplayIconButton onClick={() => {}} systemVariant="secondary">
                <Delete />
              </DisplayIconButton>
            </div>
          </div>
        );
      })}
      <div
        style={{
          display: "flex",
          flexShrink: 1,
          flexDirection: "row",
          justifyContent: "flex-end",
        }}
      >
        <DisplayButton
          variant="contained"
          onClick={() => {
            let arr = [...dataArr];
            arr.push({});
            setDataArr(arr);
            setLoadOperator({ ...loadOperator, [dataArr.length + 1]: false });
          }}
        >
          Add Condition
        </DisplayButton>
      </div>
    </div>
  );
};

export default ConditionBuilder;
