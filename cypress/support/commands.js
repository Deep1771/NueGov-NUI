import "@4tw/cypress-drag-drop";
import "cypress-wait-until";
import "cypress-file-upload";

const { nuegovHost, nueassistHost, Napi_server } = Cypress.env();

// Save cache
let LOCAL_STORAGE_MEMORY = {};
Cypress.Commands.add("saveLocalStorageCache", () => {
  Object.keys(sessionStorage).forEach((key) => {
    LOCAL_STORAGE_MEMORY[key] = sessionStorage[key];
  });
});

// restore cache
Cypress.Commands.add("restoreLocalStorageCache", () => {
  Object.keys(LOCAL_STORAGE_MEMORY).forEach((key) => {
    sessionStorage.setItem(key, LOCAL_STORAGE_MEMORY[key]);
  });
});

//login function for both nuegov and nueassist
Cypress.Commands.add("login", (bussiness, username, password) => {
  if (bussiness == "nueAssist") {
    cy.visit(nueassistHost);
  } else if (bussiness == "nuegov") cy.visit(nuegovHost);
  cy.request({
    url: `${Napi_server}/user/signin`,
    method: "POST",
    body: {
      username,
      password,
    },
  })
    .as("login")
    .its("body")
    .then((response) => {
      cy.writeFile(
        "cypress/fixtures/api_responses/UserResp.json",
        response,
        "binary"
      );
    });
  // cy.location("protocol").should("eq", "http:");
  cy.title().should("eq", "NUEGOV");
  cy.intercept({
    method: "POST",
    url: `${Napi_server}/user/signin`,
  }).as("login");
  cy.get('[testid="lg-username"]').type(username);
  cy.get('[testid="lg-password"]').type(`${password}{Enter}`);
  cy.wait("@login");
  cy.url().should("include", "app/dashboard");
  cy.screenshot("after-login");
});

//function to choose admin panel entity
Cypress.Commands.add("controlPanelEntity", (entity) => {
  cy.intercept({
    url: `${Napi_server}/api/metadata/NueGov/Admin?groupname=${entity}`,
    method: "GET",
  }).as(`${entity}EntityRoute`);
  cy.intercept({
    url: `${Napi_server}/api/entities/NueGov/Admin/${entity}/**`,
    method: "GET",
  }).as(`${entity}-entityData`);
  cy.get('[testid="nav-my-info"]', { timeout: 10000 }).click({ force: true });
  cy.get('[testid="control-panel"]', { timeout: 10000 }).click();
  cy.get('[testid="cp-nav-' + entity + '"]', { timeout: 10000 }).click();
  cy.wait(`@${entity}EntityRoute`).then((xhr) => {
    cy.writeFile(
      `cypress/fixtures/api_responses/${entity}Metadata.json`,
      xhr?.response?.body
    );
  });
  cy.wait(`@${entity}-entityData`, { timeout: 15000 });
});

//function to save admin panel detail page
Cypress.Commands.add("controlPanelDetailpageSave", (entityName) => {
  cy.intercept({
    url: `${Napi_server}/api/entities/NueGov/Admin/${entityName}/`,
    method: "POST",
  }).as(`${entityName}-DataSave`);
  cy.intercept({
    url: `${Napi_server}/api/entities-count/NueGov/Admin/${entityName}`,
    method: "GET",
  }).as(`${entityName}-count`);
  cy.get(`[testid="${entityName}-detailPage-save"]`, { timeout: 8000 }).click();
  cy.wait(`@${entityName}-DataSave`).then((xhr) => {
    const response = xhr.response.body;
    const templateID = response.id;
    cy.writeFile(
      `cypress/fixtures/api_responses/created${entityName}DataId.json`,
      {
        dataId: templateID,
      }
    );
    cy.writeFile(
      `cypress/fixtures/api_responses/created${entityName}Data.json`,
      response
    );
  });
  cy.wait(`@${entityName}-count`);
  cy.fixture(`api_responses/created${entityName}DataId.json`).then((dataId) => {
    cy.get('[testid="cp-card-' + dataId.dataId + '"]', {
      timeout: 10000,
    }).should("be.visible");
  });
});

//function for stamp agency field
Cypress.Commands.add("stampAgency", (agencyName, agencyId) => {
  cy.intercept({
    url: `${Napi_server}/api/metadata?appname=NueGov&modulename=Admin&groupname=Agency`,
    method: "GET",
  }).as("stampAgency");
  cy.intercept({
    url: `${Napi_server}/api/entities-count/NueGov/Admin/Agency?***`,
    method: "GET",
  }).as("agencySearchedResults");
  cy.get('[testid="stampagency-search"]').click();
  cy.wait("@stampAgency");
  cy.get('[testid="Agency-context-asf"]').click();
  cy.get('[testid="asf-Name"]').type(agencyName);
  cy.get('[testid="asf-applySearch"]').click();
  cy.wait("@agencySearchedResults");
  cy.waitUntil(() =>
    cy
      .get('[testid="summary-card-Agency-' + agencyId + '"]')
      .scrollIntoView()
      .should("be.visible")
      .then(($el) => $el.click())
  );
  cy.get('[testid="contextMenu-select"]').click();
});

//function for summerView
Cypress.Commands.add("summaryView", () => {
  cy.fixture("api_responses/UserResp.json").then((userresp) => {
    const { userData, token } = userresp;
    let presetid = userData?.userDefaults?.preset?._id;
    cy.intercept({
      url: `${Napi_server}/api/metadata?presetid=${presetid}`,
      method: "GET",
    }).as("metadataRoute");
    cy.get('[testid="nav-360-view"]', {
      timeout: 3000,
    }).click();
    cy.url().should("include", "app/summary/");
    cy.contains("360° View").should("be.visible");
    cy.wait("@metadataRoute").then((xhr) => {
      const res = xhr.response.body;
      cy.writeFile(
        "cypress/fixtures/api_responses/defaultPresetData.json",
        res
      );
      res.forEach((eachTemplateGroup) => {
        cy.writeFile(
          `cypress/fixtures/api_responses/${eachTemplateGroup.groupName}-templateGroup.json`,
          eachTemplateGroup
        );
      });
    });
  });
});

//function to save summary detail page
Cypress.Commands.add("summaryDetailpageSave", (entityDetail) => {
  const { appName, moduleName, entityGroupName } = entityDetail;
  cy.intercept({
    url: `${Napi_server}/api/entities/${appName}/${moduleName}/${entityGroupName}/`,
    method: "POST",
  }).as(`${entityGroupName}-DataSave`);
  cy.intercept({
    url: `${Napi_server}/api/entities-count/${appName}/${moduleName}/${entityGroupName}/`,
  }).as(`${entityGroupName}-entitycount`);
  cy.get('[testid="' + entityGroupName + '-detailPage-save"]', {
    timeout: 10000,
  }).click();
  cy.wait(`@${entityGroupName}-DataSave`).then((xhr) => {
    const response = xhr.response.body;
    const templateID = response.id;
    cy.writeFile(
      `cypress/fixtures/api_responses/created${entityGroupName}DataId.json`,
      {
        dataId: templateID,
      }
    );
    cy.writeFile(
      `cypress/fixtures/api_responses/created${entityGroupName}Data.json`,
      response
    );
  });
  // cy.wait(`@${entityName}-entitycount`);
  cy.fixture(`api_responses/created${entityGroupName}DataId.json`).then(
    (dataId) => {
      cy.get(`[testid="summary-card-${entityGroupName}-${dataId.dataId}"]`, {
        timeout: 15000,
      })
        .scrollIntoView()
        .should("be.visible");
    }
  );
});

//delete functionality to controlpanel data
Cypress.Commands.add("controlPanelDataDelete", (entityDetail, dataId) => {
  let { appName, moduleName, entityName } = entityDetail;
  cy.intercept({
    url: `${Napi_server}/api/entities/${appName}/${moduleName}/${entityName}/${dataId}`,
    method: "DELETE",
  }).as(`${entityName}-dataDelete`);
  cy.intercept({
    url: `${Napi_server}/api/entities-count/${appName}/${moduleName}/${entityName}`,
    method: "GET",
  }).as(`${entityName}-dataAfterDelete`);
  cy.get('[testid="cp-card-' + dataId + '"]', { timeout: 10000 })
    .trigger("mouseover")
    .within(() => {
      cy.get('[testid="delete"]').click();
    });
  cy.get('[testid="delete-save"]', { timeout: 8000 }).click();
  cy.wait(`@${entityName}-dataDelete`);
  cy.get('[testid="cp-card-' + dataId + '"]').should("not.exist");
  cy.wait(`@${entityName}-dataAfterDelete`);
});

//logout function
Cypress.Commands.add("logout", () => {
  cy.get('[testid="nav-my-info"]').click();
  cy.get('[testid="log-out"]').click();
  cy.url().should("include", "/");
  cy.screenshot();
});
