//! BASIC REFERENCE DIRECTIVE SHELL

export const REFERENCE_SHELL = {
  name: "entity_doc",
  title: "Select Document",
  type: "REFERENCE",
  placeHolder: "Select Document",
  visible: true,
  uiGridDisplayFieldName: "uiGridDisplayString",
  required: false,
  info: "select id",
  column: "id",
  displayFields: [
    {
      name: "id",
      friendlyName: "Select ID",
      uiGridDisplay: true,
    },
  ],
  delimiter: " ",
  canUpdate: true,
};

//! AGENCY REFERENCE

export const AGENCY_REFERENCE = {
  name: "stampagency",
  title: "",
  label: "Agency Name",
  type: "REFERENCE",
  placeHolder: "Select agency",
  visible: false,
  displayOnCsv: true,
  required: false,
  info: "Stamp the required agency (Only fo NJ-Admin)",
  column: "Name",
  displayFields: [
    {
      name: "Name",
      friendlyName: "Agency Name",
      uiGridDisplay: true,
    },
  ],
  appName: "NueGov",
  canUpdate: true,
  audit: true,
  moduleName: "Admin",
  entityName: "Agency",
};

//! USER GROUP REFERENCES

export const ROLE_REFERENCE = {
  name: "roles",
  title: "Add Roles",
  type: "REFERENCE",
  placeHolder: "Select Role",
  visible: true,
  uiGridDisplayFieldName: "uiGridDisplayString",
  required: false,
  info: "select role",
  column: "name",
  displayFields: [
    {
      name: "name",
      friendlyName: "Role Name ",
      uiGridDisplay: true,
    },
  ],
  delimiter: " ",
  appName: "NueGov",
  canUpdate: true,
  multiSelect: true,
  moduleName: "Admin",
  entityName: "Role",
};

export const USER_GROUP_REFERENCE = {
  name: "usergroups",
  title: "Add User groups",
  type: "REFERENCE",
  appName: "NueGov",
  uiGridDisplayFieldName: "uiGridDisplayString",
  info: "Click add to select from the list",
  required: false,
  placeHolder: "Select User  Group Based Name from list",
  displayFields: [
    {
      name: "userGroupName",
      friendlyName: "User group name",
      uiGridDisplay: true,
    },
  ],
  delimiter: " ",
  multiSelect: true,
  canUpdate: true,
  visible: true,
  moduleName: "Admin",
  entityName: "UserGroup",
};

export const CONTACT_ROLE_REFERENCE = {
  name: "contactRole",
  title: "Add Contact Roles",
  type: "REFERENCE",
  placeHolder: "Select contact role",
  appName: "NueGov",
  info: "Select contact role",
  uiGridDisplayFieldName: "text",
  visible: true,
  multiSelect: true,
  required: false,
  displayOnCsv: true,
  displayFields: [
    {
      name: "contactRole",
      friendlyName: "Contact Role",
      uiGridDisplay: true,
    },
  ],
  canUpdate: true,
  audit: true,
  moduleName: "Infrastructure",
  entityName: "ContactRole",
};

//! GEO BOUNDARY REFERENCE
export const BOUNDARY_REFERENCE = {
  name: "boundaries",
  title: "Add Geo contacts",
  type: "REFERENCE",
  uiGridDisplayFieldName: "uiGridDisplayString",
  info: "Click on *Search* & select boundary info from dropdown, Click on *View* to see the data about selected boundary info",
  required: false,
  visible: true,
  placeHolder: "Select Contact Name from list",
  displayFields: [
    {
      name: "Route.routeNumber",
      friendlyName: "Route Number",
      uiGridDisplay: true,
    },
  ],
  delimiter: " ",
  multiSelect: true,
  canUpdate: true,
  appName: "NueGov",
  moduleName: "Infrastructure",
  entityName: "Boundary",
};

//! CUSTOM REFERENCES

export const USER_REFERENCE = {
  name: "users",
  title: "Add Users",
  label: "Add Users",
  type: "REFERENCE",
  uiGridDisplayFieldName: "uiGridDisplayString",
  appName: "NueGov",
  info: "Click on *Search* & select User Based Name from dropdown, Click on *View* to see the data about selected participant name",
  required: false,
  placeHolder: "Select User Based Name from list",
  displayFields: [
    {
      name: "firstName",
      friendlyName: "First Name",
      uiGridDisplay: true,
    },
    {
      name: "lastName",
      friendlyName: "Last Name",
      uiGridDisplay: true,
    },
    {
      name: "email",
      friendlyName: "Email id",
      uiGridDisplay: true,
    },
  ],
  multiSelect: true,
  canUpdate: true,
  moduleName: "Admin",
  entityName: "User",
};

export const CONTACT_REFERENCE = {
  name: "contacts",
  title: "Add Contacts",
  type: "REFERENCE",
  placeHolder: "Select agency contact",
  appName: "NueGov",
  info: "Select agency contact",
  uiGridDisplayFieldName: "text",
  visible: true,
  multiSelect: true,
  required: false,
  displayOnCsv: true,
  displayFields: [
    {
      name: "firstName",
      friendlyName: "First Name",
      uiGridDisplay: true,
    },
    {
      name: "lastName",
      friendlyName: "Last Name",
      uiGridDisplay: true,
    },
    {
      name: "email",
      friendlyName: "Email ID",
      uiGridDisplay: true,
    },
  ],
  canUpdate: true,
  audit: true,
  moduleName: "Infrastructure",
  entityName: "Contact",
};

//! REFERENCE GROUP

export const REFERENCE_GROUP = [
  {
    group_name: "group_recipients",
    title: "Notify groups",
    references: [
      ROLE_REFERENCE,
      // CONTACT_ROLE_REFERENCE,
      USER_GROUP_REFERENCE,
      BOUNDARY_REFERENCE,
    ],
  },
  {
    group_name: "custom_recipients",
    title: "Notify users",
    references: [USER_REFERENCE, CONTACT_REFERENCE],
  },
];
