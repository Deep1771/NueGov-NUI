import React, { useState, useEffect } from "react";
import { style } from "../../style";
import { deleteEvent } from "utils/services/api_services/sync_services";
import LabelOutlinedIcon from "@material-ui/icons/LabelOutlined";
import EventAvailableIcon from "@material-ui/icons/EventAvailable";
import PersonOutlinedIcon from "@material-ui/icons/PersonOutlined";
import {
  DisplayButton,
  DisplayText,
  DisplayCard,
} from "components/display_components";
import moment from "moment";
import { isLightColor } from "containers/feature_containers/calendar/helper";
let ActionCard = (props) => {
  let { data, cardMeta, cardWidth, showDetail, userData } = props;
  let [date, setDate] = useState();
  useEffect(() => {
    if (data["sys_entityAttributes"]["date"]) {
      let startDate = moment(
        data["sys_entityAttributes"]["date"]["startDate"]
      ).format("MM-dd-YY");
      let endDate = moment(
        data["sys_entityAttributes"]["date"]["endDate"]
      ).format("MM-dd-YY");
      if (startDate || endDate) {
        setDate(`${startDate} - ${endDate}`);
      } else setDate("");
    } else {
      setDate("Not Specified");
    }
  }, []);
  return (
    <DisplayCard
      style={Object.assign({}, style.actionCardContainer, {
        height: 325,
        minWidth: 300,
        maxWidth: 350,
      })}
    >
      <div
        style={Object.assign({}, style.descriptionContainer, {
          maxHeight: 150,
          overflow: "auto",
        })}
      >
        {cardMeta.descriptionField.map((dataItem, index) => {
          return (
            <DisplayText variant="body1" key={index}>
              {data["sys_entityAttributes"][dataItem.name] + "\n"}
            </DisplayText>
          );
        })}
      </div>
      <div style={style.cardFooter}>
        <div style={{ display: "flex" }}>
          <LabelOutlinedIcon
            style={{ marginRight: 10, marginTop: 2, fontSize: 18 }}
          ></LabelOutlinedIcon>
          <DisplayText
            variant="subtitle1"
            style={{
              marginBottom: 10,
              lineHeight: "1.2",
              color: isLightColor(style.cardFooter.backgroundColor),
            }}
          >
            {data["sys_entityAttributes"]["actionName"]}
          </DisplayText>
        </div>
        <div style={{ display: "flex" }}>
          <EventAvailableIcon
            style={{ marginRight: 10, fontSize: 18 }}
          ></EventAvailableIcon>
          <DisplayText
            variant="h1"
            style={{
              marginBottom: 5,
              color: isLightColor(style.cardFooter.backgroundColor),
            }}
          >
            {" "}
            {`${date}`}
          </DisplayText>
        </div>
        <div style={{ display: "flex" }}>
          <PersonOutlinedIcon
            style={{ marginRight: 10, fontSize: 18 }}
          ></PersonOutlinedIcon>
          <DisplayText
            variant="h1"
            style={{ color: isLightColor(style.cardFooter.backgroundColor) }}
          >
            {" "}
            {data["sys_entityAttributes"]["owner"]["userName"]}
          </DisplayText>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          backgroundColor: "#ffffff",
          alignItems: "center",
        }}
      >
        <DisplayButton
          disabled={false}
          small
          variant="text"
          style={{ marginLeft: 10, marginBottom: 10, maxWidth: 30 }}
          onClick={() => {
            showDetail(data._id);
          }}
        >
          <DisplayText>Details</DisplayText>
        </DisplayButton>
      </div>
    </DisplayCard>
  );
};
export default ActionCard;
