import { registerSettings, moduleName } from './settings.js';
import { TimekeeperApplicationForm } from './lib/forms/TimekeeperApplicationForm/TimekeeperApplicationForm.js'
import { TimeKeeper } from './lib/timekeeper.js';
import { JournalKeeper } from './lib/journalkeeper.js';

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
    const timekeeper = new TimeKeeper(calendarData);

    // --- Setup the JournalKeeper --- //
    const journalkeeper = new JournalKeeper(game.settings.get(moduleName, 'currentJournal'), timekeeper);

    // --- Setup the main form --- //
    const mainForm = new TimekeeperApplicationForm(timekeeper, journalkeeper);

    // --- Setup the hooks --- //

    // Pause
    Hooks.on('pauseGame', async function() {
        if (game.paused === true) {
            timekeeper.pause();
        } else {
            timekeeper.resume();
        }
    })

    // Tick
    Hooks.on('vtt-timekeeper.tick', function(tick) {
        if (game.paused) {
            return
        } else {
            mainForm.render(false);
        }
    });

    // On new day
    Hooks.on('vtt-timekeeper.newDay', function(timekeeper) {
        journalkeeper.writeCurrentJournalToEntry()
        timekeeper.currentTicks = 0;
        timekeeper.currentClicks += timekeeper.allClicks.length - timekeeper.getCurrentClickIndex()
    });

    //  Journal notes
    Hooks.on('vtt-timekeeper.addJournal', function(entry) {

        journalkeeper.addEntry({
            type: entry.type,
            user: entry.user,
            content: entry.content
        })

    });

    // Rest
    /*** 
     * This hook only adds a journal entry. It does not automatically advance
     * the gametime forward, because handling that is a little too complex
     * with multiple players. The idea is that it's already quite simple for the GM
     * to advance gametime manually, and they should just do that.
    ***/
    Hooks.on('dnd5e.restCompleted', function(actor, rest) {
        let restType = rest.longRest ? 'Long Rest' : 'Short Rest'
        journalkeeper.addEntry({
            type: restType,
            user: actor,
            content: `${actor.name} takes a ${restType}`
        })
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

            Hooks.call('vtt-timekeeper.addJournal', {
                type: "Note",
                content: parameters,
                user: game.users.get(messageData.user)
            })
            return { content: `added a note to the journal: <blockquote>${parameters}</blockquote>` } 
        },
        autocompleteCallback: (menu, alias, parameters) => [game.chatCommands.createInfoElement("Write a note in today's journal")],
        closeOnComplete: true
    });

    

});


