import * as React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import clsx from 'clsx';
import Modal from 'react-modal';
import { useDashboardContext } from '../../../providers/DashboardProvider';

import { get } from 'lodash';

import ConfirmModalV2 from '../../components/ConfirmModalV2';
import ConfirmModal from '../../components/ConfirmModal';
import { useUserSubscriptionContext } from '../../../providers/UserSubscriptionProvider';
import MemberDetail from 'views/partials/MemberDetail';

export const filters = [
  {
    value: '1',
    label: 'most recent'
  },
  {
    value: '2',
    label: 'most highest'
  }
];

const MemberDetailModal = ({ t, open = false, closeModal = () => {}, data: origin }) => {
  const { formattedMembers, formattedTeams, moveMember, setMember, unlockMember } =
    useDashboardContext();
  const { setUser } = useUserSubscriptionContext();
  const [warningModal, setWarningModal] = React.useState({ visible: false, title: '', mode: null }); // mode: 'move', 'unlock'
  const [confirmModal, setConfirmModal] = React.useState({ visible: false, title: '', mode: null }); // mode: move, unlock
  const memberId = React.useRef(origin?.userId);
  const data = React.useMemo(() => {
    return origin
      ? origin
      : formattedMembers.find((it) => it.userId?.toString() === memberId.current?.toString());
  }, [formattedMembers, origin]);

  const [team, setTeam] = React.useState(null);
  React.useEffect(() => {
    if (data?.teamId) {
      setTeam(formattedTeams?.find((it) => it.value?.toString() === data?.teamId?.toString()));
    } else {
      setTeam(null);
    }
    setUser(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const hideWarningModal = () => {
    setWarningModal({ visible: false, title: '', mode: null });
  };

  const handleConfirm = React.useCallback(() => {
    switch (confirmModal.mode) {
      case 'move':
        setMember(null);
        setConfirmModal({ visible: false, title: '', mode: null });
        break;
      case 'unlock':
        setConfirmModal({ visible: false, title: '', mode: null });
        break;
      default:
        console.log('action not registered');
    }
  }, [confirmModal, setMember]);

  const handleClickMoveTeam = () => {
    setWarningModal({
      visible: true,
      title: t('move user to team warning title', {
        user: `${data?.firstName} ${data?.lastName}`,
        team: team?.label
      }),
      mode: 'move'
    });
  };

  const handleClickUnlock = () => {
    setWarningModal({
      visible: true,
      title: t('unlock user warning title'),
      mode: 'unlock'
    });
  };

  const handleWarningClick = React.useCallback(() => {
    const handleMove = () => {
      moveMember([data], team?.value)
        .then(() => {
          hideWarningModal();
          setConfirmModal({
            visible: true,
            title: t('move user to team confirmation title', {
              user: `${data?.firstName} ${data?.lastName}`,
              team: team?.label
            }),
            mode: 'move'
          });
        })
        .catch((e) => {
          console.log('moving member error', e);
        });
    };

    const handleUnlock = () => {
      unlockMember(data)
        .then(() => {
          hideWarningModal();
          setConfirmModal({
            visible: true,
            title: t('unlock user confirmation title', {
              name: `${data?.firstName} ${data?.lastName}`
            }),
            mode: 'unlock'
          });
        })
        .catch((e) => {
          console.log('moving member error', e);
        });
    };

    switch (warningModal.mode) {
      case 'move':
        handleMove();
        break;
      case 'unlock':
        handleUnlock();
        break;
      default:
        console.log('action moe not registered');
    }
  }, [data, moveMember, unlockMember, t, team, warningModal]);

  return (
    <React.Fragment>
      <Modal
        isOpen={open}
        className={clsx(
          'tw-shadow-[0_25px_50px_0px_rgba(0,0,0,0.5)]',
          'tw-absolute',
          'tw-w-full md:tw-top-[80px] md:tw-left-1/2 md:tw-w-[calc(100%-30px)]',
          'tw-max-w-8xl',
          'tw-bg-app-list-bg',
          'md:tw-transform md:-tw-translate-x-1/2',
          'tw-outline-none',
          'tw-block',
          'tw-rounded-[30px]'
        )}
        overlayClassName={clsx(
          'tw-fixed tw-top-0 tw-w-full tw-h-full tw-bg-transparent tw-backdrop-blur-[2px] tw-z-[100] tw-overflow-auto lg:tw-overflow-hidden'
        )}
        onRequestClose={closeModal}
        preventScroll={true}
        appElement={document.getElementsByTagName('body')}>
        <MemberDetail
          data={origin}
          closeModal={closeModal}
          handleClickMoveTeam={handleClickMoveTeam}
          handleClickUnlock={handleClickUnlock}
        />
      </Modal>
      <ConfirmModalV2
        show={warningModal.visible}
        header={warningModal.title}
        onOk={handleWarningClick}
        onCancel={hideWarningModal}
      />
      <ConfirmModal show={confirmModal.visible} header={confirmModal.title} onOk={handleConfirm} />
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  metric: get(state, 'ui.metric')
});

export default connect(mapStateToProps, null)(withTranslation()(React.memo(MemberDetailModal)));
