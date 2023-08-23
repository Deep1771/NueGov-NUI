import React, { lazy, Suspense } from "react";
import { Route, Switch } from "react-router-dom";
import { ProtectedRoute } from "./protected_route";
import { GlobalFactory } from "utils/services/factory_services";
import { retry } from "utils/services/helper_services/loader";
import {
  ErrorFallback,
  PageNotFound,
  BubbleLoader,
} from "components/helper_components/";
import { ForgotPwd, Login, ResetPwd, Waze, Wzdx } from "access";
import { Access } from "access_new";
import { PublicAccess } from "access_new/public_access";
import Signin from "access_new/login_page/";
import About from "access_new/landing_page/nuegov_landing_page/about";

import { NueAssistSummaryScreen } from "nueassist/screens/summary_screen";
import { NueGovSummaryScreen } from "nuegov/screens/summary_screen";

import {
  ActionItems,
  Calendar,
  FileManager,
  Dashboard,
  ImportCsv,
} from "containers/feature_containers";

import { SystemCalendar } from "components/system_components";
import { ControlPanel, ProfilePage } from "containers/user_containers";
import { Trigger, TriggerSummary } from "containers/extension_containers";
import DetailContainer from "nueassist/containers/detail_container";

//! DO NOT REMOVE THIS ==> Lingeshwar
// //Access Pages
// const ForgotPwd = lazy(() => retry(() => import("access/forgot_pwd")));
// const Login = lazy(() => retry(() => import("access/login")));
// const ResetPwd = lazy(() => retry(() => import("access/reset_pwd")));
// //Screens
// const SummaryScreen = lazy(() => retry(() => import("screens/summary_screen")));
// //Features
// const ActionItems = lazy(() =>
//   retry(() => import("containers/feature_containers/actionItems"))
// );
// const Calendar = lazy(() =>
//   retry(() => import("containers/feature_containers/calendar"))
// );
// const FileManager = lazy(() =>
//   retry(() => import("containers/feature_containers/file_manager"))
// );
// const Dashboard = lazy(() =>
//   retry(() => import("containers/feature_containers/dashboard_new"))
// );
// const ImportCsv = lazy(() =>
//   retry(() => import("containers/feature_containers/import_csv"))
// );
// //User Containers
// const ControlPanel = lazy(() =>
//   retry(() => import("containers/user_containers/control_panel"))
// );
// const ProfilePage = lazy(() =>
//   retry(() => import("containers/user_containers/profile_page"))
// );
// const Trigger = lazy(() =>
//   retry(() => import("containers/extension_containers/trigger"))
// );

export const AppRouter = () => {
  const { getBusinessType } = GlobalFactory();
  const businessType = getBusinessType();
  let applicationTitle = sessionStorage.getItem("applicationTitle");
  document.title = !!applicationTitle
    ? applicationTitle
    : businessType == "NUEASSIST"
    ? "NUEASSIST"
    : "NUEGOV";
  const SummaryScreen =
    businessType == "NUEASSIST" ? NueAssistSummaryScreen : NueGovSummaryScreen;

  const includesSideNav = businessType === "NUEASSIST" ? false : true;

  return (
    <>
      <Switch>
        {/* <Route exact path="/" component={Login} /> */}
        <Route exact path="/" component={Access} />
        <Route exact path="/forgot_pwd" component={ForgotPwd} />
        <Route exact path="/resetpwd/:token" component={ResetPwd} />
        <Route exact path="/waze" component={Waze} />
        <Route exact path="/wzdx" component={Wzdx} />
        {/* <Route exact path="/landing" component={Access} /> */}
        <Route exact path="/signin" component={Signin} />
        <Route exact path="/About" component={About} />
        <Route
          exact
          path="/publicRole/:agencyname/:uniqueId"
          component={PublicAccess}
        />

        <ProtectedRoute
          exact
          path="/app/calendar"
          includesNav={true}
          includesSideNav={false}
          component={SystemCalendar}
        />
        <ProtectedRoute
          exact
          path="/app/nuecalendar"
          includesNav={true}
          includesSideNav={false}
          component={SystemCalendar}
        />
        <ProtectedRoute
          exact
          path="/app/admin_panel/:entityname?/:mode?/:id?"
          includesNav={true}
          includesSideNav={false}
          component={ControlPanel}
        />
        <ProtectedRoute
          exact
          path="/:app/summary/:appname?/:modulename?/:entityname?/:mode?/:id?"
          includesNav={true}
          includesSideNav={includesSideNav}
          component={SummaryScreen}
        />
        <ProtectedRoute
          exact
          path="/:app/detail/:appname?/:modulename?/:entityname?/:mode?/:id?"
          includesNav={true}
          includesSideNav={false}
          component={DetailContainer}
        />
        <ProtectedRoute
          exact
          path="/app/profile_page"
          includesNav={true}
          includesSideNav={false}
          component={ProfilePage}
        />
        <ProtectedRoute
          exact
          path="/app/dashboard/:chartbuilder?/:mode?/:id?"
          includesNav={true}
          includesSideNav={false}
          component={Dashboard}
        />
        <ProtectedRoute
          exact
          path="/app/file_manager"
          includesNav={true}
          includesSideNav={false}
          component={FileManager}
        />
        <ProtectedRoute
          exact
          path="/app/import/:type?/:id?"
          includesNav={true}
          includesSideNav={false}
          component={ImportCsv}
        />
        <ProtectedRoute
          exact
          path="/app/actionitem"
          includesNav={true}
          includesSideNav={includesSideNav}
          component={ActionItems}
        />
        <ProtectedRoute
          exact
          path="/app/trigger"
          includesNav={true}
          includesSideNav={false}
          component={TriggerSummary}
        />
        <ProtectedRoute
          path="/error/:slug?"
          includesNav={true}
          includesSideNav={includesSideNav}
          component={ErrorFallback}
        />
        <Route path="*" component={PageNotFound} />
      </Switch>
    </>
  );
};

export default AppRouter;
