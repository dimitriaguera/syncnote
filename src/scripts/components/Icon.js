import React from "react";

const Icon = React.memo( ({ name }) => {
  return <i className={`icon-${name}`} aria-hidden="true" />
});

export default Icon;