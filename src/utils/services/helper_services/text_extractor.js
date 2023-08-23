import { format, parseISO } from "date-fns";
export let TextExtract = (params) => {
  let { data, definition } = params;
  let values = data.sys_entityAttributes;

  let emptyValue = "----------";
  switch (definition.type) {
    case "DATE": {
      let date_format = definition.format ? definition.format : "dd/MM/yyyy";
      if (values && values[definition.name])
        return format(new Date(values[definition.name]), date_format);
      else return "--/--/----";
    }
    case "DATETIME": {
      let date_format = definition.format
        ? definition.format
        : "dd/MM/yyyy hh:mm a";
      if (values && values[definition.name])
        return format(new Date(values[definition.name]), date_format);
      else return "--/--/---- --:--";
    }
    case "DATERANGE": {
      let date_format = definition.format ? definition.format : "dd/MM/yyyy";
      if (values && values[definition.name]) {
        if (
          typeof values[definition.name] === "object" &&
          Object.keys(values[definition.name]).length > 0
        ) {
          let startDate = format(
            new Date(values[definition.name]["startDate"]),
            date_format
          );
          let endDate = format(
            new Date(values[definition.name]["endDate"]),
            date_format
          );
          return `${startDate} -> ${endDate}`;
        }
      } else return `--/--/----`;
    }
    case "DOCUMENT": {
      return emptyValue;
    }
    case "ENTITYDOCUMENT": {
      return emptyValue;
    }
    case "LATLONG": {
      return emptyValue;
    }
    case "LINEAR": {
      return emptyValue;
    }
    case "PAIREDLIST": {
      if (values && values[definition.name])
        return Object.values(values[definition.name])
          .map((i) => i.id)
          .join(" / ");
      else return emptyValue;
    }
    case "REFERENCE": {
      let { name, displayField } = definition;
      if (values && values[name]) {
        if (displayField) {
          let fieldName;
          if (displayField.split(".").length > 1)
            fieldName =
              displayField.split(".")[displayField.split(".").length - 1];
          else fieldName = displayField;

          let value = values[name][fieldName];
          return value ? value : emptyValue;
        }
      } else return emptyValue;
    }
    case "TIMECLOCK": {
      return emptyValue;
    }
    default: {
      if (values && values[definition.name]) return values[definition.name];
      else return emptyValue;
    }
  }
};
