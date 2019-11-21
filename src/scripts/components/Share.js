import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { share } from '../services/share/share';
import { getRemoteNode } from '../services/node/node.remote';
import { getSharableUsers } from '../services/auth/auth.api';

const ShareNoConnect = ({ nid, auth, close }) => {
  const [state, setState] = useState({
    node: null,
    users: null,
    error: null,
    selected: {}
  });

  function handleChange(e) {
    const id = e.target.name;
    const isChecked = e.target.checked;
    setState(prevState => {
      const selected = { ...prevState.selected, [id]: isChecked };
      return { ...prevState, selected };
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const selection = Object.keys(state.selected).filter(
      uid => state.selected[uid]
    );

    const _share = {
      _id: nid,
      shared: selection
    };

    share(_share);
    close();
  }

  useEffect(() => {
    async function getNode() {
      const res = await getRemoteNode(nid);
      if (!res.success || !res.data) {
        throw new Error('Can not upload node meta.');
      }
      return res.data;
    }
    async function getUsers(node) {
      const res = await getSharableUsers();
      if (!res.success) {
        throw new Error('Can not upload sharable users meta.');
      }
      const initial = {};
      node.shared.forEach(uid => (initial[uid] = true));
      setState({
        node,
        users: res.data,
        selected: initial
      });
    }

    getNode()
      .then(getUsers)
      .catch(err => setState({ error: err.message }));
  }, [nid]);

  const { node, users, selected, error } = state;

  return error ? (
    <div className="share-box share-box-error">{error}</div>
  ) : (
    <div className="share-box">
      <h1>{node && node.name}</h1>
      <form onSubmit={handleSubmit}>
        {users &&
          users.map(user => {
            const disabled = auth.user._id === user._id;

            if (user._id === node.owner) {
              return null;
            }

            return (
              <div key={user._id} className="share-user">
                <input
                  onChange={handleChange}
                  disabled={disabled}
                  checked={selected[user._id] || false}
                  type="checkbox"
                  name={user._id}
                  id={user._id}
                />
                <label htmlFor={user._id}>{user.username}</label>
              </div>
            );
          })}
        <button type="submit">Confirmer</button>
        <button onClick={close}>Retour</button>
      </form>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    auth: state.auth
  };
};

const Share = connect(mapStateToProps, null)(ShareNoConnect);

export default Share;
