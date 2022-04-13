import React from "react";
import {useParams} from "react-router-dom";

function ParamsWrapper({children}) {
  const params = useParams();

  if (React.isValidElement(children)) {
    return React.cloneElement(children, params);
  }
  return children;
}

export default ParamsWrapper;
