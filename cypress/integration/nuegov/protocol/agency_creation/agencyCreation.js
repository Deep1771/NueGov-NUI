const { Napi_server } = Cypress.env();

Cypress.Commands.add("agencyDetail", (groupName, entityData) => {
  cy.intercept({
    method: "GET",
    url: `${Napi_server}/api/metadata/NueGov/Admin?groupname=Agency`,
  }).as("agencyMetadata");
  cy.get('[testid="cp-create"]').click();
  cy.bussissnessTypeSelection("NueGov", "Transportation", "Agency");
  cy.wait("@agencyMetadata").then(({ response }) => {
    expect(response.statusCode).to.eq(200);
  });
  cy.get('[testid="Agency-detailPage-save"]').should("be.disabled");
  cy.fixture("api_responses/AgencyMetadata.json").then((agencyMetadata) => {
    let topLevelMetaData = agencyMetadata.sys_entityAttributes.sys_topLevel;
    topLevelMetaData.forEach((field) => {
      cy.directives(groupName, field, entityData);
    });
  });
});

Cypress.Commands.add("permission", (groupName, field, agencyPermission) => {
  const { featurePermissions, appPermission } = agencyPermission;
  if (featurePermissions) {
    cy.featurePermission(featurePermissions);
    let adminModulePermissions = [
      {
        entity: "Agency",
        entityId: "5cf26801ae184220a3999c9a",
        fields: [
          "field-stampagency-read",
          "section-licenseInfo-read",
          "section-geolocationBoundary-read",
        ],
      },
      {
        entity: "User",
        templateName: "User",
        entityId: "5cf26801ae184220a3999c9e",
        fields: [
          "field-stampagency-read",
          "field-activeUser-read",
          "field-notification-read",
          "field-forceReset-read",
          "field-signature-read",
          "field-role-read",
          "section-openApi-read",
        ],
      },
      {
        entity: "Role",
        entityId: "5cf26801ae184220a3999d26",
        fields: ["field-stampagency-read"],
      },
    ];
    adminModulePermissions.forEach((adminEntityPermission) => {
      cy.adminEntityPermission(adminEntityPermission);
    });
  }
  cy.moduleEntityPermission(appPermission);
});

Cypress.Commands.add("moduleEntityPermission", (appPermission) => {
  appPermission?.forEach((permission) => {
    const { moduleName, entityPermission } = permission;
    cy.get(`[testid="module-tree-${moduleName}"]`, { timeout: 10000 })
      .scrollIntoView()
      .click();
    entityPermission?.forEach((ep) => {
      cy.intercept({
        url: `${Napi_server}/api/entities-count/NJAdmin/NJ-System/EntityTemplate?sys_templateGroupName.sys_groupName=${ep.entityName}`,
        method: "GET",
      }).as(`${ep.entityName}FieldData`);
      cy.get('[testId="entity-card-' + ep.entityName + '"]', {
        timeout: 10000,
      }).within(() => {
        cy.get('[testId="entity-modify"]', { timeout: 10000 }).click();
        // cy.wait(2000);
      });
      cy.wait(`@${ep.entityName}FieldData`)
        .wait(2000)
        .then(({ response }) => {
          expect(response.statusCode).to.eq(200);
        });
      if (ep.templateName) {
        cy.templateSearchASF(ep.templateName);
      }
      cy.get(
        "#context-c > div > div > div:nth-child(2) > div:nth-child(1) > div"
      ).then(($el) => {
        if (Cypress.dom.isScrollable($el))
          cy.get(
            "#context-c > div > div > div:nth-child(2) > div:nth-child(1) > div"
          ).scrollTo("bottom");
        cy.waitUntil(() =>
          cy
            .get(`[testid="summary-card-EntityTemplate-${ep?.templateId}"]`, {
              timeout: 10000,
            })
            .scrollIntoView()
            .should("be.visible")
            .then(($el) => $el.click())
        );
        cy.get('[testid="contextMenu-select"]', { timeout: 10000 }).click();
        cy.get('[testid="entity-card-' + ep.entityName + '"]', {
          timeout: 10000,
        }).click();
        cy.get('[testid="select-write-all"]', { timeout: 10000 }).should(
          "be.disabled"
        );
        cy.get('[testid="action-write"]', { timeout: 8000 }).check({
          animationDistanceThreshold: 20,
        });
        if (ep.features) {
          ep.features.map((feature) => {
            cy.get(`[testid="feature-acess-${feature}"]`, {
              timeout: 10000,
            }).within(() => {
              cy.get("input").check({
                animationDistanceThreshold: 20,
              });
            });
          });
        }
        if (ep.entityType == "Approval") {
          cy.get('[testid="approval-acess"]', { timeout: 10000 })
            .scrollIntoView()
            .within(() => {
              cy.get('[type="checkbox"]', { timeout: 8000 }).check({
                animationDistanceThreshold: 20,
              });
            });
          cy.get('[testid="more-options-acess-roleBasedLayout"]', {
            timeout: 10000,
          })
            .scrollIntoView()
            .within(() => {
              cy.get('[type="checkbox"]').check({
                animationDistanceThreshold: 20,
              });
            });
        }
        cy.get('[testid="select-write-all"]', { timeout: 10000 })
          .should("be.enabled")
          .check({
            animationDistanceThreshold: 20,
          });
        if (ep.components) {
          cy.get('[testid="tabs-CL"]', { timeout: 10000 }).click();
          ep.components.map((component) => {
            cy.get(`[testid="section-${component.componentName}-write"]`, {
              timeout: 10000,
            }).check({
              animationDistanceThreshold: 20,
            });
          });
        }
        cy.get('[testid="save"]', { timeout: 10000 }).click();
      });
    });
  });
});

Cypress.Commands.add("adminEntityPermission", (adminModulePermission) => {
  const { entity, templateName, entityId, fields } = adminModulePermission;
  cy.intercept({
    url: `${Napi_server}/api/entities-count/NJAdmin/NJ-System/EntityTemplate?sys_templateGroupName.sys_groupName=${adminModulePermission.entity}`,
    method: "GET",
  }).as(`${entity}FieldData`);
  cy.get(`[testid="module-tree-Admin"]`, { timeout: 10000 }).click();
  cy.get(`[testid="entity-card-${entity}"]`, { timeout: 10000 }).within(() => {
    cy.get('[testid="entity-modify"]', { timeout: 10000 }).click();
  });
  cy.wait(`@${entity}FieldData`).then(({ response }) => {
    expect(response.statusCode).to.eq(200);
  });
  if (templateName) {
    cy.templateSearchASF(templateName);
  }
  cy.get(
    "#context-c > div > div > div:nth-child(2) > div:nth-child(1) > div"
  ).then(($el) => {
    if (Cypress.dom.isScrollable($el))
      cy.get(
        "#context-c > div > div > div:nth-child(2) > div:nth-child(1) > div"
      ).its(scrollY);
    cy.waitUntil(() =>
      cy
        .get(`[testid="summary-card-EntityTemplate-${entityId}"]`, {
          timeout: 10000,
        })
        .its(scrollY)
        .should("be.visible")
        .then(($el) => $el.click())
    );
    cy.get('[testid="contextMenu-select"]', { timeout: 10000 }).click();
    cy.get(`[testid="entity-card-${entity}"]`, { timeout: 10000 }).click();
    cy.get('[testid="select-write-all"]', { timeout: 10000 }).should(
      "be.disabled"
    );
    cy.get('[testid="action-write"]', { timeout: 8000 }).check({
      animationDistanceThreshold: 20,
    });
    cy.get('[testid="select-write-all"]', { timeout: 8000 })
      .should("be.enabled")
      .check({
        animationDistanceThreshold: 20,
      });
    if (fields) {
      fields.forEach((field) => {
        cy.get(`[testid="${field}"]`, { timeout: 10000 })
          .scrollIntoView()
          .should("be.enabled")
          .uncheck({
            animationDistanceThreshold: 20,
          });
      });
    }
    cy.get('[testid="save"]', { timeout: 10000 }).click();
  });
});

Cypress.Commands.add("featurePermission", (featurePermissions) => {
  featurePermissions.forEach((featurePermission) => {
    switch (featurePermission) {
      case "Insights":
        cy.InsightsPermission();
        break;
      case "calendar":
        cy.calendarPermission();
        break;
      case "collaborator":
        cy.collaborator();
        break;
      case "Files":
        cy.Files();
        break;
    }
  });
});

Cypress.Commands.add("InsightsPermission", () => {
  cy.intercept({
    method: "GET",
    url: `${Napi_server}/api/entities-count/NJAdmin/NJ-System/**`,
  }).as("insightstemplates");

  cy.intercept({
    method: "GET",
    url: `${Napi_server}/api/entities/NJAdmin/NJ-System/Feature/?displayFields=featureName,featureType,relatedEntities&limit=50&skip=0&featureType=entity`,
  }).as("chartFieldsData");

  cy.intercept({
    method: "GET",
    url: `${Napi_server}/api/entities-count/NJAdmin/NJ-System/EntityTemplate?sys_templateGroupName.sys_groupName=Boards`,
  }).as("boardTemplate");

  cy.intercept({
    method: "GET",
    url: `${Napi_server}/api/entities/NJAdmin/NJ-System/Feature/?displayFields=featureName,featureType,relatedEntities&limit=50&skip=0&featureType=entity`,
  }).as("boardFieldsData");

  cy.get('[testid="Insights-activate"]', { timeout: 8000 }).within(() => {
    cy.get("input").check({
      animationDistanceThreshold: 20,
    });
  });
  cy.wait("@insightstemplates").then(({ response }) => {
    expect(response.statusCode).to.eq(200);
  });
  cy.get('[testid="Insights-ChartTemplate"]', { timeout: 15000 }).click();
  cy.get('[testid="summary-card-EntityTemplate-5f8d1f1dda32c800514cd7eb"]', {
    timeout: 10000,
  }).click();
  cy.get('[testid="contextMenu-select"]', { timeout: 1000 }).click();
  cy.wait("@chartFieldsData").then(({ response }) => {
    expect(response.statusCode).to.eq(200);
  });
  cy.get('[testid="action-write"]', { timeout: 10000 }).check({
    animationDistanceThreshold: 20,
  });
  cy.get('[testid="select-write-all"]', { timeout: 10000 }).check({
    animationDistanceThreshold: 20,
  });
  cy.get('[testid="Insights-Boards"]', { timeout: 10000 }).click();
  cy.wait("@boardTemplate").then(({ response }) => {
    expect(response.statusCode).to.eq(200);
  });
  cy.get('[testid="summary-card-EntityTemplate-5f8d214dda32c800514cd7f3"]', {
    timeout: 10000,
  }).click();
  cy.get('[testid="contextMenu-select"]', { timeout: 10000 }).click();
  cy.wait("@boardFieldsData").then(({ response }) => {
    expect(response.statusCode).to.eq(200);
  });
  cy.get('[testid="action-write"]', { timeout: 10000 }).check({
    animationDistanceThreshold: 20,
  });
  cy.get('[testid="select-write-all"]', { timeout: 10000 }).check({
    animationDistanceThreshold: 20,
  });
  cy.get('[testid="save"]', { timeout: 10000 }).click();
  cy.get('[testid="Insights-edit"]', { timeout: 10000 }).should("be.visible");
});

Cypress.Commands.add("calendarPermission", () => {
  let entities = [
    {
      entityName: "Event",
      templateId: "5e37c5288e4fab00461fc0f7",
    },
    {
      entityName: "ActionItem",
      templateId: "5e8c4440245e93003b8081cc",
    },
  ];
  cy.get('[testid="Calendar-activate"]', { timeout: 10000 }).within(() => {
    cy.get("input").check({
      animationDistanceThreshold: 20,
    });
  });
  entities.forEach((entity) => {
    cy.get(`[testid="Calendar-${entity.entityName}"]`, {
      timeout: 10000,
    }).click();
    cy.get(`[testid="summary-card-EntityTemplate-${entity.templateId}"]`, {
      timeout: 10000,
    }).click();
    cy.get('[testId="contextMenu-select"]', { timeout: 10000 }).click();
    cy.get('[testId="action-write"]', { timeout: 10000 }).check({
      animationDistanceThreshold: 20,
    });
    cy.get('[testId="select-write-all"]', { timeout: 8000 }).check({
      animationDistanceThreshold: 20,
    });
  });
  cy.get('[testid="save"]').click();
  cy.get('[testid="Calendar-edit"]', { timeout: 10000 }).should("be.visible");
});

Cypress.Commands.add("collaborator", () => {
  cy.get('[testid="Feature-activate"]', { timeout: 10000 }).within(() => {
    cy.get("input").check({
      animationDistanceThreshold: 20,
    });
  });
  cy.get('[testid="summary-card-EntityTemplate-5d9d6e36d20a050026aea218"]', {
    timeout: 10000,
  }).click();
  cy.get('[testid="contextMenu-select"]', { timeout: 10000 }).click();
  cy.get('[testid="action-write"]', { timeout: 10000 }).click();
  cy.get('[testid="save"]', { timeout: 10000 }).click();
  cy.get('[testid="Feature-edit"]', { timeout: 10000 }).should("be.visible");
});

Cypress.Commands.add("Files", () => {
  let entities = [
    {
      entityName: "Files",
      templateId: "5e4a69cd68506100461b3e86",
    },
    {
      entityName: "Folder",
      templateId: "5ed245a6e467f6003ad9fbfb",
    },
  ];
  cy.get('[testid="Files-activate"]').within(() => {
    cy.get("input").check();
  });
  entities.forEach((entity) => {
    cy.get('[testid="Files-' + entity.entityName + '"]').click();
    cy.get(
      '[testid="summary-card-EntityTemplate-' + entity.templateId + '"]'
    ).click();
    cy.get('[testId="contextMenu-select"]').click();
    cy.get('[testId="action-write"]').check({
      animationDistanceThreshold: 20,
    });
    cy.get('[testId="select-write-all"]').check({
      animationDistanceThreshold: 20,
    });
    cy.get('[testid="save"]').click();
    cy.get('[testid="Files-edit"]').should("be.visible");
  });
});

Cypress.Commands.add("templateSearchASF", (templateName) => {
  cy.get('[testid="EntityTemplate-context-asf"]', { timeout: 10000 }).click();
  cy.get('[testid="asf-sys_templateName"]', { timeout: 10000 }).type(
    templateName
  );
  cy.get('[testid="asf-applySearch"]', { timeout: 8000 }).click();
});
//function to stamp created agency
Cypress.Commands.add("agencyStamp", (entityName, agencyName, agencyId) => {
  cy.get('[testid="cp-card-' + agencyId + '"]').click();
  cy.stampAgency(agencyName, agencyId);
  cy.get('[testid="' + entityName + '-detailPage-save"]').click();
  cy.get('[testid="detail-save"]').click();
});

Cypress.Commands.add(
  "bussissnessTypeSelection",
  (bussinessType, lobType, templateName) => {
    cy.get('[testid="businessType"]', { timeout: 10000 })
      .click()
      .then(() => {
        cy.get(`[testid="businessType-${bussinessType}"]`, {
          timeout: 10000,
        }).click();
      });
    cy.get('[testid="LOB"]', { timeout: 10000 })
      .click()
      .then(() => {
        cy.get(`[testid="LOB-${lobType}"]`, { timeout: 10000 }).click();
      });
    cy.get('[testid="agencyTemplate"]')
      .click()
      .then(() => {
        cy.get(`[testid="agencyTemplate-${templateName}"]`, {
          timeout: 10000,
        }).click();
      });
    cy.get('[testid="apply-bussinessType"]', { timeout: 10000 }).click();
  }
);
