(function () {
    let worksheet;
    let currentSortCol = -1;
    let sortDirection = "asc";
    let today = new Date();

   let cfy =
    (today.getMonth() + 1) <= 7
        ? today.getFullYear()
        : today.getFullYear() + 1;
    

    $(document).ready(function () {



        tableau.extensions.initializeAsync().then(function () {
            loadSelectedSheet();
            document.getElementById("configure").addEventListener("click", openConfig);

            function openConfig() {
                tableau.extensions.ui.displayDialogAsync(
                    "config.html",
                    "",
                    { height: 300, width: 400 }
                );
            }


            //loadData();

            worksheet.addEventListener(
                tableau.TableauEventType.FilterChanged,
                loadData
            );

            /*tableau.extensions.settings.addEventListener(
                tableau.TableauEventType.SettingsChanged,
                loadData
            );*/
            tableau.extensions.settings.addEventListener(
                tableau.TableauEventType.SettingsChanged,
                loadSelectedSheet

            );

        }, function (err) {
            // Something went wrong in initialization.
            console.log('Error while Initializing: ' + err.toString());
        });


    });
    function exportTableToExcel(sheetname) {

        let data = [];

        // =========================
        // CLEAN HEADERS
        // =========================

        let headers = [];

        document.querySelectorAll("#dataTable thead th").forEach(th => {

            // Get only text node (ignores span icon)
            let headerText = "";

            th.childNodes.forEach(node => {

                if (node.nodeType === Node.TEXT_NODE) {
                    headerText += node.textContent;
                }

            });

            headers.push(headerText.trim());

        });

        data.push(headers);

        // =========================
        // TABLE DATA
        // =========================

        document.querySelectorAll("#dataTable tbody tr").forEach(tr => {

            let row = [];

            tr.querySelectorAll("td").forEach(td => {

                let link = td.querySelector("a");

                if (link) {

                    row.push({
                        t: 's',
                        v: link.innerText,
                        l: { Target: link.href }
                    });

                } else {

                    row.push(td.innerText.trim());

                }

            });

            data.push(row);

        });

        // =========================
        // CREATE EXCEL
        // =========================

        const ws = XLSX.utils.aoa_to_sheet(data);

        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, ws, "Table Data");

        XLSX.writeFile(wb, sheetname + ".xlsx");
    }

    async function loadSelectedSheet() {
        const sheetName = tableau.extensions.settings.get("worksheet");

        if (!sheetName) {
            console.log("No sheet selected yet");
            return;
        }
        $('.sheetname')[0].textContent = sheetName;
        worksheet = tableau.extensions.dashboardContent.dashboard.worksheets
            .find(ws => ws.name === sheetName);

        if (!worksheet) {
            console.error("Worksheet not found:", sheetName);
            return;
        }

        console.log("Loaded worksheet:", sheetName);
        if (sheetName) { $('#configure').hide(); }
       
        await loadData();  // 👈 call your data function
        $("#excelexport").click(function () { exportTableToExcel(sheetName) });
       
    }



  async  function loadData() {
    try{
        document.getElementById("loader").style.display = "flex";
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
                if (col.includes('AGG(') || col.includes('SUM(') || col.includes('MAX(') || col.includes('MIN(') || col.includes('COUNT(') || col.includes('COUNTD(')) {
                    col = col.replace('AGG(', '').replace('SUM(', '').replace('MAX(', '').replace('MIN(', '').replace('COUNT(', '').replace('COUNTD(', '');
                    col = col.substring(0, col.length - 1)
                }
                if (col.includes('cfy⇅'))
                {
                    const columnsplit=col.split('⇅');
                    //FY⇅cfy⇅-⇅1⇅ Balance
                    if (columnsplit[2]==='-')
                    {
                        col=columnsplit[0]+(cfy-columnsplit[3])+columnsplit[4];
                    }else
                    {
                         col=columnsplit[0]+(cfy+(columnsplit[3]*1))+columnsplit[4];
                    }
                }
                th.innerHTML = `${col}
               
                <span class="sort-icon">⇅</span>
            `;

                th.onclick = () => sortTable(index);

                headerRow.appendChild(th);
            });

            thead.appendChild(headerRow);

            // Rows
            sumdata.data.forEach(row => {

                let tr = document.createElement("tr");

                row.forEach((cell, i) => {

                    let td = document.createElement("td");

                    // detect hyperlink column
                    if (columns[i].toLowerCase().includes("link")) {

                        let a = document.createElement("a");

                        a.href = cell.value;                 // raw value for URL
                        a.innerText = cell.formattedValue;  // formatted for display
                        a.target = "_blank";
                        a.innerHTML = 'Click to View';
                        td.appendChild(a);

                        td.dataset.raw = cell.value;        // for sorting

                    } else {

                        td.innerHTML = cell.formattedValue; // keep tableau formatting
                        td.dataset.raw = cell.value;        // raw for sorting
                    }

                    tr.appendChild(td);
                });

                // Selection action
                tr.onclick = () => selectMarks(row);

                tbody.appendChild(tr);

            });

        });
         await new Promise(resolve =>
            requestAnimationFrame(resolve)
        );
    }catch (err) {

        console.error(err);

    }
    finally {
        setTimeout(function(){
            document.getElementById("loader").style.display = "none";
        },5000)

        

    }
    }


    // Sorting
    function sortTable(columnIndex) {

        const table = document.getElementById("dataTable");
        const rows = Array.from(table.rows).slice(1);

        // toggle direction
        if (currentSortCol === columnIndex) {
            sortDirection = sortDirection === "asc" ? "desc" : "asc";
        } else {
            sortDirection = "asc";
        }

        currentSortCol = columnIndex;

        rows.sort((a, b) => {

            let A = a.cells[columnIndex].dataset.raw || a.cells[columnIndex].innerText;
            let B = b.cells[columnIndex].dataset.raw || b.cells[columnIndex].innerText;

            if (!isNaN(A) && !isNaN(B)) {
                return sortDirection === "asc" ? A - B : B - A;
            }

            return sortDirection === "asc"
                ? A.localeCompare(B, undefined, { numeric: true })
                : B.localeCompare(A, undefined, { numeric: true });
        });

        rows.forEach(row => table.tBodies[0].appendChild(row));

        updateSortIcons();
    }

    function updateSortIcons() {

        document.querySelectorAll("th").forEach((th, i) => {

            let icon = th.querySelector(".sort-icon");

            if (i === currentSortCol) {
                icon.textContent = sortDirection === "asc" ? "▲" : "▼";
            } else {
                icon.textContent = "⇅";
            }
        });
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
