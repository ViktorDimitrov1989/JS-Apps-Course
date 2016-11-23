function startApp() {
    const baseUrl = 'https://baas.kinvey.com/';
    const appId = 'kid_SyCzTz7Ml';
    const appSecret = '59b87ced69e647cdaff787996bd8bf8d';
    const authHeaders = {
        'Authorization': 'Basic ' + btoa(appId + ':' + appSecret)
    };


    //sessionStorage.clear(); // Clear user auth data
    showHideMenuLinks();
    // Bind the navigation menu links
    $("#linkHome").click(showHomeView);
    $("#linkLogin").click(showLoginView);
    $("#linkRegister").click(showRegisterView);
    $("#linkListBooks").click(listBooks);
    $("#linkCreateBook").click(showCreateBookView);
    $("#linkLogout").click(logoutUser);
    // Bind the form submit buttons
    $("#buttonLoginUser").click(loginUser);
    $("#buttonRegisterUser").click(registerUser);
    $("#buttonCreateBook").click(createBook);
    $("#buttonEditBook").click(editBook);


    // Bind the info / error boxes: hide on click
    $("#infoBox, #errorBox").click(function () {
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
    function showHideMenuLinks() {
        $("#linkHome").show();
        if (sessionStorage.getItem('authToken')) {
            // We have logged in user
            $("#linkLogin").hide();
            $("#linkRegister").hide();
            $("#linkListBooks").show();
            $("#linkCreateBook").show();
            $("#linkLogout").show();
        } else {
            // No logged in user
            $("#linkLogin").show();
            $("#linkRegister").show();
            $("#linkListBooks").hide();
            $("#linkCreateBook").hide();
            $("#linkLogout").hide();
        }
    }


    function showView(viewName) {
        // Hide all views and show the selected view only
        $('main > section').hide();
        $('#' + viewName).show();

    }

    function showHomeView() {
        showView('viewHome');
    }

    function showCreateBookView() {
        $('#formCreateBook').trigger('reset');
        showView('viewCreateBook')
    }

    function showLoginView() {
        showView('viewLogin');
    }

    function showRegisterView() {
        showView('viewRegister');
        $('#formLogin').trigger('reset');
    }

    //----------------------UserController
    function loginUser() {
        let userData = {
            username: $('#formLogin input[name=username]').val(),
            password: $('#formLogin input[name=passwd]').val()
        };
        $.ajax({
            method: "POST",
            url: baseUrl + 'user/' + appId + '/login',
            data: userData,
            headers: authHeaders
        })
            .then(loginSuccess)
            .catch(handleAjaxError);

        function loginSuccess(userInfo) {
            saveAuthSession(userInfo);
            showHideMenuLinks();
            listBooks();
            showInfo('Login successful');
        }
    }

    function logoutUser() {
        sessionStorage.clear();
        showHideMenuLinks();
        $('#loggedInUser').text('');
        showView('viewHome');
        showInfo('Logout successful');
    }

    function registerUser() {
        let user = {
            username: $('#formRegister input[name=username]').val(),
            password: $('#formRegister input[name=passwd]').val()
        };
        $.ajax({
            method: "POST",
            url: baseUrl + 'user/' + appId,
            data: user,
            headers: authHeaders
        })
            .then(registerSuccess)
            .catch(handleAjaxError);

        function registerSuccess(userInfo) {
            listBooks();
            saveAuthSession(userInfo);
            showHideMenuLinks();
            showInfo('User registration successful.');
        }
    }

    function saveAuthSession(userInfo) {
        let userAuthToken = userInfo._kmd.authtoken;
        sessionStorage.setItem('authToken', userAuthToken);
        let userId = userInfo._id;
        sessionStorage.setItem('userId', userId);
        let username = userInfo.username;
        $('#loggedInUser').text(`Hello ${username}!`);
    }

    function showInfo(msg) {
        $('#infoBox').text(msg).show();
        setTimeout(function () {
            $('#infoBox').fadeOut();
        }, 3000)
    }

    function handleAjaxError(response) {
        let errorMsg = JSON.stringify(response);
        if (response.readyState === 0)
            errorMsg = "Cannot connect due to network error.";
        if (response.responseJSON &&
            response.responseJSON.description)
            errorMsg = response.responseJSON.description;
        showError(errorMsg);
    }

    function showError(errorMsg) {
        $('#errorBox').text('Error: ' + errorMsg).show();
    }

    //----------------------BookControllers
    function listBooks() {
        $('#books').empty();
        showView('viewBooks');
        $.ajax({
            method: "GET",
            url: `${baseUrl}appdata/${appId}/books`,
            headers: getKinveyAuthHeaders()
        })
            .then(loadBooks)
            .catch(handleAjaxError);

    }

    function loadBooks(books) {
        showInfo('Books loaded.');
        if (books.lenght == 0) {
            $('#books').text('No books in library.')
        }
        else {
            let table = $('<table>').append($('<tr>').append('<th>Title</th><th>Author</th><th>Description</th><th>Actions</th>'));
            for (let book of books) {
                appendBookRow(book, table);
            }
            $('#books').append(table);
        }
        function appendBookRow(book, booksTable) {
            let links = [];
            if (book._acl.creator == sessionStorage['userId']) {
                let deleteLink = $('<a href="#">[Delete]</a>')
                    .click(function () {
                        deleteBook(book)
                    });
                let editLink = $('<a href="#">[Edit]</a>')
                    .click(function () {
                        loadBookForEdit(book)
                    });
                links = [deleteLink, ' ', editLink];
            }
            booksTable.append($('<tr>').append(
                $('<td>').text(book.title),
                $('<td>').text(book.author),
                $('<td>').text(book.description),
                $('<td>').append(links)
            ));


        }
    }

    function deleteBook(book) {
        $.ajax({
            method: "DELETE",
            url: `${baseUrl}appdata/${appId}/books/${book._id}`,
            headers: getKinveyAuthHeaders()
        })
            .then(deleteBookSuccess)
            .catch(handleAjaxError);

        function deleteBookSuccess(data) {
            listBooks();
            showInfo('Book deleted.');
        }
    }

    function getKinveyAuthHeaders() {
        return {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        }
    }

    function createBook() {
        let bookData = {
            author: $('#formCreateBook input[name=author]').val(),
            description: $('#formCreateBook textarea[name=descr]').val(),
            title: $('#formCreateBook input[name=title]').val()
        };
        $.ajax({
            method: "POST",
            url: `${baseUrl}appdata/${appId}/books`,
            data: bookData,
            headers: getKinveyAuthHeaders()
        })
            .then(createBookSuccess)
            .catch(handleAjaxError);

        function createBookSuccess(response) {
            listBooks();
            showInfo('Book Created.');
        }
    }


    function loadBookForEdit(book) {
        $.ajax({
            method: "GET",
            url: `${baseUrl}appdata/${appId}/books/${book._id}`,
            headers: getKinveyAuthHeaders()
        })
            .then(loadBookForEditSuccess)
            .catch(handleAjaxError);

        function loadBookForEditSuccess(book) {
            $('#formEditBook input[name=id]').val(book._id);
            $('#formEditBook input[name=title]').val(book.title);
            $('#formEditBook input[name=author]')
                .val(book.author);
            $('#formEditBook textarea[name=descr]')
                .val(book.description);
            showView('viewEditBook');
        }
    }

    function editBook() {
        let bookData = {
            title: $('#formEditBook input[name=title]').val(),
            author: $('#formEditBook input[name=author]').val(),
            description: $('#formEditBook textarea[name=descr]').val()
        };
        $.ajax({
            method: "PUT",
            url: `${baseUrl}appdata/${appId}/books/${$('#formEditBook input[name=id]').val()}`,
            headers: getKinveyAuthHeaders(),
            data:bookData
        })
            .then(editBookSuccess)
            .catch(handleAjaxError);

        function editBookSuccess() {
            listBooks();
            showInfo('Book edited');
        }
    }
}
