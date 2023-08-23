import React from "react";
import "../Nuegov/tryitforfree.css";
import { Card, Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Grow } from "@mui/material";

const label = [
  {
    title: "Your Name",
  },
  {
    title: "Agency Name",
  },
  {
    title: "Select Product",
  },
  {
    title: "Business Phone Number",
  },
  {
    title: "Business Email",
  },
  {
    title: "Agency Location",
  },
];

const Scheduledemo = () => {
  const navigate = useNavigate();
  return (
    <Grow in="true" timeout={200} style={{ transformOrigin: "1 1 1" }}>
      <div className="schedule_demo_main_container">
        <div className="page_title_container">
          <span className="page_title">Try it for Free</span>
          <span>
            Fill the necessary information below and let us take care of the
            rest !
          </span>
        </div>
        <Card elevation={0} className="agency_section_container">
          <span className="agency_info_header">Agency Info</span>
          <div className="text_field_container">
            {label.map((label) => (
              <TextField
                className="text_field"
                label={label.title}
                size="small"
                type="text"
                id="text"
                value={Text}
                placeholder="Enter here"
                required
              />
            ))}
          </div>
        </Card>
        <Card elevation={0} className="business_section_container">
          <span className="agency_info_header">Select Business Processes</span>
        </Card>
        <Button
          sx={{ borderRadius: "1rem", backgroundColor: "#5577ff" }}
          disableElevation
          variant="contained"
          onClick={() => navigate("/Acknowledge")}
        >
          Try it for Free
        </Button>
      </div>
    </Grow>
  );
};

export default Scheduledemo;
