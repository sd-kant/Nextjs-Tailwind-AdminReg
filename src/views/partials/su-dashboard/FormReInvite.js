import React, {useState, useEffect} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import {withTranslation, Trans} from "react-i18next";
import history from "../../../history";
import backIcon from "../../../assets/images/back.svg";
import plusIcon from "../../../assets/images/plus-circle-fire.svg";
import removeIcon from "../../../assets/images/remove.svg";
import {
  setLoadingAction,
  setRestBarClassAction,
  setVisibleSuccessModalAction,
  showErrorNotificationAction,
  showSuccessNotificationAction
} from "../../../redux/action/ui";
import {
  sendRegistrationEmail,
} from "../../../http";
import {
  lowercaseEmail,
} from "./FormRepresentative";
import style from "./FormReInvite.module.scss";
import clsx from "clsx";
import Select from "react-select";
import {customStyles} from "./FormInvite";
import {permissionLevels} from "../../../constant";

export const defaultItem = {
  email: '',
  userType: '',
};

const formSchema = (t) => {
  return Yup.object().shape({
    users: Yup.array().of(
      Yup.object().shape({
        email: Yup.string()
          .required(t('email required'))
          .email(t("email invalid"))
          .max(1024, t('email max error')),
        userType: Yup.object()
          .required(t('role required')),
      }).required(),
    )
  });
};

const FormReInvite = (props) => {
  const {values, errors, touched, t, setFieldValue, setRestBarClass} = props;

  useEffect(() => {
    setRestBarClass("progress-72 medical");
  }, []);

  const navigateTo = (path) => {
    history.push(path);
  };

  const changeFormField = (e) => {
    const {value, name} = e.target;

    setFieldValue(name, value);
  };

  const changeHandler = (fieldName, value) => {
    setFieldValue(fieldName, value);
  };

  const addAnother = () => {
    const data = JSON.parse(JSON.stringify(values["users"]));
    data.push(defaultItem);
    setFieldValue("users", data);
  };

  const deleteMember = (index) => {
    const data = JSON.parse(JSON.stringify(values["users"]));
    data.splice(index, 1);
    setFieldValue("users", data);
  };


  const goBack = () => {
    history.back();
  };

  return (
    <Form className='form-group mt-57'>
      <div>
        <div
          className="d-flex align-center cursor-pointer"
          onClick={() => goBack()}
        >
          <img src={backIcon} alt="back"/>
          &nbsp;&nbsp;
          <span className='font-button-label text-orange'>
              {t("previous")}
            </span>
        </div>

        <div className='mt-28 form-header-medium'>
            <span className='font-header-medium d-block'>
              {t("re-invite users")}
            </span>
        </div>

        <div className={clsx(style.FormBody, "mt-25 d-flex flex-column")}>
          {
            values && values["users"] && values["users"].map((user, index) => (
              <div className={clsx(style.User)} key={`user-${index}`}>
                <img src={removeIcon} className={clsx(style.RemoveIcon)} alt="remove icon"
                     onClick={() => deleteMember(index)}/>

                <div className={clsx(style.UserRow)}>
                  <div className="d-flex flex-column">
                    <label className='font-input-label'>
                      {t("email")}
                    </label>

                    <input
                      className={clsx(style.Input, 'input mt-10 font-heading-small text-white')}
                      name={`users[${index}].email`}
                      value={values?.users && values.users[index] && values.users[index]?.email}
                      type="text"
                      onChange={changeFormField}
                    />

                    {
                      touched?.users && touched.users[index] && touched.users[index]?.email &&
                      errors?.users && errors.users[index] && errors.users[index]?.email && (
                        <span className="font-helper-text text-error mt-10">{errors.users[index].email}</span>
                      )
                    }
                  </div>

                  <div className={clsx(style.SelectWrapper, "d-flex")}>
                    <div className={clsx("d-flex flex-column")}>
                      <label className="font-input-label text-white text-capitalize">
                        {t("permission level")}
                      </label>

                      <Select
                        className='mt-10 font-heading-small text-black select-custom-class'
                        options={permissionLevels}
                        name={`users[${index}].userType`}
                        value={values?.users && values.users[index] && values.users[index]?.userType}
                        styles={customStyles()}
                        onChange={(value) => changeHandler(`users[${index}].userType`, value)}
                        placeholder={t("select")}
                      />
                      {
                        touched?.users && touched.users[index] && touched.users[index]?.userType &&
                        errors?.users && errors.users[index] && errors.users[index]?.userType && (
                          <span className="font-helper-text text-error mt-10">{errors.users[index].userType}</span>
                        )
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))
          }

          <div className={clsx(style.AddButton)} onClick={addAnother}>
            <img src={plusIcon} className={clsx(style.PlusIcon)} alt="plus icon"/>
            <span className="font-heading-small text-capitalize">
                    {t("re-invite another")}
                </span>
          </div>


        </div>
      </div>

      <div className={clsx(style.Mt20, style.Footer)}>
        <button
          className={`button active cursor-pointer`}
          type={"submit"}
        >
          <span className='font-button-label text-white text-uppercase'>
            {t("send")}
          </span>
        </button>
      </div>
    </Form>
  )
}


const formatUserType = (users) => {
  return users && users.map((user) => ({
    ...user,
    userType: user?.userType?.value,
  }));
}

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    users: [defaultItem],
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: async (values, {props, setFieldValue}) => {
    const {showErrorNotification, showSuccessNotification, setLoading, setVisibleSuccessModal, t} = props;
    let users = formatUserType(lowercaseEmail(values?.users));
    const calls = users?.map(user => sendRegistrationEmail({
      email: user.email.toLowerCase(),
      type: user.userType === 1 ? "teamAdmin" : "team",
    }));
    let i = 0;
    let errors = [];
    let successUserEmails = [];
    setLoading(true);
    Promise.allSettled(calls).then((list => {
      list.map((item, index) => {
        if ((item?.status === "fulfilled") && (item?.value?.data?.status === 200)) {
          i++;
          successUserEmails.push(users?.[index]?.email);
        } else {
          errors.push({
            title: users[index]?.email,
            message: item?.value?.data?.msg || item?.reason
          });
        }
      });

      setLoading(false);

      if (i > 0) {
        showSuccessNotification(t(
          i > 1 ?
            'msg users invited success' : 'msg user invited success', {
            numberOfSuccess: i
          }));

        const updatedUsers = values?.users.filter((it, index) => !successUserEmails.includes(it?.email));
        setFieldValue("users", updatedUsers);
      }

      if (errors.length > 0) {
        errors.map(error => {
          showErrorNotification(
            error.message,
            error.title,
          );
        });
      }
    }));
  }
})(FormReInvite);

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
      setRestBarClass: setRestBarClassAction,
      setVisibleSuccessModal: setVisibleSuccessModalAction,
      showErrorNotification: showErrorNotificationAction,
      showSuccessNotification: showSuccessNotificationAction,
    },
    dispatch
  );

export default connect(
  null,
  mapDispatchToProps,
)(withTranslation()(EnhancedForm));