;(function(document) {

/**
  MIT License

  Copyright (c) 2016 Ayesha Mahmood

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.

 * This is a simple module that adds `Save the Date` or
 * `Add to Calendar` functionality on a page.
 *
 * @author  Ayesha Mahmood
 * @version 1.0.0
*/

/**
 * @name: addToCalendar
 * @description: A module that allows you to add a date to the calendar
*/

  var addToCalendar = (function () {

    var selectors = {
      'calendar'  : 'data-addtocal',
      'title'     : 'data-addtocal-title',
      'startDate' : 'data-addtocal-startdate',
      'endDate'   : 'data-addtocal-enddate',
      'startTime' : 'data-addtocal-starttime',
      'endTime'   : 'data-addtocal-endtime',
      'desc'      : 'data-addtocal-desc',
      'location'  : 'data-addtocal-location',
      'url'       : 'data-addtocal-url',
      'categories': 'data-addtocal-categories',
      'organizer' : 'data-addtocal-organizer',
      'linkType'  : 'data-addtocal-type'
    };

    var calendarType = {

      google  : function (eventData) {
        return 'https://www.google.com/calendar/render?action=TEMPLATE'
              + '&text='      + eventData.title
              + '&dates='     + eventData.startDate
              + '/'           + eventData.endDate
              + '&location='  + eventData.location
              + '&details='   + eventData.description;
      },

      outlooklive : function (eventData) {
        return 'http://calendar.live.com/calendar/calendar.aspx?rru=addevent'
              + '&summary='     + eventData.title
              + '&dtstart='     + eventData.startDate
              + '&dtend='       + eventData.endDate
              + '&location='    + eventData.location
              + '&description=' + eventData.description;
      },

      yahoo : function (eventData) {
        return 'https://calendar.yahoo.com/?v=60'
              + '&title='   + eventData.title
              + '&st='      + eventData.startDate
              + '&dur='     + eventData.duration
              + '&in_loc='  + eventData.location
              + '&desc='    + eventData.description;
      },

      ics : function (eventData) {
        return 'data:text/calendar;charset=utf8,'
              + 'BEGIN:VCALENDAR'
              + '\nMETHOD:PUBLISH'
              + '\nVERSION:2.0'
              + '\nBEGIN:VEVENT'
              + '\nSEQUENCE:0'
              + '\nDTSTART:'      + eventData.startDate
              + '\nDTEND:'        + eventData.endDate
              + '\nSUMMARY:'      + eventData.title
              + '\nLOCATION:'     + eventData.location
              + '\nDESCRIPTION:'  + eventData.description
              + '\nURL:'          + (eventData.url || document.location)
              + '\nCATEGORIES:'   + (eventData.categories || '')
              + '\nORGANIZER:'    + (eventData.organizer || '')
              + '\nCLASS:PUBLIC'
              + '\nEND:VEVENT'
              + '\nEND:VCALENDAR';
      }
    };

    /**
     * @description: Format a given date object into an ISO string without special characters
     * @param  {Object} dateObj A date object containing a given date
     * @return {String}         An ISO string for a given date object
    */
    function formatDate (dateObj, justDate) {

      if (typeof dateObj !== 'object') {
        return false;
      }

      var dateISOStr = dateObj.toISOString().replace(/-|:|\.\d+/g, '');

      if (justDate) {
        return dateISOStr.substring(0, 8);
      }
      return dateISOStr;
    }

    /**
     * @description: Encode a url string for the browser
     * @param  {String} url A url string.
     * @return {String}     An encoded URL string
    */
    function encodeURL(url) {
      if (typeof url !== 'string') {
        return false;
      }

      return encodeURI(url);
    }

    /**
     * @name: dateify
     * @description: Convert a string to date object.
     * @param  {String} date  A string value in date format.
     * @return {Object}       A date object with the given date string
    */
    function dateify (date) {

      if (typeof date !== 'string') {
        console.log(date, ' is not a valid date string.');
        return false;
      }

      return new Date(date);
    }

    /**
     * @name: setHoursToDate
     * @description: Get milliseconds from time HH:MM:SS.
     * @param  {Object} date  A date object.
     * @param  {String} time  A string value in time format.
     * @return {Object}       A number with milliseconds
    */
    function setHoursToDate (dateObj, time) {

      if (!dateObj || !time) {
        return false;
      }
      var timeBreakDown = time.split(':');
      return new Date(dateObj.setHours(+timeBreakDown[0], +timeBreakDown[1], (+timeBreakDown[2] || 0)));
    }

    /**
     * @name: getEventDateAndTime
     * @description: Handle event date and time
     * @param  {Object} eventData  An object with event information.
     * @return {Object}       An object with formatted event dates and duration.
    */
    function getEventDateAndTime(eventData) {
      if (!eventData.startDate || isNaN(Date.parse(eventData.startDate))) {
        return eventData;
      }

      // Handle when start date is same as end date
      if (eventData.startDate && !eventData.endDate && eventData.startTime) {
        eventData.endDate = eventData.startDate;
      }

      // Handle full day event
      if (eventData.startDate && !eventData.startTime) {
        var formattedDate = formatDate(dateify(eventData.startDate), true);
        return { startDate: formattedDate, endDate: formattedDate};
      }

      // Handle invalid data
      if (!eventData.startTime || !eventData.endTime) {
        console.log('A valid end date, start time and end time is required.');
        return false;
      }

      // All other type of events
      var startDate = setHoursToDate(dateify(eventData.startDate), eventData.startTime);
      var endDate = setHoursToDate(dateify(eventData.endDate), eventData.endTime);
      var duration = calcDuration(startDate, endDate);

      return {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        duration: (duration || 0)
      };
    }

    /**
     * @name: calcDuration
     * @description: Calculate duration between two dates
     * @param  {Object} startDate A JS date object
     * @param  {Object} endDate   A JS end date
     * @return {Object}           A string with duration, formatted in ISO hour format
    */
    function calcDuration (startDate, endDate) {
      var duration = (Math.abs(startDate - endDate) / 36e5).toString();
      var hoursAndMin = duration.split('.');
      var durationStr = '';
      if (hoursAndMin[0]) {
        durationStr = (hoursAndMin[0] > 9 ? hoursAndMin[0] : '0' + hoursAndMin[0]);
        if(hoursAndMin[1]) {
          var minutes = parseFloat('0.' + hoursAndMin[1]);
          return Math.floor(minutes*60);
        }
      }
    }

    /**
     * @name: onDomReady
     * @description: Set the `href` of all buttons
     * @private
    */
    function onDomReady () {

      // Get all calendars with the data attribute `data-addtocal`
      var calendars = document.querySelectorAll('[' + selectors.calendar + ']');

      calendars.forEach(function (cal) {
        var eventData = {
            title       : cal.getAttribute(selectors.title)
          , startDate   : cal.getAttribute(selectors.startDate)
          , endDate     : cal.getAttribute(selectors.endDate)
          , startTime   : cal.getAttribute(selectors.startTime)
          , endTime     : cal.getAttribute(selectors.endTime)
          , location    : cal.getAttribute(selectors.location)
          , description : cal.getAttribute(selectors.desc)
          , url         : cal.getAttribute(selectors.url)
          , categories  : cal.getAttribute(selectors.categories)
          , organizer   : cal.getAttribute(selectors.organizer)
        };

        var eventDateAndTime = getEventDateAndTime(eventData);
        var buttons = cal.querySelectorAll('[' + selectors.linkType + ']');

        eventData.startDate = eventDateAndTime.startDate;
        eventData.endDate = eventDateAndTime.endDate;

        if (eventDateAndTime.duration) {
          eventData.duration = eventDateAndTime.duration;
        }

        buttons.forEach(function (button) {
          var calendar = button.getAttribute(selectors.linkType);

          if (calendar && typeof calendarType[calendar] === 'function') {
            var url = calendarType[calendar](eventData);
            button.setAttribute('href', encodeURL(url));
          }
        });
      });
    }

    /**
     * @name: bindEventListener
     * @description: Setup the `href` for all Add to Cal buttons
     * @private
    */
    function bindEventListener () {
      document.addEventListener('DOMContentLoaded', onDomReady);
    }

    return {
      initialize: function (options) {
        bindEventListener();
      }
    }

  }());

  addToCalendar.initialize();

}(document));
