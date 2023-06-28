export class TimeKeeper {

    constructor(calendarData) {

        // Configuration
        this.ticksPerClick = calendarData.realtimePerClick * 60;
        this.clicksPerDay = calendarData.phases.reduce(function(accumulator, object) {
            return accumulator + object.clicks.length
        }, 0);

        // Load the state from settings
        this.currentTicks = game.settings.get('vtt-timekeeper', 'currentTicks');
        this.currentClicks = game.settings.get('vtt-timekeeper', 'currentClicks');
        this.paused = game.paused;

        // Initial Rotation
        this.rotationDegreesPerTick = this.ticksPerClick * this.clicksPerDay / 360;
        this.currentRotation = this._updateRotation();

        // Load / build calendar data
        this.calendar = calendarData;
        
        // The current Era
        this.currentEra = calendarData.currentEra;

        // The starting year (add this to the currentClicks)
        this.startingYear = this.calendar.startingYear;
        this.totalDaysPerYear = this.calendar.months.reduce(function(accumulator, object) {
            return accumulator + object.days 
        }, 0);
        this.startingClicks = this.startingYear * this.totalDaysPerYear * this.clicksPerDay;

        // Convenience for looking up current click
        this.allClicks = this.calendar.phases.reduce(function(accumulator, phase) {
            return accumulator.concat(phase.clicks);
        }, []);

        // Clicks per year
        this.clicksPerYear = this.totalDaysPerYear * this.clicksPerDay;

        // Clicks per month
        this.allMonths = this.calendar.months.reduce(function(accumulator, object) {
            return accumulator.concat(object.monthName);
        }, []);
        this.clicksPerMonth = this.clicksPerYear / this.allMonths.length;

    }

    start() {
        setInterval(this.tick.bind(this), 1000);
    }

    tick() {

        // Add a tick if the game isn't paused
        if (!this.paused) {
            this.currentTicks += 1;
            game.settings.set('vtt-timekeeper', 'currentTicks', this.currentTicks)
            game.settings.set('vtt-timekeeper', 'currentClicks', this.currentClicks);
        }

        // Add a click (and reset ticks) if currentTicks = ticksPerClick
        if (this.currentTicks === this.ticksPerClick) {
            this.currentTicks = 0;
            game.settings.set('vtt-timekeeper', 'currentTicks', this.currentTicks)

            let currentClicks = game.settings.get('vtt-timekeeper', 'currentClicks');
            this.currentClicks = currentClicks + 1;
            game.settings.set('vtt-timekeeper', 'currentClicks', this.currentClicks);
        }

        // Update the rotation
        this.currentRotation = this._updateRotation()
        
        // Send up the tick
        Hooks.call('vtt-timekeeper.tick', this);
    }

    // Pause the timekeeper
    pause() {
        this.paused = true;
    }

    // Resume the timekeeper
    resume() {
        this.paused = false;
    }

    // Get the current rotation of the main clock
    getRotation() {
        return this.currentRotation;
    }

    // Get the current number of ticks
    getTicks() {
        return this.currentTicks;
    }

    // Get the number of ticks per click
    getTicksPerClick() {
        return this.ticksPerClick;
    }

    // Get the number of clicks in the current day
    getCurrentClicks() {
        return this.currentClicks;
    }

    // Get all the clicks in the current day
    getAllClicks() {
        return this.allClicks;
    }

    // Update the rotation of the main clock
    _updateRotation() {
        return -(((this.currentClicks % this.clicksPerDay) * this.ticksPerClick) + (this.currentTicks)) / (this.ticksPerClick * this.clicksPerDay) * 360;
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
        let phaseIndex = Math.ceil((this.getCurrentClickIndex() / this.getAllClicks().length) * this.getPhases().length) - 1;
        return this.calendar.phases[phaseIndex].phaseName;
    }

    // Get the current era
    getCurrentEra() {
        return this.currentEra;
    }

    // Get the months of the calendar
    getCalendarMonths() {
        return this.calendar.months;
    }

    // Get the current year
    getCurrentYear() {      
        return Math.round((this.startingClicks + this.currentClicks) / this.clicksPerYear);
    }

    // Get the current month
    getCurrentMonth() {
        return this.allMonths[Math.round((((this.startingClicks + this.currentClicks) % this.clicksPerYear) / this.clicksPerYear) * this.allMonths.length)]
    }

    // Get the current day
    getCurrentDay() {
        return Math.round((((this.startingClicks + this.currentClicks) % this.clicksPerYear / this.clicksPerYear) * this.totalDaysPerYear) % (this.totalDaysPerYear / this.allMonths.length)) + 1
    }

    // Get the current day as an orindal
    getCurrentDayAsOrdinal() {
        return this._getOrdinal(this.getCurrentDay())
    }

    // Get the index of the current click
    getCurrentClickIndex() {
        return (this.startingClicks + this.currentClicks) % this.clicksPerDay;
    }

    // Get the current click name
    getCurrentClickName() {
        return this.allClicks[(this.startingClicks + this.currentClicks) % this.clicksPerDay];
    }

    // Advance the gametime to a specified click
    advanceToClick(clickIndex) {
        // Get the difference between the current click and the proposed click
        let clickDifference = Math.abs(this.getCurrentClickIndex() - clickIndex);

        // Reset ticks to 0
        this.currentTicks = 0;
        this.currentClicks = this.currentClicks + clickDifference;
    }

    // Advance to the next day
    advanceToNextDay() {
        this.currentTicks = 0;
        this.currentClicks += this.allClicks.length - this.getCurrentClickIndex();
        
    }

    // Convert a number into an ordinal
    _getOrdinal(number) {
        var s = ["th", "st", "nd", "rd"];
        var v = number % 100;
        return number + (s[(v-20)%10] || s[v] || s[0]);  
    }
}