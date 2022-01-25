import React, {useRef} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {withTranslation} from "react-i18next";
import plusCircleFire from "../../assets/images/plus-circle-fire.svg";
import {Form, withFormik} from "formik";
import * as Yup from "yup";
import closeIcon from "../../assets/images/close.svg";
import Select from 'react-select';
import ResponsiveSelect from "./ResponsiveSelect";

export const defaultTeamMember = {
  email: '',
  firstName: '',
  lastName: '',
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
        firstName: Yup.string()
          .required(t('firstName required'))
          .max(1024, t("firstName max error")),
        lastName: Yup.string()
          .required(t('lastName required'))
          .max(1024, t("lastName max error")),
        userType: Yup.object()
          .required(t('role required'))

      }).required(),
    )
  });
};

const AddMembersModal = (props) => {
  const modalBodyRef = useRef(null);
  const show = props.show;
  const {
    values,
    errors,
    touched,
    t,
    close,
    setFieldValue,
    resetForm,
  } = props;

  const changeFormField = (e) => {
    const {value, name} = e.target;

    setFieldValue(name, value);
  }

  const addAnother = () => {
    const data = JSON.parse(JSON.stringify(values["users"]));
    data.push(defaultTeamMember);
    setFieldValue("users", data);
    scrollToBottom();
  }

  const deleteMember = (index) => {
    const data = JSON.parse(JSON.stringify(values["users"]));
    data.splice(index, 1);
    setFieldValue("users", data);
  }

  const scrollToBottom = () => {
    // TODO scroll to bottom
  }

  const customStyles = (disabled = false) => ({
    menu: (provided, state) => ({
      ...provided,
      width: 200,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#DE7D2C' : (state.isFocused ? '#5BAEB6': 'white'),
      width: 200,
      color: 'black',
      fontSize: '21px',
      lineHeight: '24.13px',
    }),
    control: styles => ({
      ...styles,
      border: 'none',
      outline: 'none',
      boxShadow: 'none',
      width: 200,
      height: 54,
      backgroundColor: '#272727',
    }),
    input: styles => ({
      ...styles,
      color: 'white'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'white'
    })
  });

  const changeHandler = (fieldName, value) => {
    setFieldValue(fieldName, value);
  }

  const options = [
    {
      value: 1,
      label: t('administrator'),
    },
    {
      value: 2,
      label: t('operator'),
    }
  ];

  return (
    <div
      className={`modal add-member-modal ${show ? "d-block" : "d-none"}`}
    >
      <div
        className="close-icon"
        onClick={() => {
          close();
          resetForm({users: [defaultTeamMember]});
        }}
      />

      <div className="modal-header">
        <span className="font-modal-header text-white text-capitalize">
          {t("add team members")}
        </span>
      </div>

      <div className="modal-subheader mt-10">
        <span className="font-binary text-white">
          {t("add team members description")}
        </span>
      </div>

      <Form>
        <div
          ref={modalBodyRef}
          className="modal-body mt-60"
          style={{height: "430px", maxHeight: "430px", minHeight: "430px"}}
        >
          {
            values && values["users"] && values["users"].map((user, index) => {
              return (
                <div className={`team-mate-wrapper d-flex ${index !== 0 ? "mt-25" : ""}`} key={index}>
                  <span className="team-mate-no font-input-label text-white">
                    {index + 1}
                  </span>

                  <div className="d-flex flex-column">
                    {
                      index === 0 &&
                      <label className="font-input-label text-white">
                        {t("email")}
                      </label>
                    }

                    <input
                      className="input font-binary text-white mt-10 px-15"
                      name={`users[${index}].email`}
                      value={values?.users && values.users[index] && values.users[index]?.email}
                      type="text"
                      onChange={changeFormField}
                      style={{width: "195px"}}
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
                      onChange={changeFormField}
                      style={{width: "145px"}}
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
                      onChange={changeFormField}
                      style={{width: "145px"}}
                    />

                    {
                      touched?.users && touched.users[index] && touched.users[index]?.lastName &&
                      errors?.users && errors.users[index] && errors.users[index]?.lastName && (
                        <span className="font-helper-text text-error mt-10">{errors.users[index].lastName}</span>
                      )
                    }
                  </div>

                  <div className="d-flex flex-column ml-25">
                    {
                      index === 0 &&
                      <label className="font-input-label text-white">
                        {t("team name")}
                      </label>
                    }

                    <input
                      className="input font-binary text-white mt-10 px-15"
                      disabled={true}
                      style={{width: "120px"}}
                    />
                  </div>

                  <div className="d-flex flex-column ml-25">
                    {
                      index === 0 &&
                      <label className="font-input-label text-white">
                        &nbsp;
                      </label>
                    }
                    <ResponsiveSelect
                      className='mt-10 font-heading-small text-black'
                      options={options}
                      name={`users[${index}].userType`}
                      value={values?.users && values.users[index] && values.users[index]?.userType}
                      styles={customStyles()}
                      menuPortalTarget={document.body}
                      menuPosition={'fixed'}
                      onChange={(value) => changeHandler(`users[${index}].userType`, value)}
                    />
                    {
                      touched?.users && touched.users[index] && touched.users[index]?.userType &&
                      errors?.users && errors.users[index] && errors.users[index]?.userType && (
                        <span className="font-helper-text text-error mt-10">{errors.users[index].userType}</span>
                      )
                    }
                  </div>

                  {
                    // only show when there are more than 2 users
                    values["users"]?.length > 1 &&
                    <div className="d-flex align-center ml-25">
                      <img
                        className="mt-25 cursor-pointer"
                        src={closeIcon}
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

          <div className="d-flex align-center mt-40 mb-15">
            <img
              src={plusCircleFire} className="cursor-pointer"
              alt="add icon"
              onClick={addAnother}
            />
            <span
              className="font-binary cursor-pointer"
              onClick={addAnother}
            >
            &nbsp;&nbsp;Add Another Team Member
          </span>
          </div>
        </div>

        <div className="modal-footer d-flex justify-end mt-25">
          <button
            className={`button active cursor-pointer`}
            type="submit"
            onClick={props.onOk}
          >
          <span className='font-button-label text-white text-uppercase'>
            {t("finish")}
          </span>
          </button>
        </div>
      </Form>
    </div>
  )
}

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    users: [defaultTeamMember],
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: async (values, {props}) => {
    props.submit(values);
  }
})(AddMembersModal);

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {},
    dispatch
  );

export default connect(
  null,
  mapDispatchToProps,
)(withTranslation()(EnhancedForm));