import { drive_type, organization_system_type, user_status } from "./enums";

export interface IPermissions {
  id: number;

  slug: string;

  description: string;

  active: boolean;

  created_at: Date;

  updated_at: Date;

  created_by: string | null;

  updated_by: string | null;
}

export interface IRoles {
  id: string;

  name: string;

  active: boolean;
}

export interface IDeliveryPricing {
  id: string;

  active: boolean;

  default: boolean;

  name: string;

  drive_type: keyof typeof drive_type;

  days: Array<string>;

  start_time: Date;

  end_time: Date;

  min_price?: number | null;

  rules: any;

  price_per_km: number;

  organization_id: string;
  organization?: organization;
}

export class IOrganization {
  id: string;

  name: string;

  active: boolean;

  system_type: keyof typeof organization_system_type;

  phone: string;

  webhook?: string | null;

  group_id?: string | null;

  apelsin_login?: string | null;

  apelsin_password?: string | null;

  sender_name?: string | null;

  sender_number?: string | null;

  description?: string | null;

  created_at: Date;

  updated_at: Date;

  created_by?: string | null;

  updated_by?: string | null;

  _count?: OrganizationCount;
}

export class IWorkSchedules {
  id: string;

  name: string;

  active: boolean;

  organization_id: string;

  organization?: organization;

  days: Array<string>;

  start_time: Date;

  end_time: Date;

  max_start_time: Date;

  created_at: Date;

  updated_at: Date;

  created_by?: string | null;

  updated_by?: string | null;

  work_schedules_created_byTousers?: users | null;

  work_schedules_updated_byTousers?: users | null;
}

export class ITerminals {
  id: string;

  name: string;

  active: boolean;

  phone: string | null;

  address: string | null;

  latitude: number;

  longitude: number;

  external_id: string;

  organization_id: string;

  organization?: organization;

  created_at: Date;

  updated_at: Date;

  created_by: string | null;

  updated_by: string | null;
}

export class IUsers {
  [x: string]: any;
  id: string;

  phone: string;

  first_name?: string | null;

  last_name?: string | null;

  password?: string | null;

  is_super_user: boolean;

  status: keyof typeof user_status;

  drive_type?: keyof typeof drive_type | null;

  card_name?: string | null;

  card_number?: string | null;

  birth_date?: Date | null;

  car_model?: string | null;

  car_number?: string | null;

  is_online: boolean;

  latitude?: number | null;

  longitude?: number | null;

  created_at: Date;

  updated_at: Date;

  otp?: Array<otp>;

  permissions_permissions_created_byTousers?: Array<permissions>;

  permissions_permissions_updated_byTousers?: Array<permissions>;

  post_post_created_byTousers?: Array<post>;

  post_updated_byTousers?: Array<post>;

  post_post_user_idTousers?: Array<post>;

  roles_roles_created_byTousers?: Array<roles>;

  roles_roles_updated_byTousers?: Array<roles>;

  roles_permissions_roles_permissions_created_byTousers?: Array<roles_permissions>;

  roles_permissions_roles_permissions_updated_byTousers?: Array<roles_permissions>;

  users_permissions_usersTousers_permissions_created_by?: Array<users_permissions>;

  users_permissions_usersTousers_permissions_updated_by?: Array<users_permissions>;

  users_permissions_usersTousers_permissions_user_id?: Array<users_permissions>;

  users_roles_usersTousers_roles_created_by?: Array<users_roles>;

  users_roles_usersTousers_roles_updated_by?: Array<users_roles>;

  users_roles_usersTousers_roles_user_id?: Array<users_roles>;

  post_prop_types_created_byTousers?: Array<post_prop_types>;

  post_prop_types_updated_byTousers?: Array<post_prop_types>;

  delivery_pricing_created_byTousers?: Array<delivery_pricing>;

  delivery_pricing_updated_byTousers?: Array<delivery_pricing>;

  city_created_byTousers?: Array<city>;

  city_updated_byTousers?: Array<city>;

  organization_created_byTousers?: Array<organization>;

  organization_updated_byTousers?: Array<organization>;

  work_schedules_created_byTousers?: Array<work_schedules>;

  work_schedules_updated_byTousers?: Array<work_schedules>;

  terminals_created_byTousers?: Array<terminals>;

  terminals_updated_byTousers?: Array<terminals>;

  users_terminals?: Array<users_terminals>;

  users_work_schedules?: Array<users_work_schedules>;

  _count?: UsersCount;
}

class WorkScheduleEntriesReportCouriers {
  id: string;

  first_name: string;

  last_name: string;
}

export class WorkScheduleEntriesReportForPeriod {
  users: WorkScheduleEntriesReportCouriers[];

  work_schedule_entries: WorkScheduleEntriesReportRecord[];
}

class WorkScheduleEntriesReportRecord {
  user_id: string;

  duration: number;

  day: Date;

  late: boolean;

  first_name: string;

  last_name: string;
}

export class ICustomers {
  id: string;

  name: string;

  phone: string;

  customers_comments_customers?: Array<customers_comments>;

  _count?: CustomersCount;
}

export class customers_comments {
  id: string;

  customer_id: string;

  comment: string;

  created_at: Date;

  created_by: string | null;

  customers_comments_created_byTousers?: users | null;

  customers_comments_customers?: customers;
}
