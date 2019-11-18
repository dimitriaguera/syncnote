import React from 'react';
import Icon from './Icon';

const NodeItemMenu = React.memo(
  ({ onClickEdit, onClickAdd, onClickRemove, onClickShare, onClickShare3 }) => {
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
              partager user 2
            </button>
          </li>
          <li>
            <button onClick={onClickShare3}>
              <Icon name="share" />
              partager user 3
            </button>
          </li>
        </ul>
      </div>
    );
  }
);

export default NodeItemMenu;
