import { Application as App } from "pixi.js";
import { Viewport } from "pixi-viewport";
import keyboard from "./keyboard.js";
import Grid from "./grid.js";
import Background from "./background.js";
import Token from "./token.js";
import TokenCollection from "./token-collection.js";
import GameAssets from "./game-assets.js";

export default class TableTop {
  constructor({ assets, state }) {
    this.app = new App({
      // width: 100,         // default: 800
      // height: 100,        // default: 600
      antialias: true,
      resolution: state.settings.resolution,
      resizeTo: window,
      // powerPreference: 'high-performance',
    });
    this.viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: 1000,
      worldHeight: 1000,

      interaction: this.app.renderer.plugins.interaction, // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
    });

    this.app.stage.addChild(this.viewport);
    this.assetLoader = new GameAssets();
    this.assetLoader.add(assets.tokens);
    this.assetLoader.add(assets.backgrounds);

    this.selectedToken = null;

    this.state = state;

    this.layers = {
      background: new Background(this.assetLoader),
      grid: new Grid(),
      tokens: new TokenCollection(this),
    };

    this.viewport.addChild(this.layers.background.layer);
    this.viewport.addChild(this.layers.grid.layer);
    this.viewport.addChild(this.layers.tokens.layer);

    this.viewport.drag().pinch().wheel().decelerate();

    // const left = keyboard("ArrowLeft");
    // const up = keyboard("ArrowUp");
    // const right = keyboard("ArrowRight");
    // const down = keyboard("ArrowDown");
    const del = keyboard("Backspace");

    del.press = () => {
      if (this.selectedToken) this.state.tokens.remove(this.selectedToken);
    };

    // //Left arrow key `press` method
    // left.press = () => {
    //   if (!this.selectedToken) return;
    //   //Change the cat's velocity when the key is pressed
    //   this.selectedToken.layer.x -= state.settings.cellsize;
    // };

    // //Up
    // up.press = () => {
    //   if (!this.selectedToken) return;
    //   this.selectedToken.layer.y -= state.settings.cellsize;
    // };

    // //Right
    // right.press = () => {
    //   if (!this.selectedToken) return;
    //   this.selectedToken.layer.x += state.settings.cellsize;
    // };

    // //Down
    // down.press = () => {
    //   if (!this.selectedToken) return;
    //   this.selectedToken.layer.y += state.settings.cellsize;
    // };

    // this.app.ticker.add(() => {
    //   // animation stuff
    // });
    this.drag = false;
    this.dragTarget = null;

    this.viewport.on("mousedown", this.handleDragStart.bind(this));
    this.viewport.on("touchstart", this.handleDragStart.bind(this));

    this.viewport.on("mousemove", this.handleDrag.bind(this));
    this.viewport.on("touchmove", this.handleDrag.bind(this));

    this.viewport.on("mouseup", this.handleDragEnd.bind(this));
    this.viewport.on("touchend", this.handleDragEnd.bind(this));

    this.viewport.on("click", this.handleClick.bind(this));

    document.getElementById("canvas").appendChild(this.app.view);
  }

  handleDragStart(e) {
    if (e.target && e.target.type === "token") {
      this.drag = true;
      const token = this.layers.tokens.get(e.target.id);
      this.dragTarget = token;
      token.layer.parent.parent.pause = true;
    }
  }

  handleDrag(e) {
    if (this.drag && this.dragTarget) {
      this.dragTarget.layer.position.x = e.data.getLocalPosition(
        this.dragTarget.layer.parent
      ).x;
      this.dragTarget.layer.position.y = e.data.getLocalPosition(
        this.dragTarget.layer.parent
      ).y;
    }
  }

  handleClick(e) {
    this.layers.tokens.tokens.forEach((token) => {
      token.unselect();
    });
    if (e.target && e.target.type === "token") {
      const token = this.layers.tokens.get(e.target.id);
      this.selectedToken = token;
      token.select();
    }
  }

  handleDragEnd(e) {
    if (this.drag && this.dragTarget) {
      const pos = e.data.getLocalPosition(this.dragTarget.layer.parent);
      const closestCellX = Math.ceil(pos.x / this.state.settings.cellsize);
      const closestCellY = Math.ceil(pos.y / this.state.settings.cellsize);
      this.state.tokens.update({
        ...this.dragTarget.toJSON(),
        x: closestCellX,
        y: closestCellY,
      });

      this.dragTarget.layer.parent.parent.pause = false;
      this.drag = false;
      this.dragTarget = null;
    }
  }

  createTokenAtCoords(tokenData) {
    const { x, y } = this.viewport.toWorld(
      tokenData.x / this.state.settings.resolution,
      tokenData.y / this.state.settings.resolution
    );
    const cellX = Math.ceil(x / this.state.settings.cellsize);
    const cellY = Math.ceil(y / this.state.settings.cellsize);
    this.state.tokens.add({
      x: cellX,
      y: cellY,
      src: tokenData.src,
    });
  }

  setGridlines(settings) {
    this.layers.grid.draw(settings);
    this.layers.tokens.update(settings);
  }

  setResolution(resolution) {
    this.app.renderer.resolution = resolution;
  }

  setBackgroundColor(color) {
    this.app.renderer.backgroundColor = parseInt(color, 16);
  }

  async setBackgroundImage(image) {
    this.layers.background.set(image);
  }

  setScale(settings) {
    this.viewport.worldWidth = settings.widthPx;
    this.viewport.worldHeight = settings.heightPx;
    this.viewport.moveCenter(settings.widthPx / 2, settings.heightPx / 2);
    this.viewport.fitWidth(settings.widthPx, true);
  }

  async run() {
    await this.assetLoader.load();

    this.state.on("state:background:update", (background) => {
      this.setBackgroundImage(background.src);
    });

    this.state.on("state:settings:update", (settings) => {
      this.setBackgroundColor(settings.backgroundColor);
      this.setResolution(settings.resolution);
      this.setGridlines(settings);
      this.setScale(settings);
    });

    this.state.on("state:tokens:add", (token) => {
      this.layers.tokens.add(
        new Token(this.state.settings, this.assetLoader, token)
      );
    });

    this.state.on("state:tokens:update", (token) => {
      const t = this.layers.tokens.get(token.id);
      t.move(token.x, token.y);
    });

    this.state.on("state:tokens:remove", (token) => {
      this.layers.tokens.remove(token);
    });

    this.viewport.addChild(this.layers.tokens.layer);
  }
}
