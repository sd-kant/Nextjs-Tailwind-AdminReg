import React from 'react';
import { withTranslation } from 'react-i18next';
import TrueFalse from './TrueFalse';

const MedicalTrueFalse = (props) => {
  const { disabled, answer, options, onChange } = props;

  return <TrueFalse disabled={disabled} answer={answer} options={options} onChange={onChange} />;
};

export default withTranslation()(MedicalTrueFalse);
