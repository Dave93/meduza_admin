import {
  Button,
  Create,
  Drawer,
  Edit,
  Form,
  Input,
  InputNumber,
  List,
  Space,
  Switch,
  Table,
  useDrawerForm,
  useTable,
} from "@pankod/refine-antd";
import { useCan, useGetIdentity } from "@pankod/refine-core";
import { EditOutlined } from "@ant-design/icons";
import { IProducts } from "interfaces";

interface IProductListProps {
  categoryId: any;
}

export const ProductList: React.FC<IProductListProps> = ({ categoryId }) => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const {
    drawerProps,
    formProps,
    show,
    saveButtonProps,
    deleteButtonProps,
    id,
  } = useDrawerForm<IProducts>({
    action: "create",
    resource: "product",
    redirect: false,
    metaData: {
      fields: [
        "id",
        "name",
        "description",
        "price",
        "active",
        "created_at",
        "product_category_id",
      ],
      defaultValues: {
        product_category_id: categoryId,
      },
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
  });

  const { tableProps } = useTable<IProducts>({
    initialSorter: [
      {
        field: "name",
        order: "desc",
      },
    ],
    resource: "product",
    initialFilter: [
      {
        field: "product_category_id",
        operator: "eq",
        value: categoryId && {
          equals: categoryId,
        },
      },
    ],
    permanentFilter: [
      {
        field: "product_category_id",
        operator: "eq",
        value: categoryId && {
          equals: categoryId,
        },
      },
    ],
    metaData: {
      fields: [
        "id",
        "name",
        "description",
        "price",
        "active",
        "created_at",
        "product_category_id",
      ],
      whereInputType: "productWhereInput!",
      operation: "products",
      orderByInputType: "productOrderByWithRelationInput!",
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
  } = useDrawerForm<IProducts>({
    action: "edit",
    redirect: false,
    resource: "product",
    metaData: {
      fields: [
        "id",
        "name",
        "description",
        "price",
        "active",
        "created_at",
        "product_category_id",
      ],
      defaultValues: {
        product_category_id: categoryId,
      },
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
  });

  const { data: productCan } = useCan({
    resource: "product",
    action: "create",
  });
  const { data: productCanEdit } = useCan({
    resource: "product",
    action: "edit",
  });

  return (
    <>
      <List
        title="Список товаров"
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
                  Добавить
                </Button>
              )}
            </>
          );
        }}
      >
        <Table {...tableProps} rowKey="id">
          <Table.Column
            dataIndex="active"
            title="Активность"
            render={(value) => <Switch checked={value} disabled />}
          />
          <Table.Column dataIndex="name" title="Название" />
          <Table.Column dataIndex="description" title="Описание" />
          <Table.Column
            dataIndex="price"
            title="Цена"
            render={(value) =>
              `${new Intl.NumberFormat("ru").format(value)}  сум`
            }
          />
          <Table.Column<IProducts>
            title="Действия"
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
        <Create saveButtonProps={saveButtonProps} title="Добавление товара">
          <Form {...formProps} layout="vertical">
            <Form.Item
              label="Активность"
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
            <Form.Item
              label="Цена"
              name="price"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <InputNumber />
            </Form.Item>
            <Form.Item label="Описание" name="description">
              <Input.TextArea />
            </Form.Item>
          </Form>
        </Create>
      </Drawer>
      <Drawer {...editDrawerProps}>
        <Edit saveButtonProps={editSaveButtonProps} title="Добавление товара">
          <Form {...editFormProps} layout="vertical">
            <Form.Item
              label="Активность"
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
            <Form.Item
              label="Цена"
              name="price"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <InputNumber />
            </Form.Item>
            <Form.Item label="Описание" name="description">
              <Input.TextArea />
            </Form.Item>
          </Form>
        </Edit>
      </Drawer>
    </>
  );
};
