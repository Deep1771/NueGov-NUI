import React, { useState, lazy, Suspense, useMemo, useCallback } from "react";
import { DisplayModal } from "components/display_components";
import { useDetailStyles } from "../styles";
import {
  DisplayDivider,
  DisplayText,
  DisplayIconButton,
  DisplayButton,
} from "components/display_components";
import { ThemeFactory } from "utils/services/factory_services";
import { SystemIcons } from "utils/icons";
import { Iterator } from "containers/composite_containers/detail_container/components/iterator";
import { bulkActions } from "utils/services/api_services/bulk_actions";

export const UpdateModal = (props) => {
  const {
    openUpdateModal,
    setUpdateModal,
    data,
    mode = "",
    commonFields,
    updateData,
    setUpdateData,
    title,
  } = props;
  const classes = useDetailStyles();
  const { getVariantObj, getAllVariants } = ThemeFactory();
  const { dark } = getVariantObj("primary");
  const { CloseOutlined } = SystemIcons;

  const stateParams = { mode: mode };

  const closeUpdateModal = () => {
    setUpdateModal(false);
  };

  const renderHeader = () => {
    return (
      <div
        className={classes.modal_header}
        style={{ backgroundColor: dark.bgColor }}
      >
        <DisplayText variant="h6" style={{ color: "white" }}>
          {title ? title : "Update Linked Assets"}
        </DisplayText>
        <DisplayIconButton
          systemVariant="default"
          onClick={closeUpdateModal}
          style={{ color: "white" }}
        >
          <CloseOutlined />
        </DisplayIconButton>
      </div>
    );
  };

  let getIterator = useCallback(
    (eachField, i) => {
      return (
        <Iterator
          callbackError={() => {}}
          callbackValue={(ddata) => {
            setUpdateData((prevState) => ({
              ...prevState,
              [eachField.name]: ddata,
            }));
          }}
          data={updateData[eachField?.name]}
          // data={
          //   data && data[eachField?.name]
          //     ? data && data[eachField?.name]
          //     : null
          // }
          fieldmeta={eachField}
          key={`tf-${i}`}
          stateParams={stateParams}
        />
      );
    },
    [JSON.stringify(commonFields), JSON.stringify(updateData)]
  );

  const renderBody = () => {
    return (
      <div className={classes.modal_body}>
        <DisplayText>
          These changes will reflect only for common values across linked assets
        </DisplayText>
        <div
          style={{
            // height: "55vh",
            // width: "98%",
            // padding: "1%",
            display: "flex",
            // flex: 1,
            flexWrap: "wrap",
          }}
        >
          {commonFields.length > 0 &&
            commonFields.map((eachField, i) => {
              // return <div key={`ef` + `${i}`}>{getIterator(eachField, i)}</div>;
              return (
                <Suspense fallback={<div>Loading...</div>}>
                  <Iterator
                    callbackError={() => {}}
                    callbackValue={(ddata) => {
                      setUpdateData((prevState) => ({
                        ...prevState,
                        [eachField.name]: ddata,
                      }));
                    }}
                    data={updateData[eachField?.name]}
                    // data={
                    //   data && data[eachField?.name]
                    //     ? data && data[eachField?.name]
                    //     : null
                    // }
                    fieldmeta={eachField}
                    key={`tf-${i}`}
                    stateParams={stateParams}
                  />
                </Suspense>
              );
            })}
        </div>
      </div>
    );
  };

  const renderFooter = () => {
    return (
      <div
        style={{ backgroundColor: "white" }}
        className={classes.modal_footer}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "flex-end",
          }}
        >
          {/* <DisplayButton
            variant="outlined"
            size="small"
            onClick={() => {
              closeUpdateModal();
            }}
            systemVariant={false ? "default" : "secondary"}
          >
            Cancel
          </DisplayButton> */}
          <DisplayButton
            variant="contained"
            size="small"
            onClick={() => {
              updateLinkedAssets();
            }}
            systemVariant={false ? "default" : "primary"}
          >
            Set
          </DisplayButton>
        </div>
      </div>
    );
  };

  const updateLinkedAssets = async () => {
    // setUpdateData(updateData);
    // let response = await bulkActions.updateMany("", {
    //   selectedIds: ["Vehicle-f2129e55-07dc-4c22-b7c3-b2d9aac829c0"],
    //   collectionName: "vehicle",
    //   filters: {},
    //   operationType: "Update",
    //   appname: "NueGov",
    //   modulename: "Trooper",
    //   entityname: "Vehicle",
    //   templatename: "CDPSVehicle",
    //   username: "karengriggs@cdps.com",
    //   updatingFields: [
    //     {
    //       fieldname: "vehicleYear",
    //       fieldValue: "8088",
    //     },
    //   ],
    // });
    closeUpdateModal();
  };

  return (
    <DisplayModal open={openUpdateModal} fullWidth={true} maxWidth={"md"}>
      <div
        className={classes.modal_container}
        style={{
          height: "500px",
        }}
      >
        {renderHeader()}
        <DisplayDivider />
        {renderBody()}
        <DisplayDivider />
        {renderFooter()}
      </div>
    </DisplayModal>
  );
};
