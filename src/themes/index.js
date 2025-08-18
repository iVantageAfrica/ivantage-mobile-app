import Ivantage  from '../themes/ivantage';
import { getAppConfig } from '../common/device'


const Theme = () => {
    const config = getAppConfig();
    const org = config?.client_slug || 'ivantage';
    if(org == 'ivantage') {
        return Ivantage
    }

    // Else default.
    return Ivantage
}

export default Theme()