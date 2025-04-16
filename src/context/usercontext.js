import React, { useState, useEffect } from 'react';
import { createContext, useContext } from 'react';
// import { MSStorage } from "../common/storage";

const UserContext = createContext(undefined);

export const UserContextProvider = ({
    children,
})=> {
    const [authData, setAuthData] = useState();

    // useEffect(() => {
    //     (async () => {
    //         getUserContext()
    //     })()
    // }, [])

    // const getUserContext = async() => {
    //     try {
    //         const data = await MSStorage.getItem('user')
    //         if(data !== undefined) {
    //             // setAuthData(data);
    //         }
    //     } catch (error) {
            
    //     }
        
    // }
    
    return <UserContext.Provider value={{authData, setAuthData}}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);

    if (context === undefined) {
        throw new Error('useUser must be used within the User context');
    }

    return context;
};
