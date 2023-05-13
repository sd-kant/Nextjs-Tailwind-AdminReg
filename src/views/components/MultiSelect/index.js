import React, { Component } from 'react';
import makeAnimated from 'react-select/animated';
import MySelect from './MySelect.js';
import { components } from 'react-select';

const Option = (props) => {
  return (
    <div>
      <components.Option {...props}>
        <input type="checkbox" checked={props.isSelected} onChange={() => null} />{' '}
        <label>{props.label}</label>
      </components.Option>
    </div>
  );
};

const MultiValue = (props) => (
  <components.MultiValue {...props}>
    <span>{props.data.label}</span>
  </components.MultiValue>
);

const animatedComponents = makeAnimated();
export default class Example extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <MySelect
        options={this.props.options}
        isMulti
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        components={{ Option, MultiValue, animatedComponents }}
        allowSelectAll={true}
        value={this.props.value}
        onChange={this.props.onChange}
      />
    );
  }
}
