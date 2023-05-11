import { produce } from 'immer';
import { actionTypes } from '../type';

const initialState = {
  restBarClass: '',
  loading: false,
  visibleSuccessModal: false,
  metric: localStorage.getItem('kop-v2-metric')?.toString() === 'true'
};

const uiReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_REST_BAR_CLASS:
      return produce(state, (draft) => {
        draft.restBarClass = action.payload.restBarClass;
      });
    case actionTypes.SET_METRIC:
      return produce(state, (draft) => {
        localStorage.setItem('kop-v2-metric', action.payload.metric?.toString());
        draft.metric = action.payload.metric;
      });
    case actionTypes.LOADING:
      return produce(state, (draft) => {
        draft.loading = action.payload.loading;
      });
    case actionTypes.SET_VISIBLE_SUCCESS_MODAL:
      return produce(state, (draft) => {
        draft.visibleSuccessModal = action.payload.visible;
      });

    default:
      return state;
  }
};

export default uiReducer;
