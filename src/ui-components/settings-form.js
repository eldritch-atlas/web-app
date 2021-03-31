import { h, Component } from "preact";
import htm from "htm";
import ModalHeader from "./modal-header.js";
import ModalFooter from "./modal-footer.js";

const html = htm.bind(h);

class SettingsForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...props.initialSettings,
    };
  }

  onSubmit = (e) => {
    this.props.submit(this.state);
    e.preventDefault();
  };

  onInput = (e) => {
    const { value, name } = e.target;
    this.setState({ [name]: value });
  };

  render(props, state) {
    const {
      name,
      width,
      height,
      cellsize,
      resolution,
      backgroundColor,
      gridTransparency,
      gridColor,
      backgroundOffsetX,
      backgroundOffsetY,
    } = state;
    return html`<${ModalHeader} close=${props.close}>Settings<//>
      <div class="p-8 overflow-auto">
        <div class="">
          <div class="flex items-center h-full w-full bg-teal-lighter">
            <div class="">
              <form class="mb-4">
                <div class="flex flex-col mb-4">
                  <label
                    class="mb-2 uppercase font-bold text-sm text-grey-darkest"
                    for="name"
                    >Map Name</label
                  >
                  <input
                    class="border py-2 px-3 text-grey-darkest"
                    name="name"
                    type="text"
                    value=${name}
                    onInput=${this.onInput}
                  />
                </div>

                <div class="flex flex-col mb-4">
                  <label
                    class="mb-2 uppercase font-bold text-sm text-grey-darkest"
                    for="width"
                    >Width (Number of Cells)</label
                  >
                  <input
                    class="border py-2 px-3 text-grey-darkest"
                    name="width"
                    type="number"
                    value=${width}
                    onInput=${this.onInput}
                  />
                </div>

                <div class="flex flex-col mb-4">
                  <label
                    class="mb-2 uppercase font-bold text-sm text-grey-darkest"
                    for="height"
                    >Height (Number of Cells)</label
                  >
                  <input
                    class="border py-2 px-3 text-grey-darkest"
                    name="height"
                    type="number"
                    value=${height}
                    onInput=${this.onInput}
                  />
                </div>

                <div class="flex flex-col mb-4">
                  <label
                    class="mb-2 uppercase font-bold text-sm text-grey-darkest"
                    for="cellsize"
                    >Cell Size (px)</label
                  >
                  <input
                    class="border py-2 px-3 text-grey-darkest"
                    name="cellsize"
                    type="number"
                    value=${cellsize}
                    onInput=${this.onInput}
                  />
                </div>

                <div class="flex flex-col mb-4">
                  <label
                    class="mb-2 uppercase font-bold text-sm text-grey-darkest"
                    for="resolution"
                    >Resolution</label
                  >
                  <input
                    class="border py-2 px-3 text-grey-darkest"
                    name="resolution"
                    type="number"
                    value=${resolution}
                    onInput=${this.onInput}
                  />
                </div>

                <div class="flex flex-col mb-4">
                  <label
                    class="mb-2 uppercase font-bold text-sm text-grey-darkest"
                    for="backgroundColor"
                    >Background Color (hexidecimal string eg. 8f8f8f)</label
                  >
                  <input
                    class="border py-2 px-3 text-grey-darkest"
                    name="backgroundColor"
                    type="text"
                    value=${backgroundColor}
                    onInput=${this.onInput}
                  />
                </div>

                <div class="flex flex-col mb-4">
                  <label
                    class="mb-2 uppercase font-bold text-sm text-grey-darkest"
                    for="gridTransparency"
                    >Grid Transparency (from 0 - 1)</label
                  >
                  <input
                    class="border py-2 px-3 text-grey-darkest"
                    name="gridTransparency"
                    type="number"
                    step="0.1"
                    value=${gridTransparency}
                    onInput=${this.onInput}
                  />
                </div>

                <div class="flex flex-col mb-4">
                  <label
                    class="mb-2 uppercase font-bold text-sm text-grey-darkest"
                    for="gridColor"
                    >Grid Color (hexidecimal string eg. 8f8f8f)</label
                  >
                  <input
                    class="border py-2 px-3 text-grey-darkest"
                    name="gridColor"
                    type="string"
                    value=${gridColor}
                    onInput=${this.onInput}
                  />
                </div>

                <div class="flex flex-col mb-4">
                  <label
                    class="mb-2 uppercase font-bold text-sm text-grey-darkest"
                    for="gridColor"
                    >Background Offset</label
                  >
                  x:
                  <input
                    class="border py-2 px-3 text-grey-darkest"
                    name="backgroundOffsetX"
                    type="number"
                    value=${backgroundOffsetX}
                    onInput=${this.onInput}
                  />

                  y:
                  <input
                    class="border py-2 px-3 text-grey-darkest"
                    name="backgroundOffsetY"
                    type="number"
                    value=${backgroundOffsetY}
                    onInput=${this.onInput}
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <${ModalFooter} close=${props.close} action=${this.onSubmit.bind(this)}
        >Select<//
      >`;
  }
}

export default SettingsForm;
