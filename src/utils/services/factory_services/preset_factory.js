import { useStateValue } from "../../store/contexts";
import { get } from "../helper_services/object_methods";
import { mergeApprovalSection } from "utils/services/helper_services/system_methods";
import { UserFactory } from "utils/services/factory_services";

export const Preset = () => {
  const { isNJAdmin } = UserFactory();
  const [{ moduleState }, dispatch] = useStateValue();
  const { activeModuleMapLayers: presetTemplates } = moduleState;

  const getBaseTemplates = () => {
    try {
      let temps = presetTemplates.reduce((templates, eg) => {
        let { template } = eg.templates.find((et) => et.baseTemplate);
        templates.push(template);
        return templates;
      }, []);
      return temps;
    } catch (e) {
      return [];
    }
  };

  const getByGroupName = (groupName) => {
    try {
      return presetTemplates
        .find((eg) => eg.groupName === groupName)
        .templates.find((et) => et.baseTemplate).template;
    } catch (e) {
      return null;
    }
  };

  const getSubAgencyTemplates = (groupName, agencyId = null) => {
    try {
      let templates = presetTemplates
        .find((eg) => eg.groupName === groupName)
        .templates.filter((et) => et.subAgency);
      if (agencyId) {
        let template = get(
          templates.find((et) => et.agencyId === agencyId),
          "template"
        );
        return template ? template : null;
      } else return templates;
    } catch (e) {
      return agencyId ? [] : null;
    }
  };

  const getSharedAgencyTemplates = (groupName, agencyId = null) => {
    try {
      let templates = presetTemplates
        .find((eg) => eg.groupName === groupName)
        .templates.filter((et) => et.sharedAgency);
      if (agencyId) {
        let template = get(
          templates.find((et) => et.agencyId === agencyId),
          "template"
        );
        return template ? template : null;
      } else return templates;
    } catch (e) {
      return agencyId ? [] : null;
    }
  };

  const getRoleBasedTemplates = (groupName, templateName = null) => {
    try {
      let templates = presetTemplates
        .find((eg) => eg.groupName === groupName)
        .templates.filter((et) => et.roleTemplate);
      if (templateName) {
        let template = get(
          templates.find(
            (et) =>
              et.template.sys_entityAttributes.sys_templateName === templateName
          ),
          "template"
        );
        return template ? template : null;
      } else return templates;
    } catch (e) {
      return templateName ? [] : null;
    }
  };

  const getAllTemplates = (groupName) => {
    try {
      let template = presetTemplates
        .find((eg) => eg.groupName === groupName)
        .templates.find((et) => et.baseTemplate);
      return [
        ...[template],
        ...getSubAgencyTemplates(groupName),
        ...getSharedAgencyTemplates(groupName),
      ];
    } catch (e) {
      return [];
    }
  };

  const getByAgencyId = (groupName, agencyId) => {
    try {
      if (isNJAdmin()) return getByGroupName(groupName);
      else {
        let templates = getAllTemplates(groupName);
        let { template } = templates.find(
          (et) => et && et.agencyId === agencyId
        );
        return template;
      }
    } catch (e) {
      return null;
    }
  };

  const getByData = (data, groupName) => {
    try {
      let { templates } = data.find((e) => e.groupName === groupName);
      let { template } = templates.find((e) => e.baseTemplate);
      return template;
    } catch (e) {
      return null;
    }
  };

  const getByDataAgencyId = (data, groupName, agencyId) => {
    try {
      if (isNJAdmin()) return getByData(data, groupName);
      else {
        let { templates } = data.find((e) => e.groupName === groupName);
        let { template } = templates.find((e) => e.agencyId === agencyId);
        return template;
      }
    } catch (e) {
      return null;
    }
  };

  const getRoleBasedTemplateByData = (data, groupName, templateName) => {
    try {
      if (isNJAdmin()) return getByData(data, groupName);
      else {
        let { templates } = data.find((e) => e.groupName === groupName);
        templates = templates.filter((et) => et.roleTemplate);
        let { template } = templates.find(
          (e) =>
            e.template.sys_entityAttributes.sys_templateName === templateName
        );
        return template;
      }
    } catch (e) {
      return null;
    }
  };

  const getRoleBasedTemplate = (groupName, templateName) => {
    try {
      if (isNJAdmin()) return getByGroupName(groupName);
      else {
        let baseTemplate = getByGroupName(groupName);
        let roleTemplate = getRoleBasedTemplates(groupName, templateName);
        return roleTemplate ? roleTemplate : baseTemplate;
      }
    } catch (e) {
      return null;
    }
  };

  const setPresetTemplates = (templates) => {
    if (templates) {
      //merge approval section
      templates = templates.map((et) => {
        et.templates.map((template) => {
          if (template.baseTemplate) {
            template.template = mergeApprovalSection(
              template.template,
              template.template
            );
          }
        });
        return et;
      });

      dispatch({
        type: "SET_PRESET_TEMPLATES",
        payload: templates,
      });
    }
  };

  const services = {
    getBaseTemplates,
    getByAgencyId,
    getAllTemplates,
    getByGroupName,
    getSubAgencyTemplates,
    getSharedAgencyTemplates,
    getByData,
    getRoleBasedTemplate,
    getRoleBasedTemplateByData,
    getByDataAgencyId,
    setPresetTemplates,
  };

  return { ...services };
};

export default Preset;
