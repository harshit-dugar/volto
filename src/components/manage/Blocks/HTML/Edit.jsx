/**
 * Edit html block.
 * @module components/manage/Blocks/HTML/Edit
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import Editor from 'react-simple-code-editor';
// import { highlight, languages } from 'prismjs/components/prism-core';
// import 'prismjs/components/prism-markup';
import { Button, Popup } from 'semantic-ui-react';
import loadable from '@loadable/component';
import { defineMessages, injectIntl } from 'react-intl';

import { Icon } from '@plone/volto/components';
import showSVG from '@plone/volto/icons/show.svg';
import clearSVG from '@plone/volto/icons/clear.svg';
import codeSVG from '@plone/volto/icons/code.svg';
import indentSVG from '@plone/volto/icons/indent.svg';

const Editor = loadable(() => import('react-simple-code-editor'));
const Prettier = loadable.lib(() => import('prettier/standalone'));
const ParserHtml = loadable.lib(() => import('prettier/parser-html'));

const messages = defineMessages({
  source: {
    id: 'Source',
    defaultMessage: 'Source',
  },
  preview: {
    id: 'Preview',
    defaultMessage: 'Preview',
  },
  placeholder: {
    id: '<p>Add some HTML here</p>',
    defaultMessage: '<p>Add some HTML here</p>',
  },
  prettier: {
    id: 'Prettify your code',
    defaultMessage: 'Prettify your code',
  },
  clear: {
    id: 'Clear',
    defaultMessage: 'Clear',
  },
  code: {
    id: 'Code',
    defaultMessage: 'Code',
  },
});

/**
 * Edit html block class.
 * @class Edit
 * @extends Component
 */
class Edit extends Component {
  /**
   * Property types.
   * @property {Object} propTypes Property types.
   * @static
   */
  static propTypes = {
    selected: PropTypes.bool.isRequired,
    block: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    data: PropTypes.objectOf(PropTypes.any).isRequired,
    onChangeBlock: PropTypes.func.isRequired,
    onSelectBlock: PropTypes.func.isRequired,
    onDeleteBlock: PropTypes.func.isRequired,
    handleKeyDown: PropTypes.func.isRequired,
  };

  /**
   * Constructor
   * @method constructor
   * @param {Object} props Component properties
   */
  constructor(props) {
    super(props);
    this.state = {
      code: this.props.data.html || '',
      isPreview: false,
    };
    this.onChangeCode = this.onChangeCode.bind(this);
    this.onPreview = this.onPreview.bind(this);
    this.onCodeEditor = this.onCodeEditor.bind(this);
  }

  /**
   * Component did update
   * @method componentDidUpdate
   * @returns {undefined}
   */
  componentDidUpdate(prevProps, prevState) {
    if (this.codeEditor && this.props.selected && !prevProps.selected) {
      this.codeEditor._input.focus();
    }
  }

  /**
   * Change html handler
   * @method onChangeCode
   * @param {string} code New value html
   * @returns {undefined}
   */
  onChangeCode(code) {
    this.props.onChangeBlock(this.props.block, {
      ...this.props.data,
      html: code,
    });
    this.setState({ code });
  }

  /**
   * Preview mode handler
   * @method onPreview
   * @returns {undefined}
   */
  onPreview() {
    this.setState({
      isPreview: !this.state.isPreview,
      code: this.prettier.current.default
        .format(this.state.code, {
          parser: 'html',
          plugins: [this.parserHtml.current.default],
        })
        .trim(),
    });
  }

  /**
   * Prettify handler
   * @method onPrettify
   * @returns {undefined}
   */

  onPrettify = () => {
    this.setState({
      code: this.prettier.current.default
        .format(this.state.code, {
          parser: 'html',
          plugins: [this.parserHtml.current.default],
        })
        .trim(),
    });
  };

  /**
   * Code Editor mode handler
   * @method onPreview
   * @returns {undefined}
   */
  onCodeEditor() {
    this.setState({ isPreview: !this.state.isPreview });
  }

  //ref
  prettier = React.createRef();
  parserHtml = React.createRef();

  /**
   * Render method.
   * @method render
   * @returns {string} Markup for the component.
   */
  render() {
    const placeholder =
      this.props.data.placeholder ||
      this.props.intl.formatMessage(messages.placeholder);
    return (
      <>
        <Prettier ref={this.prettier} />
        <ParserHtml ref={this.parserHtml} />
        {this.props.selected && !!this.state.code && (
          <div className="toolbar">
            <Popup
              trigger={
                <Button
                  icon
                  basic
                  aria-label={this.props.intl.formatMessage(messages.source)}
                  active={!this.state.isPreview}
                  onClick={this.onCodeEditor}
                >
                  <Icon name={codeSVG} size="24px" />
                </Button>
              }
              position="top center"
              content={this.props.intl.formatMessage(messages.code)}
              size="mini"
            />
            <Popup
              trigger={
                <Button
                  icon
                  basic
                  aria-label={this.props.intl.formatMessage(messages.preview)}
                  active={this.state.isPreview}
                  onClick={this.onPreview}
                >
                  <Icon name={showSVG} size="24px" />
                </Button>
              }
              position="top center"
              content={this.props.intl.formatMessage(messages.preview)}
              size="mini"
            />
            <Popup
              trigger={
                <Button
                  icon
                  basic
                  aria-label={this.props.intl.formatMessage(messages.prettier)}
                  onClick={this.onPrettify}
                >
                  <Icon name={indentSVG} size="24px" />
                </Button>
              }
              position="top center"
              content={this.props.intl.formatMessage(messages.prettier)}
              size="mini"
            />
            <div className="separator" />
            <Popup
              trigger={
                <Button.Group>
                  <Button icon basic onClick={() => this.onChangeCode('')}>
                    <Icon name={clearSVG} size="24px" color="#e40166" />
                  </Button>
                </Button.Group>
              }
              position="top center"
              content={this.props.intl.formatMessage(messages.clear)}
              size="mini"
            />
          </div>
        )}
        {this.state.isPreview && (
          <div dangerouslySetInnerHTML={{ __html: this.state.code }} />
        )}
        {!this.state.isPreview && (
          <Editor
            value={this.state.code}
            placeholder={placeholder}
            onValueChange={(code) => this.onChangeCode(code)}
            highlight={(code) => {
              const res = this.props.highlight(code, 'html');
              return [res];
            }}
            padding={8}
            className="html-editor"
            ref={(node) => {
              this.codeEditor = node;
            }}
          />
        )}
      </>
    );
  }
}

const Refractor = loadable.lib(() => import('refractor'));
const LangHtml = loadable.lib(() => import('refractor/lang/markup'));

function withRefractor(WrappedComponent) {
  // { highlight: fallbackHighlight }
  const fallbackHighlight = (code) => code;
  return (props) => {
    return (
      <Refractor fallback={null}>
        {(refractor) => (
          <LangHtml fallback={null}>
            {(html) => (
              <WrappedComponent
                {...props}
                highlight={
                  html && refractor ? refractor.highlight : fallbackHighlight
                }
              />
            )}
          </LangHtml>
        )}
      </Refractor>
    );
  };
}

export default injectIntl(withRefractor(Edit));
