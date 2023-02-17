const setupForm = document.getElementById('setup-form');

// Sends pattern setup data
function sendSetupData() {

    // Converts form data to JSON object because Express can't handle multi-part data (?)
    // Note: This would not work for forms with multiple values for one key. Would need a multi-part parser
    const setupData = JSON.stringify(Object.fromEntries(new FormData(setupForm)));
    const xhttp = new XMLHttpRequest();

    xhttp.open('POST', '/setup');
    xhttp.onload = function() {
        try {
            let response = this.response;
            if(this.status === 200) {
                console.log(response.message);
                window.location.href = `/pattern/${response.data}`; // Redirect to pattern build page
            } else throw response;
        } catch (error) {
            console.log('failed to create pattern setup');
            console.log(error);
        }
    }
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.responseType = 'json';
    xhttp.send(setupData);
}

// Blocks default submit behavior so that page may be redirected after submission
setupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    sendSetupData();
});