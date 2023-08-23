const { nuegovHost, Napi_server } = Cypress.env();
import { loginCredentials } from "../../fixtures/data_inputs/login.json";
const { validUsername, validPassword, invalidUsername, invalidPassword } =
  loginCredentials;

describe("login", () => {
  it("case 1 - invalid username, valid password", () => {
    cy.visit(`${nuegovHost}`);
    cy.get('[testid="lg-username"]').type(`${invalidUsername}`);
    cy.get('[testid="lg-password"]').type(`${validPassword}{Enter}`);
    // cy.get('[testid="lg-btn"]').click();
    cy.request({
      method: "POST",
      url: `${Napi_server}/user/signin`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.body).to.have.property("success", false);
    });
  });

  it("case 2 - invalid username, invalid password", () => {
    cy.get('[testid="lg-username"]').clear();
    cy.get('[testid="lg-password"]').clear();
    cy.get('[testid="lg-username"]').type(`${invalidUsername}`);
    cy.get('[testid="lg-password"]').type(`${invalidPassword}{Enter}`);
    // cy.get('[testid="lg-btn"]').click();
    cy.request({
      method: "POST",
      url: `${Napi_server}/user/signin`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.body).to.have.property("success", false);
    });
  });

  it("case 3 - valid username, invalid password", () => {
    cy.get('[testid="lg-username"]').clear();
    cy.get('[testid="lg-password"]').clear();
    cy.get('[testid="lg-username"]').type(`${validUsername}`);
    cy.get('[testid="lg-password"]').type(`${invalidPassword}{Enter}`);
    // cy.get('[testid="lg-btn"]').click();
    cy.request({
      method: "POST",
      url: `${Napi_server}/user/signin`,
      body: {
        username: `${validUsername}`,
        password: `${invalidPassword}`,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.body).to.have.property("success", false);
    });
  });

  it("case 4 - valid username, valid password", () => {
    cy.get('[testid="lg-username"]').clear();
    cy.get('[testid="lg-password"]').clear();
    cy.get('[testid="lg-username"]').type(`${validUsername}`);
    cy.get('[testid="lg-password"]').type(`${validPassword}{Enter}`);
    // cy.get('[testid="lg-btn"]').click();
    cy.request({
      method: "POST",
      url: `${Napi_server}/user/signin`,
      body: {
        username: `${validUsername}`,
        password: `${validPassword}`,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.body).to.have.property("success", true);
      expect(response.body).to.have.property("token");
    });
    cy.url().should("include", "app/dashboard");
  });
});
