const { Napi_server, nuegovHost } = Cypress.env();

// create new data
Cypress.Commands.add("newData", () => {
  // cy.intercept({
  //   method: "GET",
  //   url: `${Napi_server}/api/entities-count/NJAdmin/NJ-SysTools/Helpers?sys_templateGroupName.sys_groupName=${entityName}&isFeature=No&skip=0&limit=1`,
  // }).as("openDetailPage");
  cy.url().should("include", "drawer=true");
  cy.get('[testid="summary-new"]').click();
  // cy.wait("@openDetailPage");
  // cy.url()
  //   .should("include", `${entityName}/new?`)
  //   .then(() => {
  //     cy.get('[role="tablist"]').should("be.visible");
  //   });
});

// Drawer menu close
Cypress.Commands.add("drawerMenuClose", () => {
  cy.get('[testid="summary-drawer"]')
    .click()
    .then(() => {
      cy.url().should("include", "drawer=false");
    });
});

// Options
Cypress.Commands.add("summaryOption", () => {
  if (cy.url().should("include", "drawer=true")) {
    cy.get('[testid="summary-options"]').click();
  }
});

// expandAll & CloseAll
Cypress.Commands.add("expandAndClose", () => {
  cy.get('[testid="summary-list"]').then((body) => {
    if (body.find('[testid="Expand All"]').length > 0) {
      cy.get('[testid="Expand All"]').click().should("have.text", "Show Less ");
    } else if (body.find('[testid="Show Less"]').length > 0) {
      cy.get('[testid="Show Less"]').click();
    }
  });
});

// global search
const searchBar =
  "#root > div > div > div> div:nth-child(1) > div > div > div > div > div > div > div:nth-child(1) > div > div:nth-child(2) > div > div > div > div > input";
Cypress.Commands.add("globalSearch", (value) => {
  cy.intercept({
    method: "GET",
    url: `${Napi_server}/api/entities/**`,
  }).as("searchRequest");
  cy.get(searchBar).type(value);
  cy.get('[testid="summary-globalSearch-searchButton"]').click();
  cy.wait("@searchRequest").then(() => {
    cy.get(searchBar).should("have.value", value);
  });
});

// entity dropdown & select
Cypress.Commands.add("entitySelect", (entityName) => {
  cy.get('[testid="entity-select-menu"]').click({ force: true });
  cy.intercept({
    method: "GET",
    url: `${Napi_server}/api/entities-count/**`,
  }).as("entityCount");
  cy.get(`[testid="entity-select-${entityName}"]`).click();
  cy.wait("@entityCount");
});

// import
Cypress.Commands.add("summaryImport", () => {
  cy.get('[testid="summary-import"]').click({ force: true });
  cy.url().should("eq", `${nuegovHost}/app/import?summary=true`);
});

// export
Cypress.Commands.add("summaryExport", () => {
  cy.get('[testid="summary-export"]').click({ force: true });
  cy.get('[testid="export-title"]').should("have.text", " Export ");
});

Cypress.Commands.add("summaryContainerDataDelete", (entityDetail, dataId) => {
  const { appName, moduleName, entityGroupName } = entityDetail;
  cy.intercept({
    url: `${Napi_server}/api/entities/${appName}/${moduleName}/${entityGroupName}/${dataId}`,
    method: "DELETE",
  }).as(`${entityGroupName}-dataDelete`);
  cy.get(`[testid="summary-card-${entityGroupName}-${dataId}"]`, {
    timeout: 15000,
  })
    .scrollIntoView()
    .trigger("mouseover")
    .within(() => {
      cy.get(`[testid="delete"]`, {
        timeout: 15000,
      }).click();
    });
  cy.get(`[testid="delete-save"]`).click();
  cy.wait(`@${entityGroupName}-dataDelete`).then(({ response }) => {
    expect(response.statusCode).to.eq(200);
  });
  cy.get(`[testid="summary-card-${entityGroupName}-${dataId}"]`).should(
    "not.exist"
  );
});
