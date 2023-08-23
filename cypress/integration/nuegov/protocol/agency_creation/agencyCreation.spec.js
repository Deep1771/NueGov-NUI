describe(
  "Agency creation",
  {
    animationDistanceThreshold: 20,
  },
  () => {
    before(() => {
      cy.fixture("data_inputs/loginCredential")
        .as("loginCredential")
        .then((lc) => {
          cy.login(lc[0].bussiness, lc[0].username, lc[0].password);
        });
    });
    beforeEach(() => {
      cy.restoreLocalStorageCache();
    });
    it("Agency Creation", () => {
      cy.fixture("data_inputs/protocolData/agencyData").then((agencyDetail) => {
        const { entityName, Name } = agencyDetail;
        cy.controlPanelEntity(entityName);
        cy.agencyDetail(entityName, agencyDetail);
        cy.controlPanelDetailpageSave(entityName);
        cy.fixture("api_responses/createdAgencyDataId.json").then((aid) => {
          cy.agencyStamp(entityName, Name, aid?.dataId);
          cy.controlPanelDataDelete(agencyDetail, aid?.dataId);
        });
      });
    });
  }
);
