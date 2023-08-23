import { format } from "date-fns";
export let TextExtract = (params) => {
  let { data, metadata, definition } = params;
  let { sys_entityAttributes } = data;
  switch (definition.type) {
    case "DATE": {
      let value = sys_entityAttributes[definition["name"]];
      return value ? format(new Date(value), "MM/dd/yyyy") : "--------";
    }
    case "DATETIME": {
    }

    case "LATLONG": {
    }
    case "REFERENCE": {
      let { name, displayField } = definition;
      if (displayField.split(".") > 1)
        displayField =
          displayField.split(".")[displayField.split(".").length - 1];
      let value = sys_entityAttributes[name][displayField];
      return value ? value : "--------";
    }
    case "TIMECLOCK": {
    }
    default: {
      let value = sys_entityAttributes[definition["name"]];
      return value ? value : "--------";
    }
  }
};
