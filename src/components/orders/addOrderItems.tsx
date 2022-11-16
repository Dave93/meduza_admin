import {
  Button,
  Col,
  Drawer,
  List,
  Row,
  Space,
  Switch,
  Table,
  useTable,
} from "@pankod/refine-antd";
import { useGetIdentity } from "@pankod/refine-core";
import { IOrderItems, IProductCategories, IProducts } from "interfaces";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { FC, useState } from "react";

interface OnSaveHandler {
  (e: any): void;
}
interface MyInputProps {
  OnSaveHandler: OnSaveHandler;
}

const AddOrderItems: FC<MyInputProps> = ({ OnSaveHandler }) => {
  const [visible, setVisible] = useState(false);
  const [orderItems, setOrderItems] = useState<IProducts[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
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

  const { tableProps: productTableProps } = useTable<IProducts>({
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

  const rowSelection = {
    onChange: (selectedKeys: React.Key[]) => {
      setCategoryId(selectedKeys[0]);
    },
  };
  const onCancel = () => {
    setVisible(false);
  };

  const onSave = () => {
    OnSaveHandler(orderItems);
    setSelectedProductIds([]);
    setOrderItems([]);
    setVisible(false);
  };

  const addProduct = (product: IProducts) => {
    setSelectedProductIds([...selectedProductIds, product.id]);
    setOrderItems([...orderItems, product]);
  };

  const removeProduct = (product: IProducts) => {
    setSelectedProductIds(selectedProductIds.filter((id) => id !== product.id));
    setOrderItems(orderItems.filter((item) => item.id !== product.id));
  };

  return (
    <div>
      <Button type="primary" onClick={() => setVisible(true)}>
        Добавить услуги
      </Button>

      <Drawer
        title="Выбрать услуги"
        placement="bottom"
        size="large"
        onClose={onCancel}
        visible={visible}
        extra={
          <Space>
            <Button onClick={onCancel}>Отмена</Button>
            <Button type="primary" onClick={onSave}>
              Выбрать
            </Button>
          </Space>
        }
      >
        <Row gutter={16}>
          <Col span={8}>
            <List
              title="Категории товаров"
              resource="product_categories"
              breadcrumb={<></>}
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
                <Table.Column dataIndex="sort" title="Сортировка" />
                <Table.Column dataIndex="name" title="Название" />
              </Table>
            </List>
          </Col>
          <Col span={16}>
            <List title="Список товаров" breadcrumb={<></>}>
              <Table {...productTableProps} rowKey="id">
                <Table.Column
                  dataIndex="active"
                  title="Активность"
                  render={(value) => <Switch checked={value} disabled />}
                />
                <Table.Column dataIndex="name" title="Название" />
                <Table.Column dataIndex="description" title="Описание" />
                <Table.Column dataIndex="price" title="Цена" />
                <Table.Column<IProducts>
                  title="Действия"
                  dataIndex="actions"
                  render={(_text, record): React.ReactNode => {
                    return (
                      <Space>
                        {selectedProductIds.includes(record.id) ? (
                          <Button
                            type="primary"
                            icon={<MinusOutlined />}
                            danger
                            onClick={() => removeProduct(record)}
                          ></Button>
                        ) : (
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => addProduct(record)}
                          ></Button>
                        )}
                      </Space>
                    );
                  }}
                />
              </Table>
            </List>
          </Col>
        </Row>
      </Drawer>
    </div>
  );
};

export default AddOrderItems;
