import type { NestedProps } from '.';

export default function client(props: NestedProps) {
  return (
    <div>
      组件类型：{props.component.id} - {props.component.login_type}
    </div>
  );
}
