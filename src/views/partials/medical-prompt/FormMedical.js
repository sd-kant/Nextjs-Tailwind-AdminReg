import React, {useState, useEffect} from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import backIcon from "../../../assets/images/back.svg";
import {get} from "lodash";
import {
  QUESTION_TYPE_BOOLEAN,
  QUESTION_TYPE_RADIO
} from "../../../constant";
import RadioGroup from "../../components/RadioGroup";
import MedicalTrueFalse from "../../components/MedicalTrueFalse";
import {bindActionCreators} from "redux";
import {
  setLoadingAction,
  showErrorNotificationAction,
  showSuccessNotificationAction,
} from "../../../redux/action/ui";
import {answerMedicalQuestionsV2} from "../../../http";
import {useNavigate} from "react-router-dom";
import yesIcon from "../../../assets/images/yes.svg";
import yesGrayIcon from "../../../assets/images/yes-gray.svg";
import noIcon from "../../../assets/images/no.svg";
import noGrayIcon from "../../../assets/images/no-gray.svg";

export const formatAnswersToOptions = (answers) => {
  let temp = JSON.parse(JSON.stringify(answers));
  const sortedAnswers =  temp &&
    temp.sort((a, b) => {
      return a.answerId - b.answerId;
    });
  return sortedAnswers &&
    sortedAnswers.map((answer) => {
      return {
        value: answer?.answerId,
        title: answer?.text,
        icons: {
          active: answer?.answerId?.toString() === "5" ? noIcon : yesIcon,
          inactive: answer?.answerId?.toString() === "5" ? noGrayIcon : yesGrayIcon,
        }
      }
    });
};

const FormMedical = (props) => {
  const {
    t,
    medicalQuestions,
    order,
    setLoading,
    showErrorNotification,
    showSuccessNotification,
    setRestBarClass,
    token,
    profile,
    medicalResponses,
  } = props;
  const [questionOrder, setQuestionOrder] = useState(null);
  const [questionContent, setQuestionContent] = useState(null);
  const [answer, setAnswer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (medicalResponses) {
      const {responses} = medicalResponses;
      localStorage.setItem("medicalQuestions", JSON.stringify(responses));
    }
  }, [medicalResponses]);

  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  useEffect(() => {
    if (questionOrder !== null && medicalQuestions) {
      const currentQuestion = medicalQuestions && medicalQuestions.find(question => question.id?.toString() === questionOrder?.toString());
      setQuestionContent(currentQuestion);
    }
  }, [questionOrder, medicalQuestions]);

  const initialize = () => {
    setRestBarClass(`progress-${parseInt(order) * 9} medical`);
    setQuestionOrder(order && parseInt(order));
    const medicalQuestionsStr = localStorage.getItem("medicalQuestions");
    const data = (medicalQuestionsStr && JSON.parse(medicalQuestionsStr)) || [];
    const index = data && data.findIndex(entity => entity.questionId === parseInt(order) && (entity.answerId && entity.answerId.toString() !== "null"));

    if (index !== -1) {
      setAnswer(data[index]["answerId"]);
    } else {
      setAnswer(null);
    }
  };

  const onChangeOption = (value) => {
    setAnswer(value);
  };

  const goToPrev = () => {
    const prevQuestions =
      medicalQuestions &&
      medicalQuestions.filter(question => question.id < questionOrder);
    const orderedPrevQuestions =
      prevQuestions &&
      prevQuestions.sort((a, b) => {
        return b.id - a.id;
      });
    const prevQuestion = orderedPrevQuestions && orderedPrevQuestions[0];

    if (prevQuestion) {
      navigate(`/create-account/medical/${prevQuestion.id}`);
    } else {
      navigate(`/create-account/medical-initial`);
    }
  };

  const goToNext = () => {
    // store in local storage
    const medicalQuestionsStr = localStorage.getItem("medicalQuestions");
    const data = (medicalQuestionsStr && JSON.parse(medicalQuestionsStr)) || [];
    const index = data && data.findIndex(entity => entity.questionId === questionOrder);
    const dataItem = {
      questionId: questionOrder,
      answerId: answer,
      date: questionContent.date,
    };
    if (index !== -1) {
      data[index] = dataItem;
    } else {
      data.push(dataItem);
    }

    localStorage.setItem("medicalQuestions", JSON.stringify(data));

    const remainingQuestions =
      medicalQuestions &&
      medicalQuestions.filter(question => question.id > questionOrder);
    const orderedRemainingQuestions =
      remainingQuestions &&
      remainingQuestions.sort((a, b) => {
        return a.id - b.id;
      });
    const nextQuestion = orderedRemainingQuestions && orderedRemainingQuestions[0];

    if (nextQuestion) {
      navigate(`/create-account/medical/${nextQuestion.id}`);
    } else { // all question answered
      submit().then();
    }
  };

  const submit = async () => {
    const medicalQuestionsStr = localStorage.getItem("medicalQuestions");
    const data = (medicalQuestionsStr && JSON.parse(medicalQuestionsStr)) || [];

    if (data && data.length > 0) {
      try {
        setLoading(true);
        const gmt = profile?.gmt;
        const formData = {
          category: 'medical',
          ts: new Date().toISOString(),
          gmt: gmt?.toLowerCase()?.replace("gmt", "") ?? "+01:00",
          responses: data,
        };
        await answerMedicalQuestionsV2(formData, token);
        showSuccessNotification(t("msg medical answers submitted success"));
        localStorage.removeItem("medicalQuestions");
        navigate('/create-account/medical-complete');
      } catch (e) {
        console.log("submitting medical answers error", e);
        showErrorNotification(e.response?.data?.message);
      } finally {
        setLoading(false);
      }
    } else { // show error notification
      showErrorNotification(t("msg no medical answers"));
    }
  };

  return (
    <div className='form-group mt-57'>
      <div>
        <div
          className="d-flex align-center cursor-pointer"
          onClick={() => goToPrev()}
        >
          <img src={backIcon} alt="back"/>
          &nbsp;&nbsp;
          <span className='font-button-label text-orange'>
            {t("previous")}
          </span>
        </div>

        <div className='mt-28'>
          <span className='font-binary d-block'>
            {questionContent?.text}
          </span>
        </div>
        {
          questionContent?.type === QUESTION_TYPE_RADIO &&
          <div className="mt-28">
            <RadioGroup
              answer={answer}
              options={formatAnswersToOptions(questionContent?.["answers"])}
              onChange={onChangeOption}
            />
          </div>
        }

        {
          questionContent?.type === QUESTION_TYPE_BOOLEAN &&
          <div className="mt-40 d-flex">
            <MedicalTrueFalse
              answer={answer}
              options={formatAnswersToOptions(questionContent?.["answers"])}
              onChange={onChangeOption}
            />
          </div>
        }
      </div>

      <div className='mt-80'>
        <button
          className={`button ${answer !== null ? "active cursor-pointer" : "inactive cursor-default"}`}
          type={answer !== null ? "submit" : "button"}
          onClick={answer !== null ? goToNext : null}
        >
          <span className='font-button-label text-white'>
            {t("next")}
          </span>
        </button>
      </div>
    </div>
  )
};

const mapStateToProps = (state) => ({
  medicalQuestions: get(state, 'profile.medicalQuestions'),
  medicalResponses: get(state, 'profile.medicalResponses'),
  token: get(state, 'auth.registerToken'),
  profile: get(state, 'profile.profile'),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
      showErrorNotification: showErrorNotificationAction,
      showSuccessNotification: showSuccessNotificationAction,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(FormMedical));