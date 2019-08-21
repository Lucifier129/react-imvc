import React from "react";
import GlobalContext from "../context";
import RIMVC from "../index";

export interface ConnectProps {
  state?: RIMVC.State;
  handlers?: RIMVC.Actions;
  actions?: RIMVC.Handlers;
  props?: {
    [propName: string]: any
  }
}

export type ComponentProps = {
  isActive: { (...args: any[]): boolean };
  location: RIMVC.Location;
  className: string;
  activeClassName: string;
  style: object;
  activeStyle: object;
  to: string;
};

const returnNull: (props: ConnectProps) => any = () => null;
export default (selector = returnNull) => (
  InputComponent: React.ComponentType<ComponentProps>
) => {
  return function Connector(props: object) {
    <GlobalContext.Consumer>
      {({ state, handlers, actions }: ConnectProps) => {
        return (
          <InputComponent
            {...props}
            {...selector({ state, handlers, actions, props })}
          />
        );
      }}
    </GlobalContext.Consumer>;
  };
};
