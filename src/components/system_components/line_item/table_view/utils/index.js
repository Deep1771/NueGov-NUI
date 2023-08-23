import { TableActions } from "../components/lineItemTable/tableActions";
import { TableRefernceEditor } from "../components/lineItemTable/tableReferenceEditor";
import { ReferenceDisplay } from "../components/lineItemTable/referenceDisplay";
import { HeaderNameComponent } from "../components/lineItemTable/headerDisplay";
import TableNumber from "../components/lineItemTable/tableNumberEditor";
import { TableDiscountEditor } from "../components/lineItemTable/tableDiscountEditor";
import { TableDiscountDisplay } from "../components/lineItemTable/tableDiscountDisplay";

export const getCellDefination = (fieldDetails, fieldmeta) => {
  let { type, name, title, isEditable, required, width } = fieldDetails || {};
  switch (type.toUpperCase()) {
    case "REFERENCE":
      return {
        field: name,
        headerName: title,
        headerComponent: required ? HeaderNameComponent : "",
        editable: isEditable,
        cellEditor: TableRefernceEditor,
        cellRenderer: ReferenceDisplay,
        cellRendererParams: {
          ...fieldDetails,
          fieldmeta: fieldmeta,
        },
        cellEditorParams: {
          ...fieldDetails,
        },
      };

    case "ACTIONS":
      return {
        field: "actions",
        headerName: "Actions",
        width: 100,
        editable: false,
        pinned: "left",
        cellRenderer: TableActions,
      };

    case "DISCOUNT":
      return {
        headerComponent: required ? HeaderNameComponent : "",
        field: name,
        headerName: title,
        editable: isEditable,
        cellEditor: TableDiscountEditor,
        cellEditorParams: {
          ...fieldmeta,
        },
        cellRenderer: TableDiscountDisplay,
        cellRendererParams: {
          ...fieldDetails,
        },
      };

    case "NUMBER":
      return {
        headerComponent: required ? HeaderNameComponent : "",
        field: name,
        // headerName: title,
        editable: isEditable,
        cellEditor: TableNumber,
        headerName: title,
      };

    default:
      return {
        headerName: title,
        headerComponent: required ? HeaderNameComponent : "",
        field: name,
        headerName: title,
        editable: isEditable,
        cellEditor: "agTextCellEditor",
      };
  }
};

export const getColumnsDefs = (displayFields, fieldmeta) => {
  let columnDefinations = displayFields?.map((eachField) => {
    let cellDetails = getCellDefination(eachField, fieldmeta);
    return cellDetails;
  });

  return columnDefinations;
};

const getTopLevelfields = (fieldmeta) => {
  let { lineItems } = fieldmeta || {};
  let { displayFields } = lineItems || [];
  let obj = {};
  displayFields.map((el) => {
    if (!["REFERENCE"].includes(el.type)) {
      let keyname = el.name;
      obj[keyname] = "";
    } else {
      let keyname = el.name;
      obj[keyname] = {};
    }
  });
  return obj;
};

export const constructLineItem = (data, fieldmeta) => {
  let simplifiedTopLevel = getTopLevelfields(fieldmeta);
  let lineitem = {
    sys_entityAttributes: {
      ...simplifiedTopLevel,
    },
  };
  return lineitem;
};

export const getfieldKeys = (fieldmeta) => {
  let { displayFields } = fieldmeta || [];
  let fieldState = {};
  displayFields = displayFields?.map((el) => {
    let fieldname = el.name;
    return (fieldState[fieldname] = "");
  });
  return fieldState;
};

export const getNewLineItem = (fieldmeta, lineItemFields, result, formData) => {
  let { lineItems, inventory, originField } = fieldmeta || {};
  let { displayFields } = lineItems || {};

  //adding inventory reference values(be carefull with function)
  let inventoryEntity = inventory?.entityname;
  let inventoryReferenceFields = displayFields?.filter(
    (fl) => fl.type === "REFERENCE" && fl.entityname === inventoryEntity
  );
  if (inventoryReferenceFields?.length > 0) {
    inventoryReferenceFields = inventoryReferenceFields?.map((eachField) => {
      let fieldName = eachField?.name;
      let displayFieldsNames = eachField?.displayFields?.map((el) => el.name);
      lineItemFields["sys_entityAttributes"][fieldName] = {
        ...displayFieldsNames?.reduce(
          (accumulator, currentValue) => ({
            ...accumulator,
            [currentValue]: result[currentValue],
          }),
          {}
        ),
        id: result?._id,
        sys_gUid: result?.sys_gUid,
      };
    });
  }

  //adding inventory type to the lineitems
  lineItemFields["sys_entityAttributes"]["inventoryType"] = inventory?.title;

  //adding originField reference to lineitems
  let originFieldDetails = originField?.displayFields?.map((el) => {
    return el.name;
  });
  lineItemFields["sys_entityAttributes"][originField?.name] = {
    ...originFieldDetails?.reduce(
      (accumulator, currentValue) => ({
        ...accumulator,
        [currentValue]: formData["sys_entityAttributes"][currentValue],
      }),
      {}
    ),
    id: formData?._id,
    sys_gUid: formData?.sys_gUid,
  };

  return lineItemFields;
};
