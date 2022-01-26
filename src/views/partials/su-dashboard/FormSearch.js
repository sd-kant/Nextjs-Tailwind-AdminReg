import React, {useState, useEffect} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as Yup from 'yup';
import {Form, withFormik} from "formik";
import {withTranslation} from "react-i18next";
import history from "../../../history";
import backIcon from "../../../assets/images/back.svg";
import searchIcon from "../../../assets/images/search.svg";
import {
  setLoadingAction,
  setRestBarClassAction,
  setVisibleSuccessModalAction,
  showErrorNotificationAction,
  showSuccessNotificationAction,
} from "../../../redux/action/ui";
import {
  inviteTeamMember,
  updateUserByAdmin,
} from "../../../http";
import {
  lowercaseEmail,
} from "./FormRepresentative";
import style from "./FormSearch.module.scss";
import clsx from "clsx";
import {
  USER_TYPE_ADMIN,
  USER_TYPE_ORG_ADMIN,
} from "../../../constant";
import {
  queryAllTeamsAction,
} from "../../../redux/action/base";
import {get} from "lodash";
import ConfirmModal from "../../components/ConfirmModal";
import {getParamFromUrl, updateUrlParam} from "../../../utils";
import SearchUserItem from "./SearchUserItem";
import {useMembersContext} from "../../../providers/MembersProvider";

let searchTimeout = null;

export const defaultTeamMember = {
  email: '',
  firstName: '',
  lastName: '',
  job: "",
  action: 1,
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
    job: Yup.object()
      .required(t('role required')),
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
    match: {params: {organizationId}},
    isAdmin,
  } = props;
  const [keyword, setKeyword] = useState('');
  const [newChanges, setNewChanges] = useState(0);
  const {initializeMembers, users} = useMembersContext();

  useEffect(() => {
    setRestBarClass("progress-72 medical");
    countChanges();
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

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    updateUrlParam({param: {key: 'keyword', value: keyword}});
    searchTimeout = setTimeout(() => {
      initializeMembers({
        mode: "search",
        keyword,
      });
    }, 700);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

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

  const navigateTo = (path) => {
    history.push(path);
  };

  const goBack = () => {
    navigateTo(`/invite/${isAdmin ? organizationId : -1}/team-mode`);
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
            <img src={backIcon} alt="back" className={"cursor-pointer"} onClick={() => goBack()}/>
            &nbsp;&nbsp;
            <span className='font-button-label text-orange cursor-pointer' onClick={() => goBack()}>
              {t("previous")}
            </span>
          </div>

          <div className={clsx(style.FormHeader, "mt-40 d-flex flex-column")}>
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
          </div>

          <div className={clsx(style.FormBody, "mt-40 d-flex flex-column")}>
            {
              values?.users?.map((user, index) => (
                <SearchUserItem
                  user={user}
                  index={index}
                  key={'user'}
                  errorField={errors?.users}
                  touchField={touched?.users}
                />
              ))
            }
          </div>
        </div>
        {
          newChanges ?
            <div className={clsx(style.Footer)}>
              <button
                className={`button active cursor-pointer`}
                type={"submit"}
              >
                <span className='font-button-label text-white'>
                  {t("save & update")}
                </span>
              </button>
            </div> : <></>
        }
      </Form>
    </>
  )
}

const formatJob = (users) => {
  return users && users.map((user) => ({
    ...user,
    job: user?.job?.value,
  }));
};

const setUserType = (users) => {
  return users && users.map((user) => {
    const userTypes = user?.userTypes;
    let userType = "";
    if (userTypes?.includes(USER_TYPE_ADMIN)) {
      userType = USER_TYPE_ADMIN;
    } else if (userTypes?.includes(USER_TYPE_ORG_ADMIN)) {
      userType = USER_TYPE_ORG_ADMIN;
    }
    return {
      ...user,
      userType: userType,
    }
  });
};

const EnhancedForm = withFormik({
  mapPropsToValues: () => ({
    users: [defaultTeamMember],
  }),
  validationSchema: ((props) => Yup.lazy(values => formSchema(props.t))),
  handleSubmit: async (values, {props, setStatus}) => {
    const {showErrorNotification, showSuccessNotification, setLoading, t, match: {params: {organizationId}}} = props;
    // filter users that were modified to update
    let users = (values?.users ?? [])?.filter(it => it.updated);
    // fixme optimize
    try {
      setLoading(true);
      let usersToModify = [];
      users?.forEach(it => {
        if (!!it.userId) {
          usersToModify.push(it);
        }
      });
      usersToModify = setUserType(formatJob(lowercaseEmail(usersToModify)));
      usersToModify = usersToModify?.map(it => ({
        userId: it.userId,
        firstName: it.firstName,
        lastName: it.lastName,
        job: it.job,
        email: it.email,
        userType: it.userType,
        accessibleTeams: it.accessibleTeams,
        originalAccessibleTeams: it.originalAccessibleTeams,
      }));

      const {userType} = props;

      if (usersToModify?.length > 0) {
        const updatePromises = [];
        let inviteBody = {};
        usersToModify?.forEach(userToModify => {
          if (!(["undefined", "-1", "null", ""].includes(organizationId?.toString()))) {
            const isAdmin = [USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN].some(it => userType?.includes(it));
            if (isAdmin) {
              updatePromises.push(updateUserByAdmin(organizationId, userToModify.userId, userToModify));
            }
            if (!([USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN].includes(userToModify.userType))) { // if not super admin or org admin
              userToModify?.originalAccessibleTeams?.forEach(originalAccessibleTeam => {
                const isRemoved = !(userToModify?.accessibleTeams?.some(accessibleTeam => accessibleTeam.teamId?.toString() === originalAccessibleTeam.teamId?.toString()));
                if (isRemoved) {
                  if (inviteBody[originalAccessibleTeam.teamId]?.remove) {
                    inviteBody[originalAccessibleTeam.teamId].remove.push(userToModify?.email);
                  } else {
                    inviteBody[originalAccessibleTeam.teamId] = {remove: [userToModify?.email]};
                  }
                }
              });
              userToModify?.accessibleTeams?.forEach(accessibleTeam => {
                if (accessibleTeam.teamId && accessibleTeam.userTypes?.length > 0) {
                  if (inviteBody[accessibleTeam.teamId]?.add) {
                    inviteBody[accessibleTeam.teamId].add.push({
                      email: userToModify?.email,
                      userTypes: accessibleTeam?.userTypes,
                    });
                  } else {
                    inviteBody[accessibleTeam.teamId] = {
                      add: [
                        {
                          email: userToModify?.email,
                          userTypes: accessibleTeam?.userTypes,
                        }
                      ],
                    };
                  }
                }
              });
            }
          }
        });
        const failedEmails = [];
        let totalSuccessForModify = 0;

        const inviteFunc = () => {
          const invitePromises = [];
          if (inviteBody) {
            Object.keys(inviteBody).forEach((teamId, index) => {
              invitePromises.push(inviteTeamMember(teamId, Object.values(inviteBody)?.[index]));
            });
          }

          if (invitePromises?.length > 0) {
            Promise.allSettled(invitePromises)
              .finally(() => {
                if (failedEmails?.length === 0) {
                  setStatus({visibleSuccessModal: true});
                }
                setLoading(false);
              });
          } else {
            setStatus({visibleSuccessModal: true});
            setLoading(false);
          }
        };

        if (updatePromises?.length > 0) {
          Promise.allSettled(updatePromises)
            .then((results) => {
              results?.forEach((result, index) => {
                if (result.status === "fulfilled") {
                  totalSuccessForModify++;
                } else {
                  // store failed emails
                  failedEmails.push(usersToModify[index]?.email);
                  showErrorNotification(result.reason?.response?.data?.message);
                  console.log("modifying team member failed", result.reason);
                }
              });

              if (totalSuccessForModify > 0) {
                showSuccessNotification(
                  t(totalSuccessForModify > 1 ? 'msg users modified success' : 'msg user modified success', {
                    numberOfUsers: totalSuccessForModify,
                  })
                );
              }
            })
            .finally(async () => {
              // finished promise
              inviteFunc();
            });
        } else {
          inviteFunc();
        }
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.log('_handleSubmit error', e);
    } finally {
    }
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