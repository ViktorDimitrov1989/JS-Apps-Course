function startApp() {
    const baseUrl = 'https://baas.kinvey.com/';
    const appKey = 'kid_Skj11XvGl';
    const appSecret = '9dea3c14c7654011abc8746529148601';
    const authHeaders = {
        'Authorization': 'Basic ' + btoa(appKey + ':' + appSecret)
    };

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
        showView('viewListAds')
    });
    //Button click's section
    $('#buttonLoginUser').click(loginUser);
    $('#buttonRegisterUser').click(registerUser);
    $('#linkLogout').click(logout);

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
            .then(saveUserAuth)
            .done(eventHandling.displayInfoMsg('Login successful'))
            .catch(eventHandling.displayError);
    }

    //Logout User
    function logout() {
        sessionStorage.clear();
        showHideMenuLinks();
        showView('viewHome');
        eventHandling.displayInfoMsg('Logout successful');
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
            .then(saveUserAuth)
            .then(eventHandling.displayInfoMsg('Login successful'))
            .catch(displayError)
    }

    function saveUserAuth(userObj) {
        sessionStorage.setItem('authToken', `${userObj._kmd.authtoken}`);
        sessionStorage.setItem('username', `${userObj.username}`);
        sessionStorage.setItem('userId', `${userObj._id}`);
        showHideMenuLinks();
        showView('viewHome');
    }

    let eventHandling = {
        displayError: (error) => {
            let errorBox = $('#errorBox');
            errorBox.text(error.responseJSON.error);
            errorBox.show();

        },
        displayInfoMsg: (msg) => {
            let infoBox = $('#infoBox');
            infoBox.text(msg);
            infoBox.show();
        },
        displayLoadingBar: () => {

        }
    };


}