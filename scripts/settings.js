export const moduleName = "vtt-timekeeper";

export const registerSettings = () => {
    
    game.settings.register(moduleName, 'phasesPerDay', {
        name: 'Phases per day',
        hint: 'Phases per day of gametime',
        scope: 'world',
        config: true,
        type: Number,
        default: 4,
        onChange: (id) => {
            console.log();
        }
    })

    game.settings.register(moduleName, 'clicksPerDay', {
        name: 'Clicks per day',
        hint: 'Clicks per day of gametime',
        scope: 'world',
        config: true,
        type: Number,
        default: 12,
        onChange: (id) => {
            console.log();
        }
    });

    game.settings.register(moduleName, 'realtimePerClick', {
        name: 'Realtime per click',
        hint: 'Amount of realtime (in minutes) per click of gametime',
        config: true,
        type: Number,
        default: 20,
        onChange: (id) => {
            console.log();
        }
    });

    game.settings.register(moduleName, 'currentClicks', {
        name: 'Current Clicks',
        hint: 'How much gametime has passed, measured in "clicks"',
        scope: 'world',
        config: false,
        type: Number,
        default: 0
    });

    game.settings.register(moduleName, 'currentTicks', {
        name: 'Current ticks',
        hint: 'Hoe muvh gametime has passed in a single "click"',
        scope: 'world',
        config: false,
        type: Number,
        default: 0
    })

    game.settings.register(moduleName, 'currentJournal', {
        name: 'Current Journal',
        hint: 'The current, in-memory journal for the current click',
        scope: 'world',
        config: false,
        type: Array,
        default: []
    });
}