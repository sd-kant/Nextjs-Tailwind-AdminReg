import React, {useState, useEffect} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import {withTranslation} from "react-i18next";
import backIcon from "../../../assets/images/back.svg";
import searchIcon from "../../../assets/images/search.svg";
import {
  setLoadingAction,
  setRestBarClassAction,
  setVisibleSuccessModalAction,
  showErrorNotificationAction,
  showSuccessNotificationAction,
} from "../../../redux/action/ui";
import style from "./FormSearch.module.scss";
import clsx from "clsx";
import {
  queryAllTeamsAction,
} from "../../../redux/action/base";
import {get} from "lodash";
import ConfirmModal from "../../components/ConfirmModal";
import {getParamFromUrl} from "../../../utils";
import SearchUserItem from "./SearchUserItem";
import {useMembersContext} from "../../../providers/MembersProvider";
import {useNavigate} from "react-router-dom";
import {handleModifyUsers} from "../../../utils/invite";
import {ScrollToFieldError} from "../../components/ScrollToFieldError";

export const defaultTeamMember = {
  email: '',
  firstName: '',
  lastName: '',
  job: "",
  action: 1,
  phoneNumber: null,
};

export const userSchema = (t) => {
  return Yup.object().shape({
    email: Yup.string()
      .email(t("email invalid"))
      .max(1024, t('email max error'))
    /*.test(
      'required',
      t('email or phone number required'),
      function (value) {
        if (value) return true;
        return !!(this.parent.phoneNumber?.value);
      }
    )*/,
    firstName: Yup.string()
      .required(t('firstName required'))
      .max(1024, t("firstName max error")),
    lastName: Yup.string()
      .required(t('lastName required'))
      .max(1024, t("lastName max error")),
    job: Yup.object()
      .required(t('role required')),
    phoneNumber: Yup.object(),
  }).required();
}

const formSchema = (t) => {
  return Yup.object().shape({
    users: Yup.array().of(
      userSchema(t),
    ),
  });
};

let intervalForChangesDetect;

const FormSearch = (props) => {
  const {
    values,
    errors,
    touched,
    t,
    setFieldValue,
    setRestBarClass,
    status,
    setStatus,
    isAdmin,
    organizationId,
  } = props;
  const [newChanges, setNewChanges] = useState(0);
  const {users, setPage, keyword, setKeyword} = useMembersContext();
  const navigate = useNavigate();

  useEffect(() => {
    setRestBarClass("progress-72 medical");
    countChanges();
    setPage("search");
    const keyword = getParamFromUrl('keyword');
    if (keyword) {
      setKeyword(keyword);
    }
    setFieldValue("users", users);
    return () => {
      clearInterval(intervalForChangesDetect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*useEffect(() => {
    if (!loading) {
      setVisibleDeleteModal(false);
    }
  }, [loading]);*/

  useEffect(() => {
    setFieldValue("users", users);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  const countChanges = () => {
    intervalForChangesDetect = setInterval(() => {
      const items = document.getElementsByClassName("exist-when-updated");
      setNewChanges(items?.length ?? 0);
    }, 500);
  };

  return (
    <>
      <ConfirmModal
        show={status?.visibleSuccessModal}
        header={t('modify team success header')}
        onOk={() => {
          setStatus({visibleSuccessModal: false});
          window.location.reload();
        }}
      />
      <Form className='form-group mt-57'>
        <div>
          <div className="d-flex align-center">
            <img src={backIcon} alt="back" className={"cursor-pointer"}
                 onClick={() => navigate(`/invite/${isAdmin ? organizationId : -1}/team-mode`)}/>
            &nbsp;&nbsp;
            <span className='font-button-label text-orange cursor-pointer'
                  onClick={() => navigate(`/invite/${isAdmin ? organizationId : -1}/team-mode`)}>
              {t("previous")}
            </span>
          </div>

          <div className={clsx(style.FormHeader, "mt-40 d-flex flex-column")}>
            <ScrollToFieldError/>
            <div className={clsx(style.Header)}>
              <div className={"d-flex align-center"}>
              <span className='font-header-medium d-block text-capitalize'>
                {t("search")}
              </span>
              </div>

              <div/>

              <div className={clsx("d-flex align-center", style.ChangeNote)}>
              <span className="font-header-medium">
                {t(newChanges === 0 ? 'no new change' : (newChanges > 1 ? 'new changes' : 'new change'), {numberOfChanges: newChanges})}
              </span>
              </div>
            </div>

            <div className={clsx(style.Tools)}>
              <div className={clsx(style.SearchWrapper)}>
                <img className={clsx(style.SearchIcon)} src={searchIcon} alt="search icon"/>
                <input
                  className={clsx(style.SearchInput, 'input mt-10 font-heading-small text-white')}
                  placeholder={t("search user")}
                  type="text"
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                />
              </div>

              {
                newChanges ?
                  <div className={clsx(style.SubmitWrapper)}>
                    <button
                      className={`button active cursor-pointer`}
                      type={"submit"}
                    ><span className='font-button-label text-white'>{t("save & update")}</span>
                    </button>
                  </div> : null
              }
            </div>
          </div>

          <div className={clsx(style.FormBody, "mt-40 d-flex flex-column")}>
            {
              values?.users?.map((user, index) => (
                <SearchUserItem
                  user={user}
                  index={index}
                  key={`user-${index}`}
                  id={`users.${index}`}
                  errorField={errors?.users}
                  touchField={touched?.users}
                />
              ))
            }
          </div>
        </div>
      </Form>
    </>
  )
}

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    users: [defaultTeamMember],
  }),
  validationSchema: ((props) => formSchema(props.t)),
  handleSubmit: async (values, {props, setStatus}) => {
    const {
      showErrorNotification,
      showSuccessNotification,
      setLoading,
      t,
      isAdmin,
      organizationId,
    } = props;
    // filter users that were modified to update
    let users = (values?.users ?? [])?.filter(it => it.updated);
    handleModifyUsers({
      setLoading,
      users,
      organizationId,
      isAdmin,
      setStatus,
      showErrorNotification,
      showSuccessNotification,
      t,
    });
  },
  enableReinitialize: true,
})(FormSearch);

const mapStateToProps = (state) => ({
  allTeams: get(state, 'base.allTeams'),
  loading: get(state, 'ui.loading'),
  userType: get(state, 'auth.userType'),
  isAdmin: get(state, 'auth.isAdmin'),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
      setRestBarClass: setRestBarClassAction,
      setVisibleSuccessModal: setVisibleSuccessModalAction,
      showErrorNotification: showErrorNotificationAction,
      showSuccessNotification: showSuccessNotificationAction,
      queryAllTeams: queryAllTeamsAction,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(EnhancedForm));