function attachEvents() {
    $('#submit').click(main);
    let townObj = {};
    const conditionObj = {
        Sunny: '&#x2600;',
        Partly: '&#x26C5;',
        Overcast: '&#x2601;',
        Rain: '&#x2614;',
        Degrees: '&#176;'
    };

    function main() {
        let locationRequest = {
            method: "GET",
            url: "https://judgetests.firebaseio.com/locations.json"
        };

        $.ajax(locationRequest)
            .then(function (towns) {
                for (let town of towns) {
                    if (town.name == $('#location').val()) {
                        townObj = town;
                    }
                }
            })
            .then(() => {
                $.get(`https://judgetests.firebaseio.com/forecast/today/${townObj.code}.json`)
                    .then(dailyForecast)
                    .catch(displayError);
            })
            .then(()=> {
                $.get(`https://judgetests.firebaseio.com/forecast/upcoming/${townObj.code}.json`)
                    .then(threeDaysForecast)
                    .catch(displayError);
            })
    }

    function displayError(err) {
        $('#forecast').attr('style', 'display:visible');
        $('#forecast').text('Error');
    }

    function dailyForecast(dailyForecast) {
        $('span.condition').remove();
        let conditionSpan = $('<span class="condition">');
        let townData = $('<span class="forecast-data">').text(dailyForecast.name);
        let conditionStr = `${dailyForecast.forecast.low}${conditionObj.Degrees}/${dailyForecast.forecast.high}${conditionObj.Degrees}`;
        let degreesData = $(`<span class='forecast-data'>${conditionStr}</span>`);
        let conditionData = $('<span class="forecast-data">').text(dailyForecast.forecast.condition);
        let conditionSymbol = $(`<span class="condition symbol">${conditionObj[dailyForecast.forecast.condition.split(' ')[0]]}</span>`);
        $('#current').append(conditionSymbol);
        conditionSpan
            .append(townData)
            .append(degreesData)
            .append(conditionData)
            .appendTo($('#current'));
        $('#forecast').attr('style', 'display:visible');
    }

    function threeDaysForecast(threeDaysForecast) {
        $('span.upcoming').remove();
        let forecastArray = threeDaysForecast.forecast;
        for (let obj of forecastArray) {
            let conditionStr = `${obj.low}${conditionObj.Degrees}/${obj.high}${conditionObj.Degrees}`;
            let upcomingSpan = $('<span class="upcoming"></span>');
            let upcomingSymbol = $(`<span class="symbol">${conditionObj[obj.condition.split(' ')[0]]}</span>`);
            let upcomingDegreesData = $(`<span class="forecast-data">${conditionStr}</span>`);
            let upcomingCondition = $(`<span>${obj.condition}</span>`);
            upcomingSpan
                .append(upcomingSymbol)
                .append(upcomingDegreesData)
                .append(upcomingCondition)
                .appendTo($('#upcoming'));
        }
    }
}