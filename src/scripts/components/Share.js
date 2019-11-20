import React, { useState, useEffect } from 'react';
import { share } from '../services/share/share';
import { getRemoteNode } from '../services/node/node.remote';
import { getSharableUsers } from '../services/auth/auth.api';

const Share = ({ nid }) => {
  const [node, setNode] = useState(null);
  const [users, setUsers] = useState(null);
  const [selected, setSelected] = useState(new Map());

  function handleChange(e) {
    const id = e.target.name;
    const isChecked = e.target.checked;
    setSelected(selected.set(id, isChecked));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const s = Array.from(selected.keys());
    console.log('SUBMIT: ', s);
    const _share = {
      _id: nid,
      shared: s
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
    async function getUsers() {
      const res = await getSharableUsers();
      const map = new Map();
      if (res.success) {
        setUsers(res.data);
        node.shared.forEach(uid => map.set(uid, true));
        setSelected(map);
      }
    }
    if (node) {
      getUsers();
    }
  }, [node]);

  return (
    <div>
      <h1>{node && node.name}</h1>
      <form onSubmit={handleSubmit}>
        {users &&
          users.map(user => {
            const checked = selected.get(user._id);

            if (user._id === node.owner) {
              return null;
            }

            return (
              <div key={user._id}>
                <input
                  onChange={handleChange}
                  checked={checked}
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
