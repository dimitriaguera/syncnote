import React, { Component } from 'react';

const popover = WrappedComponent => {
  return class PopoverWrapper extends Component {
    constructor(props) {
      super(props);

      this.state = {
        open: false,
        x: 0,
        y: 0
      };

      this.wrapperRef = React.createRef();
      this.handleClose = this.handleClose.bind(this);
      this.handleOpen = this.handleOpen.bind(this);
      this.toggleOpen = this.toggleOpen.bind(this);
    }

    componentDidMount() {
      document.body.addEventListener('click', this.handleClose);
    }

    componentWillUnmount() {
      document.body.removeEventListener('click', this.handleClose);
    }

    handleOpen(event, targetRef, content) {
      event.stopPropagation();
      const coords = this.getCoords(targetRef);
      this.setState({ open: true, content, coords });
    }

    handleClose(event) {
      if (this.state.open) {
        this.setState({ open: false });
      }
    }

    toggleOpen() {
      this.setState({ open: !this.state.open });
    }

    getCoords(targetRef) {
      const base = this.wrapperRef.current.getBoundingClientRect();
      const target = targetRef.current.getBoundingClientRect();
      const offset = 5;

      return {
        x: target.left - base.left + target.width + offset,
        y: target.top - base.top
      };
    }

    render() {
      console.log('RENDER POPOVER WRAPPER');
      const addProps = { openPopover: this.handleOpen };
      const { coords } = this.state;

      return (
        <div ref={this.wrapperRef} className="popover-wrapper">
          <WrappedComponent {...this.props} {...addProps} />
          {this.state.open && (
            <Popover x={coords.x} y={coords.y} content={this.state.content} />
          )}
        </div>
      );
    }
  };
};

const Popover = ({ content: Content, x, y }) => (
  <div className="popover" style={{ left: `${x}px`, top: `${y}px` }}>
    <Content />
  </div>
);

export default popover;
