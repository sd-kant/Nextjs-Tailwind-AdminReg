import * as React from "react";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import {PREFERRED_COUNTRIES} from "../../../constant";

const CustomPhoneInput = (
  {
    value,
    disabled = false,
    onChange,
    ...props
  }) => {
  return (
    <PhoneInput
      country={'us'}
      value={value}
      disabled={disabled}
      preferredCountries={PREFERRED_COUNTRIES}
      onChange={(value, country) => {
        onChange(value, country.countryCode);
      }}
      {...props}
    />
  )
};

export default CustomPhoneInput;
