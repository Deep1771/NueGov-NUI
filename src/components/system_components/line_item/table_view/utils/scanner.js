import { entity } from "utils/services/api_services/entity_service";

export const getScannerData = async (scannerData, fieldmeta) => {
  console.log("scannerData -> ", scannerData);
  console.log("fieldmeta -> ", fieldmeta);

  let { inventory } = fieldmeta || {};
  let { format, text } = scannerData;
  let formatType = format === 11 ? "QR_CODE" : "BAR_CODE";

  let res = await entity.get({
    ...inventory,
    [formatType]: text,
    limit: 1,
    skip: 0,
  });
  console.log("res after scanning -> ", res);

  //if data exist in the scanned code
  if (res.length > 0) {
    //check for given inventory
    let result = res[0];
    if (result?.sys_groupName === inventory.entityname) {
      return {
        dataExist: true,
        msg: `${formatType} Scanned Successfully`,
        message: `Click on Continue to add ${inventory.title}`,
        // data: res[0],
        //return only sys_entityAttribute value to scanner data
        data: {
          ...result?.sys_entityAttributes,
          _id: result?._id,
          sys_gUid: result?.sys_gUid,
        },
      };
    } else {
      return {
        dataExist: false,
        msg: `its not belong to ${inventory.entityname}`,
      };
    }
  } else {
    return {
      dataExist: false,
      msg: `There is No Existing ${inventory.entityname} in the Inventory`,
      message: "",
    };
  }
};
