import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import Stylesheet from "utils/stylesheets/display_component";
import { ThemeFactory } from "utils/services/factory_services";
import { DisplaySnackbar } from "components/display_components";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import { useWatch } from "react-hook-form";
import { DisplayIconButton } from "components/display_components";
import { SystemIcons } from "utils/icons/";

const SameAsAbove = ({ sameAsAbove }) => {
  const { Clear } = SystemIcons;
  let { options = [], name: FIELD_NAME } = sameAsAbove;
  FIELD_NAME = `sys_entityAttributes.${FIELD_NAME}`;
  const { useRadioboxStyles } = Stylesheet();
  const { getVariantForComponent } = ThemeFactory();
  const classes = useRadioboxStyles(getVariantForComponent("RADIO", "primary"));
  const methods = useFormContext();
  const [list, setList] = useState(options);
  const [value, setVal] = useState("");
  const [selectedList, setSelectedList] = useState({});
  const [message, setMessage] = useState("");
  const [checkRadiosVisible, setCheckRadiosVisible] = useState(false);
  const {
    field: { ref, ...fieldOptions },
    fieldState: { error, isDirty },
  } = useController({
    name: FIELD_NAME || "sss",
    control: methods.control,
  });

  const clearMessage = () => {
    setMessage("");
  };
  let watchFields = [];
  const getFromFields = useCallback(() => {
    if (list?.length > 0) {
      let newList = list;
      for (let i of newList) {
        let fields = [];
        for (let j of i.mapping_rules) {
          fields.push(j.setFrom);
        }
        i["fromFields"] = fields;
        watchFields.push([...fields]);
      }
      setList([...newList]);
    }
  });

  const formData = useWatch({
    control: methods.control,
    name: watchFields[0],
    defaultValue: {},
  });

  const getDisabledState = () => {
    if (list?.length > 0) {
      let newList = list;
      for (let i of newList) {
        let containsData = "";
        if (i.fromFields?.length > 0 && Object.keys(formData)?.length > 0)
          for (let k of i?.fromFields) {
            containsData += formData?.sys_entityAttributes[k] || "";
          }
        if (containsData) {
          i["disable"] = false;
        } else {
          setVal("");
          // methods.setValue(FIELD_NAME, "")
          setSelectedList({});
          i["disable"] = true;
        }
      }
      setList([...newList]);
    }
  };

  const checkChanges = () => {
    for (let i of selectedList.mapping_rules) {
      if (
        formData.sys_entityAttributes[i.setFrom] !=
        formData.sys_entityAttributes[i.setTo]
      ) {
        methods.setValue(
          `sys_entityAttributes.${i.setTo}`,
          methods.getValues(`sys_entityAttributes.${i.setFrom}`)
        );
      }
    }
  };

  const handleChange = (e) => {
    if (Object.keys(e).length) {
      setVal(e?.id);
      methods.setValue(FIELD_NAME, e.id);
      setSelectedList(e);
      if (e?.mapping_rules?.length) {
        let checkEmpty = 0;
        e.mapping_rules.map((fields) => {
          let fromFieldValue =
            methods.getValues(`sys_entityAttributes.${fields.setFrom}`) || "";
          if (fromFieldValue) {
            checkEmpty = 1;
            methods.setValue(
              `sys_entityAttributes.${fields.setTo}`,
              fromFieldValue
            );
          }
        });
        if (checkEmpty == 0) {
          setVal("");
          setMessage(e.errorMessage || "Please fill details to Clone");
        }
      }
    } else {
      try {
        setVal("");
        methods.setValue(FIELD_NAME, "");
        setSelectedList({});
        list[0]["mapping_rules"].map((fields) => {
          if (fields?.type == "DATE") {
            methods.setValue(`sys_entityAttributes.${fields.setTo}`, null);
          } else {
            methods.setValue(`sys_entityAttributes.${fields.setTo}`, "");
          }
        });
      } catch (e) { }
    }
  };

  const setValue = () => {
    let val = methods.getValues(FIELD_NAME);
    if (val) {
      // setVal(val);
      setTimeout(() => {
        handleChange(options.find((fields) => fields.id == val));
      }, 1000);
    }
  };

  useEffect(() => {
    getDisabledState();
    if (Object.keys(selectedList).length > 0) {
      checkChanges();
    }
  }, [formData]);

  useEffect(() => {
    setValue();
    getFromFields();
    for (let i of options) {
      if (i.visible == true) {
        setCheckRadiosVisible(true);
        break;
      }
    }
  }, []);

  return (
    <div style={{ padding: "0px 40px", fontSize: "8px" }}>
      <FormControl component="fieldset" style={{ flexDirection: "row" }}>
        <RadioGroup aria-label="SameAs" name={FIELD_NAME} row value={value}>
          {list.map((li) => {
            return (
              li.visible && (
                <FormControlLabel
                  value={li.id}
                  onChange={(e) => handleChange(li)}
                  control={
                    <Radio
                      disabled={li.disable}
                      color="primary"
                      classes={{
                        root: classes.root,
                        checked: classes.checked,
                        disabled: classes.disabled,
                      }}
                      size="small"
                    />
                  }
                  label={li.value}
                  name={li.id}
                />
              )
            );
          })}
        </RadioGroup>
        {checkRadiosVisible && (
          <DisplayIconButton
            testid={"clear"}
            size={"small"}
            systemVariant="primary"
            //   color={color}
            onClick={() => handleChange({})}
          >
            <Clear fontSize={"small"} />
          </DisplayIconButton>
        )}
      </FormControl>
      <DisplaySnackbar
        autoHideDuration={4000}
        open={!!message}
        message={message}
        onClose={clearMessage}
        severity={"warning"}
      />
    </div>
  );
};
export default React.memo(SameAsAbove);
