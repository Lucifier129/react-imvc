import React from "react";
import GlobalContext from "../context";
import RIMVC from "..";

export interface ConnectProps {
  state?: RIMVC.State;
  handlers?: RIMVC.Actions;
  actions?: RIMVC.Handlers;
}

export type ComponentProps = {
  isActive: { (...args: any[]): boolean };
  location: Location;
  className: string;
  activeClassName: string;
  style: object;
  activeStyle: object;
  to: string;
};

const returnNull: (...args: any[]) => any = () => null;
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
