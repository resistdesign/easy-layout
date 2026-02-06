import { useState } from 'react';

type CounterProps = {
  initial?: number;
};

export function Counter({ initial = 0 }: CounterProps) {
  const [count, setCount] = useState(initial);

  return (
    <div>
      <p>Count: {count}</p>
      <button type="button" onClick={() => setCount((value) => value + 1)}>
        Increment
      </button>
    </div>
  );
}
