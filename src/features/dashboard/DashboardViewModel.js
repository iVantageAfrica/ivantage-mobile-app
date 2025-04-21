import { useAuthentication } from "../../queries/useAuthentication";


const { fetchData: getAccounts } = useAuthentication('getbankaccounts', 'get', navigation);
const { fetchData: getAccountTypes } = useAuthentication('getaccounttypes', 'get', navigation);
const { fetchData: fetchInvestments } = useAuthentication('getinvestments', 'get', navigation);
const { fetchData: fetchAccountBalance } = useAuthentication('getaccountbalance', 'get', navigation, false);

// New Dashboard
const [selectedAccount, setSelectedAccount] = useState(null)
 const [displayAccountBalance, setDisplayAccountBalance] = useState(false)
 const [accountBalanceInfo, setAccountBalanceInfo] = useState(null)
 const [acctLoading, setAcctLoading] = useState(true)
 const [accountToOpen, setAccountToOpen] = useState(null)
 const {
     isOpen,
     onOpen,
     onClose
    
    } = useDisclose();

const [accounts, setAccounts] = useState([]);
const [accountTypes, setAccountTypes] = useState({});
const [userAccountMap, setUserAccountMap] = useState({});
const [investments, setInvestments] = useState([]);
const [isLoading, setIsLoading] = useState(false);
const [hasAccount, setHasAccount] = useState(false);

const { authData } = useUser();

//getAccounts
useFocusEffect(
  useCallback(() => {
    loadAccountInfo(true);
    getInvestments();
    checkBVNVerificationRequired();
  }, [])
);

useEffect(() => {
  loadAccountInfo();
  getInvestments();
  checkBVNVerificationRequired();
}, []);

const loadAccountInfo = async (in_background) => {
  if (!in_background) {
    setIsLoading(true);
  }
  const accountTypeData = await getBankAccountTypes();
  await getUserBankAccounts(accountTypeData);
  if (!in_background) {
    setIsLoading(false);
  }
};

const checkBVNVerificationRequired = () => {
  if (authData && authData.user && !authData.user.bvnVerified && hasAccount) {
    AlertBox.confirmBox(
      "You need to verify your BVN to keep your accounts active.",
      () => {
        navigation.navigate("BVNValidationScreen", {});
      },
      () => {},
      "BVN Validation Required",
      { okText: "Validate BVN", cancelText: "Not Now" }
    );
  }
};

const getAccountBalance = async (accountKey, accountTypesMap) => {
  const accountNo =
    accountTypesMap[accountKey]?.userAccount?.account_info?.AccountNo;
  if (accountNo === undefined) {
    setAccountToOpen(accountTypesMap[accountKey]);
    onOpen();
    return;
  }
  setAcctLoading(true);
  setSelectedAccount(accountNo);
  await fetchAccountBalance({
    params: { accountNo },
  })
    .then((res) => {
      setAcctLoading(false);
      if (res?.data?.success) {
        setAccountBalanceInfo(res?.data?.data);
        return;
      }
      // AlertBox.showErrorEx(res);
      return;
    })
    .catch((err) => {
      AlertBox.showErrorEx(err);
      return;
    });
};

const copyToClipboard = async (strData) => {
  if (!strData?.accountNo && !selectedAccount) {
    AlertBox.showError("Account number not available for this account.");
    return;
  }
  await Clipboard.setStringAsync(
    `${strData.accountDesc ?? ""}\n ${
      strData.accountNo ?? selectedAccount
    } \nImperial Homes Mortgage Bank`
  );
  AlertBox.showSuccess(
    `Account details for ${
      strData.accountNo ?? selectedAccount
    } copied successfully.`,
    "Copied"
  );
};

const getInvestments = async () => {
  await fetchInvestments({})
    .then((res) => {
      if (res && res.data && res.data.success) {
        if (res.data.data.length > 0) {
          setInvestments(res.data.data);
        } else {
          setInvestments([]);
        }
        return;
      }
      AlertBox.showErrorEx(res);
      return;
    })
    .catch((err) => {
      AlertBox.showErrorEx(err);
      return;
    });
};

const getUserBankAccounts = async (accountMap) => {
  try {
    const accts = [];
    const res = await getAccounts();
    if (res?.data?.success) {
      let accountKey = null;
      if (res.data?.data?.length > 0) {
        (res.data?.data || []).map((item) => {
          if (
            item.account_type in accountMap &&
            accountMap[item.account_type]
          ) {
            setHasAccount(true);
            accountMap[item.account_type].userAccount = item;
            accts.push(item.account_type);
            if (!accountKey) {
              accountKey = item.account_type;
            }
          }
        });
      }
      setUserAccountMap([...accts]);
      setAccountTypes(accountMap);
      const firstAccountKey = accountKey ?? Object.keys(accountMap)[0];
      const firstAccountData = accountMap[firstAccountKey];
      if (firstAccountData?.userAccount) {
        await getAccountBalance(firstAccountKey, accountMap);
        setSelectedAccount(
          firstAccountData?.userAccount?.account_info?.AccountNo
        );
      } else {
        setAccountToOpen(firstAccountData);
        setHasAccount(false);
        onOpen();
        return false;
      }

      return true; // Success
    }
    AlertBox.showErrorEx(res);
  } catch (err) {
    AlertBox.showErrorEx(err);
  }
  return false;
};

const goTo = (slug, item) => {
  navigation.navigate(slug, item);
};

const getBankAccountTypes = async () => {
  try {
    const res = await getAccountTypes();
    if (res?.data?.success) {
      const accountMap = {};
      (res.data.data || []).forEach((item) => {
        if (item.accessibility.includes("mobile")) {
          accountMap[item.name] = item;
        }
      });
      setAccountTypes(accountMap);
      return accountMap;
    }
    AlertBox.showErrorEx(res);
  } catch (err) {
    AlertBox.showErrorEx(err);
  }
  return {}; // Return an empty object as a fallback
};

if (isLoading) {
  return <Loader />;
}
