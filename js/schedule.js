"use strict";


var currentInSession = false;
var firstTimeFetch = true;

var dateArray = [];
var dateEndArray = [];
var titleArray = [];
var locationArray = [];
var nsdateArray = [];
var eventTypeArray = [];
var allDayEventArray = [];


// Initialize Firebase
var config = {
  apiKey: "AIzaSyB67ma05nNyNTfhsXS0FsKuKroMi5MiE68",
  authDomain: "ichack17-508ac.firebaseapp.com",
  databaseURL: "https://ichack17-508ac.firebaseio.com",
  storageBucket: "ichack17-508ac.appspot.com",
  messagingSenderId: "207461313223"
};

firebase.initializeApp(config);

var database = firebase.database();

function performQuery() {
    // Execute the query.
    return database.ref('/event').once('value')
        .then(function(response) {
            if (response.hasErrors) {

                // Handle them in your app.
                throw response.errors[0];

            } else {
                var records = response.val();

                var numberOfRecords = records.length;
                if (numberOfRecords === 0) {
                    return render('No matching items')
                } else {

                    var skipping = true;
                    for (var i = 0; i < numberOfRecords; i++) {

                        var currentRecord = records[i];

                        var startTimeNS = new Date(currentRecord['StartTime']);
                        var now = new Date();

                        var endTimeNS = currentRecord['EndTime'];
                        if (endTimeNS != undefined) {
                            endTimeNS = new Date(endTimeNS);
                        }

                        var nowOverStartTime = (now >= startTimeNS);
                        var nowBeforeEndTime = (now < endTimeNS);
                        var first = (nowOverStartTime && nowBeforeEndTime);

                        var second = (now < endTimeNS);

                        if ((first || second) === false) {
                            continue;
                        }

                        // Title
                        var title = currentRecord['Title'];
                        titleArray.push(title);


                        // locationArray
                        var location = currentRecord['Location'];
                        if (location != undefined) {
                            location = currentRecord['Location'];
                        }
                        locationArray.push(location === undefined ? '' : location);

                        var startTime = timestampToReadableFormat(currentRecord['StartTime']);
                        dateArray.push(startTime);
                        nsdateArray.push(new Date(currentRecord['StartTime']));

                        allDayEventArray.push(currentRecord['AllDayEvent']);

                        var eventType = currentRecord['EventType'];
                        switch (eventType) {

                            case 'featured':
                                eventType = '❖ featured';
                                break;
                            case 'meal':
                                eventType = '⦿ meal';
                                break;
                            case 'workshop':
                                eventType = '✶ workshop';
                                break;
                            default:
                                eventType = '▪ event';

                        }
                        eventTypeArray.push(eventType);

                        // End Time
                        var endTime = currentRecord['EndTime'];
                        if (endTime != undefined) {
                            endTime = timestampToReadableFormat(currentRecord['EndTime']);
                        }
                        dateEndArray.push(endTime === undefined ? '' : endTime);

                    }


                    // Render webpage
                    if (firstTimeFetch == true) {
                        createList(dateArray, dateEndArray, titleArray, locationArray, nsdateArray);
                        window.setInterval(function() {
                            checkUpdate()
                        }, 10000);
                        firstTimeFetch = false;
                    } else {

                        createList(dateArray, dateEndArray, titleArray, locationArray, nsdateArray);

                    }

                }
            }
        });
}

function timestampToReadableFormat(time) {

    var defaultTime = moment(time).tz("Europe/London");
    return moment(defaultTime).format("HH:mm");

}

performQuery();

function performAnnouncementQuery() {

    // Execute the query.
    return database.ref('/announcement').once('value')
        .then(function(response) {
            if (response.hasErrors) {

                // Handle them in your app.
                throw response.errors[0];

            } else {
                var records = response.val();

                var numberOfRecords = records.length;
                if (numberOfRecords === 0) {
                    console.log("no items");
                } else {

                    var string = "";

                    for (var i = 0; i < numberOfRecords; i++) {

                        var currentRecord = records[i];
                        var messageContent = currentRecord['Content'];

                        string += messageContent;

                        if (i != numberOfRecords - 1) {
                            string += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                        }

                    }

                    document.getElementById("marqueetext").innerHTML = string;

                }

            }
        })
}


performAnnouncementQuery();


function createList(dateArray, dateEndArray, titleArray, locationArray, nsdateArray) {

    var options = {
        valueNames: ['type', 'title', 'time', 'location', 'rsvp', {
            data: ['id']
        }, {
            name: 'maplink',
            attr: 'href'
        }],
        item: '<div class="card"><img class="card-img-top img-fluid" src="http://docsoc.co.uk/events/2017-02-04-ichack/banner.jpg">' +
                '<div class="card-block">' +
                  '<h4 class="card-title">Title</h4>' +
                  '<h4 class="card-title">Time</h4>' +
                  '<h4 class="card-title">Venue</h4>' +
                '</div>' +
              '</div>'

        item: '<li id="list-item" data-id="0" class="calendarlist">' +
            '<p class="type"></p>' +
            '<p class="title" target="_blank">Loading</p>' +
            '<p class="time time-b"></p>' +
            '<p class="location maplink"></p>'
    };

    var values = [];
    for (var i = 0; i < titleArray.length; i++) {

        var time = '';
        if (allDayEventArray[i] == 1) {
            time = dateArray[i];
        } else {
            time = dateArray[i] + ' - ' + dateEndArray[i];
        }


        var temp = {
            type: eventTypeArray[i],
            title: titleArray[i],
            time: time,
            location: locationArray[i],
            id: i,
            maplink: locationArray[i],
        };

        values.push(temp);
    }

    var liveList = new List('schedule', options, values);
    liveList.clear();
    liveList.add(values);
    liveList.update();

    var list = document.getElementById('schedule').getElementsByTagName("li");

    for (var i = 0; i < titleArray.length; i++) {


        switch (eventTypeArray[i]) {
            case '❖ featured':
                $(list[i]).addClass("featuredIndicator");
                break;
            case '⦿ meal':
                $(list[i]).addClass("hackathonIndicator");
                break;
            case '✶ workshop':
                $(list[i]).addClass("workshopIndicator");
                break;
            default:
                break;
        }

    }

}

function checkUpdate() {
    dateArray = [];
    dateEndArray = [];
    titleArray = [];
    locationArray = [];
    nsdateArray = [];
    eventTypeArray = [];
    allDayEventArray = [];
    performQuery();
    performAnnouncementQuery();
}
