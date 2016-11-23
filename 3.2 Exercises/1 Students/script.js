(function attachEvents() {
    const appKey = 'kid_BJXTsSi-e';
    const appSecret = '447b8e7046f048039d95610c1b039390';
    const kinveyUsername = 'guest';
    const kinveyPassword = 'guest';
    const baseUrl = 'https://baas.kinvey.com/appdata/' + appKey + '/students';
    const base64auth = btoa(kinveyUsername + ":" + kinveyPassword);
    const authHeaders = {
        'Authorization': 'Basic ' + base64auth,
        'Content-Type': 'application/json'
    };
    $('#submit').click(createStudent);

    $.ajax({
        method: "GET",
        url: baseUrl,
        headers: authHeaders
    })
        .then(loadStudents)
        .catch(showError);


    function createStudent() {
        let id = Number($('#id').val());
        let firstName = $('#firstName').val();
        let lastName = $('#lastName').val();
        let grade = Number($('#grade').val());
        let facultyNumber = $('#facultyNumber').val();

        let facultyRegex = /^\d+$/g;

        if (id !== ''
            && firstName !== ''
            && firstName != ''
            && facultyRegex.test(facultyNumber)
            && grade !== '') {
            let student = {
                ID: id,
                FirstName: firstName,
                LastName: lastName,
                FacultyNumber: facultyNumber,
                Grade: grade
            };

            $.ajax({
                method: "POST",
                url: baseUrl,
                headers: authHeaders,
                data: JSON.stringify(student)
            })
                .then(() => {
                    $.ajax({
                        method: "GET",
                        url: baseUrl,
                        headers: authHeaders
                    })
                        .then(loadStudents);
                })
                .catch(showError)
        }
        $('#id').val('');
        $('#firstName').val('');
        $('#lastName').val('');
        $('#grade').val('');
        $('#facultyNumber').val('');


    }

    function loadStudents(students) {
        students.sort((a, b) => a.ID - b.ID);
        for (let student of students) {
            let tr = $('<tr>');
            let id = $('<td>').text(student.ID);
            let facNum = $('<td>').text(student.FacultyNumber);
            let firstName = $('<td>').text(student.FirstName);
            let lastName = $('<td>').text(student.LastName);
            let grade = $('<td>').text(student.Grade);
            tr
                .append(id)
                .append(facNum)
                .append(firstName)
                .append(lastName)
                .append(grade);
            $('#results').append(tr);
        }
    }

    function showError(error) {
        console.log(error)
    }

})();