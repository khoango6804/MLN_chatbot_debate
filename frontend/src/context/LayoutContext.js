import React, { createContext, useState, useContext } from 'react';

const LayoutContext = createContext();

export const useLayout = () => useContext(LayoutContext);

export const LayoutProvider = ({ children }) => {
    const [showHeader, setShowHeader] = useState(true);
    const [showFooter, setShowFooter] = useState(true);
    const value = {
        showHeader,
        setShowHeader,
        showFooter,
        setShowFooter,
    };
    return (
        <LayoutContext.Provider value={value}>
            {children}
        </LayoutContext.Provider>
    );
}; 