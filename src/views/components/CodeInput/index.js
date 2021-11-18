import * as React from "react";
import style from "./CodeInput.module.scss";
import clsx from "clsx";
import ReactCodeInput from "react-code-input";

function useWindowSize() {
  const [size, setSize] = React.useState([0, 0]);
  React.useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
}

const inputStyle = {
  fontFamily: 'monospace',
  margin:  '4px',
  MozAppearance: 'textfield',
  height: '74px',
  width: '37px',
  paddingLeft: '20px',
  borderRadius: '10px',
  fontSize: '34px',
  lineHeight: '24px',
  backgroundColor: '#313131',
  color: 'white',
  border: 'none'
};

const inputStyleInvalid = {
  fontFamily: 'monospace',
  margin:  '4px',
  MozAppearance: 'textfield',
  height: '74px',
  width: '37px',
  paddingLeft: '20px',
  borderRadius: '10px',
  fontSize: '34px',
  lineHeight: '24px',
  backgroundColor: '#313131',
  color: 'white',
  border: '1px solid red'
};

const CodeInput = ({

}) => {
  const [width, height] = useWindowSize();
  const [inputCodeStyle, setInputCodeStyle] = React.useState({
    inputStyle,
    inputStyleInvalid,
  });

  React.useEffect(() => {
    if (width < 1024) {
      setInputCodeStyle({
        inputStyle: {
          ...inputStyle,
          height: '40px',
          width: '20px',
          paddingLeft: '9px',
          fontSize: '20px',
          lineHeight: '17px',
          borderRadius: '5px',
        },
        inputStyleInvalid: {
          ...inputStyleInvalid,
          height: '40px',
          width: '20px',
          paddingLeft: '9px',
          fontSize: '20px',
          lineHeight: '17px',
          borderRadius: '5px',
        },
      });
    } else {
      setInputCodeStyle({
        inputStyle,
        inputStyleInvalid,
      })
    }
  }, [width]);

  return (
    <div>
      <ReactCodeInput type='text' fields={6} {...inputCodeStyle}/>
    </div>
  )
}

export default CodeInput;
