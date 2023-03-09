import {actionTypes} from "../type";

export const setMedicalQuestionsAction = (medicalQuestions) => ({
  type: actionTypes.SET_MEDICAL_QUESTIONS,
  payload: {
    medicalQuestions,
  },
});

export const getMedicalQuestionsAction = () => ({
  type: actionTypes.GET_MEDICAL_QUESTIONS,
  payload: {},
});

export const getMedicalResponsesAction = () => ({
  type: actionTypes.GET_MEDICAL_RESPONSES,
  payload: {},
});

export const updateMyProfileAction = ({body, nextPath, apiCall = true, navigate}) => ({
  type: actionTypes.UPDATE_PROFILE,
  payload: {
    body,
    nextPath,
    apiCall,
    navigate,
  },
});

export const getMyProfileAction = () => ({
  type: actionTypes.GET_PROFILE,
  payload: {},
});

export const getMyOrganizationAction = () => ({
  type: actionTypes.GET_MY_ORGANIZATION,
  payload: {},
});
