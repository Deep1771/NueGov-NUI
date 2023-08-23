Cypress.Commands.add("directives", (groupName, field, entityData) => {
  switch (field.type) {
    case "SECTION":
      if (field.name == "agencyPermissionSection") {
        cy.section(groupName, field, entityData);
        cy.wait(4000);
      }
      cy.section(groupName, field, entityData);
      break;
    case "TEXTBOX":
      cy.textbox(groupName, field, entityData);
      break;
    case "TEXTAREA":
      cy.textarea(groupName, field, entityData);
      break;
    case "LIST":
      if (field.multiSelect == false || !field.multiSelect) {
        cy.list(groupName, field, entityData);
      }
      break;
    case "EMAIL":
      cy.email(groupName, field, entityData);
      break;
    case "LATLONG":
      cy.latlong(groupName, field, entityData);
      break;
    case "REFERENCE":
      if (field.multiSelect == true) {
        cy.multireferenceSearch(groupName, field, entityData);
      }
      if (field.multiSelect == false || !field.multiSelect)
        cy.referenceSearch(groupName, field, entityData);
      break;
    case "PERMISSION":
      if (field.name == "agencyPermission")
        cy.permission(groupName, field, entityData.agencyPermission);
      if (field.name == "rolePermission")
        cy.rolePermission(groupName, field, entityData.rolePermission);
      break;
    case "PASSWORD":
      cy.password(groupName, field, entityData);
      break;
    case "RADIO":
      cy.radio(groupName, field, entityData);
      break;
    case "CAMERASTREAM":
      cy.cameraStream(groupName, field, entityData);
      break;
    case "CHECKBOX":
      cy.checkbox(groupName, field, entityData);
      break;
    case "PAIREDLIST":
      cy.pairedList(groupName, field, entityData);
      break;
  }
});
