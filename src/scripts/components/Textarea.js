import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from '../services/sync/sync';
import TextareaDebounced from './TextareaDebounced';
import { getLocalNodeById } from '../services/db/db.local';

class TextareaNoConnect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      defaultValue: ''
    };
    this.sendContentChange = this.sendContentChange.bind(this);
  }

  async componentDidMount() {
    if (this.props._id) {
      const node = await getLocalNodeById(this.props._id);
      if (node) {
        this.setState({ defaultValue: node.content });
      }
    }
  }

  async componentDidUpdate(prevProps) {
    if (prevProps._id !== this.props._id) {
      const node = await getLocalNodeById(this.props._id);
      if (node) {
        this.setState({ defaultValue: node.content || '' });
      }
    }
  }

  sendContentChange(value) {
    const { _id } = this.props;
    // Prevent sending data without node selected.
    if (!_id) {
      return null;
    }

    const _action = {
      type: 'update',
      data: { _id: _id, content: value }
    };

    push(_action);
  }

  render() {
    const { _id } = this.props;
    console.log('RENDER TEXTAREA');
    return (
      <div className="node-edit">
        {_id && (
          <TextareaDebounced
            value={this.state.defaultValue}
            targetId={_id}
            onChange={this.sendContentChange}
            time={500}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    _id: state.windowNode._id
  };
};

const Textarea = connect(mapStateToProps, null)(TextareaNoConnect);

export default Textarea;
