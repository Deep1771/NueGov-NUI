const { Napi_server } = Cypress.env();

Cypress.Commands.add("roleDetail", (groupName, entityData) => {
  cy.intercept({
    url: `${Napi_server}/api/metadata/NueGov/Admin?groupname=Role`,
    method: "GET",
  }).as("roleMetadata");
  cy.get('[testid="cp-create"]').click();
  cy.wait("@roleMetadata", { timeout: 10000 }).then(({ response }) => {
    expect(response.statusCode).to.eq(200);
  });
  cy.fixture("api_responses/RoleMetadata.json").then((roleMetadata) => {
    let roleTopLevelMetadata = roleMetadata.sys_entityAttributes.sys_topLevel;
    roleTopLevelMetadata.forEach((field) => {
      cy.directives(groupName, field, entityData);
    });
  });
});

Cypress.Commands.add("rolePermission", (groupName, field, entityData) => {
  if (entityData.features) {
    cy.roleFeaturePermission(entityData.features);
  }
  if (entityData.modulePermission) {
    cy.roleModuleEntityPermission(entityData.modulePermission);
  }
});

Cypress.Commands.add("roleFeaturePermission", (features) => {
  features.forEach((feature) => {
    cy.get(
      "div.hide_scroll >div > div > div > div > div:nth-child(2) > div > div:nth-child(2) > div > div"
    ).then((body) => {
      if (body.find(`[testid="${feature}-allow-modification"]`).length > 0) {
        cy.get(`[testid="${feature}-activate"]`, { timeout: 8000 }).within(
          () => {
            cy.get("input")
              .check({
                animationDistanceThreshold: 20,
              })
              .should("be.checked");
          }
        );
        cy.get(`[testid="save"]`, { timeout: 8000 }).click();
      } else {
        cy.get(`[testid="${feature}-activate"]`, { timeout: 8000 }).within(
          () => {
            cy.get("input")
              .check({
                animationDistanceThreshold: 20,
              })
              .should("be.checked");
          }
        );
      }
    });
  });
});

Cypress.Commands.add("roleModuleEntityPermission", (modulePermission) => {
  modulePermission.forEach((permission) => {
    cy.get(`[testid="module-tree-${permission.moduleName}"]`, {
      timeout: 10000,
    })
      .scrollIntoView()
      .click();
    permission?.entities?.forEach((ep) => {
      cy.get('[testid="entity-card-' + ep.entityName + '"]').within(() => {
        cy.get('[testid="entity-modify"]', { timeout: 10000 }).click();
      });
      if (ep.entityType == "Approval") {
        cy.get('[testid="approver"]').click();
        cy.get('[testid="select"]').click();
      }
      cy.get(`[testid="entity-card-${ep.entityName}"]`, {
        timeout: 8000,
      }).click();
      cy.get('[testid="action-write"]', { timeout: 10000 })
        .scrollIntoView()
        .check({
          animationDistanceThreshold: 20,
        });
      if (ep.features) {
        ep.features.forEach((feature) => {
          cy.get(`[testid="feature-acess-${feature}"]`, { timeout: 8000 })
            .scrollIntoView()
            .within(() => {
              cy.get("input")
                .check({
                  animationDistanceThreshold: 20,
                })
                .should("be.checked");
            });
        });
      }
      cy.get('[testid="select-write-all"]', { timeout: 8000 })
        .should("be.enabled")
        .scrollIntoView()
        .check({
          animationDistanceThreshold: 20,
        });
      if (ep.components) {
        cy.get(`[testid="tabs-CL"]`, { timeout: 8000 })
          .should("have.text", "Components")
          .click();
        ep.components.forEach((component) => {
          cy.get(`[testid="section-${component.componentName}-write"]`)
            .scrollIntoView()
            .check({
              animationDistanceThreshold: 20,
            })
            .should("be.checked");
        });
      }
      cy.get('[testid="save"]').should("be.enabled").click();
    });
  });
});
