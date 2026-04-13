let worksheets;

$(document).ready(function () {

    tableau.extensions.initializeDialogAsync().then(() => {

        const dashboard = tableau.extensions.dashboardContent.dashboard;
        const worksheets = dashboard.worksheets;

        const dropdown = document.getElementById("sheetDropdown");

        dropdown.innerHTML = ""; // clear first

        worksheets.forEach(ws => {
            let option = document.createElement("option");
            option.value = ws.name;
            option.text = ws.name;
            dropdown.appendChild(option);
        });

        console.log("Worksheets:", worksheets.map(w => w.name)); // debug

    });

});


function saveSettings() {

    let selectedSheet = document.getElementById("sheetDropdown").value;

    tableau.extensions.settings.set("worksheet", selectedSheet);
    tableau.extensions.settings.saveAsync().then(() => {
        tableau.extensions.ui.closeDialog();
    });
}