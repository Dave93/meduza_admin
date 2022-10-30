import {
  Col,
  Create,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Switch,
  useForm,
} from "@pankod/refine-antd";
import { useGetIdentity } from "@pankod/refine-core";

import { IOrderStatus, IOrganization } from "interfaces";
import { Colorpicker } from "antd-colorpicker";
import { useEffect, useState } from "react";
import { gql } from "graphql-request";
import { client } from "graphConnect";

export const OrderStatusCreate = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const { formProps, saveButtonProps } = useForm<IOrderStatus>({
    metaData: {
      fields: ["id", "name", "sort", "color", "finish", "cancel", "waiting"],
      pluralize: true,
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
  });

  return (
    <Create saveButtonProps={saveButtonProps} title="Создать статус заказа">
      <Form {...formProps} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Название"
              name="name"
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
          <Col span={4}>
            <Form.Item
              label="Сортировка"
              name="sort"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <InputNumber />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Цвет" name="color">
              <Colorpicker popup />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label="Завершающий"
              name="finish"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Отменяющий" name="cancel" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Ожидающий" name="waiting" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Create>
  );
};
