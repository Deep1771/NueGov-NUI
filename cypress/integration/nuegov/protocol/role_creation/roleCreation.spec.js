describe(
  "role creation",
  {
    animationDistanceThreshold: 20,
  },
  () => {
    before(() => {
      cy.fixture("data_inputs/loginCredential.json")
        .as("loginCredential")
        .then((lc) => {
          cy.login(lc[0].bussiness, lc[0].username, lc[0].password);
        });
    });
    beforeEach(() => {
      cy.restoreLocalStorageCache();
    });
    it("role creation", () => {
      cy.fixture("data_inputs/protocolData/roleData.json").then((roleData) => {
        cy.controlPanelEntity(roleData.entityName);
        cy.roleDetail(roleData.entityName, roleData);
        cy.controlPanelDetailpageSave(roleData.entityName);
        cy.fixture("api_responses/createdRoleDataId.json").then((rid) => {
          cy.controlPanelDataDelete(roleData, rid?.dataId);
        });
      });
    });
  }
);
