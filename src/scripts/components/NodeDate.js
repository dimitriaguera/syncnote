import React from 'react';
import { formatDate } from '../utils/tools';

const NodeDate = React.memo(({ created, updated }) => {
  let text = '';

  if (!updated) {
    if (created) {
      text = `créée le ${formatDate(new Date(created))}`;
    }
  } else {
    text = `modifiée le ${formatDate(new Date(updated))}`;
  }

  return <span className="node-item-date">{text}</span>;
});

export default NodeDate;
