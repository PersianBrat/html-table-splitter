function traverseTableTest(table) {
    const traversedTable = traverseTable(table);
    const matrix = traversedTable.matrixRepresentation;

    console.log(`Number of table rows: `, table.rows.length);
    console.log(`Malformed: `, traversedTable.isMalformed);
    console.log(`pretty matrix: `, prettifyMatrix(matrix));
}

function convertMatrixToTableTest(table) {
    const traversedTable = traverseTable(table);

    const conversionResult = convertMatrixToTable(traversedTable.matrixRepresentation, document);

    console.log(`Matrix converted to: `, conversionResult);

    const conversionSectionElement = document.getElementById("conversionSection");

    if (conversionSectionElement.hidden)
        conversionSectionElement.removeAttribute("hidden");

    const listElement = conversionSectionElement.getElementsByTagName("ol")[0];
    const listItemElement = document.createElement("li");
    listItemElement.appendChild(conversionResult);
    listElement.appendChild(listItemElement)
}

function splitTableTest(table) {
    const conversionSectionElement = document.getElementById("conversionSection");

    if (conversionSectionElement.hidden)
        conversionSectionElement.removeAttribute("hidden");

    const listElement = conversionSectionElement.getElementsByTagName("ol")[0];
    const listItemElement = document.createElement("li");

    const rowIndex = 1;

    try {
        console.log(`Splitting table at row ${rowIndex} ...`);

        const { topTable, bottomTable } = splitTableAtRow(table, rowIndex);

        listItemElement.appendChild(topTable);
        listItemElement.appendChild(bottomTable);
    } catch (e) {
        console.error(e);
        listItemElement.textContent = `UNABLE TO SPLIT: ${e}`;
    }

    listElement.appendChild(listItemElement)
}

function prettifyMatrix(matrixRepresentation) {
    const rowsCount = matrixRepresentation.length;
    if (rowsCount == 0)
        return [];

    const columnsCount = matrixRepresentation[0].length;
    if (columnsCount == 0)
        return [[]];

    let prettyMatrix = [];

    for (let i = 0; i < rowsCount; i++) {
        if (!prettifyMatrix[i])
            prettyMatrix[i] = [];

        for (let j = 0; j < columnsCount; j++) {
            const cell = matrixRepresentation[i][j];
            prettyMatrix[i][j] = `(${cell[0]},${cell[1]})`;
        }
    }

    return prettyMatrix;
}

function runTestsFor(testFunc) {
    const testTables = getAllTestTables();

    console.log(`Number of test tables: `, testTables.length);

    testTables.forEach((table, i) => {
        console.log(`Running test for table No. ${i + 1}... [#${table.id}]`);
        testFunc(table);
    });
}

function getAllTestTables() {
    const testTablesSectionElement = document.getElementById("testTablesSection");
    return testTablesSectionElement.querySelectorAll('table');
}

const runAllTests = () => runTestsFor(splitTableTest);