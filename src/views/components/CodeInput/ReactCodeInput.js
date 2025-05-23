import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'clsx';
import { uuidv4 } from '../../../utils';
import { getValueFromProps, getInputArrayFromProps } from './utils';
import customStyle from './ReactCodeInput.module.scss';

const BACKSPACE_KEY = 8;
const LEFT_ARROW_KEY = 37;
const RIGHT_ARROW_KEY = 39;

const defaultInputStyle = {
  margin: '4px',
  borderRadius: '6px',
  border: '1px solid',
  paddingLeft: '8px',
  paddingRight: 0,
  width: '36px',
  height: '42px',
  fontSize: '32px',
  boxShadow: '0px 0px 10px 0px rgba(0,0,0,.10)',
  boxSizing: 'border-box',
  fontFamily: 'monospace',
  MozAppearance: 'textfield'
};

class ReactCodeInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      input: getInputArrayFromProps(props),
      value: getValueFromProps(props)
    };

    this.textInput = [];
    this.uuid = uuidv4();
  }

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.value === null || this.props.value === prevProps.value) {
      return;
    }

    this.setState({
      input: getInputArrayFromProps(this.props),
      value: getValueFromProps(this.props)
    });

    // set cursor at first
    if (this.props.value === '') {
      this.textInput[0]?.focus();
    }
  }

  handleBlur(e) {
    this.handleTouch(e.target.value);
  }

  handleTouch(value) {
    const { touch, untouch, name } = this.props;

    if (typeof touch === 'function' && typeof untouch === 'function') {
      if (value === '') {
        touch(name);
      } else {
        untouch(name);
      }
    }
  }

  handleChange(e) {
    const { filterChars, filterCharsIsWhitelist } = this.props;

    let value = String(e.target.value);

    if (this.props.forceUppercase) {
      value = value.toUpperCase();
    }
    if (this.props.type === 'number') {
      value = value.replace(/[^\d]/g, '');
    }

    /** Filter Chars */
    value = value
      .split('')
      .filter((currChar) => {
        if (filterCharsIsWhitelist) {
          return filterChars.includes(currChar);
        }
        return !filterChars.includes(currChar);
      })
      .join('');

    let fullValue = value;

    if (value !== '') {
      const input = this.state.input.slice();
      const targetIndex = Number(e.target.dataset.id);

      if (value.length > 1) {
        value.split('').forEach((char, i) => {
          if (targetIndex + i < this.props.fields) {
            input[targetIndex + i] = char;
          }
          return false;
        });
      } else {
        input[targetIndex] = value;
      }

      input.forEach((s, i) => {
        if (this.textInput[i]) {
          this.textInput[i].value = s;
        }
      });

      const newTargetIndex = Math.min(value.length + targetIndex, this.props.fields - 1);
      const newTarget = this.textInput[newTargetIndex];

      if (newTarget) {
        newTarget.focus();
        newTarget.select();
      }

      fullValue = input.join('');

      this.setState({ value: input.join(''), input });
    }

    if (this.props.onChange && fullValue) {
      this.props.onChange(fullValue);
    }

    this.handleTouch(fullValue);
  }

  handleKeyDown(e) {
    const target = Number(e.target.dataset.id),
      nextTarget = this.textInput[target + 1],
      prevTarget = this.textInput[target - 1];

    let input, value;

    if (this.props.filterKeyCodes.length > 0) {
      this.props.filterKeyCodes.some((item) => {
        if (item === e.keyCode) {
          e.preventDefault();
          return true;
        }
        return false;
      });
    }

    switch (e.keyCode) {
      case BACKSPACE_KEY:
        e.preventDefault();
        this.textInput[target].value = '';
        input = this.state.input.slice();
        input[target] = '';
        value = input.join('');

        this.setState({ value, input });
        if (this.textInput[target].value === '') {
          if (prevTarget) {
            prevTarget.focus();
            prevTarget.select();
          }
        }
        if (this.props.onChange) {
          this.props.onChange(value);
        }
        break;

      case LEFT_ARROW_KEY:
        e.preventDefault();
        if (prevTarget) {
          prevTarget.focus();
          prevTarget.select();
        }
        break;

      case RIGHT_ARROW_KEY:
        e.preventDefault();
        if (nextTarget) {
          nextTarget.focus();
          nextTarget.select();
        }
        break;

      default:
        break;
    }

    this.handleTouch(value);
  }

  render() {
    const {
        className,
        disabled,
        style = {},
        inputStyle = {},
        inputStyleInvalid = {},
        isValid,
        type,
        autoFocus,
        autoComplete,
        pattern,
        inputMode,
        placeholder
      } = this.props,
      { input } = this.state,
      styles = {
        container: { display: 'inline-block', ...style },
        input: isValid ? inputStyle : inputStyleInvalid
      };

    if (!className && Object.keys(inputStyle).length === 0) {
      Object.assign(inputStyle, {
        ...defaultInputStyle,
        color: 'black',
        backgroundColor: 'white',
        borderColor: 'lightgrey'
      });
    }

    if (!className && Object.keys(inputStyleInvalid).length === 0) {
      Object.assign(inputStyleInvalid, {
        ...defaultInputStyle,
        color: '#b94a48',
        backgroundColor: '#f2dede',
        borderColor: '#eed3d7'
      });
    }

    if (disabled) {
      Object.assign(styles.input, {
        cursor: 'not-allowed',
        color: 'lightgrey',
        borderColor: 'lightgrey',
        backgroundColor: '#efeff1'
      });
    }

    return (
      <div className={classNames(className, customStyle.ReactCodeInput)} style={styles.container}>
        {input.map((value, i) => {
          return (
            <input
              ref={(ref) => {
                this.textInput[i] = ref;
              }}
              id={`${this.uuid}-${i}`}
              data-id={i}
              autoFocus={autoFocus && i === 0}
              value={value}
              key={`input_${i}`}
              type={type}
              // type={type === 'number' ? 'text' : type}
              min={0}
              max={9}
              style={styles.input}
              autoComplete={autoComplete}
              onFocus={(e) => e.target.select(e)}
              onBlur={(e) => this.handleBlur(e)}
              onChange={(e) => this.handleChange(e)}
              onKeyDown={(e) => this.handleKeyDown(e)}
              disabled={disabled}
              data-valid={isValid}
              pattern={pattern}
              inputMode={inputMode}
              placeholder={placeholder}
            />
          );
        })}
      </div>
    );
  }
}

ReactCodeInput.defaultProps = {
  autoComplete: 'off',
  autoFocus: true,
  isValid: true,
  disabled: false,
  forceUppercase: false,
  fields: 4,
  type: 'text',
  filterKeyCodes: [189, 190],
  filterChars: ['-', '.'],
  filterCharsIsWhitelist: false
};

ReactCodeInput.propTypes = {
  type: PropTypes.oneOf(['text', 'number', 'password', 'tel']),
  fields: PropTypes.number,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  name: PropTypes.string,
  touch: PropTypes.func,
  untouch: PropTypes.func,
  className: PropTypes.string,
  isValid: PropTypes.bool,
  disabled: PropTypes.bool,
  style: PropTypes.object,
  inputStyle: PropTypes.object,
  inputStyleInvalid: PropTypes.object,
  autoComplete: PropTypes.string,
  autoFocus: PropTypes.bool,
  forceUppercase: PropTypes.bool,
  filterKeyCodes: PropTypes.array,
  filterChars: PropTypes.array,
  filterCharsIsWhitelist: PropTypes.bool,
  pattern: PropTypes.string,
  inputMode: PropTypes.oneOf([
    'verbatim',
    'latin',
    'latin-name',
    'latin-prose',
    'full-width-latin',
    'kana',
    'kana-name',
    'katakana',
    'numeric',
    'tel',
    'email',
    'url'
  ])
};

export default ReactCodeInput;
