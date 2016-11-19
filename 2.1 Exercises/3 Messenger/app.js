function solve() {
    $('#submit').on('click', sendMsg);
    $('#refresh').on('click', refreshMessages);

    function refreshMessages() {
        $.get("https://ajax-exercises.firebaseio.com/.json")
            .then((result) => {
                $('#messages').empty();
                let keys = Object.keys(result);
                keys.sort((m1,m2) => result[m1].timestamp - result[m2].timestamp);
                for (let msg of keys) {
                    $('#messages').append(`${result[msg].author}: ${result[msg].content}\n`)
                }
            })
    }
    function sendMsg(){
        let message = {
            author: $('#author').val(),
            content: $('#content').val(),
            timestamp: Date.now()
        };
        $('#content').val('');
        $.post("https://ajax-exercises.firebaseio.com/.json", JSON.stringify(message))
            .then(refreshMessages)
    }

    /*function sendMsg() {
     let newPost = {
     content: $('#content').val(),
     user: $('#author').val()
     //timestamp:
     };
     let request = {
     method: "POST",
     url: "https://ajax-exercises.firebaseio.com/.json",
     data: JSON.stringify(newPost)
     };
     $.ajax(request)
     .then(console.log('POST success'))
     .catch(showError);
     }
     function refreshMessages() {
     let request = {
     method: "GET",
     url: "https://ajax-exercises.firebaseio.com/.json"
     };
     $.ajax(request)
     .then(appendMsgs)
     .catch(showError)
     }
     function appendMsgs(messages) {
     let keys = Object.keys(messages);
     let str = ``;
     for(let key of keys){
     str += messages[key].user + ': ' + messages[key].content + '\n';

     }
     $('#messages').text(str);
     }

     function showError(err) {
     console.dir(err)
     }*/


}