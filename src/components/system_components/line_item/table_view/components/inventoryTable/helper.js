import { InventoryActions } from "./components/actions";
import { InventoryReference } from "./components/inventoryReference";
import { InventoryList } from "./components/inventoryList";

const getCellDefination = (fieldDetails, props) => {
  let { type, name, title, isEditable } = fieldDetails || {};

  switch (type.toUpperCase()) {
    case "REFERENCE":
      return {
        field: name,
        headerName: title,
        editable: isEditable,
        cellRenderer: InventoryReference,
        cellRendererParams: { ...fieldDetails },
      };

    case "LIST":
      return {
        field: name,
        headerName: title,
        editable: isEditable,
        cellRenderer: InventoryList,
        cellRendererParams: { ...fieldDetails },
      };

    case "ACTIONS":
      return {
        filter: false,
        editable: false,
        headerName: "Actions",
        cellRenderer: InventoryActions,
        cellRendererParams: {
          ...props,
        },
        checkboxSelection: true,
        headerCheckboxSelection: false,
        width: 130,
        pinned: "left",
        headerCheckboxSelectionCurrentPageOnly: true,
        showDisabledCheckboxes: true,
        floatingFilter: false,
      };

    default:
      return {
        field: name,
        headerName: title,
        editable: isEditable,
        cellEditor: "agTextCellEditor",
      };
  }
};

export const getInventoryColumns = (templateData, params) => {
  let { sys_entityAttributes } = templateData || {};
  let { sys_topLevel } = sys_entityAttributes || [];

  //filter out the sections
  sys_topLevel = sys_topLevel?.filter(
    (fl) => fl.type !== "SECTION" && fl.visible === true
  );

  //sort based on order
  sys_topLevel = sys_topLevel?.sort((a, b) => {
    return a.order - b.order;
  });

  //addingtable actions to definations
  let obj = {
    type: "ACTIONS",
  };
  let simplifiedTopLevel = [obj, ...sys_topLevel];

  //add tableDefination
  simplifiedTopLevel = simplifiedTopLevel?.map((eachCol) => {
    return getCellDefination(eachCol, params);
  });

  return simplifiedTopLevel ? simplifiedTopLevel : [];
};
