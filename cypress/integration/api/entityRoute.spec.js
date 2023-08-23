const { Napi_server } = Cypress.env();
const { loginCredentials } = require("../../fixtures/data_inputs/login.json");
const { validUsername, validPassword } = loginCredentials;

describe("API testing", () => {
  it("Login", () => {
    cy.request({
      method: "POST",
      url: `${Cypress.env("Napi_server")}/user/signin`,
      body: {
        username: `${validUsername}`,
        password: `${validPassword}`,
      },
      failOnStatusCode: true,
    })
      .its("body")
      .then((response) => {
        cy.writeFile(
          "cypress/fixtures/api_responses/api/user.json",
          response,
          "binary"
        );
      });
  });
  beforeEach(() => {
    cy.restoreLocalStorageCache();
  });
  it("POST api call", () => {
    cy.fixture("api_responses/api/user.json").then((data) => {
      cy.request({
        method: "POST",
        url: `${Napi_server}/api/entities/NueGov/Admin/UserGroup/`,
        headers: {
          "x-access-token": `${data.token}`,
        },
        body: {
          sys_agencyId: "No Agency",
          sys_userId: "60d954bb54bbc9003a8bd3af",
          sys_entityAttributes: {
            userGroupName: "Test",
          },
          sys_templateName: "UserGroup",
        },
      }).then((response) => {
        cy.writeFile(
          "cypress/fixtures/api_responses/api/post.json",
          response.body,
          "binary"
        );
        expect(response.body).to.have.property("success", true);
      });
    });
  });

  it("GET api call", () => {
    cy.fixture("api_responses/api/user.json").then((data) => {
      cy.fixture("api_responses/api/post.json").then((postData) => {
        cy.request({
          method: "GET",
          url: `${Napi_server}/api/entities/NueGov/Admin/UserGroup/${postData.id}`,
          headers: {
            "x-access-token": `${data.token}`,
          },
        }).then((response) => {
          cy.writeFile(
            "cypress/fixtures/api_responses/api/get.json",
            response.body,
            "binary"
          );
          expect(response.body).to.have.property("_id", `${postData.id}`);
        });
      });
    });
  });

  it("PUT api call", () => {
    cy.fixture("api_responses/api/user.json").then((data) => {
      cy.fixture("api_responses/api/post.json").then((postData) => {
        cy.request({
          method: "PUT",
          url: `${Napi_server}/api/entities/NueGov/Admin/UserGroup/${postData.id}`,
          headers: {
            "x-access-token": `${data.token}`,
          },
          body: {
            _id: "61782d7ab3beae0047193b02",
            sys_gUid: "UserGroup-2992f6e3-12b4-441a-b450-ea6b8e9570bc",
            sys_agencyId: "No Agency",
            sys_entityAttributes: {
              userGroupName: "Test-1",
              id: "UserGroup-2992f6e3-12b4-441a-b450-ea6b8e9570bc",
            },
            sys_auditHistory: {
              createdByUser: "uppoor@navjoyinc.com",
              createdTime: "2021-10-26T16:31:54.622Z",
              lastUpdatedByUser: "uppoor@navjoyinc.com",
              lastUpdatedTime: "2021-10-26T16:31:54.622Z",
            },
            sys_groupName: "UserGroup",
            sys_entityName: "UserGroup",
            sys_templateName: "UserGroup",
            opData: {
              type: "CREATE",
              granularity: "SINGLE",
            },
            sys_userId: "60d954bb54bbc9003a8bd3af",
          },
        }).then((response) => {
          cy.writeFile(
            "cypress/fixtures/api_responses/api/put.json",
            response.body,
            "binary"
          );
          expect(response.body).to.have.property("success", true);
        });
      });
    });
  });

  it("DELETE api call", () => {
    cy.fixture("api_responses/api/user.json").then((data) => {
      cy.fixture("api_responses/api/post.json").then((postData) => {
        cy.request({
          method: "DELETE",
          url: `${Napi_server}/api/entities/NueGov/Admin/UserGroup/${postData.id}`,
          headers: {
            "x-access-token": `${data.token}`,
          },
        }).then((response) => {
          expect(response.body).to.have.property("ok", 1);
        });
      });
    });
  });
});
