export const localProps = {
  SelectProps: {
    MenuProps: {
      anchorOrigin: {
        vertical: "bottom",
        horizontal: "right",
      },
      transformOrigin: {
        vertical: "top",
        horizontal: "right",
      },
      getContentAnchorEl: null,
    },
  },
};

//import modes
export const modes = [
  {
    label: "Insert",
    value: "insert",
    description: "Insert new data from spreadsheet",
  },
  {
    label: "Update",
    value: "update",
    description:
      "Import modified exported data or modified success spreadsheet",
  },
];

//constants
export const tableHeaders = [
  {
    label: "source",
    value: "Source Fields",
  },
  {
    label: "target",
    value: "NueGov Fields",
  },
  {
    label: "status",
    value: "Status",
  },
];

//params
export const agencyParams = {
  appname: "NueGov",
  modulename: "Admin",
  entityname: "Agency",
};

//steps
export const steps = ["Upload File", "Map Fields", "Start Import"];

//for username match
export const usernameMatchingOptions = [
  {
    label: "Use email as username",
    value: "gmail",
  },
  {
    label: "Autogenerate",
    value: "autogenerate",
  },
];
