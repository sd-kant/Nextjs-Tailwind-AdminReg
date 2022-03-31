import { useCallback, useLayoutEffect, useState } from 'react'

import useEventListener from './useEventListener';

function useElementSize(){
  // Mutable values like 'ref.current' aren't valid dependencies
  // because mutating them doesn't re-render the component.
  // Instead, we use a state as a ref to be reactive.
  const [count, setCount] = useState(0);
  const [ref, setRef] = useState(null)
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  })

  // Prevent too many rendering using useCallback
  const handleSize = useCallback(() => {
    setSize({
      width: ref?.offsetWidth || 0,
      height: ref?.offsetHeight || 0,
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref?.offsetHeight, ref?.offsetWidth, count])

  const forceUpdate = () => {
    setTimeout(() => {
      setCount(prev => prev + 1);
    }, 10);
  };

  useEventListener('resize', handleSize)

  useLayoutEffect(() => {
    handleSize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref?.offsetHeight, ref?.offsetWidth])

  return [setRef, size, forceUpdate];
}

export default useElementSize;
