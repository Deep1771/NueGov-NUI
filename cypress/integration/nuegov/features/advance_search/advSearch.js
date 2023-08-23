const { Napi_server } = Cypress.env();

// open advance search
Cypress.Commands.add("openAdvSearch", () => {
  cy.get('[testid="summary-asf"]').click();
  cy.get('[testid="advHeader"]').should("contain", "Advanced Search");
});

// compTypes - TEXT, DATE, RADIO
Cypress.Commands.add("advSearch", (compType, compName, value) => {
  switch (compType) {
    case "TEXT":
      text(compName, value);
      break;
    case "RADIO":
      radio(compName, value);
      break;
  }
});

// advance search filter-name
Cypress.Commands.add("filterName", (value) => {
  cy.get('[testid="asf-filterName"]')
    .type(value)
    .then(() => {
      cy.get('[testid="asf-filterName"]').should("have.value", `${value}`);
      cy.get('[testid="asf-new-filter"]').should("be.visible");
    });
});

// save entity filter
Cypress.Commands.add("saveFilter", (name) => {
  cy.get('[testid="asf-new-filter"]').click();
  cy.get(`[testid="asf-new-filters-${name}"]`).should("be.visible");
});

// apply filter
Cypress.Commands.add("applyFilter", (filterName) => {
  applyAndSearch(filterName);
});

// delete filter
Cypress.Commands.add("deleteFilter", (filterName) => {
  deleteFilter(filterName);
});

// create new filter
Cypress.Commands.add("newAdvFilter", () => {
  cy.get('[testid="asf-createFilter"]')
    .click()
    .then(() => {
      cy.get('[testid="asf-filterName"]').should("have.value", "");
      cy.get('[testid="asf-new-filter"]').should("be.disabled");
    });
});

// apply search
Cypress.Commands.add("applyAdvSearch", () => {
  cy.intercept({
    method: "GET",
    url: `${Napi_server}/api/entities/**`,
  }).as("advResponse");
  cy.get('[testid="asf-applySearch"]')
    .click()
    .then(() => {
      cy.wait("@advResponse");
    });
});

// clear search
Cypress.Commands.add("clearAdvSearch", () => {
  cy.get('[testid="asf-clear"]')
    .click()
    .then(() => {
      cy.get('[testid="asf-filterName"]').should("have.value", "");
      cy.get('[testid="asf-new-filter"]').should("be.disabled");
    });
});

//  close advance search model
Cypress.Commands.add("closeAdvSearch", () => {
  cy.get('[testid="asf-modelClose"]')
    .click()
    .then(() => {
      cy.get('[testid="summary-asf"]').should("be.visible");
    });
});

// component search div
const advWindow =
  "body > div > div > div > div > div > div:nth-child(2) > div > div:nth-child(2) > form > div:nth-child(1) > div:nth-child(2) > div";

// entity filters list div
const filterList =
  "body > div > div > div > div > div > div:nth-child(2) > div > div:nth-child(1) > div > div:nth-child(1) > div > div";

// function for text search
const text = (compName, value) => {
  cy.get(advWindow).then((ele) => {
    if (Cypress.dom.isScrollable(ele)) {
      cy.get(advWindow)
        .scrollIntoView()
        .then(() => {
          cy.get(`[testid=asf-${compName}]`).type(`${value}`);
        });
    }
  });
};

// function for radio search
const radio = (compName, value) => {
  cy.get(advWindow).then((ele) => {
    if (Cypress.dom.isScrollable(ele)) {
      cy.get(advWindow)
        .scrollIntoView()
        .then(() => {
          cy.get(`[testid=asf-${compName}]`, { timeout: 8000 })
            .click()
            .then(() => {
              cy.get(`[testid=asf-${compName}-${value}]`).click();
            });
        });
    }
  });
};

// apply and search
const applyAndSearch = (filterName) => {
  cy.get(filterList).then((ele) => {
    if (Cypress.dom.isScrollable(ele)) {
      cy.get(filterList)
        .scrollIntoView()
        .then(() => {
          cy.get(`[testid="asf-filters-${filterName}"]`).within(() => {
            cy.get('[testid="asf-filterAppy&Search"]').click();
          });
        });
    }
  });
};

// delete entity filter
const deleteFilter = (filterName) => {
  cy.get(filterList).then((ele) => {
    if (Cypress.dom.isScrollable(ele)) {
      cy.get(filterList)
        .scrollIntoView()
        .then(() => {
          cy.get(`[testid="asf-filters-${filterName}"]`).within(() => {
            cy.get('[testid="asf-filterDelete"]').click();
          });
        });
    }
  });
  cy.get(`[testid="asf-${filterName}-save"]`).click();
};
