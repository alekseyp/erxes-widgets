import * as React from "react";
import * as RTG from "react-transition-group";
import { Launcher, Messenger } from "../containers";

type Props = {
  isMessengerVisible: boolean;
  saveBrowserInfo: () => void;
};

export default class App extends React.Component<Props> {
  componentDidMount() {
    // call save browser info mutation
    this.props.saveBrowserInfo();
  }

  render() {
    const { isMessengerVisible } = this.props;

    return (
      <div className="erxes-widget">
        <RTG.CSSTransition
          in={isMessengerVisible}
          timeout={300}
          classNames="scale-in"
          unmountOnExit={true}
        >
          <div className="erxes-messenger">
            <Messenger />
          </div>
        </RTG.CSSTransition>
        <Launcher />
      </div>
    );
  }
}
