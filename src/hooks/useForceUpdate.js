import * as React from "react";
//create your forceUpdate hook
function useForceUpdate(){
  // eslint-disable-next-line no-unused-vars
  const [value, setValue] = React.useState(0); // integer state
  return () => setValue(value => value + 1); // update the state to force render
}

export default useForceUpdate;
