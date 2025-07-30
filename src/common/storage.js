import * as SecureStore from 'expo-secure-store';


export const MSStorage = {
    setItem: async (key, value) => {
        return await SecureStore.setItemAsync(key, JSON.stringify(value))
    },

    getItem: async (key) => {
        const item = await SecureStore.getItemAsync(key)
        try { return JSON.parse(item) } catch (e) { return null }
    },

    deleteItem: async (key) => {
        return await SecureStore.deleteItemAsync(key)
    }
}
