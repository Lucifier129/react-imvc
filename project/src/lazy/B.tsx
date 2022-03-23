import React from 'react';

export type CounterProps = {
  count: number;
};

export const Counter = (props: CounterProps) => {
  const [count, setCount] = React.useState(props.count);

  return (
    <div id="b">
      <h1>Counter B</h1>
      <p>
        <button onClick={() => setCount(count + 1)}>+</button>
        <span>{count}</span>
        <button onClick={() => setCount(count - 1)}>-</button>
      </p>
    </div>
  );
};

export default Counter