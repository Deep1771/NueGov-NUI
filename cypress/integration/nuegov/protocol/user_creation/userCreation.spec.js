const { Napi_server } = Cypress.env();

describe("user creation", () => {
  let id;
  before(() => {
    cy.fixture("data_inputs/loginCredential.json")
      .as("loginCredential")
      .then((lc) => {
        cy.login(lc[0].bussiness, lc[0].username, lc[0].password);
      });
  });
  beforeEach(() => {
    cy.restoreLocalStorageCache();
    cy.fixture("data_inputs/protocolData/userData.json").as("userdata");
    // cy.fixture("api_responses/createdUserDataId.json").then((userDataId) => {
    //   id = userDataId;
    // });
  });
  it("super admin creation", function () {
    cy.controlPanelEntity(this.userdata.entityName);
    this.userdata.users.forEach((user) => {
      cy.userDetail(this.userdata.entityName, user);
      cy.controlPanelDetailpageSave(this.userdata.entityName);
      // cy.readFile("cypress/fixtures/api_responses/createdUserDataId.json")
      //   .then((uid) => {
      // cy.controlPanelDataDelete(this.userdata, id?.dataId);
      // });
      // cy.fixture("api_responses/createdUserDataId.json").then((uid) => {
      //   cy.controlPanelDataDelete(this.userdata, uid?.dataId);
      // });
    });
  });
});

Cypress.Commands.add("userDetail", (groupName, entityData) => {
  cy.intercept({
    url: `${Napi_server}/api/metadata/NueGov/Admin?groupname=User`,
    method: "GET",
  }).as("userMetadata");
  cy.get('[testid="cp-create"]', { timeout: 10000 }).click();
  cy.wait(3000);
  cy.bussissnessTypeSelection("NueGov", "Transportation", "User");
  cy.wait("@userMetadata", { timeout: 10000 });
  cy.fixture("api_responses/UserMetadata.json").then((userMetadata) => {
    let userTopLevelMetadata = userMetadata.sys_entityAttributes.sys_topLevel;
    userTopLevelMetadata.forEach((field) => {
      cy.directives(groupName, field, entityData);
    });
  });
});
