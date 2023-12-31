export class TimekeeperApplicationForm extends FormApplication {

    // The constructor needs both the timekeeper and journalkeeper
    constructor(timekeeper) {
        super();
        this.timekeeper = timekeeper
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["form"],
            popOut: true,
            template: "./modules/vtt-timekeeper/scripts/lib/forms/TimekeeperApplicationForm/TimekeeperApplicationForm.html",
            id: "vtt-timekeeper",
            title: "VTT Timekeeper",
            height: 750,
            width: 660,
            minimizable: true,
            classes: ["vtt-timekeeper"]
        });
    }

    getData() {

        // Create an object that is passed to the view template
        return {
            data: this.timekeeper.api.currentDateTimeDisplay(),
            secondsInCurrentSegment: this.timekeeper.getSecondsInCurrentSegment(),
            secondsPerSegment: this.timekeeper.getSecondsPerSegment(),
            secondsInCurrentSegment: this.timekeeper.getSecondsInCurrentSegment(),
            allSegments: this.timekeeper.getAllSegments(),
            currentSegmentIndex: this.timekeeper.getCurrentSegmentIndex(),
            currentSegmentName: this.timekeeper.getCurrentSegmentName(),
            rotation: this.timekeeper.getRotation(),
        };
    }

    activateListeners(html) {

        const openSimpleCalendarButton = html.find('#openSimpleCalendar');

        openSimpleCalendarButton.on("click", function(event, object) {
            SimpleCalendar.api.showCalendar();
        });

        const gametimeToggle = html.find("#gametimeToggle");

        gametimeToggle.on("click", function(event, object) {
            SimpleCalendar.api.startClock();
        })

        // Get all segments
        const segments = html.find(".click");

        // Attach click listeners 
        // TODO attach to the parent item
        // TODO Otherwise, I think that when a segment passes from being future to past, it will still have a click listener attached?
        segments.on("click", function(event, object) {

            // Get the target click index
            let targetIndex = $(event.target).data().clickindex

            // Get the current click index
            let currentIndex = this.timekeeper.getCurrentSegmentIndex();

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
                            label: `${this.timekeeper.getAllSegments()[targetIndex]}`,
                            callback: () => this.timekeeper.advanceToSegment(targetIndex)
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
