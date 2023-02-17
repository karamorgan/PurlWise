const patternList = document.getElementById('pattern-list');

(function() {
    updateDisplay();
})();

// Retrieves an array containing all of the existing pattern setups in the database, then builds a list from its contents
// Later this will only return setups associated with the specific user
function updateDisplay() {
    data('GET', '/setup/all').then(buildPatternDisplay).catch(error => {
        console.log('failed to build display');
        console.log(error);
    }); 
};

// Takes array of pattern setups and creates list item and delete button for each
function buildPatternDisplay(patterns) {
    patternList.innerHTML = '';
    patterns.forEach(pattern => {
        let patternItem = document.createElement('li');
        patternItem.innerText = pattern._id;
        let deleteBtn = document.createElement('button');
        deleteBtn.innerText = 'Delete';
        deleteBtn.value = pattern._id;
        deleteBtn.addEventListener('click', deletePattern);
        patternItem.appendChild(deleteBtn);
        patternList.appendChild(patternItem);
    });
};

// Takes click event from delete button, first deletes pattern contents from pattern collection
// Then deletes pattern setup from setup collection, then updates displays
async function deletePattern(event) {
    try {
        let setupID = event.target.value;
        await data('DELETE', '/pattern/data/' + setupID);
        await data('DELETE', '/setup/data/' + setupID);
        updateDisplay();
    } catch (error) {
        console.log('failed to delete pattern');
        console.log(error);
    }
};

// General purpose http request function for any backend communication
function data(type, route, body) {
    return new Promise((resolve, reject) => {
        const xhttp = new XMLHttpRequest();
        xhttp.open(type, route, true);
        xhttp.onload = function() {
            try {
                let response = this.response;
                if(this.status === 200) {
                    console.log(response.message);
                    resolve(response.data);
                } else throw response;
            } catch (error) {
                reject(error);
            }
        }
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.responseType = 'json';
        xhttp.send(body);
    });
};