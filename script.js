(function () {
  let worksheet;
  $(document).ready(function () {
     tableau.extensions.initializeAsync().then(function () {

        worksheet =
            tableau.extensions.dashboardContent.dashboard.worksheets[0];

        loadData();

        worksheet.addEventListener(
            tableau.TableauEventType.FilterChanged,
            loadData
        );

        tableau.extensions.settings.addEventListener(
            tableau.TableauEventType.SettingsChanged,
            loadData
        );

    },function (err) {
      // Something went wrong in initialization.
      console.log('Error while Initializing: ' + err.toString());
    });
  });


  function loadData() {

    worksheet.getSummaryDataAsync().then(function (sumdata) {

        const columns = sumdata.columns.map(c => c.fieldName);
        const table = document.getElementById("dataTable");
        const thead = table.querySelector("thead");
        const tbody = table.querySelector("tbody");

        thead.innerHTML = "";
        tbody.innerHTML = "";

        // Header
        const headerRow = document.createElement("tr");

        columns.forEach((col, index) => {
            let th = document.createElement("th");
            th.innerText = col;

            th.onclick = () => sortTable(index);

            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);

        // Rows
        sumdata.data.forEach(row => {

            let tr = document.createElement("tr");

            row.forEach((cell, i) => {

                let td = document.createElement("td");

                let value = cell.formattedValue;

                // detect hyperlink column
                if (columns[i].toLowerCase().includes("link")) {

                    let a = document.createElement("a");
                    a.href = value;
                    a.innerText = value;
                    a.target = "_blank";
                    td.appendChild(a);

                } else {

                    // numeric formatting
                    if (!isNaN(value)) {
                        td.innerText = Number(value).toLocaleString();
                        td.style.textAlign = "right";
                    }
                    else {
                        td.innerText = value;
                    }
                }

                tr.appendChild(td);
            });

            // Selection action
            tr.onclick = () => selectMarks(row);

            tbody.appendChild(tr);

        });

    });
}


// Sorting
function sortTable(columnIndex) {

    let table = document.getElementById("dataTable");
    let rows = Array.from(table.rows).slice(1);

    rows.sort((a, b) => {

        let A = a.cells[columnIndex].innerText;
        let B = b.cells[columnIndex].innerText;

        return A.localeCompare(B, undefined, {numeric: true});
    });

    rows.forEach(row => table.appendChild(row));
}



// Selection Action back to Tableau
function selectMarks(row) {

    let filterValues = [];

    row.forEach(cell => {
        filterValues.push(cell.value);
    });

    worksheet.selectMarksAsync(
        worksheet.getSummaryDataAsync().columns[0].fieldName,
        filterValues,
        tableau.SelectionUpdateType.Replace
    );

}
})();
