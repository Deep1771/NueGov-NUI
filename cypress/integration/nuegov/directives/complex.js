const { Napi_server } = Cypress.env();

//  Latlong directive
Cypress.Commands.add("latlong", (groupName, field, entityData) => {
  if (entityData[field.name]) {
    cy.get(
      "#root > div > div > div> div:nth-child(1) > div > div> div > div > div:nth-child(2) > div > div > div:nth-child(4) > div > div > div > div > div > div > div.system-components > div > div:nth-child(4) > button",
      { timeout: 10000 }
    )
      .scrollIntoView()
      .click();
    cy.wait(3000);
  }
});

// Inline Documents
Cypress.Commands.add("uploadDocument", (name, description) => {
  const image = "Aurora.jpg";
  cy.get('[testid="doc-upload"]').click();

  cy.get('[testid="doc-attach"]')
    .attachFile(image)
    .then(() => {
      cy.get('[testid="doc-download"]').should("be.visible");
    });
  cy.get('[testid="doc-name"]')
    .type(name)
    .then(() => {
      cy.get('[testid="doc-name"]').should("have.value", name);
    });
  cy.get('[testid="doc-description"]')
    .type(description)
    .then(() => {
      cy.get('[testid="doc-description"]').should("have.value", description);
    });
  cy.get('[testid="doc-save"]').click();
});

// Reference directive Search
Cypress.Commands.add("referenceSearch", (groupName, field, entityData) => {
  const { appName, moduleName, entityName, name } = field;
  cy.intercept({
    url: `${Napi_server}/api/entities-count/${appName}/${moduleName}/${entityName}`,
    method: "GET",
  }).as(`${entityName}-entitycount`);
  cy.intercept({
    url: `${Napi_server}/api/entities-count/NueGov/Admin/Role?agencyuser.id=***`,
    method: "GET",
  }).as(`rolesdata`);
  if (entityData[name]) {
    cy.get(`[testid="${groupName}-${field.name}"]`, { timeout: 15000 }).within(
      () => {
        cy.get(`[testid="${name}-search"]`).scrollIntoView().click();
      }
    );
    if (entityName == "Role" && entityData.entityName == "User")
      cy.wait("@rolesdata", { timeout: 15000 }).then(({ response }) => {
        expect(response.statusCode).to.eq(200);
      });
    else
      cy.wait(`@${field.entityName}-entitycount`, { timeout: 15000 }).then(
        ({ response }) => {
          expect(response.statusCode).to.eq(200);
        }
      );
    if (entityData[name].fieldToSearch) {
      cy.contextASF(field, entityData);
      cy.wait(3000);
    }
    cy.get(`[id="summary-card-${entityData[name].id}"]`, {
      timeout: 15000,
    })
      .scrollIntoView()
      .should("be.visible")
      .click({ force: true });
    cy.get(`[testid="contextMenu-select"]`, { timeout: 10000 }).click();
  }
});
//multiReference add
Cypress.Commands.add("multireferenceSearch", (groupName, field, entityData) => {
  const { appName, moduleName, entityName, name } = field;
  cy.intercept({
    url: `${Napi_server}/api/entities/${appName}/${moduleName}/${entityName}/?**`,
    method: "GET",
  }).as(`${entityName}-entitycount`);
  if (entityData[name]) {
    cy.get(`[testid="${name}-reference-add"]`, { timeout: 1000 })
      .scrollIntoView()
      .click();
    cy.wait(`@${entityName}-entitycount`).then(({ response }) => {
      expect(response.statusCode).to.eq(200);
    });
    entityData[name]?.forEach((e) => {
      cy.get(`[testid="${entityName}-context-asf"]`, {
        timeout: 20000,
      }).click();
      cy.get(`[testid="asf-${e.fieldToSearch}"]`, { timeout: 10000 })
        .scrollIntoView()
        .type(e.value);
      cy.get(`[testid="asf-applySearch"]`, { timeout: 5000 })
        .scrollIntoView()
        .click();
      cy.get(
        "#context-c > div > div > div:nth-child(2) > div:nth-child(1) > div",
        { timeout: 10000 }
      ).then(($el) => {
        if (Cypress.dom.isScrollable($el))
          cy.get(
            "#context-c > div > div > div:nth-child(2) > div:nth-child(1) > div",
            { timeout: 10000 }
          ).scrollTo("bottom");
        cy.waitUntil(() =>
          cy
            .get(`[testid="summary-card-${entityName}-${e.id}-checkbox"]`, {
              timeout: 18000,
            })
            .scrollIntoView()
            .then(($el) => $el.click())
        );
      });
    });
    cy.get(`[testid="contextMenu-select"]`, { timeout: 10000 }).click();
  }
});

// function for advance search in context summary (single field)
Cypress.Commands.add("contextASF", (field, entityData) => {
  const { appName, moduleName, entityName, name } = field;
  cy.intercept({
    url: `${Napi_server}/api/entities-count/${appName}/${moduleName}/${entityName}?${entityData[name].fieldToSearch}=***`,
    method: "GET",
  }).as(`${entityName}-context-asf-search`);
  cy.get(`[testid="${entityName}-context-asf"]`, {
    timeout: 15000,
  }).click();
  cy.get(`[testid="asf-${entityData[name].fieldToSearch}"]`, {
    timeout: 10000,
  }).type(entityData[field.name].value);
  cy.get('[testid="asf-applySearch"]').click();
  cy.wait(`@${entityName}-context-asf-search`).then(({ response }) => {
    expect(response.statusCode).to.eq(200);
  });
});

//CAMERASTREAM directive not completed
Cypress.Commands.add("cameraStream", (groupName, field, entityData) => {
  if (entityData[field.name]) {
    cy.get(`[testid="${groupName}-${field.name}"]`).within(() => {
      cy.get(`[testid="${field.name}-add"]`).click();
    });
  }
});
//PAIREDLIST Directive
Cypress.Commands.add("pairedList", (groupName, field, entityData) => {
  const { name, labels, type } = field;
  if (entityData[field.name]) {
    cy.get(`[testid="${groupName}-${name}"]`, { timeout: 10000 })
      .scrollIntoView()
      .within(() => {
        cy.get(`[testid="${name}-${labels.name}"]`, {
          timeout: 10000,
        }).type(entityData[name][labels.name]);
      })
      .then(() => {
        cy.get("li").contains(entityData[name][labels.name]).click();
      });
    cy.get(`[testid="${groupName}-${name}"]`, { timeout: 3000 })
      .scrollIntoView()
      .within(() => {
        cy.get(`[testid="${name}-${labels.child.name}"]`, {
          timeout: 6000,
        }).type(entityData[field.name][field.labels.child.name]);
      })
      .then(() => {
        cy.get("li")
          .contains(entityData[field.name][field.labels.child.name])
          .click();
      })
      .then(() => {
        cy.get(`[testid="${name}-${labels.name}"]`, {
          timeout: 3000,
        }).within(() => {
          cy.get("input").should("have.value", entityData[name][labels.name]);
        });
        cy.get(`[testid="${name}-${labels.child.name}"]`, {
          timeout: 3000,
        }).within(() => {
          cy.get("input").should(
            "have.value",
            entityData[field.name][field.labels.child.name]
          );
        });
      });
  }
});
