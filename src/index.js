import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from "react-redux";
import './index.css';
import App from './App';
import ReduxToastr from 'react-redux-toastr';
import reportWebVitals from './reportWebVitals';
import {store} from "./redux/store";
import {NotificationProvider} from "./providers/NotificationProvider";
import Notifications from "./views/partials/Notifications";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.Suspense fallback={"loading..."}>
    <Provider store={store}>
      <NotificationProvider>
        <React.StrictMode>
          <App />
          <ReduxToastr
            timeOut={3000}
            newestOnTop={true}
            preventDuplicates
            position="top-right"
            transitionIn="fadeIn"
            transitionOut="fadeOut"
            progressBar
            closeOnToastrClick
          />
          <Notifications/>
        </React.StrictMode>
      </NotificationProvider>
    </Provider>
  </React.Suspense>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
