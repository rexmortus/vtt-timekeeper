export class JournalKeeper {

    constructor(currentJournal, timekeeper) {

        this.currentJournal = currentJournal;
        this.timekeeper = timekeeper
        
        // TODO Store Journal Entries in a compendium 
    }

    getJournal() {

        return this.currentJournal;
    }

    getJournalEntries() {

        let currentJournal = this.currentJournal;

        return this.timekeeper.getPhases().reduce(function(accumulator, phase) {
            
            let journals = [];
            
            phase['journals'] = currentJournal.reduce(function(accumulator, journal  ) {
                
                if (journal.phaseName === phase.phaseName) {
                    return accumulator.concat(journal);
                } else{
                    return accumulator
                }

            }, []);

            return accumulator.concat(phase)

        }, [])
    }

    addEntry(entry) {

        this.currentJournal.push({
            "type": entry.type,
            "user": entry.user.name,
            "phaseName": this.timekeeper.getCurrentPhaseName(),
            "content": entry.content
        });

        game.settings.set('vtt-timekeeper', 'currentJournal', this.currentJournal);
        
        return entry;
    }

    writeCurrentJournalToEntry() {

        // Prepare data for the new journal entry
        let day = this.timekeeper.getCurrentDayAsOrdinal();
        let month = this.timekeeper.getCurrentMonth();
        let year = this.timekeeper.getCurrentYear();
        let era = this.timekeeper.getCurrentEra();
        let journalName = `${day} of ${month}, ${year} ${era}`
        
        
        let html = `
        <div style="overflow: scroll;">
        {{#each entries}}
        <h3>{{this.icon}} {{this.phaseName}}</h3>
        <ul>
          {{#each this.journals}}
            <li>{{this.user}} - {{this.type}}<br>
            <blockquote>{{this.content}}</blockquote></li>
          {{/each}}
        </ul>
        {{/each}}
        </div>
        `

        debugger;

        let template = Handlebars.compile(html);

        // Create the new JournalEntry
        JournalEntry.create({
            name: journalName,
            content: template({
                entries: this.getJournalEntries()
            })
        });

        // Reset the current journal
        this.currentJournal = [];
        game.settings.set('vtt-timekeeper', 'currentJournal', this.currentJournal);

    }

}