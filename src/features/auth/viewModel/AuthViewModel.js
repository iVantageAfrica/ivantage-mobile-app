const LoginScreen = ({ navigation }) => {
    const { setAuthData } = useUser();
    // DEV_CLEAR
    const [username, setUsername] = useState('') // devtester@yopmail.com richardboyewa@gmail.com
    const [password, setPassword] = useState('') // Killer08  Asdfghjkl@1234567890
    const [isLoading, setIsLoading] = useState(false)
    const [isValid, setIsValid] = useState(false)
    const [show, setShow] = React.useState(false);
    const [isBiometricEnabled, setIsBiometricEnable] = React.useState(false);
    const [isEnabledBioAuth, setIsEnabledBioAuth] = React.useState(false);
    const [failureCount, setFailureCount] = useState(0)

    const sdkVersion = getAppMantifest().sdkVersion
    const version = getAppMantifest().version

    const { validate, isFieldInError, getErrorsInField } =
        useValidation({
            state: { username, password },
        });

    // useFocusEffect(useCallback(() => {
    //     (async () => {
    //         const email = await getStoredEmail()
    //         const passwordData = await getStoredPassword()
    //         if (email) {
    //             setUsername(email)
    //         }
    //         if (passwordData) { setPassword(passwordData) }
    //         if (username && password) {
    //             const isEnable = await MSStorage.getItem('enable_biometric')
    //             setIsBiometricEnable(isEnable)
    //             if (isEnable) {
    //                 setIsEnabledBioAuth(true)
    //                 await configureBiometricAuth()
    //             }
    //         }

    //     })()
    // }, [isBiometricEnabled, isEnabledBioAuth]))

    useEffect(() => {
        (async () => {
            const email = await getStoredEmail()
            const passwordData = await getStoredPassword()
            if (email) {
                setUsername(email)
            }
           
            if (email && passwordData) {
                const isEnable = await MSStorage.getItem('enable_biometric')
                setIsBiometricEnable(isEnable)

                if (isEnable) {
                    setIsEnabledBioAuth(true)
                    await configureBiometricAuth()
                }
            }

        })()
    }, [isBiometricEnabled])

    useEffect(() => {
        const valid = validate({
            username: { required: true },
            password: { required: true, minlength: 8 }
        })
        setIsValid(valid);
    }, [username, password])

    const onLoginSuccessful = (navigation) => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
        });
    }

    const getStoredEmail = async () => await MSStorage.getItem('email')
    const getStoredPassword = async () => await MSStorage.getItem('password')

    const authenticate = async (email, pwd) => {
        setIsLoading(true)
        const usernameData = email ? email.toLowerCase() : username.toLowerCase()
        const _pwd = pwd || password
        await fetchData({
            username: usernameData,
            password: _pwd
        }).then(async (res) => {
            setIsLoading(false)
            if (res.data && res.data.success) {
                setFailureCount(0)
                await MSStorage.setItem('user', res.data.data)
                await MSStorage.setItem('token', res.data.data.token)
                if (!res.data.data.user.emailVerified) {
                    navigation.navigate('OTPScreen', { screen: 'Profile', params: res.data.data.user });
                    return
                }
                await MSStorage.setItem('email', usernameData)
                const isEnable = await MSStorage.getItem('enable_biometric')
                if (isEnable) {
                    await MSStorage.setItem('password', _pwd)
                }
                setAuthData(res.data.data)
                onLoginSuccessful(navigation)
            } else {
                let count = failureCount + 1
                setFailureCount(count)
                if(count > 2) {
                    resetBiometric()
                }
                
                AlertBox.showErrorEx(res)
            }
        }).catch(err => {
            setIsLoading(false)
            if (isBiometricEnabled) {
                configureBiometricAuth()
            } else {
                AlertBox.showErrorEx(err)
            }
        })
    }

    const configureBiometricAuth = async () => {
        if (failureCount > 2) {
            return
        }
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "Biometric Authentication Required",
        })
        if (result && result.success) {
            const passwordInfo = await getStoredPassword()
            const email = await getStoredEmail()
            if (!passwordInfo) {
                setIsEnabledBioAuth(false)
            }
            if (email) {
                setUsername(email)
            }
            if (passwordInfo && email) {
                await authenticate(email, passwordInfo)
            } else {
                setIsEnabledBioAuth(false)
            }
        } else {
            if (result && result.error === 'user_cancel') {
                // return configureBiometricAuth()
                return
            }
            turnOffBiometric()
        }
    }

    const turnOffBiometric = () => {
        setIsEnabledBioAuth(false)
    }

    const resetBiometric = async () => {
        setIsBiometricEnable(false)
        setIsEnabledBioAuth(false)
        setUsername('')
        setPassword('')
    }

    const handleClick = () => setShow(!show);
}