import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface RegistryFile {
  path: string;
  target: string;
  type: string;
}

interface RegistryItem {
  name: string;
  title: string;
  path: string;
  type: string;
  files: RegistryFile[];
}

const WORKSPACES = [
  { name: 'Vyductan React', path: '../../../vyductan-react' },
  { name: 'Notes', path: '../../../notes' },
  { name: 'NextJS Turbo Starter', path: '../../../nextjs-turbo-starter' },
];

export const RegistrySyncTab = () => {
  const [components, setComponents] = useState<RegistryItem[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(WORKSPACES[0].path);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      const result = await invoke<RegistryItem[]>('get_registry_components');
      setComponents(result);
    } catch (error) {
      console.error('Failed to fetch components:', error);
      setStatusMessage(`Error: ${error}`);
    }
  };

  const handleSyncComponent = async (componentName: string) => {
    setLoading(true);
    setStatusMessage(`Syncing ${componentName}...`);
    try {
      const result = await invoke<string>('sync_component', {
        componentName,
        targetWorkspacePath: selectedWorkspace,
      });
      setStatusMessage(result);
    } catch (error) {
      console.error('Failed to sync framework:', error);
      setStatusMessage(`Error syncing: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncConfigs = async () => {
    setLoading(true);
    setStatusMessage('Syncing generic configs...');
    try {
      const result = await invoke<string>('sync_generic_config', {
        targetWorkspacePath: selectedWorkspace,
      });
      setStatusMessage(result);
    } catch (error) {
      console.error('Failed to sync configs:', error);
      setStatusMessage(`Error syncing configs: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section style={{ marginBottom: '32px', background: '#f9f9fa', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600 }}>1. Select Target Workspace</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {WORKSPACES.map((ws) => (
            <button
              key={ws.path}
              onClick={() => setSelectedWorkspace(ws.path)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: selectedWorkspace === ws.path ? '2px solid #0070f3' : '1px solid #d1d5db',
                background: selectedWorkspace === ws.path ? '#e6f0fd' : '#fff',
                color: selectedWorkspace === ws.path ? '#0070f3' : '#374151',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '14px',
                transition: 'all 0.2s',
              }}
            >
              {ws.name}
            </button>
          ))}
        </div>
        <div style={{ marginTop: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>Custom Path</label>
          <input
            type="text"
            value={selectedWorkspace}
            onChange={(e) => setSelectedWorkspace(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}
          />
        </div>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>2. Sync Components</h2>
          <button
            onClick={handleSyncConfigs}
            disabled={loading}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: '#111',
              color: '#fff',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              opacity: loading ? 0.7 : 1,
            }}
          >
            Sync Core Configs (.gitignore, eslint)
          </button>
        </div>

        {components.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: '#f3f4f6', borderRadius: '12px', color: '#6b7280' }}>
            No components found in registry.json.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {components.map((comp) => (
              <div key={comp.name} style={{ border: '1px solid #eaeaea', borderRadius: '12px', padding: '20px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600 }}>{comp.title}</h3>
                <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#6b7280' }}>
                  {comp.files.length} file(s)
                </p>
                <button
                  onClick={() => handleSyncComponent(comp.name)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '8px 0',
                    borderRadius: '6px',
                    background: '#f3f4f6',
                    color: '#111',
                    border: '1px solid #e5e7eb',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#e5e7eb';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#f3f4f6';
                  }}
                >
                  Sync to Target
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {statusMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#111',
            color: '#fff',
            padding: '16px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            maxWidth: '400px',
            fontSize: '14px',
            lineHeight: 1.5,
            zIndex: 100,
          }}
        >
          <pre style={{ margin: 0, fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>{statusMessage}</pre>
          <button
            onClick={() => setStatusMessage(null)}
            style={{ position: 'absolute', top: '8px', right: '8px', background: 'transparent', border: 'none', color: '#999', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
};
