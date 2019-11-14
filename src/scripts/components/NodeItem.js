import React, { Component } from 'react';
import { connect } from 'react-redux';
import { readThisNode } from '../redux/actions';
import { push } from '../services/sync/sync';
import NodeItemMenu from './NodeItemMenu';
import IconStatus from './IconStatus';
import Icon from './Icon';

class NoteItemNoConnect extends Component {
  constructor(props) {
    super(props);

    this.state = {
      edit: false,
      value: this.props.node ? this.props.node.name : ''
    };

    this.handleToggleMode = this.handleToggleMode.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    //this.handleTestRunner = this.handleTestRunner.bind(this);

    this.input = React.createRef();
    this.refMenu = React.createRef();
  }

  componentDidUpdate() {
    if (this.state.edit && this.input.current) {
      console.log(this.input);
      this.input.current.focus();
    }
  }

  handleToggleMode(e) {
    e.stopPropagation();
    this.setState({ edit: !this.state.edit });
  }

  handleChange(e) {
    const value = e.target.value;
    this.setState({ value: value });
  }

  handleBlur(e) {
    const node = this.props.node;
    const value = this.state.value;

    //this.setState({ edit: false });

    if (value && value !== node.name) {
      const _action = {
        type: 'update',
        data: {
          _id: node._id,
          name: value
        }
      };
      push(_action);
    }
  }

  // handleTestRunner(){

  //   const delay = 50;
  //   const loops = 100;

  //   let count = 0;

  //   const testID = setInterval(() => {
  //     if( count >=  loops ) {
  //       clearInterval(testID);
  //     }
  //     count ++;
  //     const node = this.props.node;
  //     const _action = {
  //       type: "update",
  //       data: {
  //         _id: node._id,
  //         _rev: node._rev,
  //         _sync_pool: node._sync_pool,
  //         name: `Loop ${count}`
  //       }
  //     };
  //     push(_action);
  //   }, delay);
  // }

  handleAdd(e) {
    e.stopPropagation();
    const { name, _id } = this.props.node;
    const childName = `Child of ${name}`;
    push({ type: 'add', data: { name: childName, parent: _id } });
  }

  handleRemove(e) {
    e.stopPropagation();
    const node = this.props.node;
    const _action = { type: 'remove', data: node };

    push(_action);
  }

  handleSelect(e) {
    const node = this.props.node;
    this.props.selectToWindow(node._id);
  }

  render() {
    const { node, level } = this.props;
    const { edit, value } = this.state;

    const classes = [`node-status-${node._sync_status}`];

    return (
      <div className="node-item">
        <div
          className={classes.join(' ')}
          style={{ paddingLeft: `${(level - 1) * 10}px` }}
        >
          <div className="node-item-inner">
            {edit ? (
              <input
                type="text"
                value={value}
                ref={this.input}
                onChange={this.handleChange}
                onBlur={this.handleBlur}
              />
            ) : (
              <button className="name" onClick={this.handleSelect}>
                <Icon name="file-text" />
                {node.name}
              </button>
            )}

            <button
              ref={this.refMenu}
              onClick={e =>
                this.props.openPopover(e, this.refMenu, () => (
                  <NodeItemMenu
                    onClickEdit={this.handleToggleMode}
                    onClickAdd={this.handleAdd}
                    onClickRemove={this.handleRemove}
                  />
                ))
              }
            >
              <Icon name="more-vertical" />
            </button>

            <IconStatus status={node._sync_status} />
            {/* <input type="button" value="Test" onClick={this.handleTestRunner} /> */}
          </div>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return { selectToWindow: async _id => dispatch(await readThisNode(_id)) };
};

const NoteItem = connect(null, mapDispatchToProps)(NoteItemNoConnect);

export default NoteItem;
