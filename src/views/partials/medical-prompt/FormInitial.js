import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation, Trans } from 'react-i18next';
import { get } from 'lodash';
import { bindActionCreators } from 'redux';
import { showErrorNotificationAction } from '../../../redux/action/ui';
import { useNavigate } from 'react-router-dom';
import { REGISTER_MEDICAL_QUESTIONNAIRE_KEY } from 'constant';

const FormInitial = (props) => {
  const { t, medicalQuestions, showErrorNotification, setRestBarClass } = props;
  const [understandTerms, setUnderstandTerms] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigate = useNavigate();
  const [isShowMedicalOption, setIsShowMedicalOptions] = useState(false);

  useEffect(() => {
    setRestBarClass('progress-0 medical');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (mq = -1) => {
    let medicalQuestionnaire = 1;
    if(mq >= 0){
      medicalQuestionnaire = mq;
    }else{
      medicalQuestionnaire = parseInt(localStorage.getItem(REGISTER_MEDICAL_QUESTIONNAIRE_KEY)??2);
    }

    if(medicalQuestionnaire === 1){
      if (medicalQuestions && medicalQuestions.length > 0) {
        const temp = JSON.parse(JSON.stringify(medicalQuestions));
        const sortedMedicalQuestions = temp.sort((a, b) => {
          return a.id - b.id;
        });
        const firstMedicalQuestion = sortedMedicalQuestions[0];
        navigate(`/create-account/medical/${firstMedicalQuestion.id}`);
      } else {
        showErrorNotification(t('msg no medical questions'));
      }
    }else if(medicalQuestionnaire === 0){
      navigate('/create-account/medical-complete');
    }else {
      setIsShowMedicalOptions(true);
    }
  };

  return (
    <div className="form-group mt-57">
      <div>
        <div className="form-header-medium">
          <span className="font-header-medium d-block">{t('medical initial header')}</span>
        </div>

        {!isShowMedicalOption ? (
          <>
            <div className="mt-40">
              <span className="font-binary text-white">
                <Trans
                  i18nKey={'medical initial description'}
                  components={{
                    a: (
                      <a
                        className="text-orange no-underline"
                        href="https://kenzen.com/kenzen-solution-privacy-policy"
                        target="_blank"
                        rel="noreferrer"
                      />
                    )
                  }}
                />
              </span>
            </div>

            <div className="mt-40">
              <label className="checkbox-container z-index-1">
                {t('medical terms understand')}
                <input
                  type="checkbox"
                  checked={understandTerms}
                  onChange={(e) => setUnderstandTerms(e.target.checked)}
                />
                <span className="checkbox-checkmark" />
              </label>
            </div>

            <div className="mt-25">
              <label className="checkbox-container z-index-1">
                <Trans
                  i18nKey={'medical terms agree'}
                  components={{
                    a1: (
                      <a
                        className="text-orange no-underline"
                        href="https://kenzen.com/terms-of-use"
                        target="_blank"
                        rel="noreferrer"
                      />
                    ),
                    a2: (
                      <a
                        className="text-orange no-underline"
                        href="https://kenzen.com/kenzen-solution-privacy-policy"
                        target="_blank"
                        rel="noreferrer"
                      />
                    )
                  }}
                />
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <span className="checkbox-checkmark" />
              </label>
            </div>
          </>
        ): (
          <>
            <div className="mt-40">
              <span className="font-binary text-white">
                <Trans
                  i18nKey={'medical initial description 2'}
                  components={{
                    a: (
                      <a
                        className="text-orange no-underline"
                        href="https://kenzen.com/kenzen-solution-privacy-policy"
                        target="_blank"
                        rel="noreferrer"
                      />
                    )
                  }}
                />
              </span>
            </div>
            <div className="mt-40">
              <span className="font-binary text-white">
                {t('medical initial description 3')}
              </span>
            </div>
            <div className="mt-25 tw-flex tw-gap-4">
              <button
                className={`button active cursor-pointer`}
                type="button"
                onClick={() => {submit(1);}}>
                <span className="font-button-label text-white">{t('yes')}</span>
              </button>
              <button
                className={`button inactive cursor-pointer`}
                type="button"
                onClick={()=>{submit(0);}}>
                <span className="font-button-label text-white">{t('no')}</span>
              </button>
            </div>
          </>
        )}
      </div>
      {
        !isShowMedicalOption && (
          <div className="mt-80">
            <button
              className={`button ${
                agreeTerms && understandTerms ? 'active cursor-pointer' : 'inactive cursor-default'
              }`}
              type="button"
              onClick={agreeTerms && understandTerms ? submit : null}>
              <span className="font-button-label text-white">{t('continue')}</span>
            </button>
          </div>
        )
      }
    </div>
  );
};

const mapStateToProps = (state) => ({
  medicalQuestions: get(state, 'profile.medicalQuestions')
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      showErrorNotification: showErrorNotificationAction
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(FormInitial));
