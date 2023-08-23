const { nuegovHost, Napi_server } = Cypress.env();
import { forgotPassword } from "../../fixtures/data_inputs/login.json";
const { validEmail, invalidEmail } = forgotPassword;

describe("Forgot Password", () => {
  it("case 1 - Invalid Email", () => {
    cy.visit(nuegovHost);
    cy.get('[testid="fgt-password"]').click();
    cy.url().should("contain", "/forgot_pwd");
    cy.get("#standard-outlined").type(`${invalidEmail}{Enter}`);
    // cy.get('[testid="sendMail"]').click();
    cy.request({
      method: "POST",
      url: `${Napi_server}/user/forgot-password`,
      body: {
        userEmail: `${invalidEmail}`,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
    cy.get('[testid = "alertBox"]')
      .contains(`User doesn't exist`)
      .should("exist");
  });

  it("case 2 - Valid Email", () => {
    cy.visit(nuegovHost);
    cy.get('[testid="fgt-password"]').click();
    cy.url().should("contain", "/forgot_pwd");
    cy.get("#standard-outlined").type(`${validEmail}{Enter}`);
    // cy.get('[testid="sendMail"]').click();
    cy.request({
      method: "POST",
      url: `${Napi_server}/user/forgot-password`,
      body: {
        userEmail: `${validEmail}`,
      },
      failOnStatusCode: true,
    }).then((response) => {
      expect(response.status).to.eq(200);
      cy.get('[testid = "alertBox"]')
        .contains("Password reset instructions sent to your inbox")
        .should("exist");
    });
  });
});
