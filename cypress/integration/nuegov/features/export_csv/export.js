const { export_server } = Cypress.env();

// Select all the fields
Cypress.Commands.add("selectAll", () => {
  // cy.wait(5000);
  cy.get('[testid="export-selectall"]').click();
});

// Select fields
Cypress.Commands.add("selectFields", (fieldlevel, name) => {
  // selectField(fieldlevel, directiveName) = fieldLevel = toplevel or component
  cy.get(`[testid=export-${fieldlevel}-${name}]`).check();
});

// unselect fields
Cypress.Commands.add("unSelectFields", (fieldlevel, name) => {
  // selectField(fieldlevel, directiveName) = fieldLevel = toplevel or component
  cy.get(`[testid=export-${fieldlevel}-${name}]`).uncheck();
});

// Replace Null value in export
Cypress.Commands.add("replaceNullWith", (value) => {
  cy.get('[testid="export-replaceNullValues"]').type(value);
});

// Select type of export file - (XML, CSV, JSON)
// Keep separate json file for export
Cypress.Commands.add("selectFileType", (type) => {
  cy.get('[testid="export-type"]').click();
  cy.get(`[testid="export-type-${type}"]`).click();
});

// Export file Name
Cypress.Commands.add("exportFileName", (name) => {
  cy.get('[testid="export-name"]')
    .type(name)
    .then(() => {
      cy.get('[testid="export-name"]').should("have.value", name);
    });
});

// Export
Cypress.Commands.add("export", () => {
  // cy.intercept({
  //   method: "PUT",
  //   url: `${export_server}/export/**`,
  // }).as("exporting");
  cy.get('[testid="export"]').invoke("show");
  cy.get('[testid="export"]').click();
  // cy.wait("@exporting").its("response.statusCode").should("eq", 200);
});

// Close Export model
Cypress.Commands.add("closeExport", () => {
  cy.get('[testid="export-close"]').click();
});

// cancel Export
Cypress.Commands.add("cancelExport", () => {
  cy.get('[testid="export-cancel"]').click();
});
