import { Col, Row, List, PageHeader } from "@pankod/refine-antd";
import { ProductCategoriesList } from "./categories/list";
import { ProductList } from "./products/list";

export const CatalogList: React.FC = () => {
  return (
    <>
      <PageHeader title="Каталог" ghost={false}>
        <ProductCategoriesList />
      </PageHeader>
    </>
  );
};
