import React, { useState, useEffect } from 'react';
import { getRemoteNode } from '../services/node/node.remote';

const Share = ({ nid }) => {
  const [node, setNode] = useState(null);

  useEffect(() => {
    async function getNode() {
      const res = await getRemoteNode(nid);
      console.log(res);
      if (res.success) {
        setNode(res.data);
      }
    }
    getNode();
  }, [nid]);

  return <h1>{node && node.name}</h1>;
};

export default Share;
