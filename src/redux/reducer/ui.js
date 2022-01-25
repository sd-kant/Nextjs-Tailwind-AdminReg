import {produce} from 'immer';
import {actionTypes} from "../type";

const initialState = {
  restBarClass: '',
  loading: false,
  visibleSuccessModal: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_REST_BAR_CLASS:
      return produce(state, draft => {
        draft.restBarClass = action.payload.restBarClass;
      });
    case actionTypes.LOADING:
      return produce(state, draft => {
        draft.loading = action.payload.loading;
      });
    case actionTypes.SET_VISIBLE_SUCCESS_MODAL:
      return produce(state, draft => {
        draft.visibleSuccessModal = action.payload.visible;
      });

    default:
      return state;
  }
}