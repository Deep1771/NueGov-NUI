export const updateCurrentTab = ({ navbarLinks, template }) => {
  let { payload } = template?.sys_components?.[0]?.sys_entityAttributes || {};
  let { appName, moduleName, entityName, urlPaths = [] } = payload || {};
  let selected = undefined;
  if (navbarLinks?.length) {
    navbarLinks.map((eachNavBar) => {
      let selectedFound = false;
      let initialMatch =
        appName === eachNavBar?.entityInfo?.appname &&
        moduleName === eachNavBar?.entityInfo?.modulename &&
        entityName === eachNavBar?.entityInfo?.entityname;
      if (urlPaths?.length) {
        selectedFound =
          initialMatch &&
          urlPaths?.find((url) => url?.value === eachNavBar?.filter?.PAGELAYOUT)
            ? true
            : false;
        if (selectedFound) selected = eachNavBar;

        if (selected === undefined) {
          let subMenus = eachNavBar?.subMenus || undefined;
          if (subMenus?.length) {
            subMenus.map((eachSubMenu) => {
              if (!selectedFound) {
                selectedFound =
                  appName === eachSubMenu?.entityInfo?.appname &&
                  moduleName === eachSubMenu?.entityInfo?.modulename &&
                  entityName === eachSubMenu?.entityInfo?.entityname &&
                  urlPaths?.find(
                    (url) => url?.value === eachSubMenu?.filter?.PAGELAYOUT
                  )
                    ? true
                    : false;
              }
            });
          }
          if (selectedFound) selected = eachNavBar;
        }
      } else if (selected === undefined && !selectedFound) {
        selected = initialMatch ? eachNavBar : undefined;
      }
    });
  }
  if (selected) sessionStorage.setItem("currentTab", JSON.stringify(selected));
};
