export const getValueFromProps = ({ forceUppercase, value }) => {
  value = value == null ? '' : value;
  return forceUppercase ? value.toUpperCase() : value;
};

export const getInputArrayFromProps = (props) => {
  const fields = Math.min(32, props.fields);
  const value = getValueFromProps(props);
  return Array.from(Array(fields)).map((_, index) => value[index] || '');
};
