import React, { Component } from 'react';
import debounce from 'lodash/debounce';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/mode/markdown/markdown';

class TextareaDebounced extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value || ''
    };
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidMount() {
    const { onChange, time = 500 } = this.props;
    this.send = debounce(onChange, time);
    //this.setState({ value: this.props.value || '' });
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps._id !== this.props._id ||
      prevProps.value !== this.props.value
    ) {
      this.setState({ value: this.props.value || '' }, () =>
        this.instance.focus()
      );
    }
  }

  handleInputChange(editor, data, value) {
    //const value = event.target.value;
    //const value = event;
    this.send(value);
    this.setState({ value });
  }

  render() {
    return (
      // <textarea
      //   value={this.state.value}
      //   onChange={this.handleInputChange}
      // ></textarea>
      <CodeMirror
        value={this.state.value}
        onBeforeChange={this.handleInputChange}
        autoFocus={true}
        options={{
          mode: 'markdown',
          lineNumbers: true
        }}
        editorDidMount={editor => {
          this.instance = editor;
          editor.focus();
        }}
      />
    );
  }
}

export default TextareaDebounced;
