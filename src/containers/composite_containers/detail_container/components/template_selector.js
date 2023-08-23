import React, { useEffect, useState } from "react";
import {
  DisplaySelect,
  DisplayModal,
  DisplayButton,
  DisplayIconButton,
  DisplayText,
} from "components/display_components";
import {
  ThemeFactory,
  UserFactory,
  GlobalFactory,
} from "utils/services/factory_services";
import { makeStyles } from "@material-ui/core/styles";
import { entity } from "utils/services/api_services/entity_service";
import { agencyTemplate } from "utils/services/api_services/template_service";
import { ContainerWrapper } from "components/wrapper_components";
import { SystemIcons } from "utils/icons";
import { useHistory } from "react-router-dom";
import { get } from "utils/services/helper_services/object_methods";
import { DetailContainerSkeleton } from "components/skeleton_components/detail_page/detail_container";

const useStyles = makeStyles({
  text: ({ colors }) => ({
    color: colors.dark.bgColor,
  }),
  label: {
    fontSize: "10.5px",
  },
  modal_header: ({ colors }) => ({
    padding: "5px 10px",
    display: "flex",
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: colors.dark.bgColor,
  }),
  modal_body: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    overflowY: "auto",
    overflow: "hidden",
    padding: "10px",
  },
});

export const TemplateSelector = (props) => {
  let {
    appName,
    baseTemplate,
    groupName,
    metadata,
    selectorMode,
    moduleName,
    onTemplateChange,
    onSelectorClose,
    testid,
  } = props;

  const { isNJAdmin, getAgencyDetails, getAgencyId } = UserFactory();
  const { getBusinessType, getOthersRoleInfo } = GlobalFactory();
  const { getVariantForComponent } = ThemeFactory();
  const { HighlightOff } = SystemIcons;
  const history = useHistory();
  const classes = useStyles(getVariantForComponent("", "primary"));

  // let [openModal, setOpenModal] = useState(true);
  let [businessType, setbusinessType] = useState([]);
  let [lineOfBusiness, setLineOfBusiness] = useState([]);
  let [selected, setSelected] = useState([]);
  let [selectedBusinessType, setSelectedBusinessType] = useState([]);
  let [stored, setStored] = useState({});
  let [templates, setTemplates] = useState([]);
  let [mount, setMount] = useState(false);
  let [loader, setLoader] = useState(true);

  let business = metadata?.sys_entityAttributes?.sys_topLevel?.find(
    (e) => e.entityName === "BusinessType"
  );

  //contruct data format that can be input for select
  const constructData = (res, type) => {
    let data = res.map(({ _id, sys_gUid, sys_entityAttributes }) => {
      let { LOB, businessType, sys_friendlyName, sys_templateName } =
        sys_entityAttributes;
      switch (type) {
        case "BusinessType":
          return { LOB, id: _id, businessType, sys_gUid };
        // case "Template":
        //   return { name: sys_friendlyName, sys_templateName, id: _id };
        default:
          return {
            name: sys_friendlyName,
            sys_templateName,
            id: _id,
          };
      }
    });
    return data;
  };

  //Get initial business types
  const getBusinessTypes = () => {
    entity
      .get({
        appname: appName,
        modulename: moduleName,
        entityname: "BusinessType",
        limit: 30,
        skip: 0,
      })
      .then((res) => {
        let businessInfo = constructData(res, "BusinessType");
        if (businessInfo.length) {
          setbusinessType(businessInfo);
          init(businessInfo);
          businessInfo = businessInfo.filter(
            (eachValue, index, arr) =>
              arr.findIndex(
                (t) => t.businessType === eachValue.businessType
              ) === index
          );
          setSelectedBusinessType(businessInfo);
        }
      })
      .catch((e) => {
        console.log("Error in getting BusinessTypes", e);
      });
  };

  const setDefaultTemplate = (defaultTemplate, arr) => {
    let initialTemplate = constructData([baseTemplate]);
    let selected1 = Array.isArray(arr) ? arr : [],
      obj = {};

    initialTemplate.map((temp) => {
      if (defaultTemplate) obj[defaultTemplate.sys_gUid] = [baseTemplate];
      setStored({ ...stored, ...obj });
      selected1.push(temp);
      setSelected(selected1);
    });
    setTemplates(initialTemplate);
    !isNJAdmin() && handleChange();
  };

  //Get line of business depending on business type
  const getLOB = (businessId) => {
    setTemplates([]);
    let LOB = businessType.filter((e) => e.businessType === businessId);
    setLineOfBusiness(LOB);
  };

  //Get templates depending on business type & LOB
  const getTemplates = (defaultTemplate, selectedTemplate) => {
    setTemplates([]);
    let sysGuid = defaultTemplate?.sys_gUid,
      obj = {},
      arr = [];
    if (!sysGuid) {
      let { sys_entityAttributes } = getAgencyDetails;
      let { businessTypeInfo } = sys_entityAttributes;
      [1, 2].map((e) => arr.push(businessTypeInfo));
      setSelected(arr);
      sysGuid = businessTypeInfo?.sys_gUid;
    }

    if (stored[sysGuid]) {
      let templateInfo = constructData(stored[sysGuid]);
      setTemplates(templateInfo);
    } else {
      if (sysGuid)
        agencyTemplate
          .get({
            appname: appName,
            modulename: moduleName,
            entityname: "AgencyTemplate",
            limit: 30,
            skip: 0,
            "businessProcess.sys_gUid": sysGuid,
            "entityName.sys_groupName": groupName,
            pagelayoutflag: true,
          })
          .then((res) => {
            if (res.length) {
              obj[sysGuid] = res;
              setStored({ ...stored, ...obj });
              let templateInfo = constructData(res);
              setTemplates(templateInfo);
              if (!(res?.length > 1)) {
                handleChange(res[0]);
              }
            } else setDefaultTemplate(defaultTemplate, selectedTemplate);
          });
      else setDefaultTemplate(defaultTemplate, arr);
    }
  };

  //loading base template passed from detail container
  const init = (businessInfo) => {
    let selectedArr = [];
    let defaultTemplate = businessInfo.filter(
      (e) => e.businessType == "NueGov"
    );
    selectedArr.push(defaultTemplate[0]);
    setSelected(selectedArr);
    setLineOfBusiness(defaultTemplate);
    // getTemplates(defaultTemplate, selectedArr);
  };

  //function to load final template
  const handleChange = async (tData) => {
    let finalTemplate = tData || baseTemplate;
    let data,
      obj = {};
    Object.values(stored).map((storedData) =>
      storedData.map((data) => {
        if (data._id == selected[2]?.id) finalTemplate = data;
      })
    );
    business && (obj[business.name] = selected[1]);
    data = !isNJAdmin()
      ? await getDefaultData(finalTemplate)
      : groupName === "Agency"
      ? {
          sys_entityAttributes: {
            businessTypeInfo: selected[1],
          },
        }
      : {};
    onTemplateChange(finalTemplate, obj, data);
  };

  const getDefaultData = async (finalTemplate) => {
    let data = {};
    if (groupName === "User") {
      let roleInfo = await getOthersRoleInfo(finalTemplate);
      let defaultData = {
        roleName: roleInfo,
      };
      if (
        Object.keys(roleInfo).length == 0 &&
        getBusinessType() === "NUEASSIST"
      ) {
        defaultData = {
          superAdmin: true,
        };
      }
      data = {
        ...data,
        sys_entityAttributes: {
          ...defaultData,
        },
      };
    }
    return data;
  };

  const handleClose = () => {
    !selectorMode ? history.goBack() : onSelectorClose();
    setTimeout(() => {
      history.go();
    }, 500);
  };

  //UseEffects
  useEffect(() => {
    isNJAdmin() ? getBusinessTypes() : getTemplates();
    setTimeout(
      () => {
        setLoader(false);
      },
      ["AGENCY", "ROLE", "USER"].includes(groupName.toUpperCase()) ? 2000 : 0
    );
  }, []);

  useEffect(() => {}, [mount]);

  return loader ? (
    <DetailContainerSkeleton />
  ) : (
    <DisplayModal testid={"test"} open={true} fullWidth={true} maxWidth="sm">
      <ContainerWrapper
        style={{ alignSelf: "center", justifyContent: "center" }}
      >
        <div className={classes.modal_header}>
          <DisplayText
            variant="h5"
            style={{ flex: 8, fontFamily: "inherit", color: "white" }}
          >
            {"Select the " + groupName + " type"}
          </DisplayText>
          <div
            style={{ flex: 1, display: "flex", flexDirection: "row-reverse" }}
          >
            <DisplayIconButton
              testid={"close"}
              onClick={handleClose}
              size={"small"}
            >
              <HighlightOff style={{ color: "primary" }} />
            </DisplayIconButton>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            height: "100%",
            width: "100%",
            flexDirection: "column",
            gap: 15,
            padding: "2%",
          }}
        >
          {isNJAdmin() && (
            <>
              <DisplaySelect
                labelKey={"businessType"}
                valueKey={"businessType"}
                label={"Business Process"}
                testid={"businessType"}
                values={selectedBusinessType}
                placeHolder="Select Business Type"
                onChange={(businessName) => {
                  setMount(!mount);
                  getLOB(businessName);
                  let selectedData = selected;
                  selectedData.splice(
                    0,
                    1,
                    businessType.find((e) => e.businessType === businessName)
                  );
                  selectedData.splice(1);
                  setSelected(selectedData);
                }}
                value={selected[0] ? selected[0].businessType : ""}
                variant="outlined"
                showNone={false}
              />

              <DisplaySelect
                labelKey={"LOB"}
                valueKey={"sys_gUid"}
                label={"Line of Business"}
                testid={"LOB"}
                values={lineOfBusiness}
                placeHolder="Select appropriate LOB"
                onChange={(businessId) => {
                  setMount(!mount);
                  getTemplates({ sys_gUid: businessId }, selected);
                  let selectedData = selected;
                  selectedData.splice(
                    1,
                    1,
                    businessType.find((e) => e.sys_gUid === businessId)
                  );
                  selectedData.splice(2);
                  setSelected(selectedData);
                }}
                value={selected[1] ? selected[1].sys_gUid : ""}
                variant="outlined"
                showNone={false}
              />
            </>
          )}

          <DisplaySelect
            labelKey={"name"}
            valueKey={"id"}
            label={groupName + " type"}
            values={templates}
            testid={"agencyTemplate"}
            placeHolder="Select appropriate template"
            onChange={(templateId) => {
              let selectedData = selected;
              selectedData.splice(
                2,
                1,
                templates.find((e) => e.id === templateId)
              );
              setSelected(selectedData);
              setMount(!mount);
            }}
            disabled={templates.length ? false : true}
            value={selected[2] ? selected[2].id : ""}
            variant="outlined"
            showNone={false}
          />

          <DisplayButton
            testid={"apply-bussinessType"}
            onClick={() => handleChange()}
          >
            Apply
          </DisplayButton>
        </div>
      </ContainerWrapper>
    </DisplayModal>
  );
};
