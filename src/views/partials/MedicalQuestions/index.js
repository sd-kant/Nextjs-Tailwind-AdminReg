import * as React from "react";
import {connect} from "react-redux";
import {get} from "lodash";
import {bindActionCreators} from "redux";
import {getMedicalQuestionsAction} from "../../../redux/action/profile";
import {QUESTION_TYPE_BOOLEAN, QUESTION_TYPE_RADIO} from "../../../constant";
import RadioGroup from "../../components/RadioGroup";
import {formatAnswersToOptions} from "../medical-prompt/FormMedical";
import MedicalTrueFalse from "../../components/MedicalTrueFalse";

const MedicalQuestions = (
  {
    edit = true,
    medicalQuestions,
    getMedicalQuestions,
    responses,
    setResponses,
  }) => {
  React.useEffect(() => {
    getMedicalQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onChangeOption = (questionId, value) => {
    setResponses(responses?.map(it => it.questionId?.toString() === questionId?.toString() ? ({...it, answerId: value}) : it));
  };

  if (!medicalQuestions)
    return null;

  return (
    medicalQuestions.map((questionContent, index) => {
      const questionId = questionContent.id;
      const response = responses?.find(entity => entity.questionId?.toString() === questionId?.toString() && (![null, undefined, ""].includes(entity.answerId?.toString())));
      const answer = response?.["answerId"] ?? null;

      return (
        <React.Fragment key={`question-${index}`}>
          <div className='mt-28'><span className='font-binary d-block'>{index + 1}. {questionContent?.text}</span></div>
          {
            questionContent?.type === QUESTION_TYPE_RADIO &&
            <div className="mt-28">
              <RadioGroup
                disabled={!edit}
                answer={answer}
                options={formatAnswersToOptions(questionContent?.["answers"])}
                onChange={v => onChangeOption(questionId, v)}
              />
            </div>
          }

          {
            questionContent?.type === QUESTION_TYPE_BOOLEAN &&
            <div className="mt-28 d-flex">
              <MedicalTrueFalse
                disabled={!edit}
                answer={answer}
                options={formatAnswersToOptions(questionContent?.["answers"])}
                onChange={v => onChangeOption(questionId, v)}
              />
            </div>
          }
        </React.Fragment>
      )
    })
  )
}

const mapStateToProps = (state) => ({
  medicalQuestions: get(state, 'profile.medicalQuestions'),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      getMedicalQuestions: getMedicalQuestionsAction,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MedicalQuestions);
