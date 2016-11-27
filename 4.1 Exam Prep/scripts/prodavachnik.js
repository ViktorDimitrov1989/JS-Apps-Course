function startApp() {
    const baseUrl = 'https://baas.kinvey.com/';
    const appKey = 'kid_Skj11XvGl';
    const appSecret = '9dea3c14c7654011abc8746529148601';
    const authHeaders = {
        'Authorization': 'Basic ' + btoa(appKey + ':' + appSecret)
    };

    //Handling events in SPA app
    let system = {
        displayError: (error) => {
            let errorBox = $('#errorBox');
            errorBox.text(error.responseJSON.error);
            errorBox.show();

        },
        displayInfoMsg: (msg) => {
            let infoBox = $('#infoBox');
            infoBox.text(msg);
            infoBox.show();
            setTimeout(() => {
                infoBox.hide();
            }, 2500)
        },
        displayLoadingBar: {

            ajaxStart: function () {
                $("#loadingBox").show()
            }
            ,
            ajaxStop: function () {
                $("#loadingBox").hide()
            }
        },
        getKinveyAuthHeaders: () => {
            return {"Authorization": "Kinvey " + sessionStorage.getItem('authToken')}
        }

    };
    //Hide Info and errorBox on click
    $('#infoBox, #errorBox').click(function () {
        $(this).fadeOut();
    });
    // Attach AJAX "loading" event listener
    $(document).on({
        ajaxStart: function () {
            $("#loadingBox").show()
        },
        ajaxStop: function () {
            $("#loadingBox").hide()
        }
    });
    //Draw menu links
    showHideMenuLinks();
    showView('viewHome');
    //Click Events
    $('#linkHome').click(() => {
        showView('viewHome')
    });
    $('#linkLogin').click(() => {
        $('#formLogin input[name=username]').val('');
        $('#formLogin input[name=passwd]').val('');
        showView('viewLogin')
    });
    $('#linkRegister').click(() => {
        $('#formRegister input[name=username]').val('');
        $('#formRegister input[name=passwd]').val('');
        showView('viewRegister')
    });
    $('#linkListAds').click(() => {
        listAds();
        showView('viewAds')
    });
    $('#linkCreateAd').click(() => {
        showView('viewCreateAd');
    });
    //Button click's section
    $('#buttonLoginUser').click(loginUser);
    $('#buttonRegisterUser').click(registerUser);
    $('#linkLogout').click(logout);
    $('#buttonCreateAd').click(createAd);

    //Take care of showing only needed links
    function showHideMenuLinks() {
        if (sessionStorage.getItem('authToken')) {
            $('#linkRegister').hide();
            $('#linkHome').show();
            $('#linkLogin').hide();
            $('#linkLogout').show();
            $('#linkCreateAd').show();
            $('#linkListAds').show();
        }
        else {
            $('#linkRegister').show();
            $('#linkHome').show();
            $('#linkLogin').show();
            $('#linkLogout').hide();
            $('#linkCreateAd').hide();
            $('#linkListAds').hide();
        }
    }

    //Hide's all views and display the passed in view
    function showView(view) {
        $('main > section').hide();
        $(`#${view}`).show();
    }

    //Login User
    function loginUser() {
        let username = $('#formLogin input[name=username]');
        let password = $('#formLogin input[name=passwd]');
        let data = {
            username: username.val(),
            password: password.val()
        };
        $.ajax({
            method: 'POST',
            url: `${baseUrl}user/${appKey}/login`,
            headers: authHeaders,
            data: data
        })
            .then(loginSuccess)
            .catch(system.displayError);

        function loginSuccess(userInfo) {
            saveUserAuth(userInfo);
            system.displayInfoMsg('Registration successful');
        }
    }

    //Logout User
    function logout() {
        sessionStorage.clear();
        showHideMenuLinks();
        showView('viewHome');
        system.displayInfoMsg('Logout successful');
    }

    //Register User
    function registerUser() {
        let data = {
            username: $('#formRegister input[name=username]').val(),
            password: $('#formRegister input[name=passwd]').val()
        };
        $.ajax({
            method: 'POST',
            url: `${baseUrl}user/${appKey}`,
            data: data,
            headers: authHeaders

        })
            .then(registerSuccess)
            .catch(system.displayError);

        function registerSuccess(userInfo) {
            saveUserAuth(userInfo);
            system.displayInfoMsg('Registration successful');
        }
    }

    //Authenticate user - login/register
    function saveUserAuth(userObj) {
        sessionStorage.setItem('authToken', `${userObj._kmd.authtoken}`);
        sessionStorage.setItem('username', `${userObj.username}`);
        sessionStorage.setItem('userId', `${userObj._id}`);
        showHideMenuLinks();
        showView('viewHome');
    }

    //List Advertisements
    function listAds() {
        $.ajax({
            method: "GET",
            url: `${baseUrl}appdata/${appKey}/offers`,
            headers: system.getKinveyAuthHeaders()
        })
            .then(successListAds)
            .catch(system.displayError);

        function successListAds(adverts) {
            let table = $('#ads table tbody');
            table.empty();
            table.append(`<tr>
                    <th>Title</th>
                    <th>Publisher</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Date Published</th>
                </tr>`);
            appendAdvertsRow(table, adverts);
        }
        function appendAdvertsRow(table, adverts) {
            for (let advert of adverts) {
                let tr = $(`<tr><td>${advert.title}</td>
                            <td>${advert.publisher}</td>
                            <td>${advert.description}</td>
                            <td>${advert.price}</td>
                            <td>${advert.dateOfPublishing}</td>
                            </tr>`);
                if(advert._acl.creator == sessionStorage.getItem('userId')){
                    let td = $(`<td></td>`);
                    let editLink = $(`<a href ='#' id="editAd">[Edit]</a>&nbsp`)
                        .click(function() {
                            editAdvert(advert)
                        });

                    let deleteLink = $(`<a href ='#' id="deleteAd">[Delete]</a>`)
                        .click(function() {
                            deleteAdvert(advert)
                        });

                    td.append(editLink)
                        .append(deleteLink)
                        .appendTo(tr);

                }
                else{
                    tr.append(`<td></td>`);
                }

                table.append(tr);
            }
        }
        function editAdvert(advert) {
            //Edit ajax request TODO
        }
        function deleteAdvert(advert) {
            //Delete ajax request TODO
        }
    }

    //Create Advertisement
    function createAd() {
        let data = {
            title: $('#formCreateAd input[name=title]').val(),
            dateOfPublishing: $('#formCreateAd input[name=datePublished]').val(),
            publisher: sessionStorage.getItem('username'),
            description: $('#formCreateAd textarea[name=description]').val(),
            price: $('#formCreateAd input[name=price]').val()
        };
        $.ajax({
            method: "POST",
            url: `${baseUrl}appdata/${appKey}/offers`,
            data: data,
            headers: system.getKinveyAuthHeaders()
        })
            .then(successfulCreateAd)
            .catch(system.displayError);
        function successfulCreateAd() {
            listAds();
            showView('viewAds');
            system.displayInfoMsg('Advertisement is successfully created')
        }
    }


}