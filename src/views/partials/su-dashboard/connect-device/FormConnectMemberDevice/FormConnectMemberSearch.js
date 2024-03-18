import React from 'react';
import clsx from 'clsx';
import style from './FormConnectMemberSearch.module.scss';
import { withTranslation } from 'react-i18next';
import { useMembersContext } from 'providers/MembersProvider';
import SearchDropdown from 'views/components/SearchDropdown';
import useClickOutSide from 'hooks/useClickOutSide';
import { useNavigate, useParams } from 'react-router-dom';

const FormConnectMemberSearch = ({ t }) => {
  const { searchedOperators, keywordOnInvite, setKeywordOnInvite, searching } = useMembersContext();
  const navigate = useNavigate();
  const { organizationId } = useParams();

  const noMatch = React.useMemo(() => {
    return !searching && searchedOperators?.length === 0 && keywordOnInvite;
  }, [searching, searchedOperators, keywordOnInvite]);

  const [visible, setVisible] = React.useState(false);
  const [nonRegisteredErrorMessage, setNonRegisteredErrorMessage] = React.useState('');
  const dropdownRef = React.useRef(null);
  useClickOutSide(dropdownRef, () => setVisible(false));

  const visibleDropdown = React.useMemo(() => {
    return visible && searchedOperators?.length > 0;
  }, [visible, searchedOperators?.length]);

  const handleItemClick = (id) => {
    const item = searchedOperators?.find((it) => it.value === id);
    if (item) {
      if (item?.heatSusceptibility) {
        navigate(
          `/connect/member/${organizationId}/device/${item.teamId}/${id}?name=${encodeURIComponent(
            item.title
          )}`
        );
      } else {
        setNonRegisteredErrorMessage(
          t('non-registered user in mapping device', { fullname: item.title })
        );
      }
      setVisible(false);
    }
  };

  const handleCancel = () => {
    navigate('/select-mode');
  };

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
              className={clsx(style.Input, 'input mt-10 font-heading-small text-white sm:tw-w-full tw-w-[280px]')}
              type="text"
              value={keywordOnInvite}
              placeholder={t('search user')}
              onChange={(e) => {
                setNonRegisteredErrorMessage('');
                setKeywordOnInvite(e.target.value);
              }}
              onClick={() => setVisible(true)}
            />
          )}
          items={searchedOperators}
          visibleDropdown={visibleDropdown}
          onItemClick={handleItemClick}
          noMatch={noMatch}
          noMatchText={t('no member match')}
        />
      </div>
      <div>
        <div>
          <div className="md:tw-w-3/4">
            <span className="font-helper-text text-error">{nonRegisteredErrorMessage}</span>
          </div>
        </div>
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
