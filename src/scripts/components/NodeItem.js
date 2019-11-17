import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { readThisNode } from '../redux/actions';
import { push } from '../services/sync/sync';
import NodeItemMenu from './NodeItemMenu';
import IconStatus from './IconStatus';
import Icon from './Icon';
import createPopover from './Popover';

class NoteItemNoConnect extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      edit: false,
      value: this.props.name ? this.props.name : ''
    };

    this.handleToggleMode = this.handleToggleMode.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleShare = this.handleShare.bind(this);
    //this.handleTestRunner = this.handleTestRunner.bind(this);

    this.input = React.createRef();
  }

  componentDidUpdate(prevProps) {
    if (this.state.edit && this.input.current) {
      this.input.current.focus();
    }
    if (
      this.props.name !== prevProps.name &&
      this.props.name !== this.state.value
    ) {
      this.setState({ value: this.props.name });
    }
  }

  handleToggleMode(e) {
    this.setState({ edit: !this.state.edit });
  }

  handleChange(e) {
    const value = e.target.value;
    this.setState({ value: value });
  }

  handleBlur(e) {
    const { _id, name } = this.props;
    const value = this.state.value;

    this.setState({ edit: false });

    if (value && value !== name) {
      const _action = {
        type: 'update',
        data: {
          _id: _id,
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
    e.preventDefault();

    const { name, _id } = this.props;
    const childName = `Child of ${name}`;

    push({ type: 'add', data: { name: childName, parent: _id } });
  }

  handleRemove(e) {
    e.preventDefault();

    const _action = { type: 'remove', data: { _id: this.props._id } };

    push(_action);
  }

  handleSelect(e) {
    this.props.selectToWindow(this.props._id);
  }

  handleShare(e) {
    e.preventDefault();

    const _action = {
      type: 'update',
      data: { _id: this.props._id, shared: ['user2'] }
    };

    push(_action);
  }

  render() {
    const { _sync_status, level, name } = this.props;
    const { edit, value } = this.state;

    const classes = [`node-status-${_sync_status}`];

    //console.log('RENDER NODE ITEM');

    return (
      <div className="node-item">
        <div
          className={classes.join(' ')}
          style={{ paddingLeft: `${(level - 1) * 10}px` }}
        >
          <div className="node-item-inner">
            {edit ? (
              <div className="edit">
                <Icon name="file-text" />
                <input
                  type="text"
                  value={value}
                  ref={this.input}
                  onChange={this.handleChange}
                  onBlur={this.handleBlur}
                />
              </div>
            ) : (
              <button className="name" onClick={this.handleSelect}>
                <Icon name="file-text" />
                {name}
              </button>
            )}

            <MenuPopover
              trigger={
                <button className="menu">
                  <Icon name="more-vertical" />
                </button>
              }
              onClickEdit={this.handleToggleMode}
              onClickAdd={this.handleAdd}
              onClickRemove={this.handleRemove}
              onClickShare={this.handleShare}
            />

            <IconStatus status={_sync_status} />
            {/* <input type="button" value="Test" onClick={this.handleTestRunner} /> */}
          </div>
        </div>
      </div>
    );
  }
}

const MenuPopover = createPopover(NodeItemMenu);

const mapDispatchToProps = dispatch => {
  return { selectToWindow: async _id => dispatch(await readThisNode(_id)) };
};

const NoteItem = connect(null, mapDispatchToProps)(NoteItemNoConnect);

export default NoteItem;
