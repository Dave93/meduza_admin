import React from "react";
import { useLogin } from "@pankod/refine-core";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

import {
  Row,
  Col,
  AntdLayout,
  Card,
  Form,
  Input,
  Button,
  Icons,
  Typography,
} from "@pankod/refine-antd";
import "react-phone-input-2/lib/style.css";

export interface ILoginForm {
  phone: string;
  code: string;
  otpSecret: string;
}

const { Title } = Typography;

export const Login: React.FC = () => {
  const { mutate: login, isLoading } = useLogin<ILoginForm>();

  const renderGSMForm = () => (
    <Form layout="vertical" requiredMark={false} onFinish={login}>
      <Form.Item
        name="login"
        label="Login"
        rules={[
          {
            required: true,
            message: "Login is required",
          },
        ]}
      >
        <Input prefix={<UserOutlined />} placeholder="Login" />
      </Form.Item>
      <Form.Item
        name="password"
        label="Password"
        rules={[
          {
            required: true,
            message: "Password is required",
          },
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
      </Form.Item>
      <Form.Item noStyle>
        <Button
          type="primary"
          size="large"
          htmlType="submit"
          loading={isLoading}
          block
        >
          Sign in
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <AntdLayout
      style={{
        background: `#475a9b`,
        backgroundSize: "cover",
      }}
    >
      <Row
        justify="center"
        align="middle"
        style={{
          height: "100vh",
        }}
      >
        <Col xs={22}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "28px",
            }}
          >
            {/* <Title
              style={{
                color: "white",
              }}
            >
              MEDUZA
            </Title> */}
          </div>

          <Card
            style={{
              maxWidth: "400px",
              margin: "auto",
              borderRadius: "10px",
            }}
          >
            {renderGSMForm()}
          </Card>
        </Col>
      </Row>
    </AntdLayout>
  );
};
