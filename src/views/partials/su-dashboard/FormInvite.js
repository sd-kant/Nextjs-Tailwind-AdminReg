import React, {useMemo, useEffect} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import {withTranslation, Trans} from "react-i18next";
import history from "../../../history";
import backIcon from "../../../assets/images/back.svg";
import plusIcon from "../../../assets/images/plus-circle-fire.svg";
import removeIcon from "../../../assets/images/remove.svg";
import {get} from "lodash";
import {
  setLoadingAction,
  setRestBarClassAction,
  setVisibleSuccessModalAction,
  showErrorNotificationAction,
  showSuccessNotificationAction
} from "../../../redux/action/ui";
import {
  createUserByAdmin,
  inviteTeamMember,
} from "../../../http";
import {
  lowercaseEmail,
} from "./FormRepresentative";
import style from "./FormInvite.module.scss";
import clsx from "clsx";
import {AVAILABLE_JOBS, permissionLevels, USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN} from "../../../constant";
import ConfirmModal from "../../components/ConfirmModal";
import CustomPhoneInput from "../../components/PhoneInput";
import {checkPhoneNumberValidation} from "../../../utils";
import ResponsiveSelect from "../../components/ResponsiveSelect";

export const defaultTeamMember = {
  email: '',
  firstName: '',
  lastName: '',
  userType: '',
  job: "",
  phoneNumber: {
    value: '',
    countryCode: '',
  },
};

const userSchema = (t) => {
  return Yup.object().shape({
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
      .required(t('role required')),
    job: Yup.object()
      .required(t('role required')),
    phoneNumber: Yup.object()
      // .required(t('phone number required'))
      .test(
        'is-valid',
        t('phone number invalid'),
        function (obj) {
          if (!obj.value)
            return true;
          return checkPhoneNumberValidation(obj.value, obj.countryCode);
        },
      ),
  }).required();
};

const formSchema = (t) => {
  return Yup.object().shape({
    users: Yup.array().of(
      userSchema(t),
    ),
  });
};

export const customStyles = (disabled = false) => ({
  menu: (provided, state) => {
    return {
      ...provided,
      zIndex: 2,
    }
  },
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#DE7D2C' : (state.isFocused ? '#5BAEB6': 'white'),
    zIndex: 1,
    color: 'black',
    fontSize: '21px',
    lineHeight: '24.13px',
  }),
  control: styles => ({
    ...styles,
    border: disabled ? '1px solid #272727' : 'none',
    outline: 'none',
    boxShadow: 'none',
    height: 54,
    backgroundColor: disabled ? '#2f2f2f' : '#272727',
    zIndex: 1,
  }),
  input: styles => ({
    ...styles,
    color: 'white',
    zIndex: 1,
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'white',
    zIndex: 1,
  })
});

const FormInvite = (props) => {
  const {
    values,
    errors,
    touched,
    t,
    setFieldValue,
    setRestBarClass,
    status,
    setStatus,
    setVisibleSuccessModal,
    userType,
  } = props;

  useEffect(() => {
    setRestBarClass("progress-72 medical");
    const csvDataStr = localStorage.getItem("kop-csv-data");
    const csvData = csvDataStr && JSON.parse(csvDataStr);

    const d = csvData?.map(it => {
      const level = it.permissionLevel?.split(":")?.[0]?.trim();
      const job = it.jobRole?.split(":")?.[0]?.trim();
      const selectedLevel = permissionLevels.find(ele => parseInt(ele.value) === parseInt(level));
      const selectedJob = AVAILABLE_JOBS.find(ele => parseInt(ele.value) === parseInt(job));
      return {
        email: it.email,
        firstName: it.firstName,
        lastName: it.lastName,
        userType: selectedLevel || "",
        job: selectedJob || "",
      };
    });
    d && setFieldValue("users", d);
    localStorage.removeItem("kop-csv-data");
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

  const sortedJobs = AVAILABLE_JOBS && AVAILABLE_JOBS.sort((a, b) => {
    return a.label > b.label ? 1 : -1;
  });

  const addAnother = () => {
    const data = JSON.parse(JSON.stringify(values["users"]));
    data.push(defaultTeamMember);
    setFieldValue("users", data);
  };

  const deleteMember = (index) => {
    const data = JSON.parse(JSON.stringify(values["users"]));
    data.splice(index, 1);
    setFieldValue("users", data);
  };

  const pathname = window.location.pathname;
  const isManual = pathname.split("/").includes("manual");

  const goBack = () => {
    if (isManual)
      navigateTo('/invite/select');
    else
      navigateTo('/invite/upload');
  };

  const isAdmin = userType?.includes(USER_TYPE_ADMIN) || userType?.includes(USER_TYPE_ORG_ADMIN);

  const options = useMemo(() => {
    if (isAdmin) {
      return permissionLevels;
    } else {
      return permissionLevels.filter(it => it.value?.toString() !== "1");
    }
  }, [isAdmin])

  const renderUser = (user, index, key) => {
    let errorField = errors?.users?.[user.index];
    let touchField = touched?.users?.[user.index];
    const formInputName = `users[${user.index}]`;
    const v = values?.users?.[user.index];

    return (
      <div className={clsx(style.User)} key={`${key}-${index}`}>
        <img src={removeIcon} className={clsx(style.RemoveIcon)} alt="remove icon"
             onClick={() => deleteMember(index)}/>

        <div className={clsx(style.UserRow)}>
          <div className="d-flex flex-column">
            <label className='font-input-label'>
              {t("firstName")}
            </label>

            <input
              className={clsx(style.Input, 'input mt-10 font-heading-small text-white')}
              name={`${formInputName}.firstName`}
              value={v?.firstName}
              type="text"
              onChange={changeFormField}
            />

            {
              touchField?.firstName &&
              errorField?.firstName && (
                <span className="font-helper-text text-error mt-10">{errorField.firstName}</span>
              )
            }
          </div>

          <div className="d-flex flex-column">
            <label className='font-input-label'>
              {t("lastName")}
            </label>

            <input
              className={clsx(style.Input, 'input mt-10 font-heading-small text-white')}
              name={`${formInputName}.lastName`}
              value={v?.lastName}
              type="text"
              onChange={changeFormField}
            />

            {
              touchField?.lastName &&
              errorField?.lastName && (
                <span className="font-helper-text text-error mt-10">{errorField.lastName}</span>
              )
            }
          </div>
        </div>

        <div className={clsx(style.UserRow)}>
          <div className="d-flex flex-column">
            <label className='font-input-label'>
              {t("email")}
            </label>

            <input
              className={clsx(style.Input, 'input mt-10 font-heading-small text-white')}
              name={`${formInputName}.email`}
              value={v?.email}
              type="text"
              onChange={changeFormField}
            />

            {
              touchField?.email &&
              errorField?.email && (
                <span className="font-helper-text text-error mt-10">{errorField.email}</span>
              )
            }
          </div>

          <div className={clsx(style.SelectWrapper, "d-flex")}>
            <div className="d-flex flex-column">
              <label className="font-input-label text-white text-capitalize">
                {t("job")}
              </label>

              <ResponsiveSelect
                className='mt-10 font-heading-small text-black select-custom-class'
                options={sortedJobs}
                name={`${formInputName}.job`}
                value={v?.job}
                styles={customStyles()}
                maxMenuHeight={190}
                menuPortalTarget={document.body}
                menuPosition={'fixed'}
                onChange={(value) => changeHandler(`${formInputName}.job`, value)}
                placeholder={t("select")}
              />
              {
                touchField?.job &&
                errorField?.job && (
                  <span className="font-helper-text text-error mt-10">{errorField.job}</span>
                )
              }
            </div>

            <div className={clsx("d-flex flex-column")}>
              <label className="font-input-label text-white text-capitalize">
                {t("permission level")}
              </label>

              <ResponsiveSelect
                className='mt-10 font-heading-small text-black select-custom-class'
                options={options}
                // options={permissionLevels}
                name={`${formInputName}.userType`}
                value={v?.userType}
                styles={customStyles()}
                menuPortalTarget={document.body}
                menuPosition={'fixed'}
                onChange={(value) => changeHandler(`${formInputName}.userType`, value)}
                placeholder={t("select")}
              />
              {
                touchField?.userType &&
                errorField?.userType && (
                  <span className="font-helper-text text-error mt-10">{errorField.userType}</span>
                )
              }
            </div>
          </div>
        </div>

        <div className={clsx(style.UserRow)}>
          <div>
            <label className='font-input-label'>
              {t("phone number")}
            </label>
            <CustomPhoneInput
              containerClass={style.PhoneNumberContainer}
              inputClass={style.PhoneNumberInput}
              dropdownClass={style.PhoneNumberDropdown}
              value={user.phoneNumber.value}
              onChange={(value, countryCode) => changeHandler(`${formInputName}.phoneNumber`, {value, countryCode})}
            />
            {
              (touchField?.phoneNumber &&
                errorField?.phoneNumber) ? (
                <span className="font-helper-text text-error mt-10">{errorField.phoneNumber}</span>
              ) : (<span className="font-helper-text text-white mt-10">{t("required for 2fa")}</span>)
            }
          </div>

          <div>

          </div>
        </div>
      </div>
    );
  };

  const operators = values?.users?.reduce((ret, it, index) => {
    if (it.userType?.value?.toString() === '2' || ["", null, undefined].includes(it.userType)) {
      ret.push({
        ...it,
        index,
      });
    }

    return ret;
  }, []);

  const admins = values?.users?.reduce((ret, it, index) => {
    if (it.userType?.value?.toString() === '1') {
      ret.push({
        ...it,
        index,
      });
    }

    return ret;
  }, []);

  return (
    <React.Fragment>
      <ConfirmModal
        show={status?.visibleWarningModal}
        header={'Warning'}
        subheader={'Please note, the following team members were already invited and will not receive a new email invitation'}
        onOk={() => {
          setStatus({visibleWarningModal: false, alreadyRegisteredUsers: []});
          if (status?.leavePage) {
            onFinish(setVisibleSuccessModal);
          }
        }}
        okText={t('ok')}
        children={(
          <div style={{maxHeight: '160px', overflowY: 'auto'}}>
            {
              status?.alreadyRegisteredUsers?.map(it => (
                <div className={clsx('mt-10')} key={it.email}>
                  <span>
                    {it.email}
                  </span>
                </div>
              ))
            }
          </div>
        )}
      />
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
              {t("create team")}
            </span>
          </div>

          <div className={clsx(style.FormBody, "mt-40 d-flex flex-column")}>
            <div className={clsx(style.AddButton)} onClick={addAnother}>
              <img src={plusIcon} className={clsx(style.PlusIcon)} alt="plus icon"/>
              <span className="font-heading-small text-capitalize">
                    {t("add another member")}
                </span>
            </div>

            {
              operators?.length > 0 &&
              <div className="mt-28">
              <span className="font-heading-small text-uppercase text-orange">
                {t("operators")}
              </span>
              </div>
            }

            {
              operators?.map((user, index) => renderUser(user, index, 'user'))
            }

            {
              admins?.length > 0 &&
              <div className="mt-28">
              <span className="font-heading-small text-uppercase text-orange">
                {t("administrators")}
              </span>
              </div>
            }

            {
              admins?.map((user, index) => renderUser(user, index, 'admin'))
            }

          </div>
        </div>

        <div className={clsx(style.Footer)}>
          <button
            className={`button ${values['users']?.length > 0 ? 'active cursor-pointer' : 'inactive cursor-default'}`}
            type={values['users']?.length > 0 ? "submit" : "button"}
          >
            <span className='font-button-label text-white'>
              {t("finish")}
            </span>
          </button>
          {
            !isManual &&
            <span className={clsx("font-binary", style.Reupload)}>
            <Trans
              i18nKey={"reupload csv"}
              components={{
                a: (<span className={"text-orange"} onClick={() => navigateTo("/invite/upload")}/>)
              }}
            />
        </span>
          }
        </div>
      </Form>
    </React.Fragment>
  )
}


const formatUserType = (users) => {
  return users && users.map((user) => ({
    ...user,
    userTypes: [user?.userType?.value?.toString() === "1" ? "TeamAdmin" : "Operator"],
  }));
}

export const setTeamIdToUsers = (users, teamId) => {
  return users && users.map((user) => ({
    ...user,
    teamId,
  }));
}

const formatJob = (users) => {
  return users && users.map((user) => ({
    ...user,
    job: user?.job?.value,
  }));
}

const formatPhoneNumber = (users) => {
  return users && users.map((user) => ({
    ...user,
    phoneNumber: user?.phoneNumber?.value ? `+${user?.phoneNumber?.value}` : null,
  }));
}

const onFinish = (setVisibleSuccessModal) => {
  let keysToRemove = ["kop-team-id", "kop-picked-organization-id"];
  keysToRemove.map(key => localStorage.removeItem(key));

  setVisibleSuccessModal(true);
  history.push("/dashboard");
}

const onTryAgain = (failedEmails, setFieldValue, values) => {
  const users = values["users"];
  const failedUsers = users && users.filter(entity => failedEmails.includes(entity.email));
  setFieldValue("users", failedUsers);
}

export const _handleSubmit = (
  {
    users: unFormattedUsers,
    setLoading,
    showSuccessNotification,
    organizationId,
    teamId,
    t,
  }
) => {
  return new Promise((resolve, reject) => {
    setLoading(true);
    const users = formatUserType(formatPhoneNumber(formatJob(lowercaseEmail(unFormattedUsers))));
    const promises = [];
    users?.forEach(it => {
      // it["emailAddress"] = it.email;
      // delete it.email;
      delete it.userType;

      promises.push(createUserByAdmin(organizationId, it));
    });

    const alreadyRegisteredUsers = [];
    let totalSuccessForInvite = 0;
    let inviteBody = {add: []};

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
            inviteBody.add.push({
              email: users?.[index]?.email,
              userTypes: users?.[index]?.userTypes,
            });
          }
        });
      })
      .finally(async () => {
        if (inviteBody.add?.length > 0) {
          const inviteResponse = await inviteTeamMember(teamId, inviteBody);
          const numberOfSuccess = inviteResponse?.data?.added?.length;
          showSuccessNotification(t(
            numberOfSuccess > 1 ?
              'msg users invited success' : 'msg user invited success', {
              numberOfSuccess: numberOfSuccess,
            }));

          resolve({
            alreadyRegisteredUsers,
            numberOfSuccess,
          });
        } else {
          resolve({
            alreadyRegisteredUsers,
            numberOfSuccess: 0,
          });
        }
        setLoading(false);
      });
  })
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    users: [defaultTeamMember],
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: async (values, {props, setFieldValue, setStatus}) => {
    const {showErrorNotification, showSuccessNotification, setLoading, setVisibleSuccessModal, t} = props;
    let users = values?.users;
    const organizationId = localStorage.getItem("kop-v2-picked-organization-id");
    const teamId = localStorage.getItem("kop-v2-team-id")
    if (!organizationId) {
      showErrorNotification(
        t("msg create organization before inviting users"),
      );
      history.push("/invite/company");
    } else {
      if (users?.length > 0) {
        const {alreadyRegisteredUsers, numberOfSuccess} =
          await _handleSubmit({
            users,
            setLoading,
            showSuccessNotification,
            organizationId,
            teamId,
            t,
          });

        if (alreadyRegisteredUsers?.length > 0) {
          setStatus({
            visibleWarningModal: true,
            alreadyRegisteredUsers,
            leavePage: numberOfSuccess > 0,
          });
        } else {
          if (numberOfSuccess > 0) {
            setTimeout(() => {
              onFinish(setVisibleSuccessModal);
            }, 1500);
          }
        }
      }
    }
  }
})(FormInvite);

const mapStateToProps = (state) => ({
  userType: get(state, 'auth.userType'),
});

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
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(EnhancedForm));