describe("cdotr4 quick flow", () => {
  before(() => {
    cy.fixture("data_inputs/loginCredential.json")
      .as("loginCredential")
      .then((lc) => {
        cy.login(lc[0].bussiness, "nnageli@navjoyinc.com.cdotr4", "testing");
      });
  });
  it("sign flow", () => {
    cy.fixture("data_inputs/cdotr4Sign.json").then((signData) => {
      const { entityGroupName, entityFriendlyName } = signData;
      cy.summaryView();
      cy.get(`[testid="nav-my-pref"]`, { timeout: 10000 }).click();
      cy.entityExistCheckinPreset(entityGroupName, entityFriendlyName);
      cy.detailPageFlow(entityGroupName, entityFriendlyName, signData);
      // cy.summaryDetailpageSave(signData);
      cy.fixture("api_responses/createdSignData.json").then((data) => {
        cy.get(`[testid="summary-card-${entityGroupName}-${data.id}"]`, {
          timeout: 15000,
        })
          .scrollIntoView()
          .should("be.visible");
      });
      cy.fixture(`api_responses/createdSignAssessmentData.json`).then(
        (data) => {
          cy.get(`[testid="nav-my-pref"]`, { timeout: 10000 }).click();
          cy.entityExistCheckinPreset(
            signData.quickFlow[0].entityName,
            signData.quickFlow[0].entityFriendlyName
          );
          cy.get(
            `[testid="summary-card-${signData.quickFlow[0].entityName}-${data.id}"]`,
            { timeout: 15000 }
          )
            .scrollIntoView()
            .should("be.visible");
        }
      );
    });
  });
});
