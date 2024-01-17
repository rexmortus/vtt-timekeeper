import { registerSettings, moduleName } from './settings.js';
import { TimekeeperApplicationForm } from './lib/forms/TimekeeperApplicationForm/TimekeeperApplicationForm.js'
import { TimeKeeper } from './lib/timekeeper.js';

Hooks.once('init', async function() {

    // --- Register the settings for the module --- //
    registerSettings();


    let calendarReq;
    const calendarName = game.settings.get('vtt-timekeeper', 'calendar');

    if (calendarName === 'harptos') {
        calendarReq = await fetch('/modules/vtt-timekeeper/scripts/calendars/harptos-calendar.json');
    } else {
        calendarReq = await fetch('/modules/vtt-timekeeper/scripts/calendars/absalom.json');
    }

    const calendarData = await calendarReq.json();
    const timekeeper = new TimeKeeper(calendarData, SimpleCalendar.api);

    // --- Setup the main form --- //
    const mainForm = new TimekeeperApplicationForm(timekeeper);

    // Tick
    Hooks.on('vtt-timekeeper.tick', function(tick) {
        mainForm.render(false);
    });

    Hooks.on('vtt-time')
    
    // Opening the window
    game.keybindings.register("show-timekeeper", "show-timekeeper", {
        name: "Open the timekeeper window",
        hint: "Open the timekeeper window",
        editable: [
            {
                key: "KeyT",
                modifiers: ["Shift"]
            }
        ],
        onDown: () => {
            if (mainForm.rendered) {
                mainForm.close()
            } else {
                mainForm.render(true);   
            }
        },
        onUp: () => {},
        restricted: true
    })

    // --- Start the timekeeper --- //
    timekeeper.start();

});
