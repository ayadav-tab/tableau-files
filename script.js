(function () {
  $(document).ready(function () {
    tableau.extensions.initializeAsync().then(function () {
      const dashboard = tableau.extensions.dashboardContent.dashboard;
    const worksheet = dashboard.worksheets[0];

    worksheet.getSummaryDataAsync().then(function (data) {
        let html = "<table><tr>";

        data.columns.forEach(col => {
            html += "<th>" + col.fieldName + "</th>";
        });

        html += "<th>Link</th></tr>";

        data.data.forEach(row => {
            html += "<tr>";

            row.forEach(cell => {
                html += "<td>" + cell.formattedValue + "</td>";
            });

            html += "<td class='link'><a href='https://www.google.com'>Click Here</a></td>";
            html += "</tr>";
        });

        html += "</table>";
        document.getElementById("tableContainer").innerHTML = html;
    });
    }, function (err) {
      // Something went wrong in initialization.
      console.log('Error while Initializing: ' + err.toString());
    });
  });
})();
