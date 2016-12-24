function startApp(){
    const baseUrl = 'https://baas.kinvey.com';
    const appKey = 'kid_S1M49WK4g';
    const appSecret = '6e66cc0f735e44efb9da48b2b827bc11';
    
    showView('viewAppHome');
    $('#loadingBox, #infoBox, #errorBox').hide();
    loadingNotifications();
    clearForms();
    disableFormSubmit();
    showHideMenuLinks();

    //Handle Menu link-click's - Anonymous user
    //Register
    $('#linkMenuRegister').click(() => {
        showView('viewRegister')
    });
    //Login
    $('#linkMenuLogin').click(() => {
        showView('viewLogin');
    });
    //Home - anonymous user
    $('#linkMenuAppHome').click(() => {
        showView('viewAppHome')
    });
    //Home - logged in user
    $('#linkMenuUserHome').click(() => {
        showView('viewUserHome');
    });

    //Handle form-buttons click's
    $('#formRegister').submit(registerUser);
    $('#formLogin').submit(loginUser);
    $('#linkMenuLogout').click(logoutUser);
    $('#linkMenuShop, #linkUserHomeShop').click(viewProducts);
    $('#linkMenuCart, #linkUserHomeCart').click(loadCart);

    function loadCart() {
        let userId = sessionStorage.getItem('userId');
        requester.get('user',userId,'kinvey')
            .then(displayCart)
            .catch(system.displayError);

        function displayCart(user) {
            showView('viewCart');
            let cartKeys = Object.keys(user.cart);

            let body = $('#cartProducts table tbody');
            body.empty();
            for(let product of cartKeys){
                let discardButton = $(`<button data-id="${product}">Discard</button>`)
                    .click(function(){discardItem($(this).attr("data-id"))});
                let prod = user.cart[product];
                let price = (Math.round((prod.quantity * prod.product.price) * 100) / 100).toFixed(2);
                let row = $('<tr>')
                    .append(
                        $('<td>').text(prod.product.name),
                        $('<td>').text(prod.product.description),
                        $('<td>').text(prod.quantity),
                        $('<td>').text(price),
                        $('<td>').append(discardButton)
                    );
                body.append(row);
            }
        }
    }

    function discardItem(itemId) {
        let userId = sessionStorage.getItem('userId');
        requester.get('user',userId,'kinvey')
            .then((user) => updateUser(user,itemId))
            .catch(system.displayError);

        function updateUser(user,itemId) {
            let cart = user.cart;
            delete cart[itemId];
            let data = {
                "cart":cart
            };
            requester.put('user',user._id,'kinvey', data)
                .then(discardItemSuccess)
                .catch(system.displayError);
        }

        function discardItemSuccess() {
            system.displayInfoMsg('Product discarded.');
            loadCart();
        }
    }
    
    function viewProducts() {
        requester.get('appdata','products','kinvey')
            .then(loadProductsSuccess)
            .catch(system.displayError);


            function loadProductsSuccess(products) {
                $('#shopProducts table tbody').empty();
                showView('viewShop');
                for(let product of products){
                    //console.log(product);
                    let row = $(`<tr>`);
                    let purchaseButton = $(`<button data-id="${product._id}">Purchase</button>`)
                        .click(function(){getUser($(this).attr("data-id"))});
                    row.append(
                        $('<td>').text(product.name),
                        $('<td>').text(product.description),
                        $('<td>').text((Math.round(product.price * 100) / 100).toFixed(2)),
                        $('<td>').append(purchaseButton)
                    );
                    $('#shopProducts table tbody').append(row);
                }
            }
    }

    function getUser(productId) {
        let userId = sessionStorage.getItem('userId');
        requester.get('user',userId,'kinvey')
            .then((user) => updateUsersCart(user,productId))
            .catch(system.displayError)
    }

    function updateUsersCart(user,productId) {
        requester.get('appdata','products/' + productId,'kinvey')
            .then((product) => update(user,product));

        function update(user,product) {
            let cart = user.cart;
            if(!cart[product._id]){
                cart[product._id] = {};
                cart[product._id]["quantity"] = 0;
                cart[product._id]["product"] = {
                    "name": `${product.name}`,
                    "description": `${product.description}`,
                    "price": `${(Math.round(product.price * 100) / 100).toFixed(2)}`
                };
            }
            cart[productId]["quantity"] += 1;
            let data = {
                "cart": cart
            };
            requester.put('user',user._id,'kinvey', data)
                .then(() => {
                    system.displayInfoMsg('Product purchased.');
                    loadCart();
                })
                .catch(system.displayError);
        }

    }
    
    //User
    //Register
    function registerUser() {
        let data = {
            "username": $('#formRegister input[name=username]').val(),
            "password": $('#formRegister input[name=password]').val(),
            "name": $('#formRegister input[name=name]').val(),
            "cart": {}
        };
        requester.post('user', '', 'basic', data)
            .then(registerSuccess)
            .catch(registerFail);

        function registerFail(err) {
            system.displayError(err);
            showView('viewRegister');
        }
        function registerSuccess(userInfo) {
            saveUserAuth(userInfo);
            system.displayInfoMsg('User registration successful.');
        }
    }

    //Login User
    function loginUser() {
        let username = $('#formLogin input[name=username]');
        let password = $('#formLogin input[name=password]');
        let data = {
            "username": username.val(),
            "password": password.val()
        };
        requester.post('user', 'login', 'basic', data)
            .then(loginSuccess)
            .catch(loginFail);
        function loginFail(err) {
            system.displayError(err);
            showView('viewLogin');
        }
        function loginSuccess(userInfo) {
            saveUserAuth(userInfo);
            system.displayInfoMsg('Login successful.');
        }
    }

    //Logout
    function logoutUser() {
        requester.post('user', '_logout', 'kinvey')
            .then(logoutSuccess)
            .catch(system.displayError);
    }

    function logoutSuccess(successData) {
        system.displayInfoMsg('Logout successful.');
        sessionStorage.clear();
        showHideMenuLinks();
        showView('viewAppHome');
    }


    //Take care of showing only needed links
    function showHideMenuLinks() {
        if (sessionStorage.getItem('authToken')) {
            let usersOnly = $('#menu .useronly');
            let anonymous = $('#menu .anonymous');
            for (let el of anonymous) {
                $(el).hide();
            }
            for (let el of usersOnly) {
                $(el).show();
            }
        }
        else {
            let usersOnly = $('#menu .useronly');
            let anonymous = $('#menu .anonymous');
            for (let el of anonymous) {
                $(el).show();
            }
            for (let el of usersOnly) {
                $(el).hide();
            }
        }
    }

    //Handling notifications in SPA app
    let system = {
        displayError: (error) => {
            let errorBox = $('#errorBox');

            let errMsg = JSON.stringify(error);
            if (error.readyState === 0) {
                errMsg = "Cannot connect due to network error.";
            }
            if (error.responseJSON &&
                error.responseJSON.description) {
                errMsg = error.responseJSON.description;
            }
            errorBox.text('Error: ' + errMsg);
            errorBox.show();
        },
        displayInfoMsg: (msg) => {
            let infoBox = $('#infoBox');
            infoBox.text(msg);
            infoBox.show();
            setTimeout(() => {
                infoBox.hide();
            }, 3000)
        }
    };

    function saveUserAuth(userObj){
        sessionStorage.setItem('authToken', `${userObj._kmd.authtoken}`);
        sessionStorage.setItem('username', `${userObj.username}`);
        sessionStorage.setItem('name', `${userObj.name}`);
        sessionStorage.setItem('userId', `${userObj._id}`);

        showHideMenuLinks();
        setUsername();
        showView('viewUserHome');
    }

    //Hide's all views and display the passed in view
    function showView(view) {
        $('main > section').hide();
        clearForms();
        $(`#${view}`).show();
    }

    //Hide Info and errorBox on click
    $('#infoBox, #errorBox').click(function () {
        $(this).fadeOut();
    });

    // Attach AJAX "loading" event listener
    function loadingNotifications(){
        $(document).on({
            ajaxStart: function () {
                $("#loadingBox").show()
            },
            ajaxStop: function () {
                $("#loadingBox").hide()
            }
        })
    }

    //Display the logged in user username
    function setUsername() {
        $('#spanMenuLoggedInUser').text("Welcome, " + sessionStorage.getItem('username') + "!");
        $('#viewUserHomeHeading').text("Welcome, " + sessionStorage.getItem('username') + "!");
    }

    //clear all the forms in the app
    function clearForms() {
        $('form').trigger('reset');
    }

    //disable the submition of all forms
    function disableFormSubmit() {
        $('form').on('submit', function (event) {
            event.preventDefault();
        });
    }

    //Returns true if user is logged in or false oposit
    function userIsLoggedIn() {
        let userAuthToken = sessionStorage.getItem('authToken');
        return userAuthToken != '' && userAuthToken != null && userAuthToken != undefined;
    }

    let requester = {
        get: (path, endPoint, authType) => {
            let request = {
                method: 'GET',
                url: `${baseUrl}/${path}/${appKey}/${endPoint}`
            };
            if (authType === 'basic')
                request['headers'] = getBasicAuthentication();
            else
                request['headers'] = getKinveyAuthHeaders();
            return $.ajax(request);
        },

        post: (path, endPoint, authType, data) => {
            let request = {
                method: 'POST',
                url: `${baseUrl}/${path}/${appKey}/${endPoint}`
            };

            if (authType === 'basic')
                request['headers'] = getBasicAuthentication();
            else
                request['headers'] = getKinveyAuthHeaders();

            if (data !== undefined) {
                request['contentType'] = 'application/json';
                request['data'] = JSON.stringify(data);
            }
            return $.ajax(request);
        },
        put: (path, endPoint, authType, data) => {
            let request = {
                method: 'PUT',
                url: `${baseUrl}/${path}/${appKey}/${endPoint}`
            };

            if (authType === 'basic')
                request['headers'] = getBasicAuthentication();
            else
                request['headers'] = getKinveyAuthHeaders();

            if (data !== undefined) {
                request['contentType'] = 'application/json';
                request['data'] = JSON.stringify(data);
            }

            return $.ajax(request);
        },
        del: (path, endPoint, authType) => {
            let request = {
                method: 'DELETE',
                url: `${baseUrl}/${path}/${appKey}/${endPoint}`
            };

            if (authType === 'basic')
                request['headers'] = getBasicAuthentication();
            else
                request['headers'] = getKinveyAuthHeaders();

            return $.ajax(request);
        }

    };
    function getKinveyAuthHeaders() {
        return {"Authorization": "Kinvey " + sessionStorage.getItem("authToken")}
    }
    function getBasicAuthentication() {
        return {"Authorization": "Basic " + btoa(appKey + ":" + appSecret)}
    }
}