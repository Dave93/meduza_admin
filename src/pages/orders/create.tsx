import {
  Button,
  Calendar,
  Col,
  Create,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  useForm,
  Table,
} from "@pankod/refine-antd";
import {
  useGetIdentity,
  useNavigation,
  useTranslate,
} from "@pankod/refine-core";
import type { ColumnsType } from "antd/es/table";

import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import {
  ICustomers,
  IOrderDateTime,
  IOrderItems,
  IOrderStatus,
  IOrganization,
  IProducts,
} from "interfaces";
import { Colorpicker } from "antd-colorpicker";
import { useEffect, useMemo, useState } from "react";
import { gql } from "graphql-request";
import * as gqlb from "gql-query-builder";
import { client } from "graphConnect";
import DebounceSelect from "components/select/customerSelect";
import dayjs from "dayjs";
import LocationSelectorInput from "components/location_selector";
import AddOrderItems from "components/orders/addOrderItems";

export const OrdersCreate = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [times, setTimes] = useState<IOrderDateTime[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [selectedProducts, setSelectedProducts] = useState<IOrderItems[]>([]);
  const [rerenderComponent, setRerenderComponent] = useState<boolean>(false);

  const { list } = useNavigation();

  const onSaveSuccess = (data: any, values: any, context: any) => {
    const { query, variables } = gqlb.mutation({
      operation: "assignOrderItem",
      variables: {
        id: {
          value: +data.data.id,
          type: "Int",
          required: true,
        },
        order_items: {
          type: "[order_itemsInput!]",
          value: selectedProducts,
          required: true,
        },
      },
      fields: ["id"],
    });

    const response = client.request(query, variables, {
      Authorization: `Bearer ${identity?.token.accessToken}`,
    });
    list("orders");
  };

  const { formProps, saveButtonProps, form } = useForm<IOrderStatus>({
    redirect: false,
    metaData: {
      fields: [
        "id",
        "delivery_type",
        "created_at",
        "order_price",
        "duration",
        "delivery_price",
        "payment_type",
        {
          orders_couriers: ["id", "first_name", "last_name"],
        },
        {
          orders_customers: ["id", "name", "phone"],
        },
        {
          orders_order_status: ["id", "name", "color"],
        },
      ],
      pluralize: true,
      operation: "createNewOrder",
      variableType: "CreateOrderInput",
    },
    onMutationSuccess: onSaveSuccess,
  });

  const loadTimesToDate = async () => {
    const query = gql`
      query {
        getTimesForDate(date: "${dayjs().format("YYYY-MM-DD")}") {
          value
        }
      }
    `;
    const { getTimesForDate } = await client.request<{
      getTimesForDate: IOrderDateTime[];
    }>(query);
    setTimes(getTimesForDate);
  };

  const fetchCustomer = async (queryText: string) => {
    const query = gql`
        query {
          customers(where: {
            OR: [{
              name: {
                contains: "${queryText}",
                mode: insensitive
              }
            }, {
              phone: {
                contains: "${queryText}",
                mode: insensitive
              }
            }]
          }) {
            id
            name
            phone
          }
        }
    `;
    const { customers } = await client.request<{
      customers: ICustomers[];
    }>(
      query,
      {},
      {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      }
    );

    return customers.map((customer) => ({
      key: customer.id,
      value: customer.id,
      label: `${customer.name} (${customer.phone})`,
    }));
  };

  const onPanelChange = (value: any) => {
    setSelectedDate(value.format("YYYY-MM-DD"));
  };

  const selectTime = (value: string) => {
    setSelectedTime(value);
    let currentSelectedDate = dayjs(`${selectedDate} ${value}`);
    form.setFieldsValue({ delivery_time: currentSelectedDate.toDate() });
  };

  const onSelectAddress = (delivery_address: string) => {
    form.setFieldsValue({ delivery_address });
  };

  const onSetProducts = (products: IProducts[]) => {
    let res = [...selectedProducts];
    products.forEach((product) => {
      let index = res.findIndex((p) => p.product_id === product.id);
      if (index !== -1) {
        res[index] = {
          ...res[index],
          quantity: res[index].quantity + 1,
          total_price: res[index].total_price * (res[index].quantity + 1),
        };
      } else {
        res.push({
          product_id: product.id,
          quantity: 1,
          price: product.price,
          total_price: product.price * 1,
        });
      }
    });

    setSelectedProducts(res);
    setRerenderComponent(!rerenderComponent);
  };

  const onMinus = (product: IOrderItems) => {
    let res = [...selectedProducts];
    let index = res.findIndex((p) => p.product_id === product.product_id);
    if (index !== -1) {
      if (res[index].quantity === 1) {
        res.splice(index, 1);
      } else {
        res[index] = {
          ...res[index],
          quantity: res[index].quantity - 1,
          total_price: res[index].total_price * (res[index].quantity - 1),
        };
      }
    }
    setSelectedProducts(res);
    setRerenderComponent(!rerenderComponent);
  };

  const onPlus = (product: IOrderItems) => {
    let res = [...selectedProducts];
    let index = res.findIndex((p) => p.product_id === product.product_id);
    if (index !== -1) {
      res[index] = {
        ...res[index],
        quantity: res[index].quantity + 1,
        total_price: res[index].total_price * (res[index].quantity + 1),
      };
    }
    setSelectedProducts(res);
    setRerenderComponent(!rerenderComponent);
  };

  const columns: ColumnsType<IOrderItems> = [
    {
      title: "Наименование",
      dataIndex: "product_id",
    },
    {
      title: "Цена",
      dataIndex: "price",
    },
    {
      title: "Кол-во",
      dataIndex: "quantity",
      render: (value, record) => (
        <div>
          <MinusCircleOutlined
            twoToneColor="green"
            onClick={() => onMinus(record)}
          />
          <span style={{ margin: "0 10px" }}>{value}</span>
          <PlusCircleOutlined onClick={() => onPlus(record)} />
        </div>
      ),
    },
    {
      title: "Сумма",
      dataIndex: "total_price",
    },
  ];

  useEffect(() => {
    loadTimesToDate();
  }, []);

  return (
    <Create saveButtonProps={saveButtonProps} title="Добавить заказ">
      <Form {...formProps} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Клиент"
              name="customer_id"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <DebounceSelect
                fetchOptions={fetchCustomer}
                showSearch
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="День мойки"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Calendar
                fullscreen={false}
                onPanelChange={onPanelChange}
                mode="month"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Время мойки"
              name="delivery_time"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Space>
                {times.map((time) => (
                  <Button
                    key={time.value}
                    size="small"
                    type={selectedTime === time.value ? "primary" : "default"}
                    onClick={() => selectTime(time.value)}
                  >
                    {time.value}
                  </Button>
                ))}
              </Space>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Локация"
              name="location"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              {/* @ts-ignore */}
              <LocationSelectorInput onSetAddress={onSelectAddress} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Адрес"
              name="delivery_address"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Способ оплаты"
              name="payment_type"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select>
                <Select.Option value="cash">Наличными</Select.Option>
                <Select.Option value="card">Картой</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Divider orientation="left">Состав заказа</Divider>
        <AddOrderItems OnSaveHandler={onSetProducts} />
        <Table
          columns={columns}
          dataSource={selectedProducts}
          pagination={false}
          bordered
          rowKey="product_id"
        />
      </Form>
    </Create>
  );
};
