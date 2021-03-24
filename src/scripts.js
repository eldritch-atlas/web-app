import { h, render } from "preact";
import htm from "htm";
import TableTop from "./table-top.js";
import App from "./ui-components/app.js";
import Assets from "./assets.js";
import State from "./state/state.js";

const html = htm.bind(h);

const main = async () => {
  const url = new URL(window.location.href);
  const id = url.searchParams.get("id");
  console.log(id);
  if (!id) throw new Error(":id is a required url query parameter");
  if (!/^[a-z0-9]{6}$/.test(id))
    throw new Error(":id does not conform to expected url query param");

  const assets = new Assets();
  await assets.load();

  const state = new State(id);

  const tabletop = new TableTop({ assets, state });

  render(
    html`<${App}
      assets="${assets}"
      worldState="${state}"
      dropToken="${tabletop.createTokenAtCoords.bind(tabletop)}"
    />`,
    document.getElementById("app")
  );

  await tabletop.run();
  await state.load();
};

main().catch((err) => {
  console.error(err);
});
