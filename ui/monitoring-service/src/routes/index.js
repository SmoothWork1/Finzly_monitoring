import React from "react";
import { Redirect } from "react-router-dom";

// Pages Component
// import Chat from "../pages/Chat/Chat";

// Pages File Manager
// import FileManager from "../pages/FileManager/index";

// Pages Calendar
// import Calendar from "../pages/Calendar/index";

// User profile
// import UserProfile from "../pages/Authentication/UserProfile";

//Tasks
// import TasksList from "../pages/Tasks/tasks-list";
// import TasksCreate from "../pages/Tasks/tasks-create";

//Projects
// import ProjectsGrid from "../pages/Projects/projects-grid";
// import ProjectsList from "../pages/Projects/projects-list";
// import ProjectsOverview from "../pages/Projects/ProjectOverview/projects-overview";
// import ProjectsCreate from "../pages/Projects/projects-create";

//Ecommerce Pages
// import EcommerceProducts from "../pages/Ecommerce/EcommerceProducts/index";
// import EcommerceProductDetail from "../pages/Ecommerce/EcommerceProducts/EcommerceProductDetail";
// import EcommerceOrders from "../pages/Ecommerce/EcommerceOrders/index";
// import EcommerceCustomers from "../pages/Ecommerce/EcommerceCustomers/index";
// import EcommerceCart from "../pages/Ecommerce/EcommerceCart";
// import EcommerceCheckout from "../pages/Ecommerce/EcommerceCheckout";
// import EcommerceShops from "../pages/Ecommerce/EcommerceShops/index";
// import EcommerceAddProduct from "../pages/Ecommerce/EcommerceAddProduct";

//Email
// import EmailInbox from "../pages/Email/email-inbox";
// import EmailRead from "../pages/Email/email-read";
// import EmailBasicTemplte from "../pages/Email/email-basic-templte";
// import EmailAlertTemplte from "../pages/Email/email-template-alert";
// import EmailTemplateBilling from "../pages/Email/email-template-billing";

//Invoices
// import InvoicesList from "../pages/Invoices/invoices-list";
// import InvoiceDetail from "../pages/Invoices/invoices-detail";

// Authentication related pages
// import Login from "../pages/Authentication/Login";
// import Logout from "../pages/Authentication/Logout";
// import Register from "../pages/Authentication/Register";
// import ForgetPwd from "../pages/Authentication/ForgetPassword";

// Inner Authentication
// import Login1 from "../pages/AuthenticationInner/Login";
import Login2 from "../pages/AuthenticationInner/Login2";
// import Register1 from "../pages/AuthenticationInner/Register";
import Register2 from "../pages/AuthenticationInner/Register2";
// import Recoverpw from "../pages/AuthenticationInner/Recoverpw";
// import Recoverpw2 from "../pages/AuthenticationInner/Recoverpw2";
// import ForgetPwd1 from "../pages/AuthenticationInner/ForgetPassword";
// import ForgetPwd2 from "../pages/AuthenticationInner/ForgetPwd2";
// import LockScreen from "../pages/AuthenticationInner/auth-lock-screen";
// import LockScreen2 from "../pages/AuthenticationInner/auth-lock-screen-2";
// import ConfirmMail from "../pages/AuthenticationInner/page-confirm-mail";
// import ConfirmMail2 from "../pages/AuthenticationInner/page-confirm-mail-2";
// import EmailVerification from "../pages/AuthenticationInner/auth-email-verification";
// import EmailVerification2 from "../pages/AuthenticationInner/auth-email-verification-2";
// import TwostepVerification from "../pages/AuthenticationInner/auth-two-step-verification";
// import TwostepVerification2 from "../pages/AuthenticationInner/auth-two-step-verification-2";
import Verify from "pages/AuthenticationInner/Verify";
import Forgot from "pages/AuthenticationInner/forgotPassword";

// Grid
import Grid from "../pages/Dashboard/Grid";
import Heartbeats from "../pages/Dashboard/Heartbeats";
import AgentQueries from "../pages/Dashboard/AgentQueries";
import DevOpsRequests from "../pages/Dashboard/DevOpsRequests";

// Subscriptions
import Subscriptions from "../pages/Dashboard/Subscriptions";

// Dashboard
// import Dashboard from "../pages/Dashboard/index";
import Dashboard from "pages/Dashboard/dashboard";
import Flagged from "pages/Dashboard/Flagged";
import BlockDashboard from "pages/Dashboard/BlockDashboard";
import Users from "pages/Dashboard/Users";
import Events from "pages/Dashboard/Events";
import JobConfig from "pages/Dashboard/JobConfig";
import Uptime from "pages/Dashboard/Uptime";
import UptimeCalendar from "pages/Dashboard/UptimeCalendar";
// import DashboardSaas from "../pages/Dashboard-saas/index";
// import DashboardCrypto from "../pages/Dashboard-crypto/index";
// import DashboardBlog from "../pages/Dashboard-blog/index";
// import DashboardJobs from "../pages/Dashboard-jobs/index";

//Crypto
// import CryptoWallet from "../pages/Crypto/CryptoWallet/crypto-wallet";
// import CryptoBuySell from "../pages/Crypto/crypto-buy-sell";
// import CryptoExchange from "../pages/Crypto/crypto-exchange";
// import CryptoLending from "../pages/Crypto/crypto-lending";
// import CryptoOrders from "../pages/Crypto/CryptoOrders/crypto-orders";
// import CryptoKYCApplication from "../pages/Crypto/crypto-kyc-application";
// import CryptoIcoLanding from "../pages/Crypto/CryptoIcoLanding/index";

// Charts
// import ChartApex from "../pages/Charts/Apexcharts";
// import ChartistChart from "../pages/Charts/ChartistChart";
// import ChartjsChart from "../pages/Charts/ChartjsChart";
// import EChart from "../pages/Charts/EChart";
// import SparklineChart from "../pages/Charts/SparklineChart";
// import ChartsKnob from "../pages/Charts/charts-knob";
// import ReCharts from "../pages/Charts/ReCharts";

// Maps
// import MapsGoogle from "../pages/Maps/MapsGoogle";
// import MapsVector from "../pages/Maps/MapsVector";
// import MapsLeaflet from "../pages/Maps/MapsLeaflet";

//Icons
// import IconBoxicons from "../pages/Icons/IconBoxicons";
// import IconDripicons from "../pages/Icons/IconDripicons";
// import IconMaterialdesign from "../pages/Icons/IconMaterialdesign";
// import IconFontawesome from "../pages/Icons/IconFontawesome";

//Tables
// import BasicTables from "../pages/Tables/BasicTables";
// import DatatableTables from "../pages/Tables/DatatableTables";
// import ResponsiveTables from "../pages/Tables/ResponsiveTables";
// import EditableTables from "../pages/Tables/EditableTables";
// import DragDropTables from "../pages/Tables/DragDropTables";

// Forms
// import FormElements from "../pages/Forms/FormElements/index";
// import FormLayouts from "../pages/Forms/FormLayouts";
// import FormAdvanced from "../pages/Forms/FormAdvanced";
// import FormEditors from "../pages/Forms/FormEditors";
// import FormValidations from "../pages/Forms/FormValidations";
// import FormMask from "../pages/Forms/FormMask";
// import FormRepeater from "../pages/Forms/FormRepeater";
// import FormUpload from "../pages/Forms/FormUpload";
// import FormWizard from "../pages/Forms/FormWizard";
// import FormXeditable from "../pages/Forms/FormXeditable";
// import DualListbox from "../pages/Forms/DualListbox";

//Job
// import JobList from "../pages/JobPages/JobList/index";
// import JobGrid from "../pages/JobPages/JobGrid/index";
// import JobDetails from "../pages/JobPages/JobDetails";
// import JobCategories from "../pages/JobPages/JobCategories"
// import CandidateList from "../pages/JobPages/CandidateList";
// import CandidateOverview from "../pages/JobPages/CandidateOverview";
// import ApplyJobs from "../pages/JobPages/ApplyJobs/index";

//Ui
// import UiAlert from "../pages/Ui/UiAlert";
// import UiButtons from "../pages/Ui/UiButtons";
// import UiCards from "../pages/Ui/UiCards";
// import UiCarousel from "../pages/Ui/UiCarousel";
// import UiColors from "../pages/Ui/UiColors";
// import UiDropdown from "../pages/Ui/UiDropdown";
// import UiGeneral from "../pages/Ui/UiGeneral";
// import UiGrid from "../pages/Ui/UiGrid";
// import UiImages from "../pages/Ui/UiImages";
// import UiLightbox from "../pages/Ui/UiLightbox";
// import UiModal from "../pages/Ui/UiModal";
// import UiProgressbar from "../pages/Ui/UiProgressbar";
// import UiTabsAccordions from "../pages/Ui/UiTabsAccordions";
// import UiTypography from "../pages/Ui/UiTypography";
// import UiVideo from "../pages/Ui/UiVideo";
// import UiSessionTimeout from "../pages/Ui/UiSessionTimeout";
// import UiRating from "../pages/Ui/UiRating";
// import UiRangeSlider from "../pages/Ui/UiRangeSlider";
// import UiNotifications from "../pages/Ui/ui-notifications";
// import UiToast from "../pages/Ui/UiToast";
// import UiOffCanvas from "../pages/Ui/UiOffCanvas";
// import UiUtilitie from "../pages/Ui/UiUtilitie";
// import UiPlaceholders from "../pages/Ui/UiPlaceholders";

//Pages
// import PagesStarter from "../pages/Utility/pages-starter";
// import PagesMaintenance from "../pages/Utility/pages-maintenance";
// import PagesComingsoon from "../pages/Utility/pages-comingsoon";
// import PagesTimeline from "../pages/Utility/pages-timeline";
// import PagesFaqs from "../pages/Utility/pages-faqs";
// import PagesPricing from "../pages/Utility/pages-pricing";
// import Pages404 from "../pages/Utility/pages-404";
// import Pages500 from "../pages/Utility/pages-500";

//Contacts
// import ContactsGrid from "../pages/Contacts/contacts-grid";
// import ContactsList from "../pages/Contacts/ContactList/contacts-list";
// import ContactsProfile from "../pages/Contacts/ContactsProfile/contacts-profile";

//Blog
// import BlogList from "../pages/Blog/BlogList/index";
// import BlogGrid from "../pages/Blog/BlogGrid/index";
// import BlogDetails from "../pages/Blog/BlogDetails";

// Release Automation
import RADashboard from '../pages/ReleaseAutomation/dashboard';
// import RASetup from '../pages/ReleaseAutomation/setup';
import RATenants from '../pages/ReleaseAutomation/tenants';
import RAEnvironments from '../pages/ReleaseAutomation/environments';
import RAReleases from '../pages/ReleaseAutomation/releases';
import RATenantEnv from '../pages/ReleaseAutomation/tenantEnv';
import RAReleaseEnv from '../pages/ReleaseAutomation/releaseEnv';
import RAConfiguration from '../pages/ReleaseAutomation/configuration';
import RAApplications from '../pages/ReleaseAutomation/applications';
import RADevOpsProperties from '../pages/ReleaseAutomation/devops_properties';
import RAOnboardingQuestions from '../pages/ReleaseAutomation/onboarding_questions';
import RADBSchemaUpdates from '../pages/ReleaseAutomation/db_schema_updates';

const authProtectedRoutes = [
  { path: "/dashboard", component: Dashboard },
  { path: "/grid/:key", component: Grid },
  { path: "/queries/:key", component: AgentQueries },
  { path: "/devops_requests", component: DevOpsRequests },
  { path: "/subscriptions", component: Subscriptions },
  { path: "/flags", component: Flagged },
  { path: "/heartbeats", component: Heartbeats },
  { path: "/blockdash", component: BlockDashboard },
  { path: "/users", component: Users },
  { path: "/events", component: Events },
  { path: "/job_config", component: JobConfig },
  { path: "/uptime", component: Uptime },
  { path: "/uptime/calendar", component: UptimeCalendar },

  // Release Automation
  { path: "/release_automation/dashboard", component: RADashboard },
  // { path: "/release_automation/setup", component: RASetup },
  { path: "/release_automation/tenants", component: RATenants },
  { path: "/release_automation/environments", component: RAEnvironments },
  { path: "/release_automation/releases", component: RAReleases },
  { path: "/release_automation/tenant_env", component: RATenantEnv },
  { path: "/release_automation/release_env", component: RAReleaseEnv },
  { path: "/release_automation/configuration", component: RAConfiguration },
  { path: "/release_automation/applications", component: RAApplications },
  { path: "/release_automation/devops_properties", component: RADevOpsProperties },
  { path: "/release_automation/onboarding_questions", component: RAOnboardingQuestions },
  { path: "/release_automation/db_schema", component: RADBSchemaUpdates },

  //Crypto
  // { path: "/crypto-wallet", component: CryptoWallet },
  // { path: "/crypto-buy-sell", component: CryptoBuySell },
  // { path: "/crypto-exchange", component: CryptoExchange },
  // { path: "/crypto-lending", component: CryptoLending },
  // { path: "/crypto-orders", component: CryptoOrders },
  // { path: "/crypto-kyc-application", component: CryptoKYCApplication },

  //profile
  // { path: "/profile", component: UserProfile },

  //chat
  // { path: "/chat", component: Chat },

  //File Manager
  // { path: "/apps-filemanager", component: FileManager },

  //calendar
  // { path: "/calendar", component: Calendar },

  //Ecommerce
  // { path: "/ecommerce-products/:id", component: EcommerceProducts },
  // { path: "/ecommerce-products", component: EcommerceProducts },
  // { path: "/ecommerce-product-details/:id", component: EcommerceProductDetail },

  // { path: "/ecommerce-orders", component: EcommerceOrders },
  // { path: "/ecommerce-customers", component: EcommerceCustomers },
  // { path: "/ecommerce-cart", component: EcommerceCart },
  // { path: "/ecommerce-checkout", component: EcommerceCheckout },
  // { path: "/ecommerce-shops", component: EcommerceShops },
  // { path: "/ecommerce-add-product", component: EcommerceAddProduct },

  //Email
  // { path: "/email-inbox", component: EmailInbox },
  // { path: "/email-read", component: EmailRead },
  // { path: "/email-template-basic", component: EmailBasicTemplte },
  // { path: "/email-template-alert", component: EmailAlertTemplte },
  // { path: "/email-template-billing", component: EmailTemplateBilling },

  //Invoices
  // { path: "/invoices-list", component: InvoicesList },
  // { path: "/invoices-detail", component: InvoiceDetail },
  // { path: "/invoices-detail/:id", component: InvoiceDetail },

  // Tasks
  // { path: "/tasks-list", component: TasksList },
  // { path: "/tasks-create", component: TasksCreate },

  //Projects
  // { path: "/projects-grid", component: ProjectsGrid },
  // { path: "/projects-list", component: ProjectsList },
  // { path: "/projects-overview", component: ProjectsOverview },
  // { path: "/projects-overview/:id", component: ProjectsOverview },
  // { path: "/projects-create", component: ProjectsCreate },

  // Contacts
  // { path: "/contacts-grid", component: ContactsGrid },
  // { path: "/contacts-list", component: ContactsList },
  // { path: "/contacts-profile", component: ContactsProfile },

  //Blog
  // { path: "/blog-list", component: BlogList },
  // { path: "/blog-grid", component: BlogGrid },
  // { path: "/blog-details", component: BlogDetails },

  //Charts
  // { path: "/apex-charts", component: ChartApex },
  // { path: "/chartist-charts", component: ChartistChart },
  // { path: "/chartjs-charts", component: ChartjsChart },
  // { path: "/e-charts", component: EChart },
  // { path: "/sparkline-charts", component: SparklineChart },
  // { path: "/charts-knob", component: ChartsKnob },
  // { path: "/re-charts", component: ReCharts },

  // Icons
  // { path: "/icons-boxicons", component: IconBoxicons },
  // { path: "/icons-dripicons", component: IconDripicons },
  // { path: "/icons-materialdesign", component: IconMaterialdesign },
  // { path: "/icons-fontawesome", component: IconFontawesome },

  // Tables
  // { path: "/tables-basic", component: BasicTables },
  // { path: "/tables-datatable", component: DatatableTables },
  // { path: "/tables-responsive", component: ResponsiveTables },
  // { path: "/tables-editable", component: EditableTables },
  // { path: "/tables-dragndrop", component: DragDropTables },

  // Maps
  // { path: "/maps-google", component: MapsGoogle },
  // { path: "/maps-vector", component: MapsVector },
  // { path: "/maps-leaflet", component: MapsLeaflet },

  // Forms
  // { path: "/form-elements", component: FormElements },
  // { path: "/form-layouts", component: FormLayouts },
  // { path: "/form-advanced", component: FormAdvanced },
  // { path: "/form-editors", component: FormEditors },
  // { path: "/form-mask", component: FormMask },
  // { path: "/form-repeater", component: FormRepeater },
  // { path: "/form-uploads", component: FormUpload },
  // { path: "/form-wizard", component: FormWizard },
  // { path: "/form-validation", component: FormValidations },
  // { path: "/form-xeditable", component: FormXeditable },
  // { path: "/dual-listbox", component: DualListbox },

  //job
  // { path: "/job-list", component: JobList },
  // { path: "/job-grid", component: JobGrid },
  // { path: "/job-details", component: JobDetails },
  // { path: "/job-categories", component: JobCategories },
  // { path : "/candidate-list" , component: CandidateList },
  // { path : "/candidate-overview" , component : CandidateOverview },
  // { path: "/job-apply", component: ApplyJobs },

  // Ui
  // { path: "/ui-alerts", component: UiAlert },
  // { path: "/ui-buttons", component: UiButtons },
  // { path: "/ui-cards", component: UiCards },
  // { path: "/ui-carousel", component: UiCarousel },
  // { path: "/ui-colors", component: UiColors },
  // { path: "/ui-dropdowns", component: UiDropdown },
  // { path: "/ui-general", component: UiGeneral },
  // { path: "/ui-grid", component: UiGrid },
  // { path: "/ui-images", component: UiImages },
  // { path: "/ui-lightbox", component: UiLightbox },
  // { path: "/ui-modals", component: UiModal },
  // { path: "/ui-progressbars", component: UiProgressbar },
  // { path: "/ui-tabs-accordions", component: UiTabsAccordions },
  // { path: "/ui-typography", component: UiTypography },
  // { path: "/ui-video", component: UiVideo },
  // { path: "/ui-session-timeout", component: UiSessionTimeout },
  // { path: "/ui-rating", component: UiRating },
  // { path: "/ui-rangeslider", component: UiRangeSlider },
  // { path: "/ui-notifications", component: UiNotifications },
  // { path: "/ui-toasts", component: UiToast },
  // { path: "/ui-offcanvas", component: UiOffCanvas },
  // { path: "/ui-utilities", component: UiUtilitie },
  // { path: "/ui-placeholders", component: UiPlaceholders },
  //Utility
  // { path: "/pages-starter", component: PagesStarter },
  // { path: "/pages-timeline", component: PagesTimeline },
  // { path: "/pages-faqs", component: PagesFaqs },
  // { path: "/pages-pricing", component: PagesPricing },

  // this route should be at the end of all other routes
  // eslint-disable-next-line react/display-name
  { path: "/", exact: true, component: () => <Redirect to="/dashboard" /> },
];

const publicRoutes = [
  // { path: "/logout", component: Logout },
  // { path: "/login", component: Login },
  // { path: "/forgot-password", component: ForgetPwd },
  // { path: "/register", component: Register },

  // { path: "/pages-maintenance", component: PagesMaintenance },
  // { path: "/pages-comingsoon", component: PagesComingsoon },
  // { path: "/pages-404", component: Pages404 },
  // { path: "/pages-500", component: Pages500 },
  // { path: "/crypto-ico-landing", component: CryptoIcoLanding },

  // Authentication Inner
  // { path: "/pages-login", component: Login1 },
  // { path: "/pages-login-2", component: Login2 },
  { path: "/login", component: Login2 },

  // { path: "/pages-register", component: Register1 },
  // { path: "/pages-register-2", component: Register2 },
  { path: "/register", component: Register2 },
  { path: "/verify", component: Verify },
  
  { path: "/forgot", component: Forgot },

  // { path: "/page-recoverpw", component: Recoverpw },
  // { path: "/pages-recoverpw-2", component: Recoverpw2 },

  // { path: "/pages-forgot-pwd", component: ForgetPwd1 },
  // { path: "/pages-forgot-pwd-2", component: ForgetPwd2 },

  // { path: "/auth-lock-screen", component: LockScreen },
  // { path: "/auth-lock-screen-2", component: LockScreen2 },
  // { path: "/page-confirm-mail", component: ConfirmMail },
  // { path: "/page-confirm-mail-2", component: ConfirmMail2 },
  // { path: "/auth-email-verification", component: EmailVerification },
  // { path: "/auth-email-verification-2", component: EmailVerification2 },
  // { path: "/auth-two-step-verification", component: TwostepVerification },
  // { path: "/auth-two-step-verification-2", component: TwostepVerification2 },
];

export { authProtectedRoutes, publicRoutes };