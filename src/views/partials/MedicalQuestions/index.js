import * as React from "react";
import {connect} from "react-redux";
import {get} from "lodash";
import {bindActionCreators} from "redux";
import {
  getMedicalQuestionsAction,
  getMedicalResponsesAction,
} from "../../../redux/action/profile";
import {QUESTION_TYPE_BOOLEAN, QUESTION_TYPE_RADIO} from "../../../constant";
import RadioGroup from "../../components/RadioGroup";
import {formatAnswersToOptions} from "../medical-prompt/FormMedical";
import MedicalTrueFalse from "../../components/MedicalTrueFalse";

const MedicalQuestions = (
  {
    medicalQuestions,
    medicalResponses,
    getMedicalQuestions,
    getMedicalResponses,
  }) => {
  React.useEffect(() => {
    getMedicalQuestions();
    getMedicalResponses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [responses, setResponses] = React.useState(medicalResponses?.responses);
  React.useEffect(() => {
    setResponses(medicalResponses?.responses);
  }, [medicalResponses]);
  const onChangeOption = (questionId, value) => {
    setResponses(prev => prev.map(it => it.questionId?.toString() === questionId?.toString() ? ({...it, answerId: value}) : it));
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
  medicalResponses: get(state, 'profile.medicalResponses'),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      getMedicalQuestions: getMedicalQuestionsAction,
      getMedicalResponses: getMedicalResponsesAction,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MedicalQuestions);
