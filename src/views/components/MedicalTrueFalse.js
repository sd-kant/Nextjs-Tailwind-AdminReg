import React from "react";
import yesIcon from "../../assets/images/yes.svg";
import noIcon from "../../assets/images/no.svg";
import {withTranslation} from "react-i18next";

const MedicalTrueFalse = (props) => {
  const {t, answer, options, onChange} = props;

  return (
    <>
      {
        options && options.map((option, index) => {
          let img = noIcon;
          if (option.title.toLowerCase() === "yes") {
            img = yesIcon;
          }
          return (
            <div
              className={`tap cursor-pointer ${option.value === answer ? 'active' : ''} ${index !== 0 ? 'ml-40' : ''}`}
              onClick={() => onChange(option.value)}
              key={`option-${index}`}
            >
              <img
                src={img}
                alt={`${option.title.toLowerCase()} icon`}
              />

              <span className='font-binary mt-8'>
                {option.title}
              </span>
            </div>
          )
        })
      }
    </>
  )
}

export default withTranslation()(MedicalTrueFalse);