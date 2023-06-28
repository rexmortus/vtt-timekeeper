export class TimekeeperApplicationForm extends FormApplication {

    // The constructor needs both the timekeeper and journalkeeper
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

        // Create an object that is passed to the view template
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
        
        // Get all ticks
        const clicks = html.find(".click");

        // Attach click listeners 
        // TODO attach to the parent item
        // TODO Otherwise, I think that when a segment passes from being future to past, it will still have a click listener attached?
        clicks.on("click", function(event, object) {

            // Get the target click index
            let targetIndex = $(event.target).data().clickindex

            // Get the current click index
            let currentIndex = this.timekeeper.getCurrentClickIndex();

            // That's now!
            if (targetIndex ===  currentIndex) {
                window.alert(`That's now!`);
            } 
            // 
            else if (targetIndex === 0) {
                
                new Dialog({
                    title: "Advance?",
                    buttons: {
                        one: {
                            icon: '<i class="fas fa-sun"></i>',
                            label: "Next day",
                            callback: () => this.timekeeper.advanceToNextDay()
                        },
                        two: {
                            icon: '<i class="fas fa-cancel"></i>',
                            label: 'Cancel'
                        }
                    },
                    default: "one",
                    render: html => console.log("Register interactivity in the rendered dialog"),
                    close: html => console.log("This always is logged no matter which option is chosen")
                }).render(true);
                
            }
            // Advance to the selected click
            else if (targetIndex > currentIndex) {   

                new Dialog({
                    title: "Advance?",
                    buttons: {
                        one: {
                            icon: '<i class="fas fa-rotate-right"></i>',
                            label: `${this.timekeeper.getAllClicks()[targetIndex]}`,
                            callback: () => this.timekeeper.advanceToClick(targetIndex)
                        },
                        two: {
                            icon: '<i class="fas fa-cancel"></i>',
                            label: 'Cancel',
                            callback: () => console.log("chose three")
                        }
                    },
                    default: "one",
                    render: html => console.log("Register interactivity in the rendered dialog"),
                    close: html => console.log("This always is logged no matter which option is chosen")
                }).render(true);
            }

            // Highlight the selected journals
            else if (targetIndex < currentIndex) {
                if (window.confirm('Highlight journals from selected click?')) {
                    console.log('Highlight journals')
                }
            }

            // Proceed to next day
        }.bind(this));
        
        super.activateListeners(html);
        
    }

    async _updateObject(event, formData) {
    }
}
