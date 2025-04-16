import React, { useState } from 'react';
import CanvasDashboard from './CanvasDashboard';
import CanvasEditor from './CanvasEditor';
import CanvasExperimentManager from './CanvasExperimentManager';
import CanvasLearningManager from './CanvasLearningManager';

const StrategyzerAdminPanel: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const handleRefresh = () => setRefreshKey(k => k + 1);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
      <h1>Strategyzer Canvas Admin Panel</h1>
      <CanvasEditor onCreated={handleRefresh} />
      <CanvasExperimentManager onCreated={handleRefresh} />
      <CanvasLearningManager onCreated={handleRefresh} />
      <hr style={{ margin: '32px 0' }} />
      <CanvasDashboard key={refreshKey} />
    </div>
  );
};

export default StrategyzerAdminPanel;
