import React from "react";

const returnNull = () => null;
const connect = (selector = returnNull) => InputComponent => {
  function Connector(props, context) {
    return (
      <InputComponent {...props} {...selector({ ...context, props })} />
    );
  }

  Connector.contextTypes = {
    state: React.PropTypes.object,
    handlers: React.PropTypes.object,
    actions: React.PropTypes.object
  };

  return Connector;
};

export default connect;
