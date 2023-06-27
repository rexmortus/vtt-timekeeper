import { registerSettings, moduleName } from './settings.js';
import { TimekeeperApplicationForm } from './lib/forms/TimekeeperApplicationForm/TimekeeperApplicationForm.js'
import { TimeKeeper } from './lib/timekeeper.js';
import { JournalKeeper } from './lib/journalkeeper.js';

// Register handlebars helpers
Handlebars.registerHelper('isLessThan', function(n1, n2, options) {
    return (n1 < n2) ? options.fn(this) : options.inverse(this);
});

// // Add "Add to Journal" option to chat message context menu
// Hooks.on('getChatLogEntryContext', function(html, entries) {

//     entries.push({
//         name: " Add To Journal",
//         icon: "✎",
//         callback: function(menuItem, event) {
//             Hooks.call('vtt-timekeeper.addJournal', {
//                 type: "Note",
//                 content: menuItem[0].outerText,
//                 user: game.users.get(game.userId)
//             })
//         }
//     })
// })

Hooks.once('init', async function() {

    // --- Register the settings for the module --- //
    registerSettings();

    // --- Setup the TimeKeeper --- //
    // Have to load the calendar data here because you can't do await in a constructor??
    const calendarReq = await fetch('/modules/vtt-timekeeper/harptos-calendar.json');
    const calendarData = await calendarReq.json();
    const timekeeper = new TimeKeeper(calendarData);

    // --- Setup the JournalKeeper --- //
    const journalkeeper = new JournalKeeper(game.settings.get(moduleName, 'currentJournal'), timekeeper);

    // --- Setup the main form --- //
    const mainForm = new TimekeeperApplicationForm(timekeeper, journalkeeper);

    // --- Setup the hooks --- //
    Hooks.on('pauseGame', async function() {
        if (game.paused === true) {
            timekeeper.pause();
        } else {
            timekeeper.resume();
        }
    })

    Hooks.on('vtt-timekeeper.tick', function(tick) {
        if (game.paused) {
            return
        } else {
            mainForm.render(false);
        }
    });

    // Add the journal hooks
    Hooks.on('vtt-timekeeper.addJournal', function(entry) {
        journalkeeper.addEntry({
            type: entry.type,
            user: entry.user,
            phaseName: "Morning",
            content: entry.content
        })
    });
    
    // Binding the "Shift + T" key to open the window
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

Hooks.once('ready', async function() {
    

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


