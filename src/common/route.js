import * as React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Icon, Image } from 'native-base';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { Feather } from '@expo/vector-icons';

import Landing from '../../src/views/landing';
import LoginScreen from '../../src/views/auth/login';
import ResetPasswordScreen from '../../src/views/auth/password_reset';
import SuccessScreen from '../../src/views/generics/success';
import BlankScreen from '../../src/views/generics/blank';
import OTPScreen from '../../src/views/auth/otp';
import SignUpScreen from '../../src/views/auth/signup';
import AccountIntroScreen from '../../src/views/account/index';
import CreateAccountScreen from '../../src/views/account/create';
import AccountDocumentScreen from '../../src/views/account/documents';
import FundAcctScreen from '../../src/views/account/fund';
import FundWebView from '../../src/views/account/fund_webview';
import AddAccountScreen from '../../src/views/account/add_account';
import CardRequestScreen from '../../src/views/transfer/card_request';

import AppHome from '../views/dashboard/home_new';
import TransactionSummaryScreen from '../views/dashboard/transaction_summary';
import AffordabilityCalculatorScreen from '../views/properties/affordability_calculator';
import AffordabilityListingScreen from '../views/properties/affordability_listing';
import NewMortgageScreen from '../views/mortgage/create';
import PropertyListingScreen from '../views/properties/listing';
import FilterViewScreen from '../views/properties/filter_view';
import PropertyDetailScreen from '../views/properties/property_detail';
import MoreScreen from '../views/more/morepage';
import AccountManagerScreen from '../views/transfer/account_manager';

import IVantageTab from '../views/dashboard/ivantage_account';
import SavingsTab from '../views/dashboard/account_detail';
import InvestmentTab from '../views/dashboard/investment_account';
import MortgageTab from '../views/dashboard/mortgage_account';

import BillsScreen from '../views/bills/home';
import BillersScreen from '../views/bills/billers';
import PackagesScreen from '../views/bills/packages';
import PurchaseScreen from '../views/bills/purchase';

import TransactionHistoryScreen from '../views/dashboard/transaction_history';
import TransactionPINScreen from '../views/more/transaction_pin';

import TransferHomeScreen from '../views/transfer/home'
import TransferMenuScreen from '../views/transfer/menu'
import TransferToOwnAcctScreen from '../views/transfer/to_own_account'
import TransferToOtherAcctScreen from '../views/transfer/to_other_account'
import BeneficiariesScreen from '../views/transfer/beneficiaries'
import TransferOTPScreen from '../views/transfer/otp'

import NewInvestmentScreen from '../views/investment/new_investment'
import AddToDealScreen from '../views/investment/add_to_deal'
import LiquidationMenuScreen from '../views/investment/liquidate_menu'
import PartialLiquidationScreen from '../views/investment/liquidation_partial'
import FullLiquidationScreen from '../views/investment/liquidation_full'

import FAQScreen from '../views/more/faq'
import ProfileScreen from '../views/more/profile'
import FeedbackScreen from '../views/more/feedback';

import AffiliateOnboardingScreen from '../views/affiliate/onboard';
import AffiliateReferralsScreen from '../views/affiliate/referrals';

import BVNValidationScreen from '../views/verifications/bvn';


import Theme from '../themes'
import TransferLimitScreen from '../views/more/transfer_limit';

import HomeVestLanding from '../views/homevest';
import HomeVestPropertyScreen from '../views/homevest/property';
import CreateHomeVestScreen from '../views/homevest/create';
import HomeVestDashboardScreen from '../views/homevest/dashboard';

const SavingScreenStack = createNativeStackNavigator();
const MoreScreenStack = createNativeStackNavigator();
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const TopTab = createMaterialTopTabNavigator();
const deviceWidth = Math.ceil(Dimensions.get('screen').width)

const defaultPageHeader = (title) => {
    return {
        headerShown: true, title, headerTintColor: '#ffffff', headerStyle: {
            backgroundColor: Theme.Colors.backgroundColor
        }
    }
}

function TopTabAppNav() {
    return (
        <TopTab.Navigator
            screenOptions={({ route }) => ({
                cardStyle: {
                    backgroundColor: Theme.Colors.backgroundColor,
                },
                tabBarStyle: {
                    backgroundColor: Theme.Colors.backgroundColor,
                    height: 100,
                    paddingTop: 50,
                    borderBottomWidth: 1,
                    borderTopColor: Theme.Colors.backgroundColor,
                    elevation: 20
                },
                tabBarShowIcon: true,
                tabBarShowLabel: false,
                tabBarLabelStyle: {
                    color: '#ffffff',
                    paddingTop: 50,
                    alignSelf: 'baseline'
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName
                    if (route.name == 'ivantage') {
                        iconName = Theme.Icons.ivantage_acc_icon
                    }
                    if (route.name == 'current') {
                        iconName = Theme.Icons.gold_bars
                    }
                    if (route.name == 'savings') {
                        iconName = Theme.Icons.gold_bars
                    }
                    if (route.name == 'investment') {
                        iconName = Theme.Icons.investment_acc_icon
                    }
                    if (route.name == 'mortgage') {
                        iconName = Theme.Icons.home_mortgage
                    }
                    return <Image style={{ width: 25, height: 25 }} alt={route.name} source={iconName} />
                },
            })}
        >
            <TopTab.Screen name="ivantage" component={IVantageTab} />
            <TopTab.Screen name="current" component={SavingsNav} />
            <TopTab.Screen name="investment" component={InvestmentNav} />
            <TopTab.Screen name="mortgage" component={MortgageTab} />
        </TopTab.Navigator>
    )
}

function AppNav() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                cardStyle: {
                    backgroundColor: Theme.Colors.backgroundColor,
                },
                tabBarLabelStyle: {
                    textAlign: 'center',
                    textAlignVertical: 'bottom',
                    fontSize: 9,
                    alignSelf: 'baseline'
                },
                tabBarLabel: ({ focused }) => {
                    let itemLabel
                    if (route.name == 'AppHome') {
                        itemLabel = 'Home'
                    }
                    if (route.name == 'Investment') {
                        itemLabel = 'My Investments'
                    }
                    if (route.name == 'Mortgage') {
                        // itemLabel = 'Affordability\n Calculator'
                        itemLabel = 'My Mortgage'
                    }
                    if (route.name == 'PropertyScreen') {
                        itemLabel = 'Browse\n Properties'
                    }
                    if (route.name == 'MoreScreen') {
                        itemLabel = 'More'
                    }
                    return label = focused ? <Text style={{ fontSize: 9, textAlignVertical: 'bottom', color: Theme.CustomTheme['color-active-text'], textAlign: 'center' }}>{itemLabel}</Text> : <Text style={{ fontSize: 9, textAlignVertical: 'bottom', color: 'gray', textAlign: 'center' }}>{itemLabel}</Text>
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName
                    if (route.name == 'AppHome') {
                        iconName = focused ? Theme.Icons.home_selected : Theme.Icons.home
                    }
                    if (route.name == 'Investment') {
                        iconName = focused ? Theme.Icons.dashboard_selected : Theme.Icons.dashboard
                    }
                    if (route.name == 'Mortgage') {
                        iconName = focused ? Theme.Icons.affordability_calc_selected : Theme.Icons.affordability_calc
                    }
                    if (route.name == 'PropertyScreen') {
                        iconName = focused ? Theme.Icons.browse_property_selected : Theme.Icons.browse_property
                    }
                    if (route.name == 'MoreScreen') {
                        iconName = focused ? Theme.Icons.more_button_selected : Theme.Icons.more_button
                    }
                    return <Image style={{ width: 34, height: 34 }} alt={route.name} source={iconName} />
                },
                tabBarStyle: {
                    backgroundColor: Theme.Colors.backgroundColor,
                    height: 90,
                    paddingBottom: 10,
                    borderTopRightRadius: 30,
                    borderTopLeftRadius: 30,
                    paddingTop: 10,
                    // width: deviceWidth,
                    borderWidth: 1,
                    borderTopColor: '#000000',
                    elevation: 20,
                    // position: 'absolute'
                }
            })}
        >
            <Tab.Screen name="AppHome" options={{ headerShown: false, title: 'Home' }} component={AppHome} />
            {/* <Tab.Screen name="AccountDetail" options={{ headerShown: false, title: 'Dashboard' }} component={TopTabAppNav} /> */}
            <Tab.Screen name="Investment" options={defaultPageHeader('My Investments')} component={InvestmentNav} />
            <Tab.Screen name="Mortgage" options={defaultPageHeader('My Mortgage')} component={MortgageTab} />
            {/* <Tab.Screen name="AffordabilityScreen" options={{ headerShown: false, title: "Affordability Calculator" }} component={AffordabilityCalculatorScreen} /> */}
            <Tab.Screen name="PropertyScreen" options={{ headerShown: false, title: 'Browse Properties' }} component={PropertyListingScreen} />
            <Tab.Screen name="MoreScreen" options={{ headerShown: false, title: 'More' }} component={MoreNav} />
        </Tab.Navigator>
    );
}

function SavingsNav() {
    return (
        <SavingScreenStack.Navigator screenOptions={({ route }) => ({
            cardStyle: {
                backgroundColor: Theme.Colors.backgroundColor,
            },
        })} >
            <SavingScreenStack.Screen name='savings_home' options={{ headerShown: false }} component={SavingsTab} />
            <SavingScreenStack.Screen name='savings_tranfers' options={defaultPageHeader('Transfer Menu')} component={TransferHomeScreen} />
            {/* <SavingScreenStack.Screen name='savings_tranfers_menu' options={defaultPageHeader('Transfer Menu')} component={TransferMenuScreen} />
            <SavingScreenStack.Screen name='savings_tranfers_to_own_acct' options={defaultPageHeader('Own Account Transfer')} component={TransferToOwnAcctScreen} />
            <SavingScreenStack.Screen name='savings_tranfers_to_other_acct' options={defaultPageHeader('Other Account Transfer')} component={TransferToOtherAcctScreen} />
            <SavingScreenStack.Screen name='manage_beneficiaries' options={defaultPageHeader('Manage Beneficiaries')} component={BeneficiariesScreen} />
            <SavingScreenStack.Screen name='savings_tranfers_otp' options={defaultPageHeader('PIN Required')} component={TransferOTPScreen} /> */}
        </SavingScreenStack.Navigator>
    )
}

function MoreNav() {
    return (
        <MoreScreenStack.Navigator initialRouteName={'more_home'} screenOptions={({ route }) => ({
            cardStyle: {
                backgroundColor: Theme.Colors.backgroundColor,
            },
        })}>
            <MoreScreenStack.Screen name='more_home' options={{ headerShown: false, title: 'More' }} component={MoreScreen} />
            <MoreScreenStack.Screen name='more_change_password' options={{ headerShown: false, title: 'More' }} component={MoreScreen} />
            <MoreScreenStack.Screen name='more_change_pin' options={{ headerShown: false, title: 'More' }} component={MoreScreen} />
            <MoreScreenStack.Screen name='more_transfer_limit' options={{ headerShown: false, title: 'More' }} component={TransferLimitScreen} />
            <MoreScreenStack.Screen name='more_auto_save' options={{ headerShown: false, title: 'More' }} component={MoreScreen} />
            <MoreScreenStack.Screen name='more_faq' options={defaultPageHeader('FAQs')} component={FAQScreen} />
            <MoreScreenStack.Screen name='more_profile' options={defaultPageHeader('Profile')} component={ProfileScreen} />
        </MoreScreenStack.Navigator>
    )
}

function InvestmentNav() {
    return (
        <SavingScreenStack.Navigator initialRouteName={'investment_home'} screenOptions={({ route }) => ({
            cardStyle: {
                backgroundColor: Theme.Colors.backgroundColor,
            },
        })}>
            <SavingScreenStack.Screen name='investment_home' options={{ headerShown: false }} component={InvestmentTab} />
        </SavingScreenStack.Navigator>
    )
}

function Routes() {
    return (
        <Stack.Navigator screenOptions={({ route }) => ({
            cardStyle: {
                backgroundColor: Theme.Colors.backgroundColor,
            },
        })}>
            <Stack.Screen name="Landing" component={Landing} options={{ headerShown: false }} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} options={{ headerShown: false }} />
            <Stack.Screen name="OTPScreen" component={OTPScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SignUpScreen" component={SignUpScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AccountIntroScreen" component={AccountIntroScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CreateAccountScreen" component={CreateAccountScreen} options={defaultPageHeader('Create Account')} />
            <Stack.Screen name="AccountDocumentScreen" component={AccountDocumentScreen} options={{ headerShown: false }} />
            <Stack.Screen name="TransactionHistoryScreen" component={TransactionHistoryScreen} options={defaultPageHeader('Transaction History')} />
            <Stack.Screen name="TransactionPINScreen" component={TransactionPINScreen} options={defaultPageHeader('Transaction PIN')} />
            <Stack.Screen
                name="Home"
                component={AppNav}
                options={{ headerShown: false }}
            />
            <Stack.Screen name="AccountManagerScreen" component={AccountManagerScreen} options={defaultPageHeader('Account Manager')} />
            <Stack.Screen name="PropertyDetailScreen" component={PropertyDetailScreen} options={defaultPageHeader('Property Detail')} />
            <Stack.Screen name="NewMortgageScreen" component={NewMortgageScreen} options={defaultPageHeader('New Mortgage')} />
            <Stack.Screen name="FilterViewScreen" component={FilterViewScreen} options={{
                headerShown: true, title: 'Filter Properties', headerTintColor: '#ffffff', headerStyle: {
                    backgroundColor: Theme.Colors.backgroundColor
                }
            }} />
            <Stack.Screen name="AffordabilityListingScreen" component={AffordabilityListingScreen} options={defaultPageHeader('Property Listing')} />
            <Stack.Screen name="AddAccountScreen" component={AddAccountScreen} options={defaultPageHeader('Add Account')} />
            <Stack.Screen name="FundAcctScreen" component={FundAcctScreen} options={defaultPageHeader('Fund Account')} />
            <Stack.Screen name="FundWebView" component={FundWebView} options={defaultPageHeader('Fund Account')} />
            <Stack.Screen name="SuccessScreen" component={SuccessScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CardRequestScreen" component={CardRequestScreen} options={defaultPageHeader('Card Request')} />
            <Stack.Screen name="TransactionSummaryScreen" component={TransactionSummaryScreen} options={defaultPageHeader('Transaction Detail')} />
            <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} options={defaultPageHeader('Enquiries & Complaints')} />
            <Stack.Screen name="BVNValidationScreen" options={defaultPageHeader('BVN Verification')} component={BVNValidationScreen} />

            <Stack.Screen name='savings_tranfers_menu' options={defaultPageHeader('Transfer Menu')} component={TransferMenuScreen} />
            <Stack.Screen name='savings_tranfers_to_own_acct' options={defaultPageHeader('Own Account Transfer')} component={TransferToOwnAcctScreen} />
            <Stack.Screen name='savings_tranfers_to_other_acct' options={defaultPageHeader('Other Account Transfer')} component={TransferToOtherAcctScreen} />
            <Stack.Screen name='manage_beneficiaries' options={defaultPageHeader('Manage Beneficiaries')} component={BeneficiariesScreen} />
            <Stack.Screen name='savings_tranfers_otp' options={defaultPageHeader('PIN Required')} component={TransferOTPScreen} />

            <Stack.Screen name='investment_new' options={defaultPageHeader('New Investment')} component={NewInvestmentScreen} />
            <Stack.Screen name='investment_add_to_deal' options={defaultPageHeader('Add To Deal')} component={AddToDealScreen} />
            <Stack.Screen name='investment_liquidation_menu' options={defaultPageHeader('Liquidation')} component={LiquidationMenuScreen} />
            <Stack.Screen name='investment_liquidation_partial' options={defaultPageHeader('Partial Liquidation')} component={PartialLiquidationScreen} />
            <Stack.Screen name='investment_liquidation_full' options={defaultPageHeader('Full Liquidation')} component={FullLiquidationScreen} />

            <Stack.Screen name='bills.home' options={defaultPageHeader('Bills Payment')} component={BillsScreen} />
            <Stack.Screen name='bills.billers' options={defaultPageHeader('Bills Payment')} component={BillersScreen} />
            <Stack.Screen name='bills.billers.packages' options={defaultPageHeader('Bills Payment')} component={PackagesScreen} />
            <Stack.Screen name='bills.billers.purchase' options={defaultPageHeader('Bills Payment')} component={PurchaseScreen} />

            <Stack.Screen name='affiliate.onboarding' options={defaultPageHeader('Become An Affiliate')} component={AffiliateOnboardingScreen} />
            <Stack.Screen name='affiliate.detail' options={defaultPageHeader('My Referrals')} component={AffiliateReferralsScreen} />

            <Stack.Screen name='homevest.landing' options={{ headerShown: false }} component={HomeVestLanding} />
            <Stack.Screen name='homevest.properties' options={defaultPageHeader('Get Started')} component={HomeVestPropertyScreen} />
            <Stack.Screen name='homevest.create' options={defaultPageHeader('Equity & Savings Plan')} component={CreateHomeVestScreen} />
            <Stack.Screen name='homevest.dashboard' options={defaultPageHeader('My Homevest')} component={HomeVestDashboardScreen} />
        </Stack.Navigator>
    );
}

export default Routes;