describe("Bussiness flow", () => {
  before(() => {
    cy.fixture("data_inputs/loginCredential.json")
      .as("loginCredential")
      .then((lc) => {
        cy.login(lc[0].bussiness, lc[0].username, lc[0].password);
      });
  });
  it("sign flow", () => {
    cy.fixture("data_inputs/signData.json").then((signData) => {
      cy.summaryView();
      cy.get(`[testid="nav-my-pref"]`, { timeout: 10000 }).click();
      cy.entityExistCheckinPreset("Sign", "Sign");
      cy.detailPageFlow("Sign", "Sign", signData);
      cy.summaryDetailpageSave(signData);
    });
  });
});
