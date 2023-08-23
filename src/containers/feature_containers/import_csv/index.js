import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import queryString from "query-string";
import { ThemeFactory, UserFactory } from "utils/services/factory_services";
import { ErrorFallback } from "components/helper_components";
import { ContainerWrapper } from "components/wrapper_components";
import { Import, Recents } from "./components";

const useStyles = makeStyles({
  modal: () => ({
    display: "flex",
    width: "100%",
    height: "100%",
    flexDirection: "column",
    contain: "strict",
  }),
  section: () => ({
    display: "flex",
    flex: 1,
    flexDirection: "column",
  }),
});

const ImportCsv = () => {
  //factory services
  let { type, id } = useParams();
  const { getVariantForComponent } = ThemeFactory();
  const { checkGlobalFeatureAccess } = UserFactory();

  const [permissionDenied, setPermissionDenied] = useState(false);
  //styles
  const classes = useStyles(getVariantForComponent("", "primary"));

  //custom vairables
  const queryParams = queryString.parse(useLocation().search);

  useEffect(() => {
    if (!checkGlobalFeatureAccess("Imports")) setPermissionDenied(true);
  }, []);
  return (
    <ContainerWrapper>
      <div className={classes.modal}>
        {permissionDenied && <ErrorFallback slug="permission_denied" />}
        {type === "recents" && <Recents />}
        {type !== "recents" && <Import summary={queryParams.summary} />}
      </div>
    </ContainerWrapper>
  );
};

export default ImportCsv;
