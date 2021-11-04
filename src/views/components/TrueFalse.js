import React from "react";
import yesIcon from "../../assets/images/yes.svg";
import noIcon from "../../assets/images/no.svg";
import {withTranslation} from "react-i18next";

const TrueFalse = (props) => {
  const {t, answer, setAnswer} = props;

  return (
    <>
      <div
        className={`tap cursor-pointer ${answer === true ? 'active' : ''}`}
        onClick={() => setAnswer(true)}
      >
        <img src={yesIcon} alt="yes icon"/>

        <span className='font-binary mt-8'>
            {t("yes")}
          </span>
      </div>

      <div
        className={`ml-40 cursor-pointer tap ${answer === false ? 'active' : ''}`}
        onClick={() => setAnswer(false)}
      >
        <img src={noIcon} alt="no icon"/>

        <span className='font-binary mt-8'>
            {t("no")}
          </span>
      </div>
    </>
  )
}

export default withTranslation()(TrueFalse);