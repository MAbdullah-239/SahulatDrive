// import {ComponentType} from 'react';
// import MainStackWithDrawer from '../../../navigation/mainStackNavigation/mainStackWithDrawer';
// import otpSuccess from '../../../screens/auth/otpSuccess/otpSuccess';
// import Community from '../../../screens/main/community/community';
// import EditPost from '../../../screens/main/community/components/editPost/editPost';
// import Following from '../../../screens/main/community/components/following/following';
// import OtherUserPosts from '../../../screens/main/community/components/otherUserPosts/otherUserPosts';
// import UploadPost from '../../../screens/main/community/components/uploadPost/uploadPost';
// import UserPosts from '../../../screens/main/community/components/userPosts/userPosts';
// import ProfileSetting from '../../../screens/main/profile/profileSetting/profileSetting';
// import Home from '../../../screens/main/home/home';
// import EnterAmount from '../../../screens/main/home/homeComponents/enterAmount/enterAmount';
// import PredictionScreen from '../../../screens/main/home/predictionScreen/predictionScreen';
// import PlotDetailScreen from '../../../screens/auth/onboarding/onboardingSteps/components/plotDetailScreen/plotDetailScreen';
// import PaymentScreen from '../../../screens/main/paymentScreen/paymentScreen';
// import {
//   AccountPrivacy,
//   ChangePassword,
//   ConnectedSocialAccounts,
//   NotificationScreen,
//   ReferralScreen,
//   UpdateProfile,
//   Wallet,
//   SetupPayment,
//   SetupCard,
//   TransectionHistory,
//   Withdraw,
//   PrivacyPolicy,
// } from '../../../screens/main/profile';
// import LeaderBoard from '../../../screens/main/leaderBoardScreen/leaderBoard';
// import AnalyticsScreen from '../../../screens/main/analytics/analytics';
// import MyPicks from '../../../screens/main/myPicks/myPicks';
// import TermsAndConditions from '../../../screens/main/termsAndConditions/termsAndConditions';
// import Taxes from '../../../screens/main/taxes/taxes';
// import HelpCenter from '../../../screens/main/support/helpCenter/helpCenter';
// import SupportChat from '../../../screens/main/support/supportChat/supportChat';

// export const MainStack = {
//   name: 'mainStack',
//   component: MainStackWithDrawer,
//   initialRouteName: 'Home',

//   nestedScreens: {
//     Home: {name: 'Home' as const, component: Home as ComponentType<any>},
//     ReferralScreen: {
//       name: 'ReferralScreen' as const,
//       component: ReferralScreen as ComponentType<any>,
//     },
//     ChangePassword: {
//       name: 'ChangePassword' as const,
//       component: ChangePassword as ComponentType<any>,
//     },
//     AccountPrivacy: {
//       name: 'AccountPrivacy' as const,
//       component: AccountPrivacy as ComponentType<any>,
//     },
//     ConnectedSocialAccounts: {
//       name: 'ConnectedSocialAccounts' as const,
//       component: ConnectedSocialAccounts as ComponentType<any>,
//     },
//     NotificationScreen: {
//       name: 'NotificationScreen' as const,
//       component: NotificationScreen as ComponentType<any>,
//     },
//     ProfileSetting: {
//       name: 'ProfileSetting' as const,
//       component: ProfileSetting as ComponentType<any>,
//     },
//     UpdateProfile: {
//       name: 'UpdateProfile' as const,
//       component: UpdateProfile as ComponentType<any>,
//     },
//     Wallet: {name: 'Wallet' as const, component: Wallet as ComponentType<any>},
//     Withdraw: {
//       name: 'Withdraw' as const,
//       component: Withdraw as ComponentType<any>,
//     },
//     SetupPayment: {
//       name: 'SetupPayment' as const,
//       component: SetupPayment as ComponentType<any>,
//     },
//     SetupCard: {
//       name: 'SetupCard' as const,
//       component: SetupCard as ComponentType<any>,
//     },
//     TransactionHistory: {
//       name: 'TransactionHistory' as const,
//       component: TransectionHistory as ComponentType<any>,
//     },
//     PrivacyPolicy: {
//       name: 'PrivacyPolicy' as const,
//       component: PrivacyPolicy as ComponentType<any>,
//     },
//     PredictionScreen: {
//       name: 'PredictionScreen' as const,
//       component: PredictionScreen as ComponentType<any>,
//     },
//     PlotDetailScreen: {
//       name: 'PlotDetailScreen' as const,
//       component: PlotDetailScreen as ComponentType<any>,
//     },
//     EnterAmount: {
//       name: 'EnterAmount' as const,
//       component: EnterAmount as ComponentType<any>,
//     },
//     PaymentScreen: {
//       name: 'PaymentScreen' as const,
//       component: PaymentScreen as ComponentType<any>,
//     },
//     otpSuccess: {
//       name: 'otpSuccess' as const,
//       component: otpSuccess as ComponentType<any>,
//     },
//     Community: {
//       name: 'Community' as const,
//       component: Community as ComponentType<any>,
//     },
//     Following: {
//       name: 'Following' as const,
//       component: Following as ComponentType<any>,
//     },
//     UploadPost: {
//       name: 'UploadPost' as const,
//       component: UploadPost as ComponentType<any>,
//     },
//     UserPosts: {
//       name: 'UserPosts' as const,
//       component: UserPosts as ComponentType<any>,
//     },
//     EditPost: {
//       name: 'EditPost' as const,
//       component: EditPost as ComponentType<any>,
//     },
//     OtherUserPosts: {
//       name: 'OtherUserPosts' as const,
//       component: OtherUserPosts as ComponentType<any>,
//     },
//     LeaderBoard: {
//       name: 'LeaderBoard' as const,
//       component: LeaderBoard as ComponentType<any>,
//     },
//     AnalyticsScreen: {
//       name: 'AnalyticsScreen' as const,
//       component: AnalyticsScreen as ComponentType<any>,
//     },
//     TermsAndConditions: {
//       name: 'TermsAndConditions' as const,
//       component: TermsAndConditions as ComponentType<any>,
//     },
//     Taxes: {
//       name: 'Taxes' as const,
//       component: Taxes as ComponentType<any>,
//     },
//     HelpCenter: {
//       name: 'HelpCenter' as const,
//       component: HelpCenter as ComponentType<any>,
//     },
//     SupportChat: {
//       name: 'SupportChat' as const,
//       component: SupportChat as ComponentType<any>,
//     },
//     MyPicks: {
//       name: 'MyPicks' as const,
//       component: MyPicks as ComponentType<any>,
//     },
//   },
// } as const;
