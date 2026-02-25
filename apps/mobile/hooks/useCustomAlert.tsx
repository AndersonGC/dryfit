import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CustomAlert, AlertButton } from '../components/CustomAlert';

type AlertContextType = {
    showAlert: (title: string, message?: string, buttons?: AlertButton[]) => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [visible, setVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState<string | undefined>(undefined);
    const [buttons, setButtons] = useState<AlertButton[] | undefined>(undefined);

    const showAlert = useCallback((title: string, message?: string, buttons?: AlertButton[]) => {
        setTitle(title);
        setMessage(message);
        setButtons(buttons);
        setVisible(true);
    }, []);

    const handleClose = useCallback(() => {
        setVisible(false);
    }, []);

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            <CustomAlert
                visible={visible}
                title={title}
                message={message}
                buttons={buttons}
                onClose={handleClose}
            />
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};
