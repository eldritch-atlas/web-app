import Settings from "./settings.js";
import Tokens from "./tokens.js";
import Background from "./background.js";
import IndexDBAdapter from "./adapters/index-db.js";
// import HttpAdapter from "./adapters/http.js";
import EventEmitter from "eventemitter3";

const events = Symbol("events");
const settings = Symbol("settings");
const _tokens = Symbol("_tokens");
const background = Symbol("background");
const indexDBAdapter = Symbol("indexDBAdapter");
// const httpAdapter = Symbol("indexDBAdapter");

export default class State {
  constructor(id) {
    this.id = id;
    this[events] = new EventEmitter();
    this[indexDBAdapter] = new IndexDBAdapter(`eldritch-atlas`, 1);
    // this[httpAdapter] = new HttpAdapter(`http://127.0.0.1:8081`, 1);
    this[settings] = new Settings(id);
    this[_tokens] = new Tokens(id, this[events], this[indexDBAdapter]);
    this[background] = new Background(id);
  }

  on(event, handler) {
    this[events].on(event, handler);
  }

  get tokens() {
    return this[_tokens];
  }

  get background() {
    return this[background];
  }

  set background(value) {
    const changed = this[background].set(value);
    if (changed) {
      this[events].emit("state:background:update", this[background]);
      this[indexDBAdapter].set(`backgrounds`, this[background]);
    }
  }

  set updateReady(value) {
    if (value && typeof value === "boolean" && this.updateReady !== value) {
      this.updateReady = value;
      if (value === true) {
        this[events].emit("state:updateReady");
      }
    }
  }

  get settings() {
    return this[settings];
  }

  set settings(values = null) {
    if (typeof values === "string" || typeof values === "number") {
      throw new Error(
        `Invalid settings. Expected object with valid keys, got "${values}"`
      );
    }
    const validValues = [
      "id",
      "boardId",
      "name",
      "width",
      "height",
      "cellsize",
      "resolution",
      "backgroundColor",
      "gridTransparency",
      "gridColor",
      "backgroundOffsetX",
      "backgroundOffsetY",
    ];
    for (const key of Object.keys(values || {})) {
      if (!validValues.includes(key)) {
        throw new Error(
          `Invalid setting "${key}" specified when updating settings. Can only be one of ${JSON.stringify(
            validValues
          )}`
        );
      }
    }

    const changed = this[settings].set(values);
    if (changed) {
      this[events].emit("state:settings:update", this.settings);
      this[indexDBAdapter].set(`settings`, this.settings);
    }
  }

  async load() {
    this.background = await this[indexDBAdapter].get(`backgrounds`, this.id);
    // this.background = await this[httpAdapter].get(`backgrounds`, this.id);

    this.settings = await this[indexDBAdapter].get(`settings`, this.id);
    // this.settings = await this[httpAdapter].get(`settings`, this.id);

    const tokens = await this[indexDBAdapter].getAll(
      "tokens",
      "boardId",
      this.id
    );
    if (tokens) {
      for (const value of tokens) {
        this[_tokens].add(value);
      }
    }

    this[events].emit("state:load", {
      tokens: this[_tokens],
      settings: this.settings,
      background: this.background,
    });
  }
}
