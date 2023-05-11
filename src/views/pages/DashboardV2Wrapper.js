import React from 'react';
import { StickyComponentsProvider } from '../../providers/StickyComponentsProvider';
import { UtilsProvider } from '../../providers/UtilsProvider';
import { DashboardProvider } from '../../providers/DashboardProvider';
import DashboardV2 from './DashboardV2';

function DashboardV2Wrapper() {
  return (
    <StickyComponentsProvider>
      <UtilsProvider>
        <DashboardProvider>
          <DashboardV2 />
        </DashboardProvider>
      </UtilsProvider>
    </StickyComponentsProvider>
  );
}

export default DashboardV2Wrapper;
