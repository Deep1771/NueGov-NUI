import React from "react";
import { Card } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import "../Nuegov/Acknowledge.css";

const Acknowledge = () => {
  return (
    <div className="acknowledge_main_container">
      <Card
        elevation={0}
        sx={{ borderRadius: "1rem" }}
        className="acknowledge_content_container"
      >
        <CheckCircleIcon sx={{ fontSize: "4rem", color: "green" }} />
        <span className="content_header">Thank you for Choosing Nuegov </span>
        <span className="confirmation_message">
          A confirmation email with login instruction has been sent your email
          address.
        </span>
        <span className="content">
          If you don’t see that email (check your spam, promotion and trash
          folder to be sure !) reach out to us at support@nuegov.com and we will
          get it sorted out right away! To avoid missing anything we send you,
          it’s best to add support@nuegov.com to your contacts too.{" "}
        </span>
        <span className="confirmation_message">
          We look forward to helping you explore our Nuegov Public Safety{" "}
        </span>
      </Card>
    </div>
  );
};

export default Acknowledge;
