import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import { styled } from "@material-ui/styles";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  form: {
    display: "flex",
    flexDirection: "column",
    margin: "auto",
    width: "500px",
    gap: "1rem",
  },
  formControl: {
    marginTop: theme.spacing(2),
    minWidth: 120,
  },
  formControlLabel: {
    marginTop: theme.spacing(1),
  },
  TextField: {},
}));

const CustomButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#5577ff",
  borderRadius: "50px",
  color: "#ffffff",
  boxShadow: "#5577ff 0 10px 20px -10px",
  width: "fit-content",
  padding: "0.5rem 1rem 0.5rem 1rem",
  "&:hover": {
    backgroundColor: "#ff8a65",
  },
}));

function ScheduleDemo() {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
    agency: "",
    email: "",
    phone: "",
    date: "",
    time: "",
  });
  const [errors, setErrors] = useState({});

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormValues({
      name: "",
      agency: "",
      email: "",
      phone: "",
      date: "",
      time: "",
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate(formValues);
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      // handle form submission logic here
      console.log("Form submitted!", formValues);
      handleClose();
    }
  };

  const validate = (values) => {
    let errors = {};
    if (!values.name.trim()) {
      errors.name = "Name is required";
    }
    if (!values.agency.trim()) {
      errors.agency = "Agency Name is required";
    }
    if (!values.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = "Email address is invalid";
    }
    if (!values.phone.trim()) {
      errors.phone = "Phone is required";
    }
    // if (!values.date.trim()) {
    //   errors.date = 'Date is required';
    // }
    // if (!values.time.trim()) {
    //   errors.time = 'Time is required';
    // }
    return errors;
  };
  return (
    <React.Fragment>
      <CustomButton
        variant="contained"
        color="primary"
        onClick={handleClickOpen}
      >
        Schedule Demo
      </CustomButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Schedule a Demo</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit} className={classes.form}>
            <TextField
              variant="outlined"
              label="Name"
              name="name"
              value={formValues.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              required
              size="small"
            />
            <TextField
              variant="outlined"
              label="Agency Name"
              name="agency"
              value={formValues.agency}
              onChange={handleChange}
              error={!!errors.agency}
              helperText={errors.agency}
              required
              size="small"
            />
            <TextField
              variant="outlined"
              label="Email"
              name="email"
              value={formValues.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              required
              size="small"
            />
            <TextField
              variant="outlined"
              label="Phone Number"
              name="phone"
              value={formValues.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
              size="small"
            />
            <TextField
              variant="outlined"
              label="Date"
              name="date"
              value={formValues.date}
              onChange={handleChange}
              error={!!errors.date}
              helperText={errors.date}
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />
            <TextField
              variant="outlined"
              label="time"
              name="time"
              value={formValues.time}
              onChange={handleChange}
              error={!!errors.time}
              helperText={errors.time}
              type="time"
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />
            <TextField
              label="How may we help you?"
              variant="outlined"
              multiline
              rows={4}
              fullWidth
            />
          </form>
        </DialogContent>
        <DialogActions
          style={{ paddingRight: "1.5rem", paddingBottom: "1rem" }}
        >
          <Button onClick={handleClose}>Cancel</Button>
          <CustomButton onClick={handleSubmit}>Submit</CustomButton>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default ScheduleDemo;
