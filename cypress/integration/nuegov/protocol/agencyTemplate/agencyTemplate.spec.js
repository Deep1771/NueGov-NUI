const { Napi_server } = Cypress.env();
describe("Agency Template", () => {
  before(() => {
    cy.fixture("data_inputs/loginCredential.json")
      .as("loginCredential")
      .then((lc) => {
        cy.login(lc[0].bussiness, lc[0].username, lc[0].password);
      });
  });
  it("Agency Template Creation for Approval's flow", () => {
    cy.fixture("data_inputs/protocolData/agencyTemplate.json").then(
      (agencyTemplate) => {
        cy.summaryView();
        cy.get(`[testid="nav-my-pref"]`, { timeout: 10000 }).click();
        cy.entityExistCheckinPreset("AgencyTemplate", "AgencyTemplate");
        cy.detailPageFlow(
          "AgencyTemplate",
          "Agency Template",
          agencyTemplate.data
        );
        cy.summaryDetailpageSave(agencyTemplate);
        cy.fixture("api_responses/createdAgencyTemplateDataId.json").then(
          (aid) => {
            cy.summaryContainerDataDelete(agencyTemplate, aid.dataId);
          }
        );
      }
    );
  });
});
