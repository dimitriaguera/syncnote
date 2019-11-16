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

      this.containerRef = createRef();

      this.getKey = this.getKey.bind(this);
      this.handleClose = this.handleClose.bind(this);
      this.handleOpen = this.handleOpen.bind(this);
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

    handleOpen(e, key, targetRef, content) {
      e.preventDefault();
      e.stopPropagation();
      console.log('TEST: ', this.currentKey === key);

      if (this.currentKey === key) {
        return this.handleClose(e);
      }

      this.currentKey = key;
      const coords = this.getCoords(targetRef);
      this.setState({ open: true, content, coords });
    }

    handleClose(e) {
      e.preventDefault();
      e.stopPropagation();
      if (this.state.open) {
        this.currentKey = null;
        this.setState({ open: false });
      }
    }

    getCoords(targetRef) {
      const base = this.containerRef.current.getBoundingClientRect();
      const target = targetRef.current.getBoundingClientRect();
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
      console.log('RENDER POPOVER WRAPPER');

      const { coords } = this.state;

      return (
        <div
          ref={this.containerRef}
          className="popover-wrapper"
          onClick={this.handleClickOnContainer}
        >
          <PopoverContext.Provider value={this.actions}>
            <WrappedComponent {...this.props} />
            {this.state.open && (
              <PopoverElement
                x={coords.x}
                y={coords.y}
                content={this.state.content}
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
    const ContentWithProps = () => <Content {...props} />;
    return (
      <PopoverContext.Consumer>
        {actions => (
          <PopoverActionsWrapper
            children={props.children}
            actions={actions}
            content={ContentWithProps}
          />
        )}
      </PopoverContext.Consumer>
    );
  };
};

const PopoverActionsWrapper = React.memo(({ actions, children, content }) => {
  const inputRef = useRef(null);
  const key = useRef();

  // get uniq key just once
  useEffect(() => {
    key.current = actions.getKey();
  }, [actions]);

  return (
    <span
      ref={inputRef}
      onClick={e => actions.openPopover(e, key.current, inputRef, content)}
    >
      {children}
    </span>
  );
});

const PopoverElement = React.memo(({ content: Content, x, y }) => {
  console.log('RENDER POP', Content);
  const styled = { transform: `matrix(1, 0, 0, 1, ${x}, ${y})` };
  return (
    <div className="popover" style={styled}>
      <Content />
    </div>
  );
});

// function useOutsideAlerter(ref, onClickOut) {
//   function handleClickOutside(e) {
//     if (ref.current && !ref.current.contains(e.target)) {
//       onClickOut(e);
//     }
//   }

//   useEffect(() => {
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   });
// }

export { popoverContainer };

export default createPopover;
