import type { FooterProps } from '.';

export default function FooterSuspense(props: FooterProps) {
  return <footer data-name="FooterSuspense">{props.text}</footer>;
}
