Shops = new Mongo.Collection("shops");
Events = new Mongo.Collection("events");
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

if (Meteor.isClient) {
    // This code only runs on the client
    Template.body.helpers({
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
            var lastEvent = null;
            return Events.find({}, {sort: {startDateTime: 1}, transform: function (eventItem) {

                console.log('eventItem');
                console.log(eventItem);

                console.log('lastEvent');
                console.log(lastEvent);

                if (!lastEvent || (lastEvent.getDate() != eventItem.startDateTime.getDate() || lastEvent.getMonth() != eventItem.startDateTime.getMonth() || lastEvent.getFullYear() != eventItem.startDateTime.getFullYear())){
                    eventItem.new_date = true;
                }else{
                    eventItem.new_date = false;
                }
                lastEvent = eventItem.startDateTime;
                return eventItem;
            }});
        },

        log: function () {
            console.log(this);
        },

        tooManyEventss: function () {
            return Events.find().count() > limit;
        },

        noEvents: function () {
            return Events.find().count() == 0;
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
            return ( Session.get("weekday") ? aWeekday[Session.get("weekday")] : aWeekday[new Date().getDay()] );
        },

        monthChange: function () {
            return ( Session.get("month") ? aMonth[Session.get("month")] : aMonth[new Date().getMonth()] );
        }


    });

    Template.event.helpers({
        lastDateText: function () {
            return this.dateText;
        }
    });

    Template.body.events({
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



            var title = event.target.title.value;
            var place = event.target.place.value;
            var dateText = day + ' ' + month + ' ' + year;

            var startHour = $(event.target.starthour).val();
            var startMin = ($(event.target.startmin).val() == 0 ? "00" : $(event.target.startmin).val() );
            var endHour = $(event.target.endhour).val();
            var endMin = ($(event.target.endmin).val() == 0 ? "00" : $(event.target.endmin).val() );

            var startHourText = startHour + ":" + startMin;
            var endHourText = endHour + ":" + endMin;
            var frequency = event.target.frequency.value;

            var startDateTime = new Date(year, iMonth, day, parseInt(startHour), parseInt(startMin));
            console.log('startDateTime');
            console.log(startDateTime);
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
            weekday = new Date($(".year").val(), $(".month").val(), $(".day").val()).getDay();
            Session.set("weekday", weekday);
        },

        "change .month": function (event) {
            month = $(event.target).val();
            Session.set("month", month);
        },

        "change .starthour": function (event) {
            currentEndHour = parseInt($(event.target).val()) + 1;
            console.log(currentEndHour);
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
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
