describe("preset end to end test", () => {
  before(() => {
    cy.fixture("data_inputs/loginCredential.json")
      .as("loginCredential")
      .then((lc) => {
        cy.login(lc[0].bussiness, lc[0].username, lc[0].password);
      });
  });
  it("preser user default check", () => {
    cy.fixture("data_inputs/presetE2E.json").then((presetData) => {
      cy.userdefault();
      // cy.addActiveDefaultPreset(presetData);
      cy.activePresetCreate(presetData);
      cy.editPreset(presetData.editPreset);
      cy.deletePreset(presetData.activePresetName);
    });
  });
});
