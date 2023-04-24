function traverseTable(table) {
    const rowsCount = table.rows.length;

    let minColumns = Infinity, maxColumns = 0;

    let matrix = [];

    for (let i = 0; i < rowsCount; i++) {
        if (!matrix[i])
            matrix[i] = [];

        const rowCellsCount = table.rows[i].cells.length;

        let j = 0;

        for (let j2 = 0; j2 < rowCellsCount; j2++) {
            while (matrix[i][j])
                j++;

            const cell = table.rows[i].cells[j2];

            transferTableCellToMatrix(matrix, i, j, cell);
        }

        while (matrix[i][j])
            j++;

        if (j < minColumns)
            minColumns = j;

        if (j > maxColumns)
            maxColumns = j;
    }

    return {
        matrixRepresentation: matrix,
        isMalformed: maxColumns !== minColumns
    };
}

function transferTableCellToMatrix(matrix, row, column, cell) {
    for (let i = 0; i < cell.rowSpan; i++) {
        if (!matrix[row + i])
            matrix[row + i] = [];

        for (let j = 0; j < cell.colSpan; j++) {
            matrix[row + i][column + j] = {
                topLeftRow: row,
                topLeftColumn: column,
                value: cell.textContent
            };
        }
    }
}

function convertMatrixToTable(matrix, document) {
    const rowsCount = matrix.length;
    const columnsCount = matrix[0].length;

    const tbl = document.createElement("table");
    const tblBody = document.createElement("tbody");

    for (let i = 0; i < rowsCount; i++) {
        const row = document.createElement("tr");

        for (let j = 0; j < columnsCount; j++) {
            if (isCorrespondentTableCellAlreadyCreated(matrix, i, j))
                continue;

            const cell = document.createElement("td");

            const cellText = document.createTextNode(matrix[i][j].value);
            cell.appendChild(cellText);

            setRowSpanFromMatrix(cell, i, j, matrix);
            setColSpanFromMatrix(cell, i, j, matrix);

            row.appendChild(cell);
        }

        if (row.cells.length > 0)
            tblBody.appendChild(row);
    }

    tbl.appendChild(tblBody);

    return tbl;
}

function isCorrespondentTableCellAlreadyCreated(matrix, rowIndex, columnIndex) {
    const i = rowIndex;
    const j = columnIndex;

    return (i > 0 && matrix[i][j].topLeftRow === matrix[i - 1][j].topLeftRow)
        || (j > 0 && matrix[i][j].topLeftColumn === matrix[i][j - 1].topLeftColumn)
}

function setRowSpanFromMatrix(cell, rowIndex, columnIndex, matrix) {
    let i = rowIndex + 1;
    while (matrix[i]?.[columnIndex]?.topLeftRow === rowIndex)
        i++;
    const rowSpan = i - rowIndex;

    if (rowSpan > 1)
        cell.rowSpan = rowSpan;
}

function setColSpanFromMatrix(cell, rowIndex, columnIndex, matrix) {
    let j = columnIndex + 1;
    while (matrix[rowIndex][j]?.topLeftColumn === columnIndex)
        j++;
    const colSpan = j - columnIndex;

    if (colSpan > 1)
        cell.colSpan = colSpan;
}

/* ********** ********** ********** ********** */

function normalizeTable(table) {
    for (let i = 0; i < table.rows.length; i++) {
        while (table.rows[i].cells.length === 0)
            table.deleteRow(i);
    }
}

/* ********** ********** ********** ********** */

function splitTableAtRow(table, rowIndex) {
    let document = table.ownerDocument;
    if (!document)
        throw "Invalid table element";

    const { matrixRepresentation: matrix, isMalformed } = traverseTable(table);
    if (isMalformed)
        throw "The table is malformed. Cannot split a malformed table.";

    const { topMatrix, bottomMatrix } = splitMatrixAtRow(matrix, rowIndex);

    const topTable = convertMatrixToTable(topMatrix, document);
    const bottomTable = convertMatrixToTable(bottomMatrix, document);

    return { topTable, bottomTable };
}

function splitMatrixAtRow(matrix, rowIndex) {
    const rowsCount = matrix.length;

    if (rowIndex < 0 || rowIndex >= rowsCount)
        throw "Invalid rowIndex";

    if (rowIndex === 0)
        throw "Cannot split at first row";

    const topMatrix = calculateSplitterTopMatrix(matrix, rowIndex);
    const bottomMatrix = calculateSplitterBottomMatrix(matrix, rowIndex);

    return { topMatrix, bottomMatrix };
}

function calculateSplitterTopMatrix(matrix, rowIndex) {
    const columnsCount = matrix[0].length;
    let topMatrix = [];

    for (let i = 0; i < rowIndex; i++) {
        topMatrix[i] = matrix[i];
    }

    for (let j = 0; j < columnsCount; j++) {
        let i2;
        for (i2 = rowIndex; matrix[i2][j].topLeftRow === matrix[rowIndex - 1][j].topLeftRow; i2++) {
            if (!topMatrix[i2])
                topMatrix[i2] = [];
            topMatrix[i2][j] = matrix[i2][j]
        }
    }

    fillBottomEdge(topMatrix, rowIndex);

    return topMatrix;
}

function fillBottomEdge(matrix, rowIndex) {
    if (rowIndex < 0)
        throw "Invalid row index";

    if (rowIndex === 0)
        throw "Cannot fill starting from first row (row index 0)";

    const height = matrix.length;
    const width = matrix[0].length;

    if (rowIndex >= height)
        return;

    for (let i = rowIndex; i < height; i++) {
        for (let j = 0; j < width; j++)
            if (!matrix[i][j])
                matrix[i][j] = {
                    topLeftColumn: matrix[i - 1][j].topLeftColumn,
                    topLeftRow: matrix[i - 1][j].topLeftRow
                }
    }
}

function calculateSplitterBottomMatrix(matrix, rowIndex) {
    const rowsCount = matrix.length;
    const columnsCount = matrix[0].length;
    let bottomMatrix = [];

    for (let i = 0; i < rowsCount - rowIndex; i++) {
        if (!bottomMatrix[i])
            bottomMatrix[i] = [];

        for (let j = 0; j < columnsCount; j++) {
            let topLeftRow = matrix[rowIndex + i][j].topLeftRow - rowIndex;
            let value = matrix[rowIndex + i][j].value;

            if (topLeftRow < 0) {
                topLeftRow = 0;
                value = "";
            }

            bottomMatrix[i][j] = {
                topLeftRow: topLeftRow,
                topLeftColumn: matrix[rowIndex + i][j].topLeftColumn,
                value: value
            };
        }
    }

    return bottomMatrix;
}
