import { getAppConfig } from '../../src/common/device'

const ProductCode = () => {
    const org = getAppConfig().client_slug
    // const displayName = getAppConfig().client_host_wallet_name
    const product_codes = {
        ivantage: {
            savings: '005',
            current: '101',
            ivantage: '015'
        }
    }

    const product_labels = {
        ivantage: {
            savings: 'Savings',
            current: 'Current',
            // ivantage: displayName
        }
    }

    const getByName = (name) => {
        if (!(org in product_codes)) {
            return null
        }
        if (!(name in product_codes[org])) {
            return null
        }
        return product_codes[org][name];
    }

    const getLabel = (name) => {
        if (!(org in product_labels)) {
            return ''
        }
        if (!(name in product_labels[org])) {
            return ''
        }
        return product_labels[org][name];
    }

    return {
        getByName, getLabel
    }
}

export default ProductCode