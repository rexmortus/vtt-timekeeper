export class TimekeeperApplicationForm extends FormApplication {
    constructor(timekeeper, journalkeeper) {
        super();
        this.timekeeper = timekeeper
        this.journalkeeper = journalkeeper
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["form"],
            popOut: true,
            template: "./modules/vtt-timekeeper/scripts/lib/forms/TimekeeperApplicationForm/TimekeeperApplicationForm.html",
            id: "vtt-timekeeper",
            title: "VTT Timekeeper",
            height: 540,
            width: 800,
            minimizable: true,
            classes: ["vtt-timekeeper"]
        });
    }

    getData() {
        return {
            ticks: this.timekeeper.getTicks(),
            clicks: this.timekeeper.getCurrentClicks(),
            ticksPerClick: this.timekeeper.getTicksPerClick(),
            calendarMonths: this.timekeeper.getCalendarMonths(),
            allClicks: this.timekeeper.getAllClicks(),
            currentClickIndex: this.timekeeper.getCurrentClickIndex(),
            currentClickName: this.timekeeper.getCurrentClickName(),
            currentDay: this.timekeeper.getCurrentDayAsOrdinal(),
            currentMonth: this.timekeeper.getCurrentMonth(),
            currentYear: this.timekeeper.getCurrentYear(),
            currentEra: this.timekeeper.getCurrentEra(),
            rotation: this.timekeeper.getRotation(),
            currentJournalEntries: this.journalkeeper.getJournalEntries()
        };
    }

    activateListeners(html) {
        super.activateListeners(html);
    }

    async _updateObject(event, formData) {
    }
}
