function attachEvents() {
    const appId = 'kid_HkUm0wyfl';
    const serviceUrl = 'https://baas.kinvey.com/appdata/' + appId + '/biggestCatches/';
    const username = 'pesho';
    const password = 'p';
    const base64auth = btoa(username + ':' + password);
    const authHeaders = {'Authorization': 'Basic ' + base64auth};

    $('.load').click(loadCatches);
    $('.add').click(addCatch);

    function addCatch() {
        let obj = {
            "angler": `${$('#addForm .angler').val()}`,
            "weight": $('#addForm .weight').val(),
            "species": `${$('#addForm .species').val()}`,
            "location": `${$('#addForm .location').val()}`,
            "bait": `${$('#addForm .bait').val()}`,
            "captureTime": $('#addForm .captureTime').val()
        };
        $.ajax({
            method: "POST",
            url: serviceUrl,
            data: obj,
            headers: authHeaders
        })
            .then(loadCatches)
            .catch(showError);


    }
    
    function deleteCatch() {
        $.ajax({
            method: "DELETE",
            url: serviceUrl + `${$(this).parent().attr('data-id')}`,
            headers: authHeaders
        })
            .then(loadCatches)
            .catch(showError)
    }

    function loadCatches() {
        $('#catches').empty();
        $.get({
            url: serviceUrl,
            headers: authHeaders
        })
            .then(listAllCatches)
            .catch(showError);
    }

    function updateCatch() {
        let angler;
        let weight;
        let species;
        let location;
        let bait;
        let captureTime;
        $.get({
            url: serviceUrl + `${$(this).parent().attr('data-id')}`,
            headers: authHeaders
        })
            .then((data) => {
                let parentId = $(this).parent().attr('data-id');
                angler = $(`div[data-id=${parentId}] .angler`).val();
                weight = $(`div[data-id=${parentId}] .weight`).val();
                species = $(`div[data-id=${parentId}] .species`).val();
                location = $(`div[data-id=${parentId}] .location`).val();
                bait = $(`div[data-id=${parentId}] .bait`).val();
                captureTime = $(`div[data-id=${parentId}] .captureTime`).val();

                let obj = {
                    "angler": `${angler}`,
                    "weight": weight,
                    "species": `${species}`,
                    "location": `${location}`,
                    "bait": `${bait}`,
                    "captureTime": captureTime
                };
                $.ajax({
                    method: "PUT",
                    url: serviceUrl + `${$(this).parent().attr('data-id')}`,
                    headers: authHeaders,
                    data: obj
                })
                    .then(loadCatches)
                    .catch(showError);
            })
    }

    function listAllCatches(result) {
        for (let obj of result) {
            let mainDiv = $(`<div class="catch" data-id="${obj._id}">`);
            let anglerLabel = $('<label>Angler</label>');
            let anglerInput = $('<input type="text" class="angler">');
            let weightLabel = $('<label>Weight</label>');
            let weightInput = $('<input type="number" class="weight">');
            let speciesLabel = $('<label>Species</label>');
            let speciesInput = $('<input type="text" class="species">');
            let locationLabel = $('<label>Location</label>');
            let locationInput = $('<input type="text" class="location">');
            let baitLabel = $('<label>Bait</label>');
            let baitInput = $('<input type="text" class="bait">');
            let captureTimeLabel = $('<label>Capture Time</label>');
            let captureTimeInput = $('<input type="number" class="captureTime">');
            let updateBtn = $('<button class="update">Update</button>');
            let deleteBtn = $('<button class="delete">Delete</button>');

            mainDiv
                .append(anglerLabel)
                .append(anglerInput.val(obj.angler))
                .append(weightLabel)
                .append(weightInput.val(obj.weight))
                .append(speciesLabel)
                .append(speciesInput.val(obj.species))
                .append(locationLabel)
                .append(locationInput.val(obj.location))
                .append(baitLabel)
                .append(baitInput.val(obj.bait))
                .append(captureTimeLabel)
                .append(captureTimeInput.val(obj.captureTime))
                .append(updateBtn.click(updateCatch))
                .append(deleteBtn.click(deleteCatch))
                .appendTo($('#catches'));
        }
    }
}
function showError(error) {
    console.log(error.statusText);
}