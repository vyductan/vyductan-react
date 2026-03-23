import { useState } from 'react';
import { AcmeSyncTab } from './features/acme-sync/AcmeSyncTab';
import { RegistrySyncTab } from './features/registry-sync/RegistrySyncTab';

type TabKey = 'registry-sync' | 'acme-sync';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'registry-sync', label: 'Registry Sync' },
  { key: 'acme-sync', label: 'Acme Sync' },
];

const App = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('registry-sync');

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '40px 20px', color: '#333' }}>
      <header style={{ marginBottom: '32px', borderBottom: '1px solid #eaeaea', paddingBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 600, color: '#111' }}>@acme Manager</h1>
        <p style={{ margin: '8px 0 0', color: '#666', fontSize: '15px' }}>
          Synchronize UI components and configuration files across the monorepo.
        </p>
      </header>

      <nav style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: isActive ? '2px solid #0070f3' : '1px solid #d1d5db',
                background: isActive ? '#e6f0fd' : '#fff',
                color: isActive ? '#0070f3' : '#374151',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '14px',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div hidden={activeTab !== 'registry-sync'}>
        <RegistrySyncTab />
      </div>
      <div hidden={activeTab !== 'acme-sync'}>
        <AcmeSyncTab />
      </div>
    </div>
  );
};

export default App;
