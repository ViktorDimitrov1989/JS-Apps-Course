function loadCommits() {
    $('#commits').empty();
    let username = $('#username').val();
    let repo = $('#repo').val();
    let request = {
        method: "GET",
        url: "https://api.github.com/repos/" + username + "/" + repo + "/commits"
    };
    $.ajax(request)
        .then(showRepos)
        .catch(showError);


    function showRepos(repos) {
        for(let repo of repos){
            $('#commits').append($('<li>').text(repo.commit.author.name + ": " + repo.commit.message));
        }
    }
    function showError(err) {
        $('#commits').append($('<li>').text(`Error: ${err.status} (${err.statusText})`))
    }
}

