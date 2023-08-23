import React, { lazy, Suspense, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import { StateProvider } from "utils/store/contexts";
import { LocationProvider } from "utils/location";
import reducer, { initialState } from "utils/store/reducers";
import { NetworkDetector } from "components/helper_components/";
import AppRouter from "routes";

function App() {
  const isMobile = useMediaQuery({ query: "(max-device-width:600px)" });
  const renderMobileView = () => (
    <Dialog open={isMobile}>
      <DialogTitle>{"For better user Experience"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Switch to our mobile App in either play store or app store
        </DialogContentText>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <a href="https://play.google.com/store/apps/details?id=com.navjoy">
            <img
              src="https://img.icons8.com/color/64/000000/google-play.png"
              height={60}
              width={60}
            />
          </a>
          <a href="https://apps.apple.com/us/app/smartgov/id1422390974?app=itunes&ign-mpt=uo%3D4">
            <img
              src="https://img.icons8.com/color/64/000000/apple-app-store--v1.png"
              height={60}
              width={60}
            />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderDesktopView = () => {
    return (
      <StateProvider initialState={initialState} reducer={reducer}>
        <LocationProvider>
          <div className="viewport">
            <NetworkDetector>
              <AppRouter className="col-flex" />
            </NetworkDetector>
          </div>
        </LocationProvider>
      </StateProvider>
    );
  };

  return isMobile ? renderMobileView() : renderDesktopView();
}

export default App;
