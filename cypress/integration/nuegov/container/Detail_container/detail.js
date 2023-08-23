const { Napi_server } = Cypress.env();
Cypress.Commands.add(
  "detailPageFlow",
  (groupName, friendlyName, entityData) => {
    cy.newData(groupName);
    cy.wait(3000);
    cy.fixture("api_responses/activepresetData").then((activepreset) => {
      for (let i = 0; i < activepreset.length; i++) {
        let tlMetadata =
          activepreset[i].templates[0].template.sys_entityAttributes
            .sys_topLevel;
        let relationEntityMetadata =
          activepreset[i]?.templates[0]?.template?.sys_entityAttributes
            ?.sys_entityRelationships;
        if (activepreset[i].groupName == groupName) {
          cy.get('[testid="detailPage-' + friendlyName + '"]', {
            timeout: 15000,
          }).should("be.visible");
          tlMetadata.forEach((field) => {
            cy.directives(groupName, field, entityData);
          });
          if (relationEntityMetadata) {
            relationEntityMetadata.forEach((metadata) => {
              if (entityData.quickFlow && metadata.quickFlow == true) {
                let relationData = entityData.quickFlow;
                relationData.forEach((data) => {
                  cy.quickFlow(entityData, metadata, data);
                });
              }
            });
          }
        }
      }
    });
  }
);

Cypress.Commands.add(
  "quickFlow",
  (parentData, relationMetadata, relationData) => {
    const { entityName, moduleName, appName } = relationMetadata;
    cy.intercept({
      url: `${Napi_server}/api/entities/${parentData.appName}/${parentData.moduleName}/${parentData.entityGroupName}/`,
      method: "POST",
    }).as(`${parentData.entityGroupName}-Data`);
    cy.intercept({
      url: `${Napi_server}/api/metadata/${appName}/${moduleName}?groupname=${entityName}`,
      method: "GET",
    }).as(`${entityName}-metadata`);
    cy.intercept({
      url: `${Napi_server}/api/entities/${appName}/${moduleName}/${entityName}/`,
      method: "POST",
    }).as(`${entityName}-dataSave`);
    if (relationData.entityName == entityName) {
      cy.get(`[testid="detailPage-qf-dropdown"]`, { timeout: 10000 }).click();
      cy.get(`[testid="${relationMetadata.relationButtons[0].title}"]`, {
        timeout: 10000,
      }).click();
      cy.wait(`@${parentData.entityGroupName}-Data`).then(({ response }) => {
        expect(response.statusCode).to.eq(200);
        cy.writeFile(
          `cypress/fixtures/api_responses/created${parentData.entityGroupName}Data.json`,
          response.body
        );
      });
      cy.wait(`@${entityName}-metadata`).then(({ response }) => {
        cy.writeFile(
          `cypress/fixtures/api_responses/${entityName}-metadata.json`,
          response.body
        );
        expect(response.statusCode).to.eq(200);
      });
      cy.fixture(`api_responses/${entityName}-metadata.json`, {
        timeout: 20000,
      }).then((relationEntityMetadata) => {
        let quickFlowMetadata =
          relationEntityMetadata.sys_entityAttributes.sys_topLevel;
        quickFlowMetadata.forEach((field) => {
          cy.directives(entityName, field, relationData);
        });
        cy.get(`[testid="${entityName}-detailPage-save"]`, { timeout: 15000 })
          .scrollIntoView()
          .click();
        cy.wait(`@${entityName}-dataSave`).then(({ response }) => {
          expect(response.statusCode).to.eq(200);
          cy.writeFile(
            `cypress/fixtures/api_responses/created${entityName}Data.json`,
            response.body
          );
        });
      });
    }
  }
);

Cypress.Commands.add("componentFlow", (compName, groupName, entityData) => {
  cy.get(`[testid="${groupName}-COMPONENT"]`).click();
  cy.get(`[testid=${groupName}-addComponents]`).click();
  cy.get(`[testid=${groupName}-${compName}]`).click();
  cy.get('[testid="comp-select"]').click();
});
