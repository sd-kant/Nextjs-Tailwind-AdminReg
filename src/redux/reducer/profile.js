import { produce } from 'immer';
import { actionTypes } from '../type';

const initialState = {
  medicalQuestions: null,
  medicalResponses: null,
  profile: null,
  organization: null
};

const profileReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_MEDICAL_QUESTIONS:
      return produce(state, (draft) => {
        draft.medicalQuestions = action.payload.medicalQuestions;
      });

    case actionTypes.SET_MY_ORGANIZATION:
      return produce(state, (draft) => {
        draft.organization = action.payload.orgData;
      });

    case actionTypes.SET_MEDICAL_RESPONSES:
      return produce(state, (draft) => {
        draft.medicalResponses = action.payload.medicalResponses;
      });

    case actionTypes.PROFILE_UPDATED:
      return produce(state, (draft) => {
        draft.profile = action.payload.profile;
      });

    default:
      return state;
  }
};

export default profileReducer;
