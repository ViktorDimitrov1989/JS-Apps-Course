function attachEvents() {
    const baseUrl = 'https://baas.kinvey.com/';
    const kinveyId = 'kid_BJ_Ke8hZg';
    const kinveyUser = 'guest';
    const kinveyPass = 'pass';
    const authHeaders = {
        "Authorization": "Basic " + btoa(kinveyUser + ':' + kinveyPass)
    };


    $('#getVenues').click(getVenuesId);

    function getVenuesId() {
        let data = $('#venueDate').val();

        $.ajax({
            method: "POST",
            url: `${baseUrl}rpc/${kinveyId}/custom/calendar?query=${data}`,
            headers: authHeaders
        })
            .then(obtainVenues)
            .catch(showError)

    }

    function obtainVenues(venues) {
        $('#venue-info').empty();
        for (let id of venues) {
            $.ajax({
                method: "GET",
                url: baseUrl + 'appdata/' + kinveyId + '/venues/' + id,
                headers: authHeaders
            })
                .then(listVenues)
                .catch(showError);
        }
        function listVenues(venue) {
            $(`<div class="venue" id="${venue._id}">
  <span class="venue-name"><input class="info" type="button" value="More info">${venue.name}</span>
  <div class="venue-details" style="display: none;">
    <table>
      <tr><th>Ticket Price</th><th>Quantity</th><th></th></tr>
      <tr>
        <td class="venue-price">${venue.price} lv</td>
        <td><select class="quantity">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select></td>
        <td><input class="purchase" type="button" value="Purchase"></td>
      </tr>
    </table>
    <span class="head">Venue description:</span>
    <p class="description">${venue.description}</p>
    <p class="description">Starting time: ${venue.startingHour}</p>
  </div>
</div>
`).appendTo($('#venue-info'));

            $(`#${venue._id} .info`).click(() => {
                $(`#${venue._id} .venue-details`).attr('style','display: block');
            })
        }
    }

    function showError(error) {
        console.log(error);
    }


}