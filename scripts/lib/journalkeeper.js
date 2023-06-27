export class JournalKeeper {

    constructor(currentJournal, timekeeper) {
        this.currentJournal = currentJournal;
        this.timekeeper = timekeeper
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

}