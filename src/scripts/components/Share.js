import React, { useState, useEffect } from 'react';
import { share } from '../services/share/share';
import { getRemoteNode } from '../services/node/node.remote';
import { getSharableUsers } from '../services/auth/auth.api';

const Share = ({ nid }) => {
  const [node, setNode] = useState(null);
  const [users, setUsers] = useState(null);
  const [selected, setSelected] = useState({});

  function handleChange(e) {
    const id = e.target.name;
    const isChecked = e.target.checked;
    setSelected(prevState => {
      return { ...prevState, [id]: isChecked };
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const selection = Object.keys(selected).filter(uid => selected[uid]);
    console.log('SUBMIT: ', selection);
    const _share = {
      _id: nid,
      shared: selection
    };

    share(_share);
  }

  useEffect(() => {
    async function getNode() {
      const res = await getRemoteNode(nid);
      if (res.success) {
        setNode(res.data);
      }
    }

    getNode();
  }, [nid]);

  useEffect(() => {
    async function getUsers(selected) {
      const res = await getSharableUsers();
      if (res.success) {
        setUsers(res.data);
        const s = {};
        node.shared.forEach(uid => (s[uid] = true));
        setSelected(s);
      }
    }
    if (node) {
      getUsers();
    }
  }, [node]);
  console.log('selected: ', selected);
  return (
    <div>
      <h1>{node && node.name}</h1>
      <form onSubmit={handleSubmit}>
        {users &&
          users.map(user => {
            if (user._id === node.owner) {
              return null;
            }

            return (
              <div key={user._id}>
                <input
                  onChange={handleChange}
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
      </form>
    </div>
  );
};

export default Share;
