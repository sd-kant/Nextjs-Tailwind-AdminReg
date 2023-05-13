import { all } from 'redux-saga/effects';
import auth from './auth';
import ui from './ui';
import base from './base';
import profile from './profile';

export default function* rootSaga() {
  yield all([auth(), ui(), base(), profile()]);
}
