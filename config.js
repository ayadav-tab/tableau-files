let worksheets;

$(document).ready(function () {

    tableau.extensions.initializeDialogAsync().then(() => {

        worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;

        let dropdown = document.getElementById("sheetDropdown");

        worksheets.forEach(ws => {
            let opt = document.createElement("option");
            opt.value = ws.name;
            opt.text = ws.name;
            dropdown.appendChild(opt);
        });

        document.getElementById("save").onclick = saveSettings;

    });

});


function saveSettings() {

    let selectedSheet = document.getElementById("sheetDropdown").value;

    tableau.extensions.settings.set("worksheet", selectedSheet);
    tableau.extensions.settings.saveAsync().then(() => {
        tableau.extensions.ui.closeDialog();
    });
}