import React, { useState } from 'react';
import clsx from 'clsx';
import style from './FormConnectMemberSearch.module.scss';
import { withTranslation } from 'react-i18next';
import { useMembersContext } from 'providers/MembersProvider';
import SearchDropdown from 'views/components/SearchDropdown';
import useClickOutSide from 'hooks/useClickOutSide';
import { useNavigate, useParams } from 'react-router-dom';
import { uploadBulkUserList } from 'http/organization';
import { useNotificationContext } from 'providers/NotificationProvider';

const FormConnectMemberSearch = ({ t }) => {
  const { searchedOperators, keywordOnInvite, setKeywordOnInvite, searching } = useMembersContext();
  const { addNotification } = useNotificationContext();
  const navigate = useNavigate();
  const { organizationId } = useParams();
  const [fileUploadResult, setFileUploadResult] = useState([]);

  const noMatch = React.useMemo(() => {
    return !searching && searchedOperators?.length === 0 && keywordOnInvite;
  }, [searching, searchedOperators, keywordOnInvite]);

  const [visible, setVisible] = React.useState(false);
  const dropdownRef = React.useRef(null);
  useClickOutSide(dropdownRef, () => setVisible(false));

  const visibleDropdown = React.useMemo(() => {
    return visible && searchedOperators?.length > 0;
  }, [visible, searchedOperators?.length]);

  const handleItemClick = (id) => {
    const item = searchedOperators?.find((it) => it.value === id);
    if (item) {
      navigate(
        `/connect/member/${organizationId}/device/${item.teamId}/${id}?name=${encodeURIComponent(
          item.title
        )}`
      );
    }
  };

  const handleCancel = () => {
    navigate('/select-mode');
  };

  const handleFileChange = (event) => {
    //setBulkFile(event.target.files[0]);
    uploadBulkUserList(organizationId, event.target.files[0])
      .then((res) => {
        event.target.value = null;
        setFileUploadResult(res.data);
        console.log('bulk excel upload result:', res);
        //addNotification('success', 'success');
      })
      .catch((e) => {
        console.log('error:', e);
        addNotification(e.response?.data?.message, 'error');
      });
  };

  const fileUploadResultRender = fileUploadResult.map((item, index) => (
    <li key={index}>
      <p>{item.deviceId}</p>
      <span>{item.result}</span>
    </li>
  ));

  return (
    <div className={clsx(style.Wrapper, 'form')}>
      <div className={clsx('d-flex flex-column mt-25', style.FormRow)}>
        <label className="font-input-label" htmlFor="deviceId">
          {t('enter team member')}
        </label>
        <SearchDropdown
          ref={dropdownRef}
          renderInput={() => (
            <input
              className={clsx(style.Input, 'input mt-10 font-heading-small text-white')}
              type="text"
              value={keywordOnInvite}
              placeholder={t('search user')}
              onChange={(e) => setKeywordOnInvite(e.target.value)}
              onClick={() => setVisible(true)}
            />
          )}
          items={searchedOperators}
          visibleDropdown={visibleDropdown}
          onItemClick={handleItemClick}
          noMatch={noMatch}
          noMatchText={t('no member match')}
        />

        <label
          className={
            'button active cursor-pointer tw-mt-2 tw-box-border tw-flex tw-justify-center tw-items-center'
          }
          type={'button'}>
          <span className="font-button-label text-white text-uppercase">
            {t('Upload user/device list')}
          </span>
          <input type="file" hidden onChange={handleFileChange} />
        </label>
      </div>
      <div className="tw-h-80 tw-mt-[10px] tw-overflow-auto">
        <ol className="tw-list-decimal">{fileUploadResultRender}</ol>
      </div>

      <div>
        <div>
          <button className="button cursor-pointer cancel" type="button" onClick={handleCancel}>
            <span className="font-button-label text-orange text-uppercase">{'cancel'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default withTranslation()(FormConnectMemberSearch);
