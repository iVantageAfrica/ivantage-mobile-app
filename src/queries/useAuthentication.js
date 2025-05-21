import { Urls } from './urls';
import useAxios from './useAxios';

export const useAuthentication = (type = 'login', method = 'post', navigation = null, is_multi_part =  false, stringify = true) => {
    const { fetchData } = useAxios({
        method: method,
        url: Urls[type],
        is_multi_part,
        stringify: method == 'get' ? false: stringify,
        navigation
    });
    const fetchParamData = (data) => {
        if(!data.urlParams) { data.urlParams = {}}
        let parsedUrl = Urls[type]
        for(const r in data.urlParams) {
            const l = `<${r}>`
            parsedUrl = parsedUrl.replace(`<${r}>`, data.urlParams[r])
        }
        delete(data.urlParams)
        const { fetchData } = useAxios({
            method: method,
            url: parsedUrl,
            is_multi_part,
            stringify: method == 'get' ? false: stringify,
            navigation
        });
        return fetchData(data)
    }
    const uploadDocument = (details) => {
        const { fetchData } = useAxios({
            method: 'post',
            url: `${Urls[type]}`,
            stringify: false,
            is_multi_part: true,
            navigation
        });
        return fetchData(details)
    }
    const lockDownProperty = (property) => {
        const { fetchData } = useAxios({
            method: 'get',
            url: `${Urls[type]}/${property.objectId}/lockdown`,
            navigation
        });
        return fetchData()
    }
    return {
        fetchData,
        lockDownProperty,
        uploadDocument,
        fetchParamData
    }
}
