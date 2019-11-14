import React from 'react';
import Icon from './Icon';

const NodeItemMenu = React.memo(
  ({ onClickEdit, onClickAdd, onClickRemove }) => {
    return (
      <div className="node-item-menu-box">
        <button onClick={onClickEdit}>
          <Icon name="edit-3" />
        </button>
        <button onClick={onClickAdd}>
          <Icon name="file-plus" />
        </button>
        <button onClick={onClickRemove}>
          <Icon name="file-minus" />
        </button>
      </div>
    );
  }
);

export default NodeItemMenu;
