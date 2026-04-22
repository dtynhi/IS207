import { Button, Checkbox, Form, InputNumber } from "antd";
import type { ProductCategory } from "../types/product.types";

export type ProductFilterValues = {
  search?: string;
  facet?: string[];
  minPrice?: number;
  maxPrice?: number;
};

type Props = {
  categories: ProductCategory[];
  initialValues: ProductFilterValues;
  onSubmit: (values: ProductFilterValues) => void;
  onReset: () => void;
};

export const ProductFilterForm = ({ categories, initialValues, onSubmit, onReset }: Props) => {
  const [form] = Form.useForm<ProductFilterValues>();

  return (
    <Form form={form} layout="vertical" initialValues={initialValues} onFinish={onSubmit} className="flex flex-col gap-6">
      <div>
        <div className="mb-3 font-semibold">Theo Danh Mục</div>
        <Form.Item name="facet" className="m-0">
          <Checkbox.Group className="flex flex-col gap-2.5">
            {categories.map((c) => (
              <Checkbox key={c.id} value={c.id}>
                {c.title}
              </Checkbox>
            ))}
          </Checkbox.Group>
        </Form.Item>
      </div>

      <div>
        <div className="mb-3 font-semibold">Khoảng Giá</div>
        <div className="flex items-center gap-2">
          <Form.Item name="minPrice" className="m-0 flex-1">
            <InputNumber min={0} placeholder="Từ" className="w-full" />
          </Form.Item>
          <span>-</span>
          <Form.Item name="maxPrice" className="m-0 flex-1">
            <InputNumber min={0} placeholder="Đến" className="w-full" />
          </Form.Item>
        </div>
      </div>

      <div className="flex gap-2.5">
        <Button type="primary" htmlType="submit" className="flex-1">
          Áp dụng
        </Button>
        <Button
          onClick={() => {
            form.resetFields();
            onReset();
          }}
          className="flex-1"
        >
          Xoá
        </Button>
      </div>
    </Form>
  );
};
