import "./commands";
import "./../integration/nuegov/container/summary_container/summary";
import "./../integration/nuegov/features/advance_search/advSearch";
import "./../integration/nuegov/features/export_csv/export";
import "./../integration/nuegov/protocol/";
import "./../integration/nuegov/directives";
import "./../integration/nuegov/features/preset/preset";
import "./../integration/nuegov/container/Detail_container/detail";
// require("cypress-watch-and-reload/support");

Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});
