import React from 'react';
import clsx from 'clsx';
import style from './FormConnectMemberSearch.module.scss';
import { withTranslation } from 'react-i18next';
import { useMembersContext } from '../../../providers/MembersProvider';
import SearchDropdown from '../../components/SearchDropdown';
import useClickOutSide from '../../../hooks/useClickOutSide';
import { useNavigate, useParams } from 'react-router-dom';

const FormConnectMemberSearch = ({ t }) => {
  const { searchedOperators, keywordOnInvite, setKeywordOnInvite } = useMembersContext();
  const navigate = useNavigate();
  const { organizationId } = useParams();

  const [visible, setVisible] = React.useState(false);
  const dropdownRef = React.useRef(null);
  useClickOutSide(dropdownRef, () => setVisible(false));

  const visibleDropdown = React.useMemo(() => {
    return visible && searchedOperators?.length > 0;
  }, [visible, searchedOperators?.length]);

  const handleItemClick = (id) => {
    const item = searchedOperators?.find((it) => it.value === id);
    navigate(`/connect/member/${organizationId}/device/${item.teamId}/${id}`);
  };

  const handleCancel = () => {
    navigate('/select-mode');
  };

  return (
    <div className={clsx(style.Wrapper)}>
      <div className={clsx(style.Body)}>
        <div className={clsx(style.Row)}>
          <div className="d-flex flex-column">
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
            />
          </div>
        </div>

        <div className={clsx(style.Row, 'mt-25')}>
          <div className="d-flex flex-column">
            <button className="active cursor-pointer button" type="button" onClick={handleCancel}>
              <span className="font-button-label text-white text-uppercase">{'cancel'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className={clsx(style.Footer)} />
    </div>
  );
};

export default withTranslation()(FormConnectMemberSearch);
