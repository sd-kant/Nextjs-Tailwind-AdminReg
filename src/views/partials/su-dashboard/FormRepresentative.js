import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import {bindActionCreators} from "redux";
import history from "../../../history";
import plusCircleFire from "../../../assets/images/plus-circle-fire.svg";
import backIcon from "../../../assets/images/back.svg";
import removeIcon from "../../../assets/images/remove.svg";
import {
  setLoadingAction,
  setRestBarClassAction,
  showErrorNotificationAction,
  showSuccessNotificationAction
} from "../../../redux/action/ui";
import {createUserByAdmin} from "../../../http";
import {USER_TYPE_ORG_ADMIN} from "../../../constant";
import clsx from "clsx";
import style from "./FormRepresentative.module.scss";

const formSchema = (t) => {
  return Yup.object().shape({
    users: Yup.array().of(
      Yup.object().shape({
        email: Yup.string()
          .required(t('email required'))
          .email(t("email invalid"))
          .max(1024, t('email max error')),
        firstName: Yup.string()
          .required(t('firstName required'))
          .max(1024, t("firstName max error")),
        lastName: Yup.string()
          .required(t('lastName required'))
          .max(1024, t("lastName max error")),
      }).required(),
    )
  });
};

export const defaultMember = {
  email: '',
  firstName: '',
  lastName: '',
};

const FormRepresentative = (props) => {
  const {values, errors, touched, t, setFieldValue, setRestBarClass} = props;

  useEffect(() => {
    setRestBarClass("progress-18 medical");
  }, []);

  const changeFormField = (e) => {
    const {value, name} = e.target;

    setFieldValue(name, value);
  }

  const addAnother = () => {
    const data = JSON.parse(JSON.stringify(values["users"]));
    data.push(defaultMember);
    setFieldValue("users", data);
  }

  const deleteMember = (index) => {
    const data = JSON.parse(JSON.stringify(values["users"]));
    data.splice(index, 1);
    setFieldValue("users", data);
  }

  const navigateTo = (path) => {
    history.push(path);
  }

  return (
    <Form className='form mt-57'>
      <div style={{padding: '0 10px'}}>
        <div
          className="d-flex align-center cursor-pointer"
          onClick={() => navigateTo('/invite/team-create')}
        >
          <img src={backIcon} alt="back"/>
          &nbsp;&nbsp;
          <span className='font-button-label text-orange'>
              {t("previous")}
            </span>
        </div>

        <div className='grouped-form mt-40'>
          <label className="font-header-medium">
            {t("team representative")}
          </label>

          <label className="font-binary d-block mt-8">
            {t("team representative description")}
          </label>
        </div>

        <div className='grouped-form mt-40' style={{maxWidth: '700px', minHeight: '300px', maxHeight: '400px', overFlowY: 'auto'}}>
          {
            values && values["users"] && values["users"].map((user, index) => {
              return (
                <div
                  className={`team-representative-wrapper d-flex ${index !== 0 ? "mt-25" : ""}`}
                  key={`member-${index}`}
                >
                  <div className="d-flex flex-column">
                    {
                      index === 0 &&
                      <label className="font-input-label text-white">
                        {t("team representative email")}
                      </label>
                    }

                    <input
                      className="input font-binary text-white mt-10 px-15"
                      name={`users[${index}].email`}
                      value={values?.users && values.users[index] && values.users[index]?.email}
                      type="text"
                      style={{width: "195px"}}
                      onChange={changeFormField}
                    />

                    {
                      touched?.users && touched.users[index] && touched.users[index]?.email &&
                      errors?.users && errors.users[index] && errors.users[index]?.email && (
                        <span className="font-helper-text text-error mt-10">{errors.users[index].email}</span>
                      )
                    }
                  </div>

                  <div className="d-flex flex-column ml-25">
                    {
                      index === 0 &&
                      <label className="font-input-label text-white">
                        {t("firstName")}
                      </label>
                    }

                    <input
                      className="input font-binary text-white mt-10 px-15"
                      name={`users[${index}].firstName`}
                      value={values?.users && values.users[index] && values.users[index]?.firstName}
                      type="text"
                      style={{width: "145px"}}
                      onChange={changeFormField}
                    />

                    {
                      touched?.users && touched.users[index] && touched.users[index]?.firstName &&
                      errors?.users && errors.users[index] && errors.users[index]?.firstName && (
                        <span className="font-helper-text text-error mt-10">{errors.users[index].firstName}</span>
                      )
                    }
                  </div>

                  <div className="d-flex flex-column ml-25">
                    {
                      index === 0 &&
                      <label className="font-input-label text-white">
                        {t("lastName")}
                      </label>
                    }

                    <input
                      className="input font-binary text-white mt-10 px-15"
                      name={`users[${index}].lastName`}
                      value={values?.users && values.users[index] && values.users[index]?.lastName}
                      type="text"
                      style={{width: "145px"}}
                      onChange={changeFormField}
                    />

                    {
                      touched?.users && touched.users[index] && touched.users[index]?.lastName &&
                      errors?.users && errors.users[index] && errors.users[index]?.lastName && (
                        <span className="font-helper-text text-error mt-10">{errors.users[index].lastName}</span>
                      )
                    }
                  </div>

                  {
                    // only show when there are more than 2 users
                    values["users"]?.length > 1 &&
                    <div className="d-flex align-center ml-25" style={{height: '45px'}}>
                      <img
                        className={`${index === 0 ? 'mt-57' : 'mt-25'} cursor-pointer`}
                        style={{zIndex: 1}}
                        src={removeIcon}
                        width={30}
                        height={30}
                        alt="close icon"
                        onClick={() => deleteMember(index)}
                      />
                    </div>
                  }
                </div>
              )
            })
          }
        </div>

        <div className="d-flex align-center mt-40 mb-15" style={{zIndex: 1, position: "relative"}}>
          <img
            src={plusCircleFire} className="cursor-pointer"
            onClick={addAnother}
            alt="add icon"
          />
          <span
            className="font-binary cursor-pointer"
            onClick={addAnother}
          >
          &nbsp;&nbsp;{t("team representative add another")}
        </span>
        </div>
      </div>

      <div className={clsx(style.Footer, 'mt-80')}>
        <button
          className={`button active cursor-pointer`}
          type={"submit"}
        >
          <span className='font-button-label text-white'>
            {t("next")}
          </span>
        </button>

        <span className={clsx(style.Skip, 'font-binary')} onClick={() => history.push("/invite/select")}>{t("skip")}</span>
      </div>
    </Form>
  )
}

export const lowercaseEmail = (users) => {
  return users && users.map((user) => ({
    ...user,
    email: user["email"] && user["email"].toLowerCase(),
  }));
}

export const setUserTypeToUsers = (users, userType) => {
  return users && users.map((user) => ({
    ...user,
    userType: userType,
  }));
}

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    users: [defaultMember],
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: async (values, {props}) => {
    let users = values?.users;
    const organizationId = localStorage.getItem("kop-v2-picked-organization-id");
    if (!organizationId) {
      history.push("/invite/company");
    } else {
      users = setUserTypeToUsers(lowercaseEmail(users), USER_TYPE_ORG_ADMIN);
    }

    try {
      const promises = [];
      let totalSuccessForInvite = 0;
      let alreadyRegisteredUsers = [];

      users?.forEach(it => {
        // it["emailAddress"] = it.email;
        // delete it.email;

        promises.push(createUserByAdmin(organizationId, it));
      });
      if (promises?.length > 0) {
        props.setLoading(true);
        Promise.allSettled(promises)
          .then(items => {
            items.forEach((item, index) => {
              let addToPayload = false;
              if (item.status === "fulfilled") {
                totalSuccessForInvite++;
                addToPayload = true;
              } else {
                console.error("creating user failed", item.reason?.response?.data);
                // fixme be sure if 409 is for already registered error
                if (item?.reason?.response?.data?.status?.toString() === "409") {
                  addToPayload = true;
                  alreadyRegisteredUsers.push({
                    email: users[index]?.email,
                  });
                }
              }
              if (addToPayload) {
                // todo add to invite promises
              }
            });
          })
          .finally(() => {
            if (totalSuccessForInvite > 0) {
              props.showSuccessNotification(props.t(
                totalSuccessForInvite ?
                  'msg users created success' : 'msg user created success', {
                  numberOfSuccess: totalSuccessForInvite,
                }));
            }
            props.setLoading(false);
            history.push("/invite/team-mode");
          });
      }
    } catch (e) {
      console.log("registering multiple users error", e);
      props.showErrorNotification(e.response?.data?.message ?? props.t("msg something went wrong"));
    }
  }
})(FormRepresentative);

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
      setRestBarClass: setRestBarClassAction,
      showErrorNotification: showErrorNotificationAction,
      showSuccessNotification: showSuccessNotificationAction,
    },
    dispatch
  );

export default connect(
  null,
  mapDispatchToProps,
)(withTranslation()(EnhancedForm));