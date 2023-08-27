import React from 'react';
import { StickyComponentsProvider } from '../../../../providers/StickyComponentsProvider';
import { UtilsProvider } from '../../../../providers/UtilsProvider';
import { OperatorDashboardProvider } from '../../../../providers/operator/OperatorDashboardProvider';
import OperatorDashboard from './OperatorDashboard';

function OperatorDashboardWrapper() {
  return (
    <StickyComponentsProvider>
      <UtilsProvider>
        <OperatorDashboardProvider>
          <OperatorDashboard />
        </OperatorDashboardProvider>
      </UtilsProvider>
    </StickyComponentsProvider>
  );
}

export default OperatorDashboardWrapper;
