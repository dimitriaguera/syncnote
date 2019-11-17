import React from 'react';
import Icon from './Icon';

const NodeItemMenu = React.memo(
  ({ onClickEdit, onClickAdd, onClickRemove, onClickShare }) => {
    return (
      <div className="node-item-menu-box">
        <ul>
          <li>
            <button onClick={onClickEdit}>
              <Icon name="edit-3" />
              éditer le nom
            </button>
          </li>
          <li>
            <button onClick={onClickAdd}>
              <Icon name="file-plus" />
              créer une note enfant
            </button>
          </li>
          <li>
            <button onClick={onClickRemove}>
              <Icon name="file-minus" />
              supprimer
            </button>
          </li>
          <li>
            <button onClick={onClickShare}>
              <Icon name="share" />
              partager
            </button>
          </li>
        </ul>
      </div>
    );
  }
);

export default NodeItemMenu;
