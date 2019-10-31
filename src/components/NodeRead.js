import React, { Component } from "react";
import ReactMarkdown from "react-markdown";
import { connect } from "react-redux";

class NodeReadNoConnect extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { display } = this.props;
    let content = '';

    if( display._id ) {
      content = display.content;
    }

    return (
    <div className="node-read markdown-body">
      <ReactMarkdown source={content} />
    </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    display: state.windowNode
  };
};

const NodeRead = connect(
  mapStateToProps,
  null
)(NodeReadNoConnect);

export default NodeRead;
