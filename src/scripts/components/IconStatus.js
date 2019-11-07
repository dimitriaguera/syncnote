import React from "react";

const statusIconNames = [
  'check-circle',
  'refresh-cw',
  'alert-circle',
  'x-circle'
]

const IconStatus = React.memo( ({ status }) => {
  return <i className={`component-icon-status icon-${statusIconNames[status]}`} aria-hidden="true" />
});

export default IconStatus;
