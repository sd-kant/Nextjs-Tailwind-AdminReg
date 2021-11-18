import * as React from "react";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

const CustomPhoneInput = (
  {
    value,
    onChange,
    ...props
  }) => {
  return (
    <PhoneInput
      country={'us'}
      value={value}
      preferredCountries={['us', 'ca', 'fr', 'de', 'jp', 'cn', 'au', 'za', 'in', 'qa', 'gb', 'sa', 'es']}
      onChange={(value, country) => {
        onChange(value, country.countryCode);
      }}
      {...props}
    />
  )
}

export default CustomPhoneInput;
