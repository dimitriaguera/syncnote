import React from 'react';
import { connect } from 'react-redux';
import Icon from './Icon';

const NodeInfosNoConnect = ({ owner, shared, userId }) => {
  return (
    <span className="node-item-info">
      {shared && shared.length !== 0 && <Icon name="users" />}
    </span>
  );
};

const mapStateToProps = state => {
  return { userId: state.auth.user ? state.auth.user._id : null };
};

const NodeInfos = connect(mapStateToProps, null)(NodeInfosNoConnect);

export default React.memo(NodeInfos);
