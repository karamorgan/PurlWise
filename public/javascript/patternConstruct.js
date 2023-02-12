const addStitchesBtn = document.getElementById('add-stitches-btn');
let stitchTypeInput = document.getElementById('stitch-type-select');
let stitchNumInput = document.getElementById('stitch-num');
let rowBuildList = document.getElementById('row-build-list');
const repeatNum = document.getElementById('repeat-num');
const groupRepeatBtn = document.getElementById('repeat-group-btn');
const nextRowBtn = document.getElementById('next-row-btn');
let rowGroupBuildList = document.getElementById('row-group-build-list');
const displayLink = document.getElementById('pattern-display-link');

// Restructure later to avoid using global variables
const setupID = window.location.pathname.split('/').pop();
let displays = {
    rowGroup: null,
    row: null
};

// Initializes displays and adds event listeners
(function() {
    displayLink.href += setupID;
    updateDisplays('GET', 'display', null, 'failed to build displays');
    eventListeners();
})();

// General purpose function to post data to database or get the IDs of the row/rowgroup to display, then rebuild the displays
function updateDisplays(type, route, body, errorMsg) {
    data(type, route, body).then(buildDisplays).catch(error => {
        console.log(errorMsg);
        console.log(error);
    }); 
};

// Retrieves row or row group data from database, then builds the display lists
// Need to separate this function by row and row group to avoid unnecessary calls to database when row group doesn't change
// Also consider how we might just add individual DOM elements one at a time instead of rebuilding entire list each time
function buildDisplays(newDisplays) {
    if(newDisplays) displays = newDisplays;
    rowBuildList.innerHTML = '';
    rowGroupBuildList.innerHTML = '';

    data('GET', 'data', null, displays.row).then(addRowListItems);
    data('GET', 'data', null, displays.rowGroup).then(addRowGroupListItems);
};

// Creates DOM elements to represent each stitch in a row as a list
function addRowListItems(row) {
    for(const stitchGroup of row.children) {
        for(const stitches of stitchGroup.children) {
            let listItem = document.createElement('li');
            listItem.innerText = stitches.data + stitches.instances;
            rowBuildList.appendChild(listItem);

            if(stitchGroup.instances === 1) {
                let checkbox = document.createElement('input');
                checkbox.setAttribute('type', 'checkbox');
                checkbox.id = stitches.id;
                checkbox.addEventListener('click', click1click2);
                listItem.appendChild(checkbox);
            }
        }
    }
};

// Creates DOM elements to represent each row in a row group as a list
function addRowGroupListItems(rowGroup) {
    for(const row of rowGroup.children) {
        let listItem = document.createElement('li');
        let rowData = [];
        for(const stitchGroup of row.children) {
            let stitchGroupData = [];
            for(const stitches of stitchGroup.children) {
                stitchGroupData.push(stitches.data + stitches.instances);
            }
            stitchGroupData = stitchGroupData.join(', ');
            if(stitchGroup.instances > 1) stitchGroupData = `[${stitchGroupData}](x${stitchGroup.instances})`;
            rowData.push(stitchGroupData);
        }

        listItem.innerText = rowData.join(', ');
        rowGroupBuildList.appendChild(listItem);
    }
};

// How to pass display data into the event listeners when variables aren't global?
function eventListeners() {
    addStitchesBtn.addEventListener('click', addStitches);

    groupRepeatBtn.addEventListener('click', groupRepeat);

    nextRowBtn.addEventListener('click', () => {
        displays.row = null;
        rowBuildList.innerHTML = '';
    });
};

// Manipulates the data tree at the database by splitting existing groups of stitches into smaller repeat groups
// This allows us to store fewer documents to represent repetitive data, instead of adding each stitch individually
function groupRepeat() {
    let checked = document.querySelectorAll('input[type="checkbox"]:checked');
    let checkedData = JSON.stringify( {
        first: checked[0].id, 
        last: checked[checked.length - 1].id,
        instances: repeatNum.value
    }); // Later add logic to require values for both

    updateDisplays('POST', 'split', checkedData);
}

function addStitches() {
    let stitches = {    // Make these fields required
        data: stitchTypeInput.value,
        instances: parseInt(stitchNumInput.value)
    };

    // Specifies where to add the stitches in the data tree by sending the active display identifiers
    let stitchData = JSON.stringify({ stitches: stitches, displays: displays });

    updateDisplays('POST', 'add', stitchData);
};

// Need to access these across multiple different event listeners, but shouldn't use global variables
// Maybe convert checkboxes to instances of constructor later?
let click1 = null;
let click2 = null;

// Assigns stitch IDs of the boxes clicked to click1 and click2 in order to fill all boxes between
function click1click2() {
    const click = this;
    if(click1 && !click2) {
        click1 === click.id ? click1 = null : click2 = click.id;
    }
    else {
        click1 = click.id;
        click2 = null;
    }
    if(click1 && click2) fillBoxes();
};

// Fills all boxes between the last two checkboxes clicked so the user can visualize which stitches will be added to the repeat group
// Only the first and last box IDs will be sent to the backend to do the manipulation of the data tree at the database
function fillBoxes() {
    let checkboxes = document.querySelectorAll('input[type="checkbox"]');
    let checked = false;
    for(let box of checkboxes) {
        if(box.id === click1 || box.id === click2) {
            box.checked = true;
            if(click2) checked ^= true;
        }
        else box.checked = checked;
    }
};

// General purpose http request function for retrieving or sending any data from/to the database
function data(type, route, body, patternID) {
    return new Promise((resolve, reject) => {
        const xhttp = new XMLHttpRequest();
        xhttp.open(type, ['/pattern', route, setupID, patternID].join('/'), true);
        xhttp.onload = function() {
            let response = this.response;
            if(this.status === 200) {
                console.log(response.message);
                resolve(response.data);
            } else reject(response);
        }
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.responseType = 'json';
        xhttp.send(body);
    });
};