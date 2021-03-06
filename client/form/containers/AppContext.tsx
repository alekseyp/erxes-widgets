import * as React from "react";
import { IEmailParams, IIntegration, IIntegrationFormData } from "../../types";
import { connection } from "../connection";
import { ICurrentStatus, IForm, IFormDoc, ISaveFormResponse } from "../types";
import { increaseViewCount, postMessage, saveForm, sendEmail } from "./utils";

interface IState {
  isPopupVisible: boolean;
  isFormVisible: boolean;
  isCalloutVisible: boolean;
  currentStatus: ICurrentStatus;
}

interface IStore extends IState {
  init: () => void;
  showForm: () => void;
  toggleShoutbox: (isVisible?: boolean) => void;
  showPopup: () => void;
  closePopup: () => void;
  save: (doc: IFormDoc) => void;
  createNew: () => void;
  sendEmail: (params: IEmailParams) => void;
  setHeight: () => void;
  getIntegration: () => IIntegration;
  getForm: () => IForm;
  getIntegrationConfigs: () => IIntegrationFormData;
}

const AppContext = React.createContext({} as IStore);

export const AppConsumer = AppContext.Consumer;

export class AppProvider extends React.Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      isPopupVisible: false,
      isFormVisible: false,
      isCalloutVisible: false,
      currentStatus: { status: "INITIAL" }
    };
  }

  /*
   * Decide which component will render initially
   */
  init = () => {
    const { data, hasPopupHandlers } = connection;
    const { integration, form } = data;

    const { callout } = form;
    const { loadType } = integration.formData;

    // if there is popup handler then do not show it initially
    if (loadType === "popup" && hasPopupHandlers) {
      return null;
    }

    this.setState({ isPopupVisible: true });

    // if there is no callout setting then show form
    if (!callout) {
      return this.setState({ isFormVisible: true });
    }

    // If load type is shoutbox then hide form component initially
    if (callout.skip && loadType !== "shoutbox") {
      return this.setState({ isFormVisible: true });
    }

    return this.setState({ isCalloutVisible: true });
  };

  /*
   * Will be called when user click callout's submit button
   */
  showForm = () => {
    this.setState({
      isCalloutVisible: false,
      isFormVisible: true
    });
  };

  /*
   * Toggle circle button. Hide callout and show or hide form
   */
  toggleShoutbox = (isVisible?: boolean) => {
    if (!isVisible) {
      // Increasing view count
      increaseViewCount(this.getForm()._id);
    }

    this.setState({
      isCalloutVisible: false,
      isFormVisible: !isVisible
    });
  };

  /*
   * When load type is popup, Show popup and show one of callout and form
   */
  showPopup = () => {
    const { data } = connection;
    const { integration } = data;
    const { callout } = integration.formData;

    this.setState({ isPopupVisible: true });

    // if there is no callout setting then show form
    if (!callout) {
      return this.setState({ isFormVisible: true });
    }

    if (callout.skip) {
      return this.setState({ isFormVisible: true });
    }

    return this.setState({ isCalloutVisible: true });
  };

  /*
   * When load type is popup, Hide popup
   */
  closePopup = () => {
    this.setState({
      isPopupVisible: false,
      isCalloutVisible: false,
      isFormVisible: false
    });

    // Increasing view count
    increaseViewCount(this.getForm()._id);
  };

  /*
   * Save user submissions
   */
  save = (doc: IFormDoc) => {
    saveForm({
      doc,
      browserInfo: connection.browserInfo,
      integrationId: this.getIntegration()._id,
      formId: this.getForm()._id,
      saveCallback: (response: ISaveFormResponse) => {
        const { status, errors } = response;

        this.setState({
          currentStatus: {
            status: status === "ok" ? "SUCCESS" : "ERROR",
            errors
          }
        });
      }
    });
  };
  /*
   * Redisplay form component after submission
   */
  createNew = () => {
    this.setState({ currentStatus: { status: "INITIAL" } });
  };

  setHeight = () => {
    const container = document.getElementById("erxes-container");

    if (!container) {
      return;
    }

    const elementsHeight = container.clientHeight;

    postMessage({
      message: "changeContainerStyle",
      style: `height: ${elementsHeight}px;`
    });
  };

  getIntegration = () => {
    return connection.data.integration;
  };

  getForm = () => {
    return connection.data.form;
  };

  getIntegrationConfigs = () => {
    return this.getIntegration().formData;
  };

  render() {
    return (
      <AppContext.Provider
        value={{
          ...this.state,
          init: this.init,
          showForm: this.showForm,
          toggleShoutbox: this.toggleShoutbox,
          showPopup: this.showPopup,
          closePopup: this.closePopup,
          save: this.save,
          createNew: this.createNew,
          sendEmail,
          setHeight: this.setHeight,
          getIntegration: this.getIntegration,
          getForm: this.getForm,
          getIntegrationConfigs: this.getIntegrationConfigs
        }}
      >
        {this.props.children}
      </AppContext.Provider>
    );
  }
}
