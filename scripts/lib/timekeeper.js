export class TimeKeeper {

    constructor(calendarData) {

        // Configuration
        this.ticksPerClick = calendarData.realtimePerClick * 60;
        this.clicksPerDay = calendarData.phases.reduce(function(accumulator, object) {
            return accumulator + object.clicks.length
        }, 0);

        // State
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

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }

    getRotation() {
        return this.currentRotation;
    }

    getTicks() {
        return this.currentTicks;
    }

    getTicksPerClick() {
        return this.ticksPerClick;
    }

    getCurrentClicks() {
        return this.currentClicks;
    }

    getAllClicks() {
        return this.allClicks;
    }

    _updateRotation() {
        return -(((this.currentClicks % this.clicksPerDay) * this.ticksPerClick) + (this.currentTicks)) / (this.ticksPerClick * this.clicksPerDay) * 360;
    }

    setCalendar(calendar) {
        this.calendar = calendar;
    }

    getPhases() {
        return this.calendar.phases;
    }

    getCalendar() {
        return this.calendar;
    }

    getCurrentPhaseName() {
        let phaseIndex = Math.round((((this.startingClicks + this.currentClicks) % this.clicksPerDay) / this.calendar.phases.length)) - 1;
        return this.calendar.phases[phaseIndex].phaseName;
    }

    getCurrentEra() {
        return this.currentEra;
    }

    getCalendarMonths() {
        return this.calendar.months;
    }

    getCurrentYear() {      
        return Math.round((this.startingClicks + this.currentClicks) / this.clicksPerYear);
    }

    getCurrentMonth() {
        return this.allMonths[Math.round((((this.startingClicks + this.currentClicks) % this.clicksPerYear) / this.clicksPerYear) * this.allMonths.length)]
    }

    getCurrentDay() {
        return Math.round((((this.startingClicks + this.currentClicks) % this.clicksPerYear / this.clicksPerYear) * this.totalDaysPerYear) % (this.totalDaysPerYear / this.allMonths.length)) + 1
    }

    getCurrentDayAsOrdinal() {
        return this._getOrdinal(this.getCurrentDay())
    }

    getCurrentClickIndex() {
        return (this.startingClicks + this.currentClicks) % this.clicksPerDay;
    }

    getCurrentClickName() {
        return this.allClicks[(this.startingClicks + this.currentClicks) % this.clicksPerDay];
    }

    _getOrdinal(number) {
        var s = ["th", "st", "nd", "rd"];
        var v = number % 100;
        return number + (s[(v-20)%10] || s[v] || s[0]);  
    }
}