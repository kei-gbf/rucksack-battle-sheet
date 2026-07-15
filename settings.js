

class Settings {

    #values = {};
    #defaults = {};
    #prefix = "";
    #storage = localStorage;

    constructor({
        storage = localStorage,
        prefix = "rucksack-battle-sheet.github.io",
        defaults = {},
    } = {}) {
        this.#defaults = defaults;
        this.#prefix = prefix;
        this.#storage = storage;
        this.#load();

        return new Proxy(this, {
            get(target, prop) {
                // console.log(`get ${target} ${prop}`);
                if (prop in target) {
                    return target[prop].bind(target);
                }
                return target.#getValue(prop);
            },
            set(target, prop, value) {
                if (prop in target) return;
                if (!(prop in target.#defaults)) return;

                target.#setValue(prop, value);
            }
        });
    }

    #getValue(prop) {
        return this.#values[prop] ?? this.#defaults[prop];
    }

    #setValue(prop, value) {
        this.#values[prop] = value;
        this.#save();
    }

    #reset() {
        this.#values = {};
    }

    #save() {
        console.log("settings SAVE");
        this.#storage.setItem(`${this.#prefix}/settings`,
            JSON.stringify(this.#values));
    }
    #load() {
        console.log("settings LOAD");
        const data = this.#storage.getItem(`${this.#prefix}/settings`);
        try {
            this.#values = JSON.parse(data ?? "");
        } catch {
            this.#reset();
        }
    }

    update(data) {
        this.#values = {...this.#values, ...data};
        this.#save();
    }

    clone() {
        return {...this.#defaults, ...this.#values};
    }
}

const settings = new Settings({
    defaults: {
        graphMin: 0,
        graphMax: 1200,
        enableTourOnStart: true,
        enableCopyToClipboard: false,
        copyRows: ["job", "time", "jobwin", "win", "score", "rank", "point", "note"],
    }
});

const DBNAME = "RankMatchDB";