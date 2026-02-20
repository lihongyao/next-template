import type { CardProps } from '.';

export default function CardSuspense(props: CardProps) {
  return (
    <div data-name="CardSuspense">
      <h3>{props?.name}</h3>
      <ul>
        {props?.list.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
