Cypress.Commands.add("section", (groupName, field, entityData) => {
  if (field && field.marker == "start" && entityData[field.name]) {
    cy.get(`[testid="${groupName}-${field.name}"]`).scrollIntoView().click();
  }
});

Cypress.Commands.add("textbox", (groupName, field, entityData) => {
  if (entityData[field.name] && !field?.disable) {
    cy.get(`[testid="${groupName}-${field.name}"]`, { timeout: 10000 }).type(
      entityData[field.name]
    );
    if (field.required == true && !field?.disable) {
      cy.get('[testid="' + groupName + "-" + field.name + '"]').within(() => {
        cy.get("div.system-helpertext", { timeout: 3000 })
          .contains("Required")
          .should("be.visible");
        cy.wait(500);
      });
    }
    if (field.unique == true) {
      cy.get(`[testid="${groupName}-${field.name}"]`).within(() => {
        cy.get("div.system-helpertext", { timeout: 15000 })
          .contains("Checking Availibility..")
          .should("be.visible");
        cy.wait(2000);
      });
    } else if (field.disable == true) {
      cy.get(`[testid="${groupName}-${field.name}"]`).should("be.disabled");
    }
  }
});

Cypress.Commands.add("list", (groupName, field, entityData) => {
  if (entityData[field.name] && !field.disable) {
    cy.get(`[testid="${groupName}-${field.name}"]`, { timeout: 10000 })
      .scrollIntoView()
      .click()
      .then(() => {
        cy.get(`[testid="${field.name}-${entityData[field.name]}"]`, {
          timeout: 10000,
        }).click();
      });
    cy.get('[testid="' + groupName + "-" + field.name + '"]').within(() => {
      cy.get("input").should("have.value", entityData[field.name]);
    });
  } else if (field.disable == true) {
    cy.get('[testid="' + groupName + "-" + field.name + '"]')
      .scrollIntoView()
      .within(() => {
        cy.get('[role="button"]').should("have.attr", "aria-disabled", "true");
      });
  }
});

Cypress.Commands.add("email", (groupName, field, entityData) => {
  if (entityData[field.name] && !field.disable) {
    cy.get(`[testid="${groupName}-${field.name}"]`).type(
      entityData[field.name]
    );
    if (field.required == true) {
      cy.get('[testid="' + groupName + "-" + field.name + '"]').within(() => {
        cy.get("div.system-helpertext", { timeout: 3000 })
          .contains("Required")
          .should("be.visible");
        cy.wait(500);
      });
    } else if (field.unique == true) {
      cy.get('[testid="' + groupName + "-" + field.name + '"]').within(() => {
        cy.get('[testid="' + field.name + '"]').type(entityData[field.name]);
        cy.get("div.system-helpertext", { timeout: 10000 })
          .contains("Checking Availibility..")
          .should("be.visible");
      });
    } else if (field.disable == true) {
      cy.get('[testid="' + groupName + "-" + field.name + '"]').within(() => {
        cy.get('[testid="' + field.name + '"]').should("be.disabled");
      });
    }
  }
});

Cypress.Commands.add("textarea", (groupName, field, entityData) => {
  if (entityData[field.name] && !field.disable) {
    cy.get('[testid="' + groupName + "-" + field.name + '"]').within(() => {
      if (field.required == true) {
        cy.get("div.system-helpertext", { timeout: 3000 })
          .contains("Required")
          .should("be.visible");
      }
      cy.get(`textarea`, { timeout: 8000 }).type(entityData[field.name]);
    });
  }
});

Cypress.Commands.add("password", (groupName, field, entityData) => {
  if (entityData[field.name] && !field.disable) {
    cy.get('[testid="' + groupName + "-" + field.name + '"]').within(() => {
      cy.get(`[testid="${field.name}"]`).clear();
      cy.get('[testid="' + field.name + '"]').type(entityData[field.name]);
      if (field.required == true) {
        cy.get("div.system-helpertext", { timeout: 3000 })
          .contains("Required")
          .should("be.visible");
        cy.wait(1000);
      }
      if (entityData[field.name] && field.disable == true) {
        cy.get(`[testid="${field.name}"]`).should("be.disabled");
      }
    });
  }
});

Cypress.Commands.add("radio", (groupName, field, entityData) => {
  if (entityData[field.name] && !field.disable) {
    cy.get('[testid="' + groupName + "-" + field.name + '"]').within(() => {
      if (field.required == true) {
        cy.get("div.system-helpertext", { timeout: 3000 })
          .contains("Required")
          .should("be.visible");
      }
      cy.get(`[testid="${field.name}-${entityData[field.name]}"]`).click();
    });
  }
});

Cypress.Commands.add("checkbox", (groupName, field, entityData) => {
  if (entityData[field.name] && !field.disable) {
    cy.get('[testid="' + groupName + "-" + field.name + '"]').within(() => {
      if (field.required == true) {
        cy.get("div.system-helpertext", { timeout: 3000 })
          .contains("Required")
          .should("be.visible");
      }
      entityData[field.name].forEach((e) => {
        cy.get(`[testid="${field.name}-${e}"]`).check().should("be.checked");
      });
    });
  }
});
