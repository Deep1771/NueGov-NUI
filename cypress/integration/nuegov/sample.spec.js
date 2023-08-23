describe("System Test", () => {
  before(() => {
    cy.fixture("data_inputs/loginCredential.json")
      .as("loginCredential")
      .then((lc) => {
        cy.login(lc[0].bussiness, lc[0].username, lc[0].password);
      });
  });
  it("unit test", () => {
    cy.fixture("data_inputs/unittestData.json").then((entityData) => {
      const { entityGroupName, entityFriendlyName } = entityData;
      cy.summaryView();
      cy.get(`[testid="nav-my-pref"]`, { timeout: 10000 }).click();
      cy.entityExistCheckinPreset(entityGroupName, entityFriendlyName);
      cy.detailPageFlow(entityGroupName, entityFriendlyName, entityData);
      cy.summaryDetailpageSave(entityData);
      cy.fixture("api_responses/createdUnitTestData.json").then((dataId) => {
        cy.summaryContainerDataDelete(entityData, dataId.id);
      });
    });
  });
});
