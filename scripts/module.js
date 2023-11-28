import { registerSettings, moduleName } from './settings.js';
import { TimekeeperApplicationForm } from './lib/forms/TimekeeperApplicationForm/TimekeeperApplicationForm.js'
import { TimeKeeper } from './lib/timekeeper.js';

// Register handlebars helpers
Handlebars.registerHelper('isLessThan', function(n1, n2, options) {
    return (n1 < n2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('isEqualTo', function(n1, n2, options) {
    return (n1 === n2) ? options.fn(this) : options.inverse(this);
});

Hooks.once('init', async function() {

    // --- Register the settings for the module --- //
    registerSettings();

    // --- Setup the TimeKeeper --- //
    // Have to load the calendar data here because you can't do await in a constructor??

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

    // --- Register chat journalling functions --- //
    Hooks.on("chatCommandsReady", commands => {

        // Add a note
        commands.register({
            name: "/note",
            module: "_chatcommands",
            aliases: ["/n"],
            description: "Write a note in today's journal",
            icon: "✎ ",
            requiredRole: "NONE",
            callback: function(chat, parameters, messageData) {

                if (parameters) {
                    let user = game.users.get(messageData.user);
                    let title = `${user.name} at ${SimpleCalendar.api.currentDateTimeDisplay().time}` 
                    SimpleCalendar.api.addNote(title, parameters, {}, {}, true, SimpleCalendar.api.NoteRepeat.Never, ['Notes']);
                    return { content: `added a note to the journal: <blockquote>${parameters}</blockquote>` }
                } else {
                    ui.notifications.info("There was no journal content");
                }

                 
            },
            autocompleteCallback: (menu, alias, parameters) => [game.chatCommands.createInfoElement("Write a note in today's journal")],
            closeOnComplete: true
        });

    });
    
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
