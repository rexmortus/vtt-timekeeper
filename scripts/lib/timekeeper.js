export class TimeKeeper {

    constructor(calendarData, api) {

        this.api = api;

        // Configuration
        this.timeConfig = this.api.getTimeConfiguration()
        this.secondsInMinute = this.timeConfig.secondsInMinute
        this.minutesInHour = this.timeConfig.minutesInHour;
        this.totalSecondsInDay = this.timeConfig.secondsInMinute * this.timeConfig.minutesInHour * this.timeConfig.hoursInDay
        this.degreesPerSecond = 360 / this.totalSecondsInDay;
        this.segmentsPerDay = calendarData.phases.reduce(function(accumulator, object) {
            return accumulator + object.clicks.length
        }, 0);

        this.secondsPerSegment = this.totalSecondsInDay / this.segmentsPerDay;    

        this.currentRotation = this._updateRotation();

        this.calendar = calendarData;
        this.allSegments = this.calendar.phases.reduce(function(accumulator, phase) {
            return accumulator.concat(phase.clicks);
        }, []);

    }

    start() {
        setInterval(this.tick.bind(this), 1000);
    }

    tick() {

        // Update the rotation
        this.currentRotation = this._updateRotation()
        
        // Send up the tick
        Hooks.call('vtt-timekeeper.tick', this);
    }

    // Get the current rotation of the main clock
    getRotation() {
        return this.currentRotation;
    }

    // Get the current number of ticks
    getSecondsInCurrentSegment() {
        return this.getCurrentSeconds() % this.secondsPerSegment;
    }

    // Get the number of ticks per click
    getSecondsPerSegment() {
        return this.secondsPerSegment;
    }

    // Get the number of clicks in the current day
    getCurrentClicks() {
        return this.currentClicks;
    }

    // Get all the clicks in the current day
    getAllSegments() {
        return this.allSegments;
    }

    getCurrentSeconds() {
        let dateTime = this.api.currentDateTime();
        let secondsFromHours = dateTime.hour * this.minutesInHour * this.secondsInMinute;
        let secondsFromMinutes = dateTime.minute * this.secondsInMinute;
        let seconds = dateTime.seconds;
        return seconds + secondsFromMinutes + secondsFromHours;
    }

    // Update the rotation of the main clock
    _updateRotation() {
        return -(this.getCurrentSeconds() * this.degreesPerSecond);
    }

    // Set the calendar
    setCalendar(calendar) {
        this.calendar = calendar;
    }

    // Get all the phases from the calendar
    getPhases() {
        return this.calendar.phases;
    }

    // Get the calendar data
    getCalendar() {
        return this.calendar;
    }

    // Get the current phase name
    getCurrentPhaseName() {
        
        // Get the current phase
        let phaseIndex = Math.floor((this.getCurrentSegmentIndex() / (this.getAllSegments().length - 1)) * this.getPhases().length);
        
        if (phaseIndex === this.getPhases().length) {
            phaseIndex -= 1;
        }
        
        return this.calendar.phases[phaseIndex].phaseName;
    }

    // Get the index of the current click
    getCurrentSegmentIndex() {
        return -Math.floor(this.currentRotation / 30) - 1;
    }

    // Get the current click name
    getCurrentSegmentName() {
        return this.allSegments[-Math.floor(this.currentRotation / 30) - 1];
    }

    // Advance the gametime to a specified click
    advanceToSegment(segmentIndex) {

        // Get the difference between the current click and the proposed segment
        let segmentDifference = Math.abs(this.getCurrentSegmentIndex() - segmentIndex);

        this.api.setDate({seconds: 0, minute: 0, hour: (segmentIndex * this.secondsPerSegment) / this.secondsInMinute / this.minutesInHour})
    }

    // Advance to the next day
    advanceToNextDay() {
        Hooks.call('vtt-timekeeper.newDay', this);
    }

    // Convert a number into an ordinal
    _getOrdinal(number) {
        var s = ["th", "st", "nd", "rd"];
        var v = number % 100;
        return number + (s[(v-20)%10] || s[v] || s[0]);  
    }
}