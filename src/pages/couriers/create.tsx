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

export const CouriersCreate = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const { formProps, saveButtonProps } = useForm<IOrderStatus>({
    metaData: {
      fields: ["id", "name", "active", "phone"],
      pluralize: true,
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
  });

  return (
    <Create saveButtonProps={saveButtonProps} title="Добавить курьера">
      <Form {...formProps} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Активность"
              name="active"
              rules={[
                {
                  required: true,
                },
              ]}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={4}>
            <Form.Item
              label="Имя"
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
          <Col span={4}>
            <Form.Item label="Тeлефон" name="phone">
              <Input />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Пароль">
              <Input.Password />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Create>
  );
};
