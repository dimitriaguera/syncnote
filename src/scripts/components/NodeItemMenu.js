import React from 'react';
import Icon from './Icon';
import Share from './Share';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
  }
};

const NodeItemMenu = React.memo(
  ({
    nid,
    onClickEdit,
    onClickAdd,
    onClickRemove,
    onClickShare,
    onClickShare3
  }) => {
    const [modalIsOpen, setIsOpen] = React.useState(false);

    function openModal() {
      setIsOpen(true);
    }

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
          <li>
            <button onClick={openModal}>
              <Icon name="share" />
              test modal
            </button>
            <Modal
              isOpen={modalIsOpen}
              style={customStyles}
              contentLabel="Example Modal"
            >
              <Share nid={nid} />
            </Modal>
          </li>
        </ul>
      </div>
    );
  }
);

export default NodeItemMenu;
