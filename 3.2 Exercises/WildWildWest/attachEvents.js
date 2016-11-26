function attachEvents() {
    const baseUrl = 'https://baas.kinvey.com/';
    const kinveyId = 'kid_Sk_qD2rfg';
    const kinveyUser = 'pesho';
    const kinveyPass = 'pesho';
    const authHeaders = {
        "Authorization": "Basic " + btoa(kinveyUser + ':' + kinveyPass)
    };

    getPlayers();
    $('#addPlayer').click(addPlayer);


    function getPlayers() {
        $.ajax({
            method: "GET",
            url: `${baseUrl}appdata/${kinveyId}/players`,
            headers: authHeaders
        })
            .then(displayPlayers)
            .catch(displayError)
    }

    function displayPlayers(players) {
        $('#players').empty();
        for (let player of players) {
            let mainDiv = $(`<div class="player" data-id="${player._id}">`);
            let nameDiv = $(`<div class="row"><label>Name:</label><label class="name">${player.name}</label></div>`);
            let moneyDiv = $(`<div class="row"><label>Money:</label><label class="money">${player.money}</label></div>`);
            let bulletsDiv = $(`<div class="row"><label>Bullets:</label><label class="bullets">${player.bullets}</label></div>`);
            let playBtn = $('<button class="play">Play</button>');
            let deleteBtn = $('<button class="delete">Delete</button>');


            mainDiv.append(nameDiv)
                .append(moneyDiv)
                .append(bulletsDiv)
                .append(playBtn)
                .append(deleteBtn)
                .appendTo($('#players'));

            deleteBtn.click(() => {
                deletePlayer(player)
            });
            playBtn.click(() => {
                $('#canvas').css('display', 'block');
                $('#save').css('display', 'block');
                $('#reload').css('display', 'block');
                let obj = {
                    name: player.name,
                    money: Number(player.money),
                    bullets: Number(player.bullets)
                };
                loadCanvas(obj);
                $('#save').click(() => {
                    let data = {
                        name: obj.name,
                        money: obj.money,
                        bullets: obj.bullets
                    };
                    $.ajax({
                        method: "PUT",
                        url: `${baseUrl}appdata/${kinveyId}/players/${player._id}`,
                        headers: authHeaders,
                        data: data
                    })
                        .then(() => {
                            $('#canvas').css('display', 'none');
                            $('#save').css('display', 'none');
                            $('#reload').css('display', 'none');
                            clearInterval(canvas.intervalId);
                            getPlayers()
                        })
                        .catch(displayError)
                });
                $('#reload').click(() => {
                    obj.money -= 60;
                    obj.bullets += 6;
                })
            })

        }

        function deletePlayer(player) {
            $.ajax({
                method: "DELETE",
                url: `${baseUrl}appdata/${kinveyId}/players/${player._id}`,
                headers: authHeaders
            })
                .then(getPlayers)
                .catch(displayError)
        }
    }

    function addPlayer() {
        let data = {
            name: $('#addName').val(),
            money: Number(500),
            bullets: 6
        };
        $('#addName').val('');
        $.ajax({
            method: "POST",
            url: `${baseUrl}appdata/${kinveyId}/players`,
            headers: authHeaders,
            data: data
        })
            .then(getPlayers)
            .catch(displayError)
    }

    function displayError(error) {
        console.log(error);
    }
}



