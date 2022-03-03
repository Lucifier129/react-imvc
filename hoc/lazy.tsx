import React from 'react';

const isSupportWindow = typeof window !== 'undefined';

export function lazy<T extends React.ComponentType<any>>(
  loader: () => Promise<{ default: T }>
) {
  const consumers = [] as Array<() => void>;
  const addConsumer = (consumer: () => void) => {
    consumers.push(consumer);
  };
  const removeConsumer = (consumer: () => void) => {
    const index = consumers.indexOf(consumer);
    if (index > -1) {
      consumers.splice(index, 1);
    }
  };
  const publish = () => {
    consumers.forEach((consumer) => consumer());
    consumers.length = 0;
  };

  let Component: T | null = null;

  const load = async () => {
    if (Component) {
      return;
    }

    const result = await loader();
    Component = result.default;

    if (isSupportWindow) {
      publish();
    }
  };

  const Lazy = (props: React.ComponentProps<T>) => {
    const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

    React.useEffect(() => {
      if (isSupportWindow) {
        addConsumer(forceUpdate);
        return () => {
          removeConsumer(forceUpdate);
        };
      }
    }, []);

    if (Component) {
      return <Component {...props} />;
    }

    return null;
  };

  Lazy.load = load;
  Lazy.displayName = `Lazy`;

  return Lazy;
}
