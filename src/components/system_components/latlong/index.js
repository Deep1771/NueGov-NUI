import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { TextField, makeStyles, IconButton } from "@material-ui/core";
import PropTypes from "prop-types";
import { useStateValue } from "../../../utils/store/contexts";
import {
  DisplayInput,
  DisplayHelperText,
  DisplayFormControl,
  DisplayText,
} from "components/display_components";
import { GridWrapper } from "components/wrapper_components/grid_wrapper";
import { UsePosition } from "./UsePosition";
import { MapComponent } from "../map_component";
import { SystemIcons } from "utils/icons";
import debounce from "lodash/debounce";
import { isDefined } from "utils/services/helper_services/object_methods";
import { globalProps } from "../global-props";
import { ToolTipWrapper } from "components/wrapper_components";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  control: {
    padding: theme.spacing(2),
  },
  footer: {
    alignItems: "center",
    display: "flex",
    flexShrink: 1,
    justifyContent: "flex-end",
    padding: "5px",
  },
}));

export const SystemLatLong = (props) => {
  let { data, callbackValue, callbackError, fieldError, stateParams } = props;
  let fieldmeta = {
    ...SystemLatLong.defaultProps.fieldmeta,
    ...props.fieldmeta,
  };
  let {
    canUpdate,
    defaultValue,
    disable,
    name,
    fields,
    placeHolder,
    required,
    title,
    unique,
    validationRegEx,
    skipReadMode,
    ...others
  } = fieldmeta;
  let { displayOnCsv, info, length, type, visible, visibleOnCsv, ...rest } =
    others;
  const autocomplete = new window.google.maps.places.AutocompleteService();
  const [{ presetState, configState }, dispatch] = useStateValue();

  const { Map } = SystemIcons;
  const { latitude, longitude } = UsePosition();
  const [addressComponent, setAddressComponent] = useState();
  const [applyEnable, setApplyEnable] = useState(false);
  const [currentPosition, setCurrentPosition] = useState({});
  const [prevPosition, setPrevPosition] = useState({});
  const [error, setError] = useState(false);
  const [location, setLocation] = useState();
  const [helperText, setHelperText] = useState();
  const [predictions, setPredictions] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  let geocoder = new window.google.maps.Geocoder();
  let isReadMode = stateParams?.mode?.toLowerCase() == "read" && !skipReadMode;

  const getPlacePredictions = (input) => {
    autocomplete.getPlacePredictions({ input }, (predictions) => {
      predictions?.length
        ? setPredictions(
            predictions?.map((prediction) => prediction.description)
          )
        : setPredictions([]);
    });
  };

  const debouncedGetPlacePredictions = useCallback(
    debounce(getPlacePredictions, 500),
    []
  );

  const handleSelectChange = (value) => {
    if (isDefined(value)) {
      validateData(value, true);
      geocoder.geocode({ address: value }, function (results, status) {
        if (status == "OK") {
          address_Extractor(results);
          setPrevPosition({
            formattedAddress: results[0].formatted_address,
            coordinates: [longitude, latitude],
            type: "Point",
          });
        }
      });
    } else {
      fields.length = 0;
      setLocation({});
    }
    if (!value && required) showError("Required");
  };

  const onChange = (event) => {
    if (isDefined(event.target.value)) {
      validateData(event.target.value, true);
      debouncedGetPlacePredictions(event.target.value);
    } else setLocation({});
  };

  const address_Extractor = (results, currentPosition) => {
    let latitude = currentPosition
      ? currentPosition.lat
      : results[0].geometry.location.lat();
    let longitude = currentPosition
      ? currentPosition.lng
      : results[0].geometry.location.lng();
    let addressComponents = results?.[0]?.address_components || [];
    setLocation({
      formattedAddress: results[0].formatted_address,
      coordinates: [longitude, latitude],
      type: "Point",
    });
    fields.forEach((eachField) => {
      if (eachField.autofillOptions) {
        let temp = addressComponents?.forEach((eachComponent) => {
          let { types = [] } = eachComponent;
          if (types?.includes(eachField?.reference_type)) {
            setLocation((prevState) => ({
              ...prevState,
              [eachField?.name]: eachComponent?.long_name || "",
            }));
          }
        });
      } else {
        setLocation((prevState) => ({
          ...prevState,
          [eachField.name]: "",
        }));
      }
    });
    validateData(results, true);
    let bounds = new window.google.maps.LatLngBounds();
    if (results?.[0]?.geometry?.viewport) {
      bounds.union(results?.[0]?.geometry?.viewport);
    } else {
      bounds.extend(results?.[0]?.geometry?.location);
    }
    dispatch({
      type: "SET_MAP_INTERACTION",
      payload: bounds,
    });
  };

  const clearError = () => {
    callbackError(null, props);
    setError(false);
    setHelperText();
  };

  const dataInit = (data) => {
    setLocation(data);
    callbackValue(data ? data : null, props);
    validateData(data, true);
  };

  const showError = (msg) => {
    if (canUpdate && !disable) {
      callbackError(msg, props);
      setError(true);
      setHelperText(msg);
    }
  };

  const validateData = (data) => {
    if (data) {
      !data ? showError("Required") : clearError();
    } else {
      required ? showError("Required") : clearError();
    }
  };

  const renderReadmode = (data) => (
    <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
      <div className="system-label">
        <DisplayText
          variant="h1"
          style={{ color: "#666666", cursor: "default" }}
        >
          {title}
        </DisplayText>
        &nbsp;&nbsp;&nbsp;
        <IconButton
          disabled={disable || !canUpdate || !location ? true : false}
          onClick={(e) => {
            setShowModal(true);
          }}
        >
          <Map style={{ padding: "2%", cursor: "pointer" }} />
        </IconButton>
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "row",
            flexWrap: "wrap",
            margin: "15px",
          }}
        >
          <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
            <div style={{ flex: 2 }}>
              <DisplayText variant="h1" style={{ color: "#576574" }}>
                {"Location : "}
              </DisplayText>
            </div>{" "}
            {data && (
              <div style={{ flex: 10, margin: "0 15px" }}>
                <DisplayText
                  variant="h2"
                  style={{ color: "#576574", marginTop: "15px" }}
                >
                  {data.formattedAddress ? data.formattedAddress : "N/A"}{" "}
                </DisplayText>{" "}
              </div>
            )}{" "}
          </div>
          <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
            <div style={{ flex: 2 }}>
              <DisplayText variant="h1" style={{ color: "#576574" }}>
                {"Latitude : "}
              </DisplayText>
            </div>{" "}
            {data && (
              <div style={{ flex: 10, margin: "0 15px" }}>
                <DisplayText
                  variant="h2"
                  style={{ color: "#576574", marginTop: "15px" }}
                >
                  {data?.coordinates
                    ? data?.coordinates[1]
                      ? data?.coordinates[1]
                      : "N/A"
                    : "N/A"}
                </DisplayText>
              </div>
            )}
          </div>
          <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
            <div style={{ flex: 2 }}>
              <DisplayText variant="h1" style={{ color: "#576574" }}>
                {"Longitude : "}
              </DisplayText>
            </div>{" "}
            {data && (
              <div style={{ flex: 10, margin: "0 15px" }}>
                <DisplayText
                  variant="h2"
                  style={{ color: "#576574", marginTop: "15px" }}
                >
                  {data?.coordinates
                    ? data?.coordinates[0]
                      ? data?.coordinates[0]
                      : "N/A"
                    : "N/A"}{" "}
                </DisplayText>
              </div>
            )}
          </div>
        </div>
        {fields && fields.length > 0 && (
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "row",
              flexWrap: "wrap",
              margin: "15px",
            }}
          >
            <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
              <div style={{ flex: 1 }}>
                <DisplayText variant="h1" style={{ color: "#576574" }}>
                  {"City : "}
                </DisplayText>
              </div>{" "}
              {data && (
                <div style={{ flex: 11, margin: "0 15px" }}>
                  <DisplayText
                    variant="h2"
                    style={{ color: "#576574", marginTop: "15px" }}
                  >
                    {data.city ? data.city : "N/A"}
                  </DisplayText>
                </div>
              )}
            </div>
            <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
              <div style={{ flex: 1 }}>
                <DisplayText variant="h1" style={{ color: "#576574" }}>
                  {"State : "}
                </DisplayText>
              </div>{" "}
              {data && (
                <div style={{ flex: 11, margin: "0 15px" }}>
                  <DisplayText
                    variant="h2"
                    style={{ color: "#576574", marginTop: "15px" }}
                  >
                    {data.state ? data.state : "N/A"}
                  </DisplayText>
                </div>
              )}
            </div>
            <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
              <div style={{ flex: 1 }}>
                <DisplayText variant="h1" style={{ color: "#576574" }}>
                  {"Country : "}
                </DisplayText>
              </div>{" "}
              {data && (
                <div style={{ flex: 11, margin: "0 15px" }}>
                  <DisplayText
                    variant="h2"
                    style={{ color: "#576574", marginTop: "15px" }}
                  >
                    {data.country ? data.country : "N/A"}
                  </DisplayText>
                </div>
              )}
            </div>
            <div style={{ display: "flex", flex: 2, flexDirection: "column" }}>
              <div style={{ flex: 1 }}>
                <DisplayText variant="h1" style={{ color: "#576574" }}>
                  {"Zip : "}
                </DisplayText>
              </div>
              {data && (
                <div style={{ flex: 11, margin: "0 15px" }}>
                  <DisplayText
                    variant="h2"
                    style={{ color: "#576574", marginTop: "15px" }}
                  >
                    {data.zip ? data.zip : "N/A"}
                  </DisplayText>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderMaps = useMemo(() => {
    return (
      <MapComponent
        setAddressComponent={!isReadMode ? setAddressComponent : null}
        setCurrentPosition={setCurrentPosition}
        // address_Extractor={address_Extractor}
        stateParams={stateParams}
        marker={[
          {
            position: location?.coordinates?.length
              ? {
                  lat: location.coordinates[1],
                  lng: location.coordinates[0],
                }
              : {
                  lat: latitude,
                  lng: longitude,
                },
            title: "",
            draggable: true,
            color: "red",
          },
        ]}
      />
    );
  }, [location && Object.keys(location).length, predictions]);

  useEffect(() => {
    if (fieldError) showError(fieldError);
    setMounted(true);
  }, []);

  useEffect(() => {
    setLocation(data);
    mounted && dataInit(data);
    if (fieldError) showError(fieldError);
    if (!data && required) showError("Required");
  }, [data, name]);

  useEffect(() => {
    if (location) callbackValue(location ? location : null, props);
  }, [location]);

  useEffect(() => {
    if (addressComponent) address_Extractor(addressComponent, currentPosition);
  }, [addressComponent, currentPosition]);

  return (
    <>
      {isReadMode ? (
        <>{renderReadmode(data)}</>
      ) : (
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            gap: "0.2rem",
            width: "100%",
          }}
        >
          <DisplayFormControl>
            <div
              style={{
                display: "flex",
                flex: 1,
                gap: "0.5rem",
              }}
            >
              <div
                style={{ display: "flex", flex: 2, flexDirection: "column" }}
              >
                <div style={{ display: "flex" }}>
                  <DisplayText
                    style={{
                      color: "#5F6368",
                      fontWeight: "400",
                      fontSize: "12px",
                      paddingBottom: "4px",
                    }}
                  >
                    {title}
                  </DisplayText>
                  &nbsp;&nbsp;
                  {error && (
                    <DisplayHelperText icon={SystemIcons.Error}>
                      ({helperText})
                    </DisplayHelperText>
                  )}
                </div>
                <Autocomplete
                  options={predictions}
                  disabled={disable || !canUpdate ? true : false}
                  disableClearable={false}
                  required={required}
                  value={
                    location && location.formattedAddress
                      ? location["formattedAddress"]
                      : ""
                  }
                  getOptionLabel={(predictions) =>
                    typeof predictions === "string"
                      ? predictions
                      : predictions.description
                  }
                  filterOptions={(x) => x}
                  onChange={(e, value) => handleSelectChange(value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      {...rest}
                      InputProps={{
                        ...params?.InputProps,
                        ...globalProps?.InputProps,
                        style: {
                          ...globalProps?.InputProps?.style,
                          padding: "0px 10px",
                        },
                      }}
                      inputProps={{
                        ...params?.inputProps,
                        ...globalProps?.inputProps,
                        style: {
                          ...globalProps?.inputProps?.style,
                          marginRight: "50px",
                        },
                      }}
                      variant="outlined"
                      onChange={onChange}
                      style={{ display: "flex", flex: 1, width: "99%" }}
                    />
                  )}
                  style={{ display: "flex", flex: 1 }}
                />
                {fields.length > 0 && (
                  <>
                    <br />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        columnGap: "8px",
                      }}
                    >
                      {fields.map((e, i) => (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            width: "100%",
                          }}
                        >
                          <DisplayText
                            style={{
                              color: "#5F6368",
                              fontWeight: "400",
                              fontSize: "12px",
                              paddingBottom: "4px",
                            }}
                          >
                            {e.title}
                          </DisplayText>
                          <DisplayInput
                            key={i}
                            disabled={!canUpdate || disable}
                            error={error}
                            type={e["name"] == "zip" ? "NUMBER" : "text"}
                            hideClear={true}
                            onChange={(val) => {
                              setLocation((prevState) => ({
                                ...prevState,
                                [e["name"]]: val,
                              }));
                            }}
                            placeholder={e["placeHolder"]}
                            value={location ? location[e["name"]] : ""}
                            variant="outlined"
                            // label={e.title}
                            {...globalProps}
                            {...rest}
                          />
                          &nbsp;&nbsp;&nbsp;
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  flex: 1,
                }}
              >
                {renderMaps}
              </div>
            </div>
            <ToolTipWrapper
              title={
                fieldmeta?.description?.length > 57
                  ? fieldmeta?.description
                  : ""
              }
              placement="bottom-start"
            >
              <div
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "pre",
                  maxWidth: "100%",
                  fontSize: "11px",
                  opacity: "0.65",
                  height: "16px",
                }}
              >
                <DisplayText
                  style={{
                    fontSize: "11px",
                  }}
                >
                  {fieldmeta?.description}
                </DisplayText>
              </div>
            </ToolTipWrapper>
          </DisplayFormControl>
        </div>
      )}
    </>
  );
};

SystemLatLong.defaultProps = {
  fieldmeta: {
    canUpdate: true,
    disable: false,
    displayOnCsv: true,
    required: false,
    visibleOnCsv: false,
  },
};

SystemLatLong.propTypes = {
  data: PropTypes.string,
  fieldmeta: PropTypes.shape({
    disable: PropTypes.bool,
    info: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    placeHolder: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    visibleOnCsv: PropTypes.bool,
  }),
};

export default GridWrapper(SystemLatLong);
