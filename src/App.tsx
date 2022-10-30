import { Refine } from "@pankod/refine-core";
import {
  notificationProvider,
  Layout,
  ErrorComponent,
  Typography,
} from "@pankod/refine-antd";

import "@pankod/refine-antd/dist/styles.min.css";
import "./styles/main.css";

import routerProvider from "@pankod/refine-react-router-v6";
import { RefineKbarProvider } from "@pankod/refine-kbar";
import { useTranslation } from "react-i18next";
import { OffLayoutArea } from "components/offLayoutArea";
import { Header } from "components/layout";
import { authProvider, TOKEN_KEY } from "./authProvider";
import { Login } from "pages/login";
// import dataProvider, { GraphQLClient } from "@pankod/refine-strapi-graphql";
import dataProvider from "./dataprovider";
import { client } from "graphConnect";
import {
  PermissionsList,
  PermissionsEdit,
  PermissionsCreate,
} from "pages/permissions";
import { RolesList, RolesShow } from "pages/roles";
import { RolesCreate } from "pages/roles/create";
import { RolesEdit } from "pages/roles/edit";
import {
  DeliveryPricingCreate,
  DeliveryPricingEdit,
  DeliveryPricingList,
} from "pages/delivery_pricing";
import {
  OrganizationList,
  OrganizationsCreate,
  OrganizationsEdit,
} from "pages/organization";
import {
  WorkSchedulesCreate,
  WorkSchedulesEdit,
  WorkSchedulesList,
} from "pages/work_schedules";
import { TerminalsCreate, TerminalsEdit, TerminalsList } from "pages/terminals";
import { UsersCreate, UsersEdit, UsersList } from "pages/users";
import { WorkSchedulesReport } from "pages/work_schedule_entries_report";
import { CustomersList, CustomersShow } from "pages/customers";
import {
  OrderStatusCreate,
  OrderStatusEdit,
  OrderStatusList,
} from "pages/order_status";
import { OrdersList } from "pages/orders";
import { OrdersShow } from "pages/orders/show";
import { ApiTokensCreate, ApiTokensList } from "pages/api_tokens";
import { AES, enc } from "crypto-js";
import { CustomersCreate } from "pages/customers/create";

const { Title } = Typography;
const gqlDataProvider = dataProvider(client);

const { Link } = routerProvider;

function App() {
  const { t, i18n } = useTranslation();

  const i18nProvider = {
    translate: (key: string, params: object) => t(key, params),
    changeLocale: (lang: string) => i18n.changeLanguage(lang),
    getLocale: () => i18n.language,
  };

  return (
    <RefineKbarProvider>
      <Refine
        notificationProvider={notificationProvider}
        Layout={Layout}
        accessControlProvider={{
          can: async ({ action, params, resource }) => {
            const token = localStorage.getItem(TOKEN_KEY);
            if (token) {
              let password = process.env.REACT_APP_CRYPTO_KEY!;
              var bytes = AES.decrypt(token, password);
              var decryptedData = JSON.parse(bytes.toString(enc.Utf8));
              const {
                access: { additionalPermissions },
              } = decryptedData;
              return Promise.resolve({
                can: additionalPermissions.includes(`${resource}.${action}`),
                reason: additionalPermissions.includes(`${resource}.${action}`)
                  ? undefined
                  : "You are not allowed to do this",
              });
            }
            return Promise.resolve({
              can: true,
            });
          },
        }}
        // ReadyPage={ReadyPage}
        catchAll={<ErrorComponent />}
        routerProvider={routerProvider}
        dataProvider={gqlDataProvider}
        authProvider={authProvider}
        LoginPage={Login}
        OffLayoutArea={OffLayoutArea}
        i18nProvider={i18nProvider}
        syncWithLocation={true}
        Header={Header}
        Title={() => (
          <Link to="/" style={{ width: "100%" }}>
            <Title
              style={{
                color: "white",
              }}
            >
              MEDUZA
            </Title>
          </Link>
        )}
        resources={[
          {
            name: "home",
          },
          {
            name: "orders-group",
            options: {
              label: "Заказы",
            },
          },
          {
            name: "customers",
            options: {
              label: "Клиенты",
            },
            parentName: "orders-group",
            list: CustomersList,
            show: CustomersShow,
            create: CustomersCreate,
          },
          {
            name: "order_status",
            options: {
              label: "Статусы заказов",
            },
            parentName: "orders-group",
            list: OrderStatusList,
            create: OrderStatusCreate,
            edit: OrderStatusEdit,
          },
          {
            name: "orders",
            options: {
              label: "Заказы",
            },
            parentName: "orders-group",
            list: OrdersList,
            show: OrdersShow,
          },
          {
            name: "users-group",
            options: {
              label: "Пользователи",
            },
            list: UsersList,
          },
          {
            name: "roles",
            parentName: "users-group",
            list: RolesList,
            create: RolesCreate,
            edit: RolesEdit,
            show: RolesShow,
            options: {
              label: "Роли",
            },
          },
          {
            name: "permissions",
            parentName: "users-group",
            list: PermissionsList,
            edit: PermissionsEdit,
            create: PermissionsCreate,
            options: {
              label: "Разрешения",
            },
          },
          {
            name: "users",
            parentName: "users-group",
            list: UsersList,
            create: UsersCreate,
            edit: UsersEdit,
            options: {
              label: "Список пользователей",
            },
          },
          // {
          //   name: "time_management",
          //   options: {
          //     label: "Время и отчёты",
          //   },
          // },
          // {
          //   name: "work_schedules",
          //   parentName: "time_management",
          //   options: {
          //     label: "Рабочие графики",
          //   },
          //   list: WorkSchedulesList,
          //   create: WorkSchedulesCreate,
          //   edit: WorkSchedulesEdit,
          // },
          // {
          //   name: "work_schedule_entries_report",
          //   parentName: "time_management",
          //   options: {
          //     label: "Отчёт по рабочим графикам",
          //   },
          //   list: WorkSchedulesReport,
          // },
          {
            name: "settings",
            options: {
              label: "Настройки",
            },
          },
          {
            name: "api_tokens",
            parentName: "settings",
            options: {
              label: "API Токены",
            },
            list: ApiTokensList,
            create: ApiTokensCreate,
          },
        ]}
      />
    </RefineKbarProvider>
  );
}

export default App;
