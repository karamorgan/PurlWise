const setupID = window.location.pathname.split('/').pop();
let stitchDisplay = document.getElementById('stitch-display');
let rowDisplay = document.getElementById('row-display');
let forthcoming = document.getElementById('forthcoming');
let current = document.getElementById('current');
let completed = document.getElementById('completed');
const fwdBtn = document.getElementById('forward');
const bkwdBtn = document.getElementById('backward');
const advIncRadios = document.getElementsByName('advance-type');

getAdvInc(); // Increment to advance with each cue. Advance through pattern by stitch, stitch group, or row (default: stitch)

// Initializes display by first retrieving setup and pattern data, then building the rows to display, finally building the iterator to
// accept user cues and drive pattern progress
(function() {
    Promise.all([data('GET', 'setup'), data('GET', 'pattern')]).then(buildRows).then(buildIterator).catch(error => {
        console.log('failed to build display');
        console.log(error);
    });
})();

// Builds rows by traversing the pattern data tree and sending each row one at a time to the displayRows function
// Accepts setup and pattern data after it was retrieved from the database
// Returns a generator object that will be called by the user-cued iterator each time a new row is needed in the display
function buildRows([setup, pattern]) {
    let beforeAfter = 1; // Number of rows to display in each the forthcoming and completed divs
    let direction;
    let count = beforeAfter;

    function* rowGen(root, depth = 0) {
        depth++;
        for(let instance = direction ? root.instances : 1; instance <= root.instances && instance > 0; direction ? instance-- : instance++) {

            if(depth === 3) {
                displayRows(root, direction);
                if(count === 0) { // Count ensures that the row to highlight is always in the current div
                    let previous = direction; // Remember the current direction to detect a flip after the next yield
                    direction = yield;
                    if(previous !== direction) {
                        count = beforeAfter * 2;
                    }
                } else count--;
            }

            if(depth < 3) {
                for(let childInd = direction ? root.children.length - 1 : 0; childInd < root.children.length && childInd >= 0; direction ? childInd-- : childInd++) {
                    yield* rowGen(root.children[childInd], depth);
                }
            }

            // After all rows have been visited (returned to pattern root), send blank rows until last row is in current div
            if(depth === 1) {
                while(count < beforeAfter) {
                    displayRows(null, direction);
                    count++;
                }
                direction = yield;
                count = beforeAfter * 2;
                yield* rowGen(root, depth = 0);
            }
        }
    };

    return [setup, rowGen(pattern)];
};

// Iterates through data by traversing the nested DOM elements representing each row
// Accepts setup data (to track progress) and row generator object (so new rows can be called when needed for display)
// Creates a generator object that will be called by user cue each time the forward or backward buttons are clicked
// Each time the generator object yields, it will highlight the current stitch DOM element(s) and return the current stitch count
function buildIterator([setup, rowGenObj]) {

    // Stitch generator function accepts the child div (containing row elements) of the "current" div container
    // A new row div will be provided by the row generator object whenever the end of the current row has been reached
    function* stitchGen(elem, stitchCount = 0, direction = null) {

        // First, iteratively traverses the nested row div (equivalent to a tree structure) using a stack (LIFO)
        // Builds an array in the order each element will be visited in post-order depth-first traversal
        let stack = [{ node: elem, depth : 1 }];
        let ordered = [];

        while(stack.length) {
            let node = stack.pop();
            ordered.push(node);
            for(let child of node.node.children) {
                stack.push({ node: child, depth: node.depth + 1 });
            }
        }

        // Traverses the array to visit each element in order. Direction can be reversed depending on which button cues the generator
        for(let i = direction ? 0 : ordered.length - 1; direction ? i < ordered.length : i >= 0; direction ? i++ : i--) {
            if(ordered[i].depth === 4) direction ? stitchCount-- : stitchCount++;
            if(ordered[i].depth == advInc) {
                ordered[i].node.classList.add('highlight');
                let prevInc = advInc;
                direction = yield stitchCount; // Yields when next element of the specified advance increment depth is visited
                if(direction && prevInc != advInc) stitchCount++;
                ordered[i].node.classList.remove('highlight');
            }
        }

        rowGenObj.next(direction); // Calls the row generator object to provide a new row, replacing the current div
        yield* stitchGen(current.firstElementChild, stitchCount, direction); // Recursive call with new current div
    };

    rowGenObj.next(); // Initialize rows in the display

    // Calls an initializing function to drive the iterator until current stitch progress is shown in the display
    findProgress(stitchGen(current.firstElementChild), setup); 
};

// Initializing function drives the stitch generator object until the stitchCount is greater than the pattern progress
// setup.progress represents the # of stitches completed, whereas stitchCount represents the last stitch in the highlighted increment
function findProgress(stitchGenObj, setup) {
    let stitchCount = 0;
    while(stitchCount <= setup.progress) {
        stitchCount = stitchGenObj.next().value;
    }
    console.log('count:', stitchCount,' progress:',setup.progress)
    fwdBkwd(stitchGenObj, setup, stitchCount);
};

// Something is currently buggy in the back button. stitchCount isn't always accurate when changing advance increment in reverse
// For now, just refresh if stitchCount isn't aligned with highlighted increment
function fwdBkwd(stitchGenObj, setup, count) {
    fwdBtn.addEventListener('click', () => {
        setup.progress = count;
        updateProgress(setup.progress); // Update progress in the database
        count = stitchGenObj.next().value;
    });

    bkwdBtn.addEventListener('click', () => {
        if(setup.progress > 0) {
            count = stitchGenObj.next('bkwd').value;
            setup.progress = count - 1;
            updateProgress(setup.progress); // Update progress in the database
        }
    });
};

// Updates pattern progress at database. PUT request because it is idempotent
function updateProgress(progress) {
    const body = JSON.stringify({ progress });
    data('PUT', 'setup', body).catch(error => {
        console.log('failed to update progress');
        console.log(error);
    });
};

// Builds row display, consisting of current row plus X rows already completed and X rows ahead in the pattern
// Accepts row data from row generator function and pattern advance direction, backward or undefined (i.e. forward)
// Builds DOM elements, no return data
function displayRows(row, direction) {

    // Build a div for each row, containing nested spans representing each node in the tree structure
    let rowDiv = document.createElement('div');
    if(row) {
        for(const stitchGroup of row.children) {
            for(let i = 1; i <= stitchGroup.instances; i++) {
                let stitchGroupSpan = document.createElement('span');
                for(const stitches of stitchGroup.children) {
                    let stitchesSpan = document.createElement('span');
                    for(let j = 1; j <= stitches.instances; j++) {
                        let stitchSpan = document.createElement('span');
                        stitchSpan.innerText += `${stitches.data}${stitches.instances} `;
                        stitchesSpan.appendChild(stitchSpan);
                    }
                    stitchGroupSpan.appendChild(stitchesSpan);
                }
                rowDiv.appendChild(stitchGroupSpan);
            }
        }
    }

    // Update row divs in each forthcoming, current, and completed divs. Each div shifts to make room for new row, and last row is removed
    if(direction) { // If advancing through pattern backward. direction = 'bkwd'
        completed.appendChild(rowDiv);
        current.appendChild(completed.firstElementChild);
        forthcoming.appendChild(current.firstElementChild);
        forthcoming.firstElementChild.remove();
    } else { // If advancing through pattern forward. Direction is null
        forthcoming.insertBefore(rowDiv, forthcoming.firstElementChild);
        current.insertBefore(forthcoming.lastElementChild, current.firstElementChild);
        completed.insertBefore(current.lastElementChild, completed.firstElementChild);
        completed.lastElementChild.remove();
    }
};

// Update pattern advance increment (advance by stitch, stitch group, or row)
function getAdvInc() {
    advInc = document.querySelector('input[name="advance-type"]:checked').value;
};

advIncRadios.forEach(radio => {
    radio.addEventListener('click', getAdvInc);
});

// General purpose http request function for any backend communication
function data(type, route, body) {
    return new Promise((resolve, reject) => {
        const xhttp = new XMLHttpRequest();
        xhttp.open(type, `/${route}/data/${setupID}/`, true);
        xhttp.onload = function() {
            let response = this.response;
            if(this.status === 200) {
                console.log(response.message);
                resolve(response.data);
            } else reject(response);
        }
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.responseType = 'json';
        xhttp.send(body);
    });
};