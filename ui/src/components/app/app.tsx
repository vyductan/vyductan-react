import React from "react";

import type { ConfirmConfig } from "../modal";
import { Modal as InternalModal } from "../modal";

// App context interface
interface AppContextType {
  modal: {
    confirm: (config: ConfirmConfig) => {
      destroy: () => void;
    };
  };
  message: {
    success: (content: string) => void;
    error: (content: string) => void;
    warning: (content: string) => void;
    info: (content: string) => void;
  };
  notification: {
    success: (config: { message: string; description?: string }) => void;
    error: (config: { message: string; description?: string }) => void;
    warning: (config: { message: string; description?: string }) => void;
    info: (config: { message: string; description?: string }) => void;
  };
}

// Modal state for the app context
interface ModalState {
  visible: boolean;
  config: ConfirmConfig;
  loading: boolean;
}

// Create App context
const AppContext = React.createContext<AppContextType | null>(null);

// App component props
export interface AppProps {
  children: React.ReactNode;
}

// App component implementation
export const App: React.FC<AppProps> & {
  useApp: () => AppContextType;
} = ({ children }) => {
  const [modalState, setModalState] = React.useState<ModalState>({
    visible: false,
    config: {},
    loading: false,
  });

  // Modal confirm function
  const confirm = React.useCallback((config: ConfirmConfig) => {
    setModalState({
      visible: true,
      config,
      loading: false,
    });

    return {
      destroy: () => {
        setModalState((prev) => ({
          ...prev,
          visible: false,
        }));
      },
    };
  }, []);

  // Handle modal OK
  const handleOk = React.useCallback(async () => {
    const { onOk } = modalState.config;
    if (onOk) {
      setModalState((prev) => ({ ...prev, loading: true }));
      try {
        await onOk();
        setModalState((prev) => ({ ...prev, visible: false, loading: false }));
      } catch (error) {
        console.error("Modal onOk error:", error);
        setModalState((prev) => ({ ...prev, loading: false }));
      }
    } else {
      setModalState((prev) => ({ ...prev, visible: false }));
    }
  }, [modalState.config]);

  // Handle modal cancel
  const handleCancel = React.useCallback(() => {
    const { onCancel } = modalState.config;
    onCancel?.();
    setModalState((prev) => ({ ...prev, visible: false }));
  }, [modalState.config]);

  // Message functions (placeholder - can be extended later)
  const message = React.useMemo(
    () => ({
      success: (content: string) => {
        console.log("Message Success:", content);
        // TODO: Implement actual message component
      },
      error: (content: string) => {
        console.error("Message Error:", content);
        // TODO: Implement actual message component
      },
      warning: (content: string) => {
        console.warn("Message Warning:", content);
        // TODO: Implement actual message component
      },
      info: (content: string) => {
        console.info("Message Info:", content);
        // TODO: Implement actual message component
      },
    }),
    [],
  );

  // Notification functions (placeholder - can be extended later)
  const notification = React.useMemo(
    () => ({
      success: (config: { message: string; description?: string }) => {
        console.log("Notification Success:", config);
        // TODO: Implement actual notification component
      },
      error: (config: { message: string; description?: string }) => {
        console.error("Notification Error:", config);
        // TODO: Implement actual notification component
      },
      warning: (config: { message: string; description?: string }) => {
        console.warn("Notification Warning:", config);
        // TODO: Implement actual notification component
      },
      info: (config: { message: string; description?: string }) => {
        console.info("Notification Info:", config);
        // TODO: Implement actual notification component
      },
    }),
    [],
  );

  // App context value
  const contextValue = React.useMemo<AppContextType>(
    () => ({
      modal: {
        confirm,
      },
      message,
      notification,
    }),
    [confirm, message, notification],
  );

  const {
    title = "Confirm",
    content,
    okText = "OK",
    okButtonProps,
    cancelText = "Cancel",
  } = modalState.config;

  return (
    <AppContext.Provider value={contextValue}>
      {children}

      {/* Global Modal */}
      <InternalModal
        open={modalState.visible}
        title={title}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={okText}
        okButtonProps={okButtonProps}
        cancelText={cancelText}
        confirmLoading={modalState.loading}
        onOpenChange={(open) => {
          if (!open) {
            handleCancel();
          }
        }}
      >
        {content}
      </InternalModal>
    </AppContext.Provider>
  );
};

// Add static useApp method to App component (like Ant Design)
App.useApp = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error("App.useApp() must be used within App component");
  }
  return context;
};

export default App;
