import {
  List,
  Table,
  useTable,
  Space,
  ShowButton,
  Button,
  Form,
  Select,
  Col,
  Row,
  DatePicker,
  Tag,
  EditButton,
  Input,
} from "@pankod/refine-antd";
import {
  CrudFilters,
  HttpError,
  useGetIdentity,
  useNavigation,
} from "@pankod/refine-core";
import { client } from "graphConnect";
import { gql } from "graphql-request";

import {
  ICustomers,
  IOrders,
  IOrderStatus,
  ITerminals,
  IUsers,
} from "interfaces";
import { chain } from "lodash";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import duration from "dayjs/plugin/duration";
import DebounceSelect from "components/select/customerSelect";
import FetchSelector from "components/select/fetchSelector";

var weekday = require("dayjs/plugin/weekday");
dayjs.locale("ru");
dayjs.extend(weekday);
dayjs.extend(duration);

const { RangePicker } = DatePicker;

export const OrdersList: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [orderStatuses, setOrderStatuses] = useState<any[]>([]);

  const { show } = useNavigation();

  const { tableProps, searchFormProps } = useTable<
    IOrders,
    HttpError,
    {
      organization_id: string;
      created_at: [dayjs.Dayjs, dayjs.Dayjs];
      terminal_id: string;
      order_status_id: string[];
      customer_phone: string;
      courier_id: any;
      id: number;
    }
  >({
    initialSorter: [
      {
        field: "created_at",
        order: "desc",
      },
    ],
    metaData: {
      fields: [
        "id",
        // "number",
        "delivery_type",
        "created_at",
        "order_price",
        "duration",
        "delivery_price",
        "payment_type",
        {
          orders_couriers: ["id", "name"],
        },
        {
          orders_customers: ["id", "name", "phone"],
        },
        {
          orders_order_status: ["id", "name", "color"],
        },
      ],
      whereInputType: "ordersWhereInput!",
      orderByInputType: "ordersOrderByWithRelationInput!",
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
    initialFilter: [
      {
        field: "created_at",
        operator: "gte",
        value: dayjs().startOf("d").toDate(),
      },
      {
        field: "created_at",
        operator: "lte",
        value: dayjs().endOf("d").toDate(),
      },
    ],
    onSearch: async (params) => {
      const filters: CrudFilters = [];
      const { created_at, order_status_id, customer_phone, courier_id, id } =
        params;

      filters.push(
        {
          field: "created_at",
          operator: "gte",
          value: created_at ? created_at[0].toISOString() : undefined,
        },
        {
          field: "created_at",
          operator: "lte",
          value: created_at ? created_at[1].toISOString() : undefined,
        }
      );

      if (order_status_id && order_status_id.length) {
        filters.push({
          field: "order_status_id",
          operator: "in",
          value: order_status_id,
        });
      }

      if (customer_phone) {
        filters.push({
          field: "orders_customers",
          operator: "contains",
          value: {
            custom: {
              is: {
                phone: {
                  contains: customer_phone,
                },
              },
            },
          },
        });
      }

      if (id) {
        filters.push({
          field: "id",
          operator: "eq",
          value: {
            equals: +id,
          },
        });
      }

      if (courier_id && courier_id.value) {
        filters.push({
          field: "courier_id",
          operator: "eq",
          value: { equals: courier_id.value },
        });
      }

      return filters;
    },
  });

  const getAllFilterData = async () => {
    const query = gql`
      query {
        cachedOrderStatuses {
          id
          name
          color
        }
      }
    `;
    const { cachedOrderStatuses } = await client.request<{
      cachedOrderStatuses: IOrderStatus[];
    }>(query, {}, { Authorization: `Bearer ${identity?.token.accessToken}` });
    setOrderStatuses(cachedOrderStatuses);
  };

  const fetchCourier = async (queryText: string) => {
    const query = gql`
        query {
          couriers(where: {
            active: {
              equals: true
            },
            OR: [{
              name: {
                contains: "${queryText}"
                mode: insensitive
              }
            }, {
              phone: {
                contains: "${queryText}"
              }
            }]
          }) {
            id
            name
            phone
          }
        }
    `;
    const { couriers } = await client.request<{
      couriers: ICustomers[];
    }>(
      query,
      {},
      {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      }
    );
    console.log(couriers);
    console.log(
      couriers.map((user) => ({
        key: user.id,
        value: user.id,
        label: `${user.name} (${user.phone})`,
      }))
    );
    return couriers.map((user) => ({
      key: user.id,
      value: user.id,
      label: `${user.name} (${user.phone})`,
    }));
  };

  const goToCustomer = (id: string) => {
    show(`customers`, id);
  };

  const goToCourier = (id: string) => {
    show(`users`, id);
  };

  useEffect(() => {
    getAllFilterData();
  }, []);
  return (
    <>
      <List title="???????????? ??????????????">
        <Form
          layout="horizontal"
          {...searchFormProps}
          initialValues={{
            created_at: [dayjs().startOf("d"), dayjs().endOf("d")],
          }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="???????? ????????????" name="created_at">
                <RangePicker format={"DD.MM.YYYY"} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="order_status_id" label="????????????">
                <Select showSearch optionFilterProp="children" allowClear>
                  {orderStatuses.map((terminal: any) => (
                    <Select.Option key={terminal.id} value={terminal.id}>
                      {terminal.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="customer_phone" label="?????????????? ??????????????">
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="courier_id" label="????????????">
                <FetchSelector fetchOptions={fetchCourier} allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="id" label="?????????? ????????????">
                <Input allowClear />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button htmlType="submit" type="primary">
              ??????????????????????
            </Button>
          </Form.Item>
        </Form>
        <Table
          {...tableProps}
          rowKey="id"
          bordered
          size="small"
          onRow={(record: any) => ({
            onDoubleClick: () => {
              show("orders", record.id);
            },
          })}
        >
          <Table.Column dataIndex="id" title="???" />
          <Table.Column
            dataIndex="created_at"
            title="???????? ????????????"
            render={(record: any) => (
              <span>{dayjs(record).format("DD.MM.YYYY HH:mm")}</span>
            )}
          />
          <Table.Column
            dataIndex="order_status_id"
            title="????????????"
            render={(value: any, record: any) => (
              <Tag color={record.orders_order_status.color}>
                {record.orders_order_status.name}
              </Tag>
            )}
          />
          <Table.Column
            dataIndex="orders_couriers.name"
            title="????????????"
            render={(value: any, record: IOrders) =>
              record.orders_couriers ? (
                <Button
                  type="link"
                  size="small"
                  onClick={() => goToCourier(record.orders_couriers.id)}
                >
                  {`${record.orders_couriers.name}`}
                </Button>
              ) : (
                <span>???? ????????????????</span>
              )
            }
          />
          <Table.Column
            dataIndex="orders_customers.name"
            title="??????"
            render={(value: any, record: IOrders) => (
              <Button
                type="link"
                size="small"
                onClick={() => goToCustomer(record.orders_customers.id)}
              >
                {record.orders_customers.name}
              </Button>
            )}
          />
          <Table.Column
            dataIndex="orders_customers.phone"
            title="??????????????"
            render={(value: any, record: IOrders) => (
              <Button
                type="link"
                size="small"
                onClick={() => goToCustomer(record.orders_customers.id)}
              >
                {record.orders_customers.phone}
              </Button>
            )}
          />
          <Table.Column
            dataIndex="order_price"
            title="????????"
            render={(value: any, record: IOrders) => (
              <span>
                {new Intl.NumberFormat("ru").format(record.order_price)} ??????
              </span>
            )}
          />
          <Table.Column dataIndex="payment_type" title="?????? ????????????" />
          <Table.Column<IOrders>
            title="Actions"
            dataIndex="actions"
            render={(_text, record): React.ReactNode => {
              return (
                <Space>
                  <EditButton size="small" recordItemId={record.id} hideText />
                  <ShowButton size="small" recordItemId={record.id} hideText />
                </Space>
              );
            }}
          />
        </Table>
      </List>
    </>
  );
};
