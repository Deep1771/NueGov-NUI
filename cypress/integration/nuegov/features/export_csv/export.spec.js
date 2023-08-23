import {
  groupName,
  friendlyName,
  FileName,
  fileType,
  replaceValue,
  toplevelFields,
  componentlevelFields,
  uncheckToplevelFields,
  uncheckComponentFields,
} from "../../../../fixtures/data_inputs/export.json";
const { name1, name2 } = FileName;
const { type1, type2 } = fileType;

describe("Export E2E testcase", () => {
  // login
  before("Login", () => {
    cy.fixture("data_inputs/loginCredential")
      .as("loginCredential")
      .then((lc) => {
        cy.login(lc[0].bussiness, lc[0].username, lc[0].password);
        cy.get('[testid="nav-360-view"]').click({ force: true });
        cy.get(`[testid="nav-my-pref"]`, { timeout: 10000 }).click();
        cy.entityExistCheckinPreset(groupName, friendlyName);
      });
  });

  // Select all the fields and export
  it("Select all Fields and Export", () => {
    cy.summaryExport();
    cy.selectAll();
    cy.replaceNullWith(replaceValue);
    cy.selectFileType(type1);
    cy.exportFileName(name1);
    cy.wait(8000);
    cy.export();
    cy.closeExport();
  });

  // Select the fields from test data then export
  it("Select custom fields and export", () => {
    cy.get('[testid="nav-360-view"]').click({ force: true });
    cy.entitySelect("UnitTest");
    cy.summaryExport();

    // select fields
    if (toplevelFields.length > 0) {
      toplevelFields.forEach((fields) => {
        cy.selectFields("toplevel", fields);
      });
    } else if (componentlevelFields.length > 0) {
      componentlevelFields.forEach((fields) => {
        cy.selectFields("component", fields);
      });
    } else {
      cy.selectAll();
    }

    // unselect fields
    if (uncheckToplevelFields.length > 0) {
      uncheckToplevelFields.forEach((fields) => {
        cy.unSelectFields("toplevel", fields);
      });
    } else if (uncheckComponentFields.length > 0) {
      uncheckComponentFields.forEach((fields) => {
        cy.unSelectFields("component", fields);
      });
    }

    cy.selectFileType(type2);
    cy.exportFileName(name2);
    cy.wait(8000);
    cy.export();
    cy.closeExport();
  });

  it("logout", () => {
    cy.logout();
  });
});
