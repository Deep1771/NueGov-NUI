import React, { useState } from "react";
import "access_new/components/Footer.css";
import { LinkedIn } from "@material-ui/icons";
import PhoneOutlinedIcon from "@material-ui/icons/PhoneOutlined";
import MapOutlinedIcon from "@material-ui/icons/MapOutlined";
import EmailOutlinedIcon from "@material-ui/icons/EmailOutlined";
import { Link, Button, Modal, TextField, Dialog } from "@material-ui/core";
import { styled } from "@material-ui/styles";
import { MailOutlineOutlined } from "@material-ui/icons";
import ScheduleDemo from "./scheduledemo";

const CustomButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#5577ff",
  borderRadius: "50px",
  color: "#ffffff",
  boxShadow: "#5577ff 0 10px 20px -10px",
  width: "200px",
  padding: "0.5rem 1rem 0.5rem 1rem",
  "&:hover": {
    backgroundColor: "#ff8a65",
  },
}));

const Footer = () => {
  return (
    <div className="footer_main_container">
      <span className="footer_header">Put NueGOV to the Test</span>
      <span className="footer_tagline">
        Schedule a demo, ask about our solutions.
      </span>
      <span className="contact_us_header">Contact Us :</span>
      <span className="contact_us_items">
        <PhoneOutlinedIcon
          style={{ verticalAlign: "middle", marginRight: "0.5rem" }}
        />
        1-720-399-4402
      </span>
      <span className="contact_us_items">
        <MapOutlinedIcon
          style={{ verticalAlign: "middle", marginRight: "0.5rem" }}
        />
        7340 Caley Avenue, Suite 100W Centennial, CO 80111
      </span>
      <span className="contact_us_items">
        <EmailOutlinedIcon
          style={{ verticalAlign: "middle", marginRight: "0.5rem" }}
        />
        Communication@navjoyinc.com
      </span>
    </div>
  );
};

export default Footer;
