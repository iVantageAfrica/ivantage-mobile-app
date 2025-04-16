import Ivantage  from '../themes/ivantage';
import { getAppConfig } from '../common/device'


const Theme = () => {
    const org = getAppConfig().client_slug
    if(org == 'ivantage') {
        return Ivantage
    }

    // Else default.
    return Ivantage
}

export default Theme()