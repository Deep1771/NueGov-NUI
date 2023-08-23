const { Napi_server } = Cypress.env();

Cypress.Commands.add(
  "entityExistCheckinPreset",
  (groupName, entityFriendlyname) => {
    cy.intercept({
      url: `${Napi_server}/api/metadata?presetid=**`,
      method: "GET",
    }).as("metadataroute");
    cy.get('[testid="search-preset"]').type(entityFriendlyname);
    cy.wait(2000);
    cy.get(
      "#root > div > div > div:nth-child(1) > div > div > div > div > div > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div > div > div:nth-child(1)",
      { timeout: 10000 }
    ).click();
    cy.wait("@metadataroute").then(
      ({ response }) => {
        expect(response.statusCode).to.eq(200);
        const resp = response.body;
        cy.writeFile(
          "cypress/fixtures/api_responses/activepresetData.json",
          resp
        );
      },
      { timeout: 10000 }
    );
    cy.entitySelect(groupName);
    // cy.get('[testid="entity-select-menu"]', { timeout: 10000 }).click();
    // cy.get('[testid="entity-select-' + groupName + '"]', { timeout: 10000 })
    //   .scrollIntoView()
    //   .should("be.visible")
    //   .click();
    cy.contains('[testid="entity-select-menu"]', entityFriendlyname, {
      timeout: 10000,
    }).should("be.visible");
    cy.get('[testid="preset-module-close"]', { timeout: 10000 }).click();
  }
);

Cypress.Commands.add("userdefault", () => {
  cy.fixture("api_responses/UserResp").then((UserResp) => {
    if (UserResp.userData.userDefaults.preset) {
      const presetName =
        UserResp.userData.userDefaults.preset.sys_entityAttributes.presetName;
      const id = UserResp.userData.userDefaults.preset._id;
      if (presetName) {
        cy.intercept({
          url: `${Napi_server}/api/metadata?presetid=${id}`,
          method: "GET",
        }).as("summaryPreset");
        cy.intercept({
          url: `${Napi_server}/api/entities/NJAdmin/NJ-Personalization/Preset/?userName.username=***`,
          method: "GET",
        }).as("presetResp");
        cy.summaryView();
        cy.wait("@summaryPreset");
        cy.get('[testid="nav-my-pref"]').click();
        cy.wait("@presetResp").then(({ response }) => {
          expect(response.statusCode).to.eq(200);
        });
        cy.get('[testid="search-preset"]').type(presetName);
        cy.get(`[testid="preset-card-${presetName}"]`)
          .scrollIntoView()
          .within(() => {
            cy.get('[testid="preset-default"]').should("be.visible");
          });
        cy.get(`[testid="summary-${presetName}"]`).should(
          "contain",
          presetName
        ); //summary container preset name
        cy.get('[testid="preset-module-close"]', { timeout: 10000 }).click();
      }
    } else {
      cy.get('[testid="nav-360-view"]').click();
      cy.get('[testid="preset-appPanelModel"]').should("be.exist");
    }
  });
});
Cypress.Commands.add("presetEntitySelection", (data) => {
  data.moduleEntities.forEach((data) => {
    cy.get('[testid="preset-modules-' + data.moduleName + '"]', {
      timeout: 10000,
    })
      .scrollIntoView()
      .click();
    data.entityGroups.forEach((entity) => {
      cy.get(`[testId="preset-${entity}"]`, { timeout: 10000 }).drag(
        '[testId="preset-dropContainer"]',
        { force: true },
        { timeout: 10000 }
      );
    });
  });
});
Cypress.Commands.add("addActiveDefaultPreset", (data) => {
  cy.intercept({
    url: `${Napi_server}/api/entities/NJAdmin/NJ-Personalization/Preset/`,
    method: "POST",
  }).as("presetSave");
  cy.intercept({
    url: `${Napi_server}/user?src=web`,
    method: "GET",
  }).as("pageload");
  cy.get(`[testid="nav-my-pref"]`, { timeout: 10000 }).click();
  cy.get('[testid="preset-add"]', { timeout: 8000 }).click();
  cy.presetEntitySelection(data);
  cy.get('[testid="appPanel-save"]').click();
  cy.get('[testid="preset-name"]', { timeout: 8000 }).type(data.presetName);
  if (data.default == true) {
    cy.get('[testid="preset-makeDefault"]', { timeout: 8000 }).check();
  }
  if (data.active == true) {
    cy.get('[testid="preset-saveAndMakeActive"]', { timeout: 8000 }).click();
  } else {
    cy.get('[testid="preset-save"]', { timeout: 8000 }).click();
  }
  cy.wait("@presetSave").then((xhr) => {
    let response = xhr.response.body;
    expect(xhr.response.statusCode).to.eq(200);
    cy.writeFile(
      "cypress/fixtures/api_responses/createdPresetData.json",
      response
    );
  });
  cy.wait("@pageload");
  cy.get('[testid="nav-my-pref"]', { timeout: 20000 }).click();
  cy.fixture("api_responses/createdPresetData").then((presetData) => {
    cy.get(`[id="preset-card-${presetData.id}"]`, {
      timeout: 10000,
    }).should("be.visible");
    if (data.default) {
      cy.get(`[id="preset-card-${presetData.id}"]`, { timeout: 10000 })
        .scrollIntoView()
        .within(() => {
          cy.get('[testid="preset-default"]').should("be.visible");
        });
    }
  });
  cy.get('[testid="preset-module-close"]', { timeout: 10000 }).click();
});

Cypress.Commands.add("activePresetCreate", (data) => {
  cy.intercept({
    url: `${Napi_server}/api/entities/NJAdmin/NJ-Personalization/Preset/`,
    method: "POST",
  }).as("presetSave");
  cy.intercept({
    url: `${Napi_server}/user?src=web`,
    method: "GET",
  }).as("pageload");
  cy.get('[testid="nav-my-pref"]', { timeout: 8000 }).click();
  cy.get('[testid="preset-add"]', { timeout: 8000 }).click();
  cy.presetEntitySelection(data);
  cy.get('[testid="appPanel-save"]').click();
  cy.get('[testid="preset-name"]').type(data.activePresetName);
  cy.get('[testid="preset-saveAndMakeActive"]').click();
  cy.wait("@presetSave").then((xhr) => {
    let response = xhr.response.body;
    expect(xhr.response.statusCode).to.eq(200);
    cy.writeFile(
      "cypress/fixtures/api_responses/createdPresetData.json",
      response
    );
    expect(xhr.response.statusCode).to.eq(200);
  });
  cy.wait(`@pageload`).then(({ response }) => {
    expect(response.statusCode).to.eq(200);
  });
  cy.get('[testid="nav-my-pref"]', { timeout: 8000 }).click();
  cy.fixture("api_responses/createdPresetData").then((presetData) => {
    cy.get(`[id="preset-card-${presetData.id}"]`, {
      timeout: 8000,
    }).should("be.visible");
    cy.get('[testid="summary-' + data.activePresetName + '"]', {
      timeout: 10000,
    }).should("contain", data.activePresetName);
  });
  cy.get('[testid="preset-module-close"]', { timeout: 10000 }).click();
});

Cypress.Commands.add("editPreset", (editPresetData) => {
  cy.intercept({
    url: `${Napi_server}/api/entities/NJAdmin/NJ-Personalization/Preset/`,
    method: "POST",
  }).as("presetSave");
  cy.intercept({
    url: `${Napi_server}/user?src=web`,
    method: "GET",
  }).as("pageload");
  cy.intercept({
    url: `${Napi_server}/api/entities/NJAdmin/NJ-Personalization/Preset/**`,
    method: "PUT",
  }).as("saveEdit");
  cy.get('[testid="nav-my-pref"]', { timeout: 8000 }).click();
  cy.get(`[testid="preset-card-${editPresetData.presetName}"]`, {
    timeout: 10000,
  })
    .within(() => {
      cy.get('[testid="editPreset"]').click({
        force: true,
      });
    })
    .then(() => {
      cy.presetEntitySelection(editPresetData);
    });
  cy.get('[testid="appPanel-save"]', { timeout: 8000 }).click();
  if (editPresetData.active === true) {
    cy.get('[testid="preset-saveAndMakeActive"]', { timeout: 8000 }).click();
    cy.wait("@pageload").then(({ response }) => {
      expect(response.statusCode).to.eq(200);
    });
  } else {
    cy.get('[testid="preset-save"]').click();
    cy.wait("@saveEdit").then(({ response }) => {
      expect(response.statusCode).to.eq(200);
    });
  }
});

Cypress.Commands.add("deletePreset", (presetName) => {
  cy.intercept({
    url: `${Napi_server}/api/entities/NJAdmin/NJ-Personalization/Preset/**`,
    method: "DELETE",
  }).as("deletePreset");
  cy.get('[testid="nav-my-pref"]', { timeout: 8000 }).click();
  cy.get('[testid="search-preset"]', { timeout: 6000 })
    .clear()
    .type(presetName);
  cy.get(`[testid="preset-card-${presetName}"]`).within(() => {
    cy.waitUntil(() =>
      cy.get('[testid="DeletePreset"]').then(($el) => $el.click())
    );
  });
  cy.get('[testid="presetDelet-save"]', { timeout: 10000 }).click();
  cy.wait("@deletePreset").then(({ response }) => {
    expect(response.statusCode).to.eq(200);
  });
  cy.get(`[testid="preset-card-${presetName}"]`, { timeout: 10000 }).should(
    "not.exist"
  );
  cy.get('[testid="preset-module-close"]', { timeout: 10000 }).click();
});

Cypress.Commands.add("makeActivePreset", (presetName) => {
  cy.intercept({
    url: `${Napi_server}/api/entities/NJAdmin/NJ-Personalization/Preset/?userName.username=***`,
  }).as("getAllPreset");
  cy.get('[testid="nav-my-pref"]').click();
  cy.wait("@getAllPreset").then(({ response }) => {
    expect(response.statusCode).to.eq(200);
  });
  cy.get('[testid="search-preset"]').type(presetName);
  cy.waitUntil(() =>
    cy.get(`[testid="preset-card-${presetName}"]`).then(($el) => $el.click())
  );
  cy.get(`[testid="summary-${presetName}"]`).should("contain", presetName);
});

Cypress.Commands.add("makeDefaultPreset", (presetName) => {
  cy.get('[testid="search-preset"]').clear().type(presetName);
  cy.get(`[testid="preset-card-${presetName}"]`).within(() => {
    cy.waitUntil(() =>
      cy
        .get('[testid="preset-card-def-' + presetName + '"]')
        .then(($el) => $el.click())
    );
  });
  cy.get(`[testid="preset-card-${presetName}"]`).within(() => {
    cy.get('[testid="preset-default"]').should("be.visible");
  });
});
