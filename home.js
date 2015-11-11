Shops = new Mongo.Collection("shops");
Events = new Mongo.Collection("events");
Feeds = new Meteor.Collection("feeds");
FeedEntries = new Meteor.Collection("feed_entries");
limit = 5;

aWeekday = [
    'dimanche',
    'lundi',
    'mardi',
    'mercredi',
    'jeudi',
    'vendredi',
    'samedi'
];

aWeekdayWeather = {
    'Mon' : 'Lun',
    'Tue' : 'Mar',
    'Wed' : 'Mer',
    'Thu' : 'Jeu',
    'Fri' : 'Ven',
    'Sat' : 'Sam',
    'Sun' : 'Dim'
};

aMonth = [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre'
];

aWeather = {
    "0" : "tornade",
    "1" : "tempête tropicale",
    "2" : "ouragan",
    "3" : "orages violents",
    "4" : "orages",
    "5" : "pluie et neige",
    "6" : "pluie et neige fondue",
    "7" : "neige et neige fondue",
    "8" : "brouillard givrant",
    "9" : "bruine",
    "10" : "pluie verglaçante",
    "11" : "averses",
    "12" : "averses",
    "13" : "rafales de neige",
    "14" : "légères chutes de neige",
    "15" : "blizzard",
    "16" : "neige",
    "17" : "grêle",
    "18" : "neige fondue",
    "19" : "poussière",
    "20" : "brumeux",
    "21" : "brume",
    "22" : "enfumé",
    "23" : "bourrasques",
    "24" : "venteux",
    "25" : "froid",
    "26" : "nuageux",
    "27" : "nuageux",
    "28" : "nuageux",
    "29" : "partiellement nuageux",
    "30" : "partiellement nuageux",
    "31" : "nuit claire",
    "32" : "ensoleillé",
    "33" : "belle nuit",
    "34" : "belle journée",
    "35" : "mixte pluie et la grêle",
    "36" : "chaud",
    "37" : "orages isolés",
    "38" : "orages intermittents",
    "39" : "orages intermittents",
    "40" : "averses intermittentes",
    "41" : "chutes de neige abondantes",
    "42" : "chutes de neige intermittentes",
    "43" : "chutes de neige abondantes",
    "44" : "partiellement nuageux",
    "45" : "averses orageuses",
    "46" : "chutes de neige",
    "47" : "averses orageuses isolées",
    "3200" : "indisponible"
};

if (Meteor.isClient) {

    date = new Date();
    curDate  = new Date( new Date().setHours(0, 0, 0, 0) );
    //curDate  = new Date(date.getTime() - (100 * 24 * 60 * 60 * 1000));
    curDateTemp  = new Date( new Date().setHours(0, 0, 0, 0) );
    endDate = new Date( curDateTemp.setDate(curDateTemp.getDate() + 30) );

    if (annyang) {
        // Let's define our first command. First the text we expect, and then the function it should call
        annyang.debug();
        annyang.setLanguage('fr-FR');

        var commandsEventTitle = {
            'annuler': function (){
                Meteor.call('msg', '"Ajouter un événement" annulé !', function(error, result){
                    Session.set('msg', result);
                });
                annyang.removeCommands();
                annyang.addCommands(commands);
            },
            '*title': function (title) {
                Session.set('eventTitle', title);

                Meteor.call('msg', "Quel est le lieu de l'événement ?", function(error, result){
                    Session.set('msg', result);
                });
                annyang.removeCommands();
                annyang.addCommands(commandsEventLocation);
            }
        };

        var commandsEventLocation = {
            'annuler': function (){
                Meteor.call('msg', '"Ajouter un événement" annulé !', function(error, result){
                    Session.set('msg', result);
                });
                annyang.removeCommands();
                annyang.addCommands(commands);
            },
            '*location': function (location) {
                Session.set('eventLocation', location);

                Meteor.call('msg', "Quelle est la date de l'événement ?", function(error, result){
                    Session.set('msg', result);
                });
                annyang.removeCommands();
                annyang.addCommands(commandsEventDate);
            }
        };

        var commandsEventDate = {
            'annuler': function (){
                Meteor.call('msg', '"Ajouter un événement" annulé !', function(error, result){
                    Session.set('msg', result);
                });
                annyang.removeCommands();
                annyang.addCommands(commands);
            },
            '(le) *date': function (date) {
                isDay = false;
                isMonth = false;
                isYear = false;
                aDate = date.split( ' ' );
                if ( aDate.length == 3 )
                {
                    day = parseInt( aDate[ 0 ] );
                    month = aDate[ 1 ];
                    year = parseInt( aDate[ 2 ] );
                }else{
                    day = parseInt( aDate[ 0 ]);
                    month = aDate[ 1 ];
                    year = curDate.getFullYear();
                }

                if ( day >= 1 && day <=  31 ){
                    isDay = true;
                }

                if ( aMonth.indexOf( month ) >= 0 && aMonth.indexOf( month ) <=  11 ){
                    isMonth = true;
                }

                if ( year >= parseInt( curDate.getFullYear() ) ){
                    isYear = true;
                }

                if ( isDay && isMonth && isYear ) {
                    Session.set('eventDate', date);

                    Meteor.call('msg', "Quelle est l'heure de début de l'événement ?", function(error, result){
                        Session.set('msg', result);
                    });
                    annyang.removeCommands();
                    annyang.addCommands(commandsEventStartHour);
                }else{
                    Meteor.call('msg', 'Date incorrecte !<br>Quelle est la date de l\'événement ?', function(error, result){
                        Session.set('msg', result);
                    });
                }
            }
        };

        var commandsEventStartHour = {
            'annuler': function (){
                Meteor.call('msg', '"Ajouter un événement" annulé !', function(error, result){
                    Session.set('msg', result);
                });
                annyang.removeCommands();
                annyang.addCommands(commands);
            },
            '(à) *starthour': function (starthour) {

                isHour = false;
                isMin = false;

                Session.set('eventStartHour', starthour);

                Meteor.call('msg', 'Quelle est l\'heure de fin de l\'événement ?', function(error, result){
                    Session.set('msg', result);
                });
                annyang.removeCommands();
                annyang.addCommands(commandsEventEndHour);
            }
        };

        var commandsEventEndHour = {
            'annuler': function (){
                Meteor.call('msg', '"Ajouter un événement" annulé !', function(error, result){
                    Session.set('msg', result);
                });
                annyang.removeCommands();
                annyang.addCommands(commands);
            },
            '(à) *endhour': function (endhour) {
                Session.set('eventEndHour', endhour);

                //Meteor.call('msg', "Quelle est l'heure de fin de l'événement", function(error, result){
                //    Session.set('msg', result);
                //});

                Meteor.call('addEvent', {
                    'title': Session.get( 'eventTitle'),
                    'location': Session.get( 'eventLocation'),
                    'date': Session.get( 'eventDate'),
                    'starthour': Session.get( 'eventStartHour'),
                    'endhour': Session.get( 'eventEndHour')
                });

                annyang.removeCommands();
                annyang.addCommands(commands);
            }
        };

        var commands = {
            'envoie (la liste des courses) à *name': function(name) {
                Meteor.call("sendSMS", name, function(error, result){
                    Session.set('msg', result);
                });
            },

            'penser à acheter *obj': function(obj) {

                Meteor.call("addShop", obj);
            },

            'retirer l\'événement *title': function( title ) {
                Meteor.call('rmEvent', title);
            },

            'supprimer *item': function(item) {
                Meteor.call("rmItemShop", item);
            },

            'supprimer': function() {
                Meteor.call("rmLastShop");
            },

            'supprimer tout': function() {
                Meteor.call("rmAllShop");
            },

            'vider la liste': function() {
                Meteor.call("rmAllShop");
            },

            'bonjour': function() {
                Meteor.call('msg', "Bonjour, Toi!", function(error, result){
                    Session.set('msg', result);
                });
            },

            'comment tu t\'appelles': function() {
                Meteor.call('msg', 'Je me nomme BlackMirror.<br>Et toi?', function(error, result){
                    Session.set('msg', result);
                });
            },

            'je m\'appelle *name': function( name ) {
                Meteor.call('msg', 'Comment tu vas ' + name, function(error, result){
                    Session.set('msg', result);
                });
            },

            'ajouter un événement': function() {
                Meteor.call('msg', 'Quel est le titre de votre événement ?', function(error, result){
                    Session.set('msg', result);
                });
                annyang.removeCommands();
                annyang.addCommands(commandsEventTitle);
            }
        };

        // Add our commands to annyang
        annyang.addCommands(commands, true);

        // Start listening. You can call this here, or attach this call to an event, button, etc.
        annyang.start({ autoRestart: true, continuous: true });
    }


    function set(key, value) {
        Session.set(key, value);
    }

    setInterval(function(){
        if(new Date( new Date().setHours(0, 0, 0, 0) ).getTime() != curDate.getTime()){
            location.reload();
        }
        var hours = (new Date().getHours() < 10 ? '0' + new Date().getHours() : new Date().getHours() );
        var minutes = (new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() : new Date().getMinutes() );
        var time = hours + ':' + minutes;
        var date = new Date().getDate() + ' ' + aMonth[ new Date().getMonth() ] + ' ' + new Date().getFullYear();
        Session.set("time", time);
        Session.set("date", date);
    }, 1000);

    setInterval( function(){
        getWeather();
    }, 600000 );

    // This code only runs on the client
    Template.body.helpers({

        message: function(){
            Session.set('hasmessage', 'true');
            setTimeout(function(){
                Session.set('hasmessage', 'false');
            }, 3000)
            return Session.get('msg');
        },

        hasmessage: function( boolean ){
            return Session.get('hasmessage');
        },

        shops: function () {
            return Shops.find({}, {sort: {createdAt: -1}, limit: limit});
        },

        tooManyShops: function () {
            return Shops.find().count() > limit;
        },

        noShops: function () {
            return Shops.find().count() == 0;
        },

        events: function () {

            var allEvents = Events.find().fetch();
            var allEventsTemp = [];

            allEvents.forEach(function (event) {
                if( 1==1 /*event.startDateTime < curDate || event.startDateTime > endDate*/){


                    var currentDate = new Date();

                    while(currentDate < endDate){
                        var eventTemp = (JSON.parse(JSON.stringify(event)));

                        if(eventTemp.frequency == 2){

                            eventTemp.startDateTime = new Date(currentDate.setHours(event.startDateTime.getHours(), event.startDateTime.getMinutes(), 0, 0));
                            eventTemp.endDateTime = new Date(currentDate.setHours(event.endDateTime.getHours(), event.startDateTime.getMinutes(), 0, 0));

                            /*console.log(eventTemp.startDateTime);
                            console.log(event.startDateTime);*/

                            if( eventTemp.startDateTime.toString() != event.startDateTime.toString()) {
                                //console.log(eventTemp.startDateTime);
                                var weekDay = aWeekday[eventTemp.startDateTime.getDay()];
                                weekDay = weekDay.charAt(0).toUpperCase() + weekDay.slice(1);
                                var day = ( eventTemp.startDateTime.getDate() == 1 ? '1er' : eventTemp.startDateTime.getDate() );
                                var month = aMonth[eventTemp.startDateTime.getMonth()];
                                var year = eventTemp.startDateTime.getFullYear();

                                eventTemp.dateText = weekDay + ' ' + day + ' ' + month + ' ' + year;
                                //console.log(eventTemp.startDateTime);
                                //console.log(eventTemp);
                                allEventsTemp.push(eventTemp);
                                eventTemp = null;
                            }
                        }else if( eventTemp.frequency == 3 ){

                            if( currentDate.getDay() != 6 && currentDate.getDay() != 0 ){
                                eventTemp.startDateTime = new Date(currentDate.setHours(event.startDateTime.getHours(), event.startDateTime.getMinutes(), 0, 0));
                                eventTemp.endDateTime = new Date(currentDate.setHours(event.endDateTime.getHours(), event.startDateTime.getMinutes(), 0, 0));

                                /*console.log(eventTemp.startDateTime);
                                console.log(event.startDateTime);*/

                                if( eventTemp.startDateTime.toString() != event.startDateTime.toString()) {
                                    //console.log(eventTemp.startDateTime);
                                    var weekDay = aWeekday[eventTemp.startDateTime.getDay()];
                                    weekDay = weekDay.charAt(0).toUpperCase() + weekDay.slice(1);
                                    var day = ( eventTemp.startDateTime.getDate() == 1 ? '1er' : eventTemp.startDateTime.getDate() );
                                    var month = aMonth[eventTemp.startDateTime.getMonth()];
                                    var year = eventTemp.startDateTime.getFullYear();

                                    eventTemp.dateText = weekDay + ' ' + day + ' ' + month + ' ' + year;
                                    //console.log(eventTemp.startDateTime);
                                    //console.log(eventTemp);
                                    allEventsTemp.push(eventTemp);
                                    eventTemp = null;
                                }
                            }
                        }else if( eventTemp.frequency == 4 ){

                            if( currentDate.getDay() == event.startDateTime.getDay() ){
                                eventTemp.startDateTime = new Date(currentDate.setHours(event.startDateTime.getHours(), event.startDateTime.getMinutes(), 0, 0));
                                eventTemp.endDateTime = new Date(currentDate.setHours(event.endDateTime.getHours(), event.startDateTime.getMinutes(), 0, 0));

                                /*console.log(eventTemp.startDateTime);
                                 console.log(event.startDateTime);*/

                                if( eventTemp.startDateTime.toString() != event.startDateTime.toString()) {
                                    //console.log(eventTemp.startDateTime);
                                    var weekDay = aWeekday[eventTemp.startDateTime.getDay()];
                                    weekDay = weekDay.charAt(0).toUpperCase() + weekDay.slice(1);
                                    var day = ( eventTemp.startDateTime.getDate() == 1 ? '1er' : eventTemp.startDateTime.getDate() );
                                    var month = aMonth[eventTemp.startDateTime.getMonth()];
                                    var year = eventTemp.startDateTime.getFullYear();

                                    eventTemp.dateText = weekDay + ' ' + day + ' ' + month + ' ' + year;
                                    //console.log(eventTemp.startDateTime);
                                    //console.log(eventTemp);
                                    allEventsTemp.push(eventTemp);
                                    eventTemp = null;
                                }
                            }
                        }else if( eventTemp.frequency == 5 ){

                            if( currentDate.getDate() == event.startDateTime.getDate() ){
                                eventTemp.startDateTime = new Date(currentDate.setHours(event.startDateTime.getHours(), event.startDateTime.getMinutes(), 0, 0));
                                eventTemp.endDateTime = new Date(currentDate.setHours(event.endDateTime.getHours(), event.startDateTime.getMinutes(), 0, 0));

                                /*console.log(eventTemp.startDateTime);
                                 console.log(event.startDateTime);*/

                                if( eventTemp.startDateTime.toString() != event.startDateTime.toString()) {
                                    //console.log(eventTemp.startDateTime);
                                    var weekDay = aWeekday[eventTemp.startDateTime.getDay()];
                                    weekDay = weekDay.charAt(0).toUpperCase() + weekDay.slice(1);
                                    var day = ( eventTemp.startDateTime.getDate() == 1 ? '1er' : eventTemp.startDateTime.getDate() );
                                    var month = aMonth[eventTemp.startDateTime.getMonth()];
                                    var year = eventTemp.startDateTime.getFullYear();

                                    eventTemp.dateText = weekDay + ' ' + day + ' ' + month + ' ' + year;
                                    //console.log(eventTemp.startDateTime);
                                    //console.log(eventTemp);
                                    allEventsTemp.push(eventTemp);
                                    eventTemp = null;
                                }
                            }
                        }else if( eventTemp.frequency == 6 ){

                            if( currentDate.getDate() == event.startDateTime.getDate() && currentDate.getMonth() == event.startDateTime.getMonth() ){
                                eventTemp.startDateTime = new Date(currentDate.setHours(event.startDateTime.getHours(), event.startDateTime.getMinutes(), 0, 0));
                                eventTemp.endDateTime = new Date(currentDate.setHours(event.endDateTime.getHours(), event.startDateTime.getMinutes(), 0, 0));

                                /*console.log(eventTemp.startDateTime);
                                 console.log(event.startDateTime);*/

                                if( eventTemp.startDateTime.toString() != event.startDateTime.toString()) {
                                    //console.log(eventTemp.startDateTime);
                                    var weekDay = aWeekday[eventTemp.startDateTime.getDay()];
                                    weekDay = weekDay.charAt(0).toUpperCase() + weekDay.slice(1);
                                    var day = ( eventTemp.startDateTime.getDate() == 1 ? '1er' : eventTemp.startDateTime.getDate() );
                                    var month = aMonth[eventTemp.startDateTime.getMonth()];
                                    var year = eventTemp.startDateTime.getFullYear();

                                    eventTemp.dateText = weekDay + ' ' + day + ' ' + month + ' ' + year;
                                    //console.log(eventTemp.startDateTime);
                                    //console.log(eventTemp);
                                    allEventsTemp.push(eventTemp);
                                    eventTemp = null;
                                }
                            }
                        }

                        var newDate = currentDate.setDate(currentDate.getDate() + 1);
                        currentDate = new Date(newDate);
                    }
                }

            });

            var events = Events.find( { startDateTime: {$gte: curDate, $lte: endDate} }, { sort: {startDateTime: 1} }).fetch();

            /*console.log(allEventsTemp);*/

            events = events.concat(allEventsTemp);
            events.sort(function (a, b) {
                return new Date(a.startDateTime) - new Date(b.startDateTime);
            });

            Session.set("events", events);

            var eventsGrouped = ListGrouper.getGroup({
                // Pass a MongoDB cursor or just a native Array to the collection field
                collection: events,
                // How would you like your data to be grouped?
                // The groupBy object contains a name and a groupMethod.
                groupBy: {
                    // Give the grouping a name
                    name: 'date',
                    // The method used for grouping the data
                    groupMethod: function ( event ) {
                        return event.dateText;
                    }
                },
                sums: [{
                    // Show how many shots were made by the players in each group
                    name: 'date',
                    sumMethod: function ( memo, event ) {
                        return event.dateText;
                    }
                }]
            });
            eventsGrouped.sort(function (a, b) {
                return new Date(a.groupItems[0].startDateTime) - new Date(b.groupItems[0].startDateTime);
            });

            return eventsGrouped;
        },

        log: function () {
            console.log(this);
        },

        tooManyEvents: function () {
            return Session.get("events").length > limit;
        },

        noEvents: function () {
            if (Session.get("events")) {
                return Session.get("events").length == 0;
            }else{
                return true;
            }
        },

        days:  function () {
            days = [
                { day: "1er", value: 1 }
            ];
            for(i=2;i<=31;i++){
                days.push({day: i, value: i});
            }
            return days;
        },

        months: function () {
            months = [];
            for(i=0;i<=11;i++){
                months.push({month: aMonth[i], value: i});
            }
            return months;
        },

        years: function () {
            currentYear = new Date().getFullYear();
            years = [];
            for(i=currentYear-5;i<=currentYear+10;i++){
                years.push({year: i, value: i});
            }
            return years;
        },

        hours:  function () {
            hours = [];
            for(i=0;i<=23;i++){
                hours.push({hour: i, value: i});
            }
            return hours;
        },

        mins: [
            { min: "00", value: 0 },
            { min: "15", value: 15 },
            { min: "30", value: 30 },
            { min: "45", value: 45 }
        ],

        dayChange: function () {
            return ( Session.get("day") ? Session.get("day") : new Date().getDate() );
        },

        weekdayChange: function () {
            return ( Session.get("weekday") != null ? aWeekday[Session.get("weekday")] : aWeekday[new Date().getDay()] );
        },

        monthChange: function () {
            return ( Session.get("month") ? aMonth[Session.get("month")] : aMonth[new Date().getMonth()] );
        },

        time: function () {
            return Session.get('time');
        },

        date: function () {
            return Session.get('date');
        }

    });

    Template.event.helpers({
        lastDateText: function () {
            return this.dateText;
        }
    });

    Template.rssT.helpers({
        rss: function () {

            $.ajax({
                type: "GET",
                url: "https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=10&q=http://rss.lemonde.fr/c/205/f/3050/index.rss",
                dataType: "jsonp",
                success: function (data) {
                    set("rss", data.responseData.feed.entries);
                    Template.rssT.rendered();
                }
            }, this);
            //console.log(Session.get('rss'));
            return Session.get('rss');
        }
    });

    Template.body.events({
		"click .sms": function (event) {
			Meteor.call("sendSMS");
            
            return false;
        },
		
        "submit .new-city": function (event) {
            // This function is called when the new task form is submitted

            var location = event.target.city.value;

            Template.simpleWeather.rendered(location);

            // Clear form
            event.target.city.value = "";
            // Prevent default form submit
            return false;
        },

        "submit .new-shop": function (event) {
            // This function is called when the new task form is submitted

            var text = event.target.text.value;

            Shops.insert({
                text: text,
                createdAt: new Date() // current time
            });

            // Clear form
            event.target.text.value = "";
            // Prevent default form submit
            return false;
        },

        "click .toggle-new-event": function () {
            currentDay = new Date().getDate();
            currentMonth = new Date().getMonth();
            currentYear = new Date().getFullYear();

            currentStartHour = new Date().getHours();
            currentEndHour = (currentStartHour == 23 ? 23 : currentStartHour + 1 );

            $(".new-event").toggleClass( 'hide', 'show' );
            $("select[name='day'] option[value='" + currentDay + "']").prop('selected', true);
            $("select[name='month'] option[value='" + currentMonth + "']").prop('selected', true);
            $("select[name='year'] option[value='" + currentYear + "']").prop('selected', true);
            $("select[name='starthour'] option[value='" + currentStartHour + "']").prop('selected', true);
            $("select[name='endhour'] option[value='" + currentEndHour + "']").prop('selected', true);
        },

        "submit .new-event": function (event) {
            // This function is called when the new task form is submitted
            event.preventDefault();

            var day = $("select[name='day'] option[value='" + event.target.day.value + "']").text();
            var month = $("select[name='month'] option[value='" + event.target.month.value + "']").text();
            var iMonth = $(event.target.month).val();
            var year = $("select[name='year'] option[value='" + event.target.year.value + "']").text();

            var startHour = $(event.target.starthour).val();
            var startMin = ($(event.target.startmin).val() == 0 ? "00" : $(event.target.startmin).val() );
            var startDateTime = new Date(year, iMonth, day, parseInt(startHour), parseInt(startMin));

            var weekDay = aWeekday[startDateTime.getDay()];
            weekDay = weekDay.charAt(0).toUpperCase() + weekDay.slice(1);
            var title = event.target.title.value;
            var place = event.target.place.value;
            var dateText = weekDay + ' ' + day + ' ' + month + ' ' + year;


            var endHour = $(event.target.endhour).val();
            var endMin = ($(event.target.endmin).val() == 0 ? "00" : $(event.target.endmin).val() );

            var startHourText = startHour + ":" + startMin;
            var endHourText = endHour + ":" + endMin;
            var frequency = event.target.frequency.value;


            var endDateTime = new Date(year, iMonth, day, parseInt(endHour), parseInt(endMin));

            Events.insert({
                title: title,
                place: place,
                dateText: dateText,
                startHourText: startHourText,
                endHourText: endHourText,
                frequency: frequency,
                startDateTime: startDateTime,
                endDateTime: endDateTime,
                createdAt: new Date() // current time
            });
            // Hide form
            $(".new-event").toggleClass( 'hide', 'show' );
            // Clear form
            event.target.title.value = "";
            event.target.place.value = "";
            event.target.frequency.value = "";
            // Prevent default form submit
            return false;
        },

        "change .day": function (event) {
            day = $(event.target).val();
            Session.set("day", day);
        },

        "change .day, change .month, change .year": function (event) {
            var weekday = new Date($(".year").val(), $(".month").val(), $(".day").val()).getDay();
            Session.set("weekday", weekday);
        },

        "change .month": function (event) {
            month = $(event.target).val();
            Session.set("month", month);
        },

        "change .starthour": function (event) {
            currentEndHour = parseInt($(event.target).val()) + 1;
            //console.log(currentEndHour);
            $("select[name='endhour'] option[value='" + currentEndHour + "']").prop('selected', true);

        }

    });

    Template.shop.events({
        "click .toggle-checked": function () {
            // Set the checked property to the opposite of its current value
            Shops.update(this._id, {$set: {checked: ! this.checked}});
        },
        "click .delete": function () {
            Shops.remove(this._id);
        }
    });

    Template.event.events({
        "click .delete": function () {
            Events.remove(this._id);
        }
    });

    Template.rssT.rendered = function() {
        console.log('test')
        setTimeout( function () {
            $('#carousel').slick({
                slidesToShow: 1,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 8000,
                arrows: false,
                speed: 500,
                fade: true
            });
        }, 1000);
    };

    function getWeather(location) {
        //console.log(location);
        if(typeof location == 'undefined'){
            location = 'Paris, FR';
        }
        var optionsWeather = {
            location: location, // Paris
            unit: 'c',
            success: function (weather) {
                html = '<div class="today">';
                html += '<h2><i class="sw icon-' + weather.code + '"></i> ';
                html += weather.temp + '&deg;' + weather.units.temp + '</h2>';
                html += '<ul>';
                html += '<li class="currently">' + aWeather[weather.code] + '</li>';
                html += '<li class="currently">à</li>';
                html += '<li class="currently">' + weather.city + '</li>';
                html += '</ul>';
                html += '</div>';

                for(i = 1; i<5; i++){
                    html += '<div class="after">';
                    html += '<span class="day">' + aWeekdayWeather[ weather.forecast[i].day ] + '</span>';
                    html += '<h6><i class="sw icon-' + weather.forecast[i].code + '"></i> ';
                    html += weather.forecast[i].low + '&deg;' + weather.units.temp + '</br>';
                    html += weather.forecast[i].high + '&deg;' + weather.units.temp + '</h6>';
                    html += '</div>';
                }


                $("#weather").html(html);
            },
            error: function (error) {
                $("#weather").html('<p>' + error + '</p>');
            }
        };

        Weather.options = optionsWeather;
        Weather.load();
    }
    getWeather();

    Template.simpleWeather.rendered = function(location){
        setInterval(getWeather(location), 60000);
    }

}

Meteor.methods({
    msg: function( text ){
        return text;
    },

    sendSMS: function (name) {
        var to = '';
		var accountSid = 'AC0989ac8a5de7c8505b4c450a2a5ec861'; 
		var authToken = 'b9116fe55aba63cbe8054356aac35e80'; 
		var body = '\n \n Bonjour ' + name + ',\n Voici la liste des courses : \n';

		var shopList = Shops.find({}, {sort: {createdAt: -1}, limit: limit}).fetch();

		shopList.forEach(function (shop) {
			body += shop.text + '\n';
		});

        name = name.toLowerCase();

        console.log(name);

        if(name == 'kevin' || name == 'kévin'){ to = '+33647936273';}
        if(name == 'nana'){ to = '+33674379519';}
        twilio = Twilio(accountSid, authToken);
        twilio.sendSms({
            to: to,
            from: '+12056059940', 
            body: body
        }, function(err, responseData) { //this function is executed when a response is received from Twilio
            if (!err) {
                console.log(responseData.from); // outputs "+14506667788"
                console.log(responseData.body); // outputs "word to your mother."

            }
			if (err) {
                console.log(err); // outputs "+14506667788"
            }
        });
        return 'Le sms a bien été envoyé';
    },

    addShop: function(obj){
        Shops.insert({
            text: obj,
            createdAt: new Date() // current time
        });
    },

    rmLastShop : function(){
        shop = Shops.find({}, {sort: {createdAt: -1}, limit: 1}).fetch();
        console.log(shop[0]._id);
        Shops.remove(shop[0]._id);
    },

    rmItemShop : function(item){
        item = item + "*";
        shop = Shops.find({text:{$regex:item}}, {sort: {createdAt: -1}, limit: 1}).fetch();
        Shops.remove(shop[0]._id);
    },

    rmAllShop : function(){
        Shops.remove({});
    },

    addEvent: function( event ){
        console.log( event );
        var curDate = new Date;

        startHourText = event.starthour.replace('h', ':');
        if ( startHourText.length == 2 || startHourText.length == 3 ) startHourText = startHourText + '00';
        endHourText = event.endhour.replace('h', ':');
        if ( endHourText.length == 2 || endHourText.length == 3 ) endHourText = endHourText + '00';

        aDate = event.date.split(' ');
        console.log( aDate.length );

        if ( aDate.length == 3 )
        {
            year = aDate[2];
        }else{
            year = curDate.getFullYear();
        }
        iMonth =  aMonth.indexOf( aDate[1] );
        day =  aDate[0];

        if ( startHourText.length % 2 == 0  )
        {
            startHour = startHourText.substring(0,1);
        }
        else
        {
            startHour = startHourText.substring(0,2);
        }

        if ( startHourText.length == 2 || startHourText.length == 3 )
        {
            startMin = 0;
        }
        else if( startHourText.length == 4 )
        {
            startMin = startHourText.substring(2,4);
        }
        else if( startHourText.length == 5 )
        {
            startMin = startHourText.substring(3,5);
        }
        console.log('parseInt(startMin)');
        console.log(startMin);
        console.log(parseInt(startMin));

        if ( endHourText.length % 2 == 0  )
        {
            endHour = endHourText.substring(0,1);
        }
        else
        {
            endHour = endHourText.substring(0,2);
        }

        if ( endHourText.length == 2 || endHourText.length == 3 )
        {
            endMin = 0;
        }
        else if( endHourText.length == 4 )
        {
            endMin = endHourText.substring(2,4);
        }
        else if( endHourText.length == 5 )
        {
            endMin = endHourText.substring(3,5);
        }

        var startDateTime = new Date(year, iMonth, day, parseInt(startHour), parseInt(startMin));
        console.log(year);
        console.log(iMonth);
        console.log(day);
        console.log(parseInt(startHour));
        console.log(parseInt(startMin));
        var endDateTime = new Date(year, iMonth, day, parseInt(endHour), parseInt(endMin));

        var weekDay = aWeekday[startDateTime.getDay()];
        weekDay = weekDay.charAt(0).toUpperCase() + weekDay.slice(1);
        var day = ( startDateTime.getDate() == 1 ? '1er' : startDateTime.getDate() );
        var month = aMonth[startDateTime.getMonth()];
        var year = startDateTime.getFullYear();

        dateText = weekDay + ' ' + day + ' ' + month;

        newEvent = {
            title: event.title,
            place: event.location,
            dateText: dateText,
            startHourText: startHourText,
            endHourText: endHourText,
            frequency: 1,
            startDateTime: startDateTime,
            endDateTime: endDateTime,
            createdAt: new Date() // current time
        };

        console.log(newEvent);


        Events.insert(newEvent);
    },

    rmEvent : function(title){
        title = title + "*";
        event = Events.find({title:{$regex:title}}, {sort: {createdAt: -1}, limit: 1}).fetch();
        Events.remove(event[0]._id);
    }
});

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
	SSL('/meteor/blackMirror/private/server.key','/meteor/blackMirror/private/server.crt', 443);
  });
}
