function attachEvents() {
    const kinveyAppId = 'kid_HkKFW9TWg';
    const serviceUrl = 'https://baas.kinvey.com/appdata/' + kinveyAppId;
    const kinveyUsername = 'pesho';
    const kinveyPassword = 'p';
    const base64Auth = btoa(kinveyUsername + ':' + kinveyPassword);
    const authHeaders = {
        "Authorization": "Basic " + base64Auth
    };
    $('#btnLoadPosts').click(loadPostsClicked);
    $('#btnViewPost').click(viewPostClicked);


    function loadPostsClicked() {
        let getPostsRequest = {
            method: "GET",
            url: serviceUrl + '/posts',
            headers: authHeaders
        };
        $.ajax(getPostsRequest)
            .then(displayPostsInDropDown)
            .catch(displayError)
    }

    function displayPostsInDropDown(posts) {
        for (let post of posts) {
            let option = $('<option>').text(post.title);
            option.val(post._id);
            $('#posts').append(option);
        }
    }

    function displayError(error) {
        let errorDiv = $('<div>').text('Error: ' + error.status + `(${error.statusText})`);
        $(document.body).prepend(errorDiv);
        setTimeout(function () {
            errorDiv.fadeOut(function () {
                errorDiv.remove();
            });
        }, 2000)
    }

    function viewPostClicked() {
        let selectedPostId = $('#posts').val();
        let postsRequest = $.ajax({
            method: "GET",
            url: serviceUrl + '/posts/' + selectedPostId,
            headers: authHeaders
        });

        //Comments Request
        let commentsRequest = $.ajax({
            method: "GET",
            url: serviceUrl + `/comments/?query={"post_id":"${selectedPostId}"}`,
            headers: authHeaders
        });
        Promise.all([postsRequest, commentsRequest])
            .then(displayPostWithComments)
            .catch(displayError);

        function displayPostWithComments([post,comments]) {
            $('#post-title').text(post.title);
            $('#post-body').text(post.body);

            $('#post-comments').empty();
            for (let comment of comments) {
                $('<li>').text(comment.text)
                    .appendTo($('#post-comments'));
            }

        }
    }
}