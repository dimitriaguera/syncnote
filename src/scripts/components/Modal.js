import React, { cloneElement, useState } from 'react';
import ReactModal from 'react-modal';

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

ReactModal.setAppElement('#root');

const Modal = props => {
  const { children, trigger, ...rest } = props;

  const [modalIsOpen, setIsOpen] = useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  console.log('MODAL');

  return [
    cloneElement(trigger, {
      key: 'mt',
      onMouseDown: openModal
    }),
    <ReactModal key="me" isOpen={modalIsOpen} style={customStyles} {...rest}>
      {children(closeModal)}
    </ReactModal>
  ];
};

export default Modal;
