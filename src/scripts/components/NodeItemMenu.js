import React, { PureComponent } from "react";
import Icon from "./Icon";

const NodeItemMenuBox = React.memo( ({ onClickEdit, onClickAdd, onClickRemove }) => {
  return (
    <div className="node-item-menu-box">
      <button onClick={onClickEdit}><Icon name="edit-3"/></button>
      <button onClick={onClickAdd}><Icon name="file-plus"/></button>
      <button onClick={onClickRemove}><Icon name="file-minus"/></button>
    </div>
  )
});

class NodeItemMenu extends PureComponent {
  constructor( props ) {
    super(props);

    this.state = {
      open: false
    }

    this.toggleOpen = this.toggleOpen.bind(this);
  }

  toggleOpen() {
    this.setState({ open: !this.state.open });
  }

  render() {
    const { onClickEdit, onClickAdd, onClickRemove } = this.props;
    const menuBoxProps = { onClickEdit, onClickAdd, onClickRemove };
    return (
      <div className="node-item-menu">
        <button className="nim-toggle" onClick={this.toggleOpen}><Icon name='more-vertical' /></button>
        {this.state.open && <NodeItemMenuBox {...menuBoxProps} />}
      </div>
    );
  }
}

export default NodeItemMenu;