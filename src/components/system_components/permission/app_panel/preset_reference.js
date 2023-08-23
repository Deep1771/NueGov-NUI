const PresetMetaData = {
  name: "preset",
  title: "Preset",
  type: "REFERENCE",
  placeHolder: "Select Preset from the List",
  info: "Presets are simply pre-selected security configurations across products and modules that will apply to the sub-agency being created.",
  moduleName: "Admin",
  uiGridDisplayFieldName: "text",
  entityName: "SubAgencyPreset",
  visible: true,
  required: false,
  column: "name",
  disable: true,
  dynamicFilters: [
    {
      filterKey: "sys_agencyId",
      filterPath: "sys_agencyId",
      njFilterKey: "sys_agencyId",
      njFilterPath: "sys_entityAttributes.parentAgency.id",
      isArray: true,
    },
  ],
  displayFields: [
    {
      name: "name",
      friendlyName: "Preset Name",
      uiGridDisplay: true,
    },
  ],
  delimiter: " ",
  displayOnCsv: true,
  appName: "NueGov",
  canUpdate: true,
  audit: true,
};

const RolePresetMeta = {
  name: "rolePreset",
  title: "Role Preset",
  type: "REFERENCE",
  placeHolder: "Select Preset from the List",
  appName: "NueGov",
  moduleName: "Admin",
  entityName: "RolePreset",
  visible: true,
  required: false,
  column: "name",
  canUpdate: true,
  displayFields: [
    {
      name: "presetName",
      friendlyName: "Preset Name",
      uiGridDisplay: true,
    },
  ],
};

export { PresetMetaData, RolePresetMeta };
