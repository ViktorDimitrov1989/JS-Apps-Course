function main() {
    let btnLoad = $("#btnLoad");
    let btnCreate = $('#btnCreate');
    btnLoad.click(loadContacts);
    btnCreate.click(createContact);
    function loadContacts() {
        $.get('https://phonebook-lab.firebaseio.com/phonebook.json')
            .then(displayContacts)
            .catch(displayError);
    }

    function displayContacts(contacts) {

        let ul = $('#phonebook');
        ul.empty();
        let keys = Object.keys(contacts);
        for (let key of keys) {
            let contact = contacts[key];
            let text = contact.person + ': ' + contact.phone;
            if (contacts[key]) {
                let li = $('<li>');
                li.text(text);
                li.appendTo(ul);
                li.append(' ');
                li.append($('<a>[Delete]</a>').attr('href', '#').click(function () {
                    deleteContact(key);
                }));
            }
        }
    }
    function createContact() {
        let person = $('#person').val();
        let phone = $('#phone').val();
        let newContact = {
            person: person,
            phone: phone
        };

        let createRequest = {
            method: "POST",
            url: "https://phonebook-lab.firebaseio.com/phonebook/.json", //baseUrl - variable
            data: JSON.stringify(newContact)
        };
        $.ajax(createRequest)
            .then(loadContacts)
            .catch(displayError);
    }

    function displayError(error) {
        $('#phonebook').append($('<li>Error</li>'))
    }
    function deleteContact(key) {
        let delrequest = {
            method: "DELETE",
            url: "https://phonebook-lab.firebaseio.com/phonebook/" + key + ".json",

        };
        $.ajax(delrequest)
            .then(loadContacts)
            .catch(displayError);
    }


}