import React, { PropTypes } from 'react';

import styles from './styles.css';

export default class NumField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func,
    validation: PropTypes.object,
    className: PropTypes.string,
    autoFocus: PropTypes.bool,
    format: PropTypes.string,
    step: PropTypes.string
  }
  handleChange = (event) => {
    const { value } = event.target;
    if (this.props.onChange) this.props.onChange(value);
  }
  render() {
    const { value, className, autoFocus, validation, format, step } = this.props;
    const attrs = {
      className,
      type: 'number',
      value,
      onChange: this.handleChange,
      autoFocus,
      step
    };
    if (validation) {
      ['min', 'max'].filter(rule => rule in validation).forEach(rule => {
        attrs[rule] = validation[rule];
      });
    }
    let prepend;
    let append;
    if (format) [prepend, append] = format.split(':');
    const numberInput = <input {...attrs} />;
    return (<div className={styles.numField}>
      <label>
        {prepend}{numberInput}{append}
      </label>
    </div>);
  }
}
