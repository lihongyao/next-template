'use client';
import type { FooterProps } from '.';

export default function Footer(props: FooterProps) {
  return <footer data-name="Footer">{props?.text}</footer>;
}
