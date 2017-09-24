import React from "react";

export default class ViewManager extends React.Component {
  views = {};
  scrollMap = {}
  constructor(props, context) {
    super(props, context)
    this.addItemIfNeed(props)
  }
  addItemIfNeed(props) {
    let path = props.state.location.raw
    if (!this.views.hasOwnProperty(path)) {
      this.views[path] = null
    }
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.state.location !== nextProps.state.location) {
      this.scrollMap[this.props.state.location.raw] = window.scrollY
    }
    this.addItemIfNeed(nextProps)
  }
  renderView(path) {
    let { View, state, handlers, actions, controller } = this.props;
    let isActive = state.location.raw === path;

    if (isActive) {
      let view = <View state={state} handlers={handlers} actions={actions} />;
      if (controller.KeepAlive) {
        this.views[path] = view;
      } else if (this.views.hasOwnProperty(path)) {
        delete this.views[path];
      }
      return view;
    } else {
      return this.views[path];
    }
  }
  render() {
    let { state } = this.props;
    return (
      <div>
        {Object.keys(this.views).map(path => {
          return (
            <ViewItem
              key={path}
              path={path}
              isActive={path === state.location.raw}
              view={this.renderView(path)}
              scrollY={this.scrollMap[path]}
            />
          );
        })}
      </div>
    );
  }
}

class ViewItem extends React.Component {
  getContainer = container => {
    this.container = container;
  };
  shouldComponentUpdate(nextProps) {
    if (!nextProps.isActive) {
      this.container.style.display = 'none'
    } else {
      if (!this.props.isActive) {
        this.container.style.display = ''
        window.scroll(0, this.props.scrollY)
      }
    }
    return nextProps.isActive
  }
  componentDidMount() {
    window.scroll(0, 0)
  }
  render() {
    return (
      <div ref={this.getContainer} data-path={this.props.path}>
        {this.props.view}
      </div>
    );
  }
}
