(async function fileRun() {
  try {
    let workBook;
    let a = await import("xlsx").then((modules) => {
      let XLSX = modules.default;
      workBook = XLSX.readFile("testData.xlsx");
      workBook.SheetNames.forEach(async (sheet) => {
        const jsonData = XLSX.utils.sheet_to_json(workBook.Sheets[sheet]);
        let b = await import("fs").then((fsModules) => {
          let { writeFileSync } = fsModules.default;
          writeFileSync(
            "../cypress/fixtures/data_inputs/" + sheet + ".json",
            JSON.stringify(jsonData, null, 4),
            "utf-8"
          );
        });
      });
    });
  } catch (e) {
    throw Error(e);
  }
})();
