import {
  Button,
  Col,
  Create,
  Drawer,
  Edit,
  EditButton,
  Form,
  Input,
  InputNumber,
  List,
  Row,
  Space,
  Switch,
  Table,
  useDrawerForm,
  useTable,
} from "@pankod/refine-antd";
import { useCan, useGetIdentity } from "@pankod/refine-core";
import { EditOutlined } from "@ant-design/icons";
import { IProductCategories } from "interfaces";
import { useState } from "react";
import { ProductList } from "../products/list";

export const ProductCategoriesList: React.FC = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const { tableProps } = useTable<IProductCategories>({
    initialSorter: [
      {
        field: "sort",
        order: "asc",
      },
    ],
    resource: "product_categories",
    metaData: {
      fields: ["id", "name", "sort"],
      whereInputType: "product_categoriesWhereInput!",
      orderByInputType: "product_categoriesOrderByWithRelationInput!",
      operation: "productCategories",
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
  });
  const [categoryId, setCategoryId] = useState<any>(null);

  const rowSelection = {
    onChange: (selectedKeys: React.Key[]) => {
      setCategoryId(selectedKeys[0]);
    },
  };

  const { show, drawerProps, saveButtonProps, formProps } =
    useDrawerForm<IProductCategories>({
      action: "create",
      redirect: false,
      resource: "product_categories",
      metaData: {
        fields: [
          "id",
          "name",
          "active",
          "sort",
          "description",
          "is_additional",
        ],
        pluralize: true,

        requestHeaders: {
          Authorization: `Bearer ${identity?.token.accessToken}`,
        },
      },
    });
  const {
    show: editCategory,
    drawerProps: editDrawerProps,
    saveButtonProps: editSaveButtonProps,
    formProps: editFormProps,
  } = useDrawerForm<IProductCategories>({
    action: "edit",
    redirect: false,
    resource: "product_categories",
    metaData: {
      fields: ["id", "name", "active", "sort", "description", "is_additional"],
      pluralize: true,

      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
  });

  const { data: productCan } = useCan({
    resource: "product_categories",
    action: "create",
  });
  const { data: productCanEdit } = useCan({
    resource: "product_categories",
    action: "edit",
  });

  return (
    <>
      <Row gutter={16}>
        <Col span={8}>
          <List
            title="?????????????????? ??????????????"
            resource="product_categories"
            headerButtons={({ defaultButtons }) => {
              return (
                <>
                  {defaultButtons}
                  {productCan && (
                    <Button
                      type="primary"
                      onClick={() => {
                        show();
                      }}
                    >
                      ????????????????
                    </Button>
                  )}
                </>
              );
            }}
          >
            <Table
              {...tableProps}
              rowKey="id"
              rowSelection={{
                type: "radio",
                ...rowSelection,
              }}
              onRow={(record) => {
                return {
                  onClick: () => {},
                };
              }}
            >
              <Table.Column dataIndex="sort" title="????????????????????" />
              <Table.Column dataIndex="name" title="????????????????" />
              <Table.Column<IProductCategories>
                title="????????????????"
                dataIndex="actions"
                render={(_text, record): React.ReactNode => {
                  return (
                    <Space>
                      <Button
                        icon={<EditOutlined />}
                        disabled={productCanEdit?.can === false}
                        size="small"
                        onClick={() => {
                          if (productCanEdit?.can === false) {
                            return;
                          }
                          editCategory(record.id);
                        }}
                      />
                    </Space>
                  );
                }}
              />
            </Table>
          </List>
          <Drawer {...drawerProps}>
            <Create
              saveButtonProps={saveButtonProps}
              title="???????????????????? ?????????????????? ??????????????"
            >
              <Form {...formProps} layout="vertical">
                <Form.Item
                  label="????????????????????"
                  name="active"
                  valuePropName="checked"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  label="?????? ??????????"
                  name="is_additional"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  label="????????????????"
                  name="name"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="????????????????????"
                  name="sort"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <InputNumber />
                </Form.Item>
                <Form.Item label="????????????????" name="description">
                  <Input.TextArea />
                </Form.Item>
              </Form>
            </Create>
          </Drawer>
          <Drawer {...editDrawerProps}>
            <Edit
              saveButtonProps={editSaveButtonProps}
              title="???????????????????????????? ?????????????????? ??????????????"
            >
              <Form {...editFormProps} layout="vertical">
                <Form.Item
                  label="????????????????????"
                  name="active"
                  valuePropName="checked"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  label="?????? ??????????"
                  name="is_additional"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  label="????????????????"
                  name="name"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="????????????????????"
                  name="sort"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <InputNumber />
                </Form.Item>
                <Form.Item label="????????????????" name="description">
                  <Input.TextArea />
                </Form.Item>
              </Form>
            </Edit>
          </Drawer>
        </Col>
        <Col span={16}>
          <ProductList categoryId={categoryId} />
        </Col>
      </Row>
    </>
  );
};
