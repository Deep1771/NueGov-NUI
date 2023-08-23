import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Menu,
  MenuItem,
  IconButton,
  Popover,
} from "@material-ui/core/";
import {
  Menu as MenuIcon,
  ExpandMore as ExpandMoreIcon,
} from "@material-ui/icons";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { styled } from "@material-ui/styles";
import "../components/Navbar.css";
import { createMuiTheme, ThemeProvider } from "@material-ui/core";

const theme = createMuiTheme({
  overrides: {
    MuiButton: {
      root: {
        borderRadius: "8px",
        fontWeight: "bold",
      },
      text: {
        borderRadius: "2rem",
        color: "#212121",
        fontFamily: "Open Sans",
        fontWeight: "400",
        fontSize: "1rem",
        textTransform: "none",
        "&:hover": {
          fontWeight: "500",
          color: "#0176d3",
        },
      },
    },
  },
});

const CustomButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#5577ff",
  textTransform: "none",
  borderRadius: "50px",
  fontWeight: "500",
  color: "#000000",
  boxShadow: "#5577ff 0 10px 20px -10px",
  width: "fit-content",
  padding: "0.5rem 1rem 0.5rem 1rem",
  "&:hover": {
    backgroundColor: "#ff8a65",
  },
}));

const Navbar = () => {
  const history = useHistory();
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorEl1, setAnchorEl1] = useState(null);
  const [anchorEl2, setAnchorEl2] = useState(null);
  const [anchorEl3, setAnchorEl3] = useState(null);

  let { pathname = "/", state: { from = {} } = {} } = history?.location || {};

  const handleOpenNavMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorEl(null);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClick1 = (event) => {
    setAnchorEl1(event.currentTarget);
  };
  const handleClick2 = (event) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClick3 = (event) => {
    setAnchorEl3(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setAnchorEl1(null);
    setAnchorEl2(null);
    setAnchorEl3(null);
  };

  const checkLoginVisibility = () => {
    if (pathname === "/signin") return false;
    else if (from?.pathname?.length > 0) return false;
    else return true;
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="sticky" elevation={2} color="default">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Box sx={{ display: { xs: "flex", md: "flex" }, mr: 1 }}>
              <img
                className="brand_logo"
                src="https://assetgov-icons.s3.us-west-2.amazonaws.com/Brandlogos/nuegov_logo.png"
                alt="Nuegov_logo"
              ></img>
            </Box>
            <Box
              style={{
                display: "flex",
                flexGrow: 1,
                justifyContent: "center",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              {/* <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton> */}
              <Popover
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorEl)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: "flex", md: "none" },
                }}
              >
                <MenuItem color="inherit" onClick={() => history.push("/")}>
                  Home
                </MenuItem>
                {/* <MenuItem color="inherit" aria-controls="menu1" aria-haspopup="true" onClick={handleClick1}  endIcon={<ExpandMoreIcon />}>Solutions</MenuItem> */}
                {/* <MenuItem color="inherit" >Why Nuegov</MenuItem> */}
                {/* <MenuItem color="inherit" aria-controls="menu1" aria-haspopup="true" onClick={handleClick2}  endIcon={<ExpandMoreIcon />}>Resources</MenuItem> */}
                <MenuItem
                  color="inherit"
                  aria-controls="menu1"
                  aria-haspopup="true"
                  onClick={handleClick3}
                  endIcon={<ExpandMoreIcon />}
                >
                  Company
                </MenuItem>
              </Popover>
            </Box>
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: "none", sm: "flex", md: "flex" },
              }}
            >
              <Button
                variant="text"
                color="inherit"
                onClick={() => history.push("/")}
              >
                Home
              </Button>
              {/* <Button color="inherit" aria-controls="menu1" aria-haspopup="true" onClick={handleClick1}  endIcon={<ExpandMoreIcon />}>Solutions</Button> */}
              {/* <Menu
              id="simple-menu1"
              anchorEl={anchorEl1}
              keepMounted
              open={Boolean(anchorEl1)}
              onClose={handleClose}
            > */}
              {/* <MenuItem onClick={() =>{handleClose(); history('/Pshome')}}>Public Safety</MenuItem> */}
              {/* <MenuItem onClick={handleClose}>Transportation</MenuItem> */}
              {/* </Menu> */}
              {/* <Button color="inherit" >Why Nuegov</Button> */}
              {/* <Button color="inherit" aria-controls="menu1" aria-haspopup="true" onClick={handleClick2}  endIcon={<ExpandMoreIcon />}>Resources</Button> */}
              {/* <Menu
              id="simple-menu2"
              anchorEl={anchorEl2}
              keepMounted
              open={Boolean(anchorEl2)}
              onClose={handleClose}
            > */}
              {/* <MenuItem onClick={handleClose}>Blog</MenuItem>
            <MenuItem onClick={handleClose}>Learn</MenuItem>
            <MenuItem onClick={handleClose}>Help Center</MenuItem> */}
              {/* </Menu> */}
              <Button
                variant="text"
                color="inherit"
                aria-controls="menu1"
                aria-haspopup="true"
                onClick={() => {
                  handleClose();
                  history.push("/About");
                }}
                // endIcon={<ExpandMoreIcon />}
              >
                About us
              </Button>
              {/* <Popover
              id="simple-menu3"
              anchorEl={anchorEl3}
              keepMounted
              open={Boolean(anchorEl3)}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              transformOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <MenuItem
                onClick={() => {
                  handleClose();
                  history.push("/About");
                }}
              >
                About us
              </MenuItem>
              <MenuItem onClick={() =>{handleClose(); history('/Newsroom')}}>News Room</MenuItem>
            </Popover> */}
            </Box>
            <Box
              sx={{
                flexGrow: 0,
                display: { xs: "none", sm: "flex", md: "flex" },
              }}
            >
              {checkLoginVisibility() && (
                <CustomButton
                  onClick={() => history.push("/signin")}
                  aria-label="log_in_button"
                  testid="login"
                >
                  Login
                </CustomButton>
              )}
              {/* <Button variant='contained' sx={{borderRadius:"2rem", backgroundColor:"#ffffff", color:"#005da8"}} disableElevation onClick={() => history('/Scheduledemo')}>Try it for Free</Button> */}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </ThemeProvider>
  );
};

export default Navbar;
