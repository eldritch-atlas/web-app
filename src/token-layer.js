import { Sprite, Container, filters, TextStyle, Text, Graphics } from "pixi.js";

const _settings = Symbol("settings");
const _token = Symbol("token");
const _colorFilter = Symbol("colorFilter");
const _layer = Symbol("layer");
const _sprite = Symbol("sprite");
const _label = Symbol("label");
const _labelBackground = Symbol("labelBackground");
const _labelText = Symbol("labelText");
const _labelTextStyle = Symbol("labelTextStyle");

const fontSize = (cellsize) => {
  if (cellsize <= 30) return 8;
  if (cellsize <= 40) return 10;
  if (cellsize <= 50) return 12;
  if (cellsize <= 60) return 14;
  if (cellsize <= 70) return 16;
  if (cellsize <= 80) return 18;
  if (cellsize <= 90) return 20;
  if (cellsize <= 100) return 22;
  if (cellsize > 100) return 24;
};

export default class Token {
  constructor(settings, assets, token) {
    const {
      loader: { resources },
    } = assets;
    const xy = (i) => i * settings.cellsize - settings.cellsize;
    this.xy = xy;

    this.id = token.id;
    this[_token] = token;

    this[_settings] = settings;
    this[_layer] = new Container();
    this[_layer].interactive = true;

    this[_layer].id = this.id;
    this[_layer].type = "token";

    this[_colorFilter] = new filters.ColorMatrixFilter();
    this[_layer].filters = [this[_colorFilter]];
    this[_colorFilter].enabled = false;
    this[_colorFilter].hue(45);

    const sprite = new Sprite(resources[token.src].texture);
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
    this[_sprite] = sprite;

    this.move();
    this.resize();
    this.rotate();

    this[_layer].addChild(sprite);

    const style = new TextStyle({
      fontFamily: "Arial",
      fontSize: 18,
      fill: "white",
      // stroke: "#ff3300",
      // strokeThickness: 4,
      // dropShadow: true,
      // dropShadowColor: "#000000",
      // dropShadowBlur: 4,
      // dropShadowAngle: Math.PI / 6,
      // dropShadowDistance: 6,
    });
    this[_labelTextStyle] = style;
    const label = new Container();
    this[_label] = label;
    this[_labelBackground] = new Graphics();
    // this[_labelBackground].lineStyle(4, 0x99ccff, 1);

    // this[_labelBackground].x = 48;
    // this[_labelBackground].y = 190;
    this[_label].addChild(this[_labelBackground]);
    const labelText = new Text("", style);
    label.addChild(labelText);
    this[_layer].addChild(label);
    this[_labelText] = labelText;

    this.label();
  }

  get layer() {
    return this[_layer];
  }

  select() {
    // this[_colorFilter].enabled = true;
  }

  unselect() {
    // this[_colorFilter].enabled = false;
  }

  move() {
    const xy = (i) => i * this[_settings].cellsize - this[_settings].cellsize;
    const sizeModifier = this[_token].size % 2 === 0 ? 1 : 2;
    this[_layer].x =
      this[_settings].cellsize / sizeModifier + xy(this[_token].x);
    this[_layer].y =
      this[_settings].cellsize / sizeModifier + xy(this[_token].y);
  }

  resize() {
    this[_sprite].width =
      this[_settings].cellsize * parseFloat(this[_token].size);
    this[_sprite].height =
      this[_settings].cellsize * parseFloat(this[_token].size);
  }

  rotate() {
    this[_sprite].rotation = (this[_token].rotation * Math.PI) / 180;
  }

  label() {
    if (!this[_token].label) {
      this[_labelText].text = "";
      this[_label].visible = false;
      return;
    }
    this[_label].visible = true;
    this[_labelTextStyle].fontSize = fontSize(this[_settings].cellsize);
    this[_labelText].text = this[_token].label;
    this[_labelBackground].clear();
    this[_labelBackground].beginFill(0x000000);
    this[_labelBackground].drawRoundedRect(
      -8,
      -2,
      this[_labelText].width + 16,
      this[_labelText].height + 4,
      10
    );
    this[_labelBackground].endFill();

    const labelHeight = fontSize(this[_settings].cellsize) + 4;
    const heightOffset =
      this[_token].height(this[_settings].cellsize) / 2 - labelHeight;
    this[_label].position.set(-(this[_labelText].width / 2), heightOffset);
  }

  set settings(settings) {
    this[_settings] = settings;
    this.move();
    this.resize();
    this.rotate();
    this.label();
  }

  set token(token) {
    this[_token] = token;
    this.move();
    this.resize();
    this.rotate();
    this.label();
  }
}
