import React, { useEffect, useState } from "react";
import { Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ThemeFactory, UserFactory } from "utils/services/factory_services";
import { entity } from "utils/services/api_services/entity_service";
import {
  DisplayButton,
  DisplayCard,
  DisplayGrid,
  DisplayInput,
  DisplayText,
  DisplayIconButton,
  DisplayProgress,
} from "components/display_components";
import { dateToString } from "utils/services/helper_services/file_helpers";
import { Banner } from "components/helper_components";
import { SystemIcons } from "utils/icons";
import "./style.css";

const useStyles = makeStyles({
  header: ({ colors, local }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.dark.bgColor,
    color: colors.dark.text,
    flex: 1,
    padding: "10px",
  }),
});

export const Notes = (props) => {
  const {
    title,
    appname,
    entityname,
    modulename,
    id,
    callbackClose,
    parentMode,
    groupname,
  } = props;
  const [data, setData] = useState([]);
  const [content, setContent] = useState("");
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { Close } = SystemIcons;

  const { getVariantForComponent } = ThemeFactory();
  let { getDetails } = UserFactory();
  const defaultVariant = "primary";
  const classes = useStyles(
    getVariantForComponent("NOTES_HEADER", defaultVariant)
  );

  let params = {
    appname: appname,
    modulename: modulename,
    entityname: entityname,
    parentName: groupname,
    sys_parentId: id,
    limit: 40,
  };

  const userCredentialData = () => {
    if (getDetails) {
      setUserData(getDetails);
    }
  };

  const getEntityData = () => {
    return entity.get(params).then((res) => {
      setData(res);
      setLoading(false);
    });
  };

  const handleChange = (value) => {
    setContent(value);
  };

  const addNotes = (cont) => {
    let obj = {};
    obj["sys_entityAttributes"] = {
      content: cont,
      date: new Date().toISOString(),
      sys_parentId: id,
      parentName: groupname,
      name: {
        id: userData._id,
        sys_gUid: userData.sys_gUid,
      },
    };

    obj["sys_agencyId"] = userData.sys_agencyId;

    entity.create(params, obj).then((res) => {
      getEntityData();
    });
    setContent("");
  };

  const enterPress = (event) => {
    if (event.key === "Enter") {
      addNotes(content);
    }
  };

  useEffect(() => {
    setLoading(true);
    userCredentialData();
    getEntityData();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flexWrap: "wrap",
        height: "100vh",
      }}
    >
      {title ? (
        <div
          className={classes.header}
          style={{
            position: "sticky",
            top: "0",
            padding: "0 0 0 5px",
            flex: 0,
          }}
        >
          <DisplayText
            variant="h5"
            style={{ fontWeight: 500, fontFamily: "inherit" }}
          >
            {" "}
            {title}{" "}
          </DisplayText>
          <DisplayIconButton onClick={callbackClose}>
            <Close />{" "}
          </DisplayIconButton>
        </div>
      ) : null}

      <div style={{ overflow: "auto", flex: 10, padding: "5px" }}>
        {!loading ? (
          data.length > 0 ? (
            data.map((item, index) => {
              let { firstName, lastName } = item.sys_entityAttributes.name;
              return (
                <>
                  <DisplayCard
                    key={index}
                    style={{
                      backgroundColor: "#fafafa",
                      borderRadius: "0px",
                      boxShadow: "none",
                    }}
                  >
                    <p className={"content"}>
                      <DisplayText
                        testid={"c-" + item.sys_entityAttributes.content}
                      >
                        {item.sys_entityAttributes.content}
                      </DisplayText>{" "}
                    </p>
                  </DisplayCard>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "20px",
                      width: "100%",
                      marginTop: "10px",
                    }}
                  >
                    <span className={"creater"} key={index + 1}>
                      <DisplayText>
                        {dateToString(
                          item.sys_entityAttributes.date,
                          "MM-DD-YYYY HH:mm"
                        )}
                      </DisplayText>
                    </span>
                    <span className={"creater"} key={index + 2}>
                      <DisplayText testid={"c-" + firstName + " " + lastName}>
                        {firstName}&nbsp;{lastName}
                      </DisplayText>
                      &nbsp;
                    </span>
                  </div>
                </>
              );
            })
          ) : (
            <Banner
              msg="No message found"
              src="https://assetgov-icons.s3-us-west-2.amazonaws.com/Reactimages/nodatafound.png"
              iconSize="200px"
              fontSize="18px"
            ></Banner>
          )
        ) : (
          <div className="loading">
            <DisplayProgress />
          </div>
        )}
      </div>
      <div
        style={{
          flex: 1,
          bottom: "0",
          padding: "0 5px",
          position: "sticky",
          backgroundColor: "#fafafa",
          marginTop: "10px",
          zIndex: "1",
          height: "100%",
        }}
      >
        <DisplayInput
          rows="5"
          style={{ width: "100%" }}
          multiline={true}
          testid={"c-typehere"}
          className={"textarea"}
          onChange={handleChange}
          value={content ? content : ""}
          onKeyPress={enterPress}
          variant="standard"
        />
        <DisplayButton
          disabled={!content}
          testid={"c-send"}
          style={{ float: "right" }}
          onClick={() => {
            addNotes(content);
          }}
        >
          Send &nbsp;
          <SystemIcons.Send fontSize="sm" />
        </DisplayButton>
      </div>
    </div>
  );
};
