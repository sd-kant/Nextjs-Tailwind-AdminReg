import * as React from "react";
import style from "./PasswordInput.module.scss";
import clsx from "clsx";
import eye from "../../../assets/images/eye-light.svg";
import eyeSlash from "../../../assets/images/eye-slash-light.svg";

const PasswordInput = (
  {
    value,
    name = 'password',
    autoFocus = false,
    onChange,
  }) => {
  const [type, setType] = React.useState('password');

  return (
    <div className={clsx(style.InputWrapper, 'input-field-wrapper')}>
      <input
        className='input input-field mt-10 font-heading-small text-white'
        name={name}
        type={type}
        autoFocus={autoFocus}
        value={value}
        onChange={onChange}
      />
      {
        type === "password" ?
          <img className={clsx(style.EyeIcon)} src={eye} alt="eye icon" onClick={() => setType('text')}/>
          :
          <img className={clsx(style.EyeIcon)} src={eyeSlash} alt="eye slash icon" onClick={() => setType('password')}/>
      }
    </div>
  )
};

export default PasswordInput;
