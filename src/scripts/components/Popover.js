import React, { Component, useRef, useEffect, createRef } from 'react';

const PopoverContext = React.createContext();

const popoverContainer = WrappedComponent => {
  return class PopoverWrapper extends Component {
    constructor(props) {
      super(props);

      this.state = {
        open: false,
        x: 0,
        y: 0
      };

      this.increment = 0;
      this.currentKey = null;
      this.currentTarget = null;
      this.containerRef = createRef();

      this.getKey = this.getKey.bind(this);
      this.handleOpen = this.handleOpen.bind(this);
      this.handleMove = this.handleMove.bind(this);
      this.handleScroll = this.handleScroll.bind(this);
      this.handleClose = this.handleClose.bind(this);
      this.handleClickOnContainer = this.handleClickOnContainer.bind(this);

      this.actions = {
        getKey: this.getKey,
        openPopover: this.handleOpen,
        closePopover: this.handleClose
      };
    }

    handleClickOnContainer(e) {
      this.handleClose(e);
    }

    handleOpen(e, key, content) {
      e.preventDefault();
      e.stopPropagation();

      if (this.currentKey === key) {
        return this.handleClose(e);
      }

      this.currentKey = key;
      this.currentTarget = e.target;
      this.setState({ open: true, content, coords: this.getCoords() });
    }

    handleClose(e) {
      // no preventDefault() here because this handler
      // is bind in a fullscreen component
      // and we don't want to stop
      // behaviours like form submit
      //e.stopPropagation();
      if (this.state.open) {
        this.currentKey = null;
        this.currentTarget = null;
        this.setState({ open: false });
      }
    }

    // handleCloseNoStop(e) {
    //   // no preventDefault() here because this handler
    //   // is bind in a fullscreen component
    //   // and we don't want to stop
    //   // behaviours like form submit
    //   if (this.state.open) {
    //     this.currentKey = null;
    //     this.currentTarget = null;
    //     this.setState({ open: false });
    //   }
    // }

    handleScroll(e) {
      if (this.currentTarget) {
        this.handleClose(e);
      }
    }

    handleMove() {
      if (this.currentTarget) {
        this.setState({ coords: this.getCoords() });
      }
    }

    getCoords() {
      const base = this.containerRef.current.getBoundingClientRect();
      const target = this.currentTarget.getBoundingClientRect();
      const offset = 5;

      return {
        x: target.left - base.left + target.width + offset,
        y: target.top - base.top
      };
    }

    getKey() {
      return ++this.increment;
    }

    render() {
      //console.log('RENDER POPOVER WRAPPER');

      const { coords } = this.state;

      return (
        <div
          ref={this.containerRef}
          className="popover-wrapper"
          onMouseDown={this.handleClickOnContainer}
          onScroll={this.handleScroll}
        >
          <PopoverContext.Provider value={this.actions}>
            <WrappedComponent {...this.props} />
            {this.state.open && (
              <PopoverElement
                x={coords.x}
                y={coords.y}
                content={this.state.content}
                close={this.handleClose}
              />
            )}
          </PopoverContext.Provider>
        </div>
      );
    }
  };
};

const createPopover = Content => {
  return props => {
    const { trigger, ...rest } = props;
    const ContentWithProps = () => (
      <Content closeModal={this.handleClose} {...rest} />
    );

    return (
      <PopoverContext.Consumer>
        {actions => (
          <PopoverActionsWrapper
            trigger={trigger}
            actions={actions}
            content={ContentWithProps}
          />
        )}
      </PopoverContext.Consumer>
    );
  };
};

const PopoverActionsWrapper = React.memo(({ trigger, actions, content }) => {
  const key = useRef();
  //console.log('POPOPOPOPOPOPOPO');

  // get uniq key just once
  useEffect(() => {
    key.current = actions.getKey();
  }, [actions]);

  return React.cloneElement(trigger, {
    onMouseDown: e => actions.openPopover(e, key.current, content)
  });
});

const PopoverElement = React.memo(({ close, content: Content, x, y }) => {
  console.log('RENDER POP', close);
  const styled = { transform: `matrix(1, 0, 0, 1, ${x}, ${y})` };
  return (
    <div
      className="popover"
      style={styled}
      // onMouseDown={e => {
      //   e.stopPropagation();
      //   //close(e);
      // }}
    >
      <Content
      //close={close}
      //onClick={close}
      //onMouseDown={e => e.stopPropagation()}
      />
    </div>
  );
});

export { popoverContainer };

export default createPopover;
