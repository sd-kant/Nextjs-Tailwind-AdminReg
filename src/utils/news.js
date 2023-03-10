export const JoinStringFromArr = (arr) => {
  let list = [];
  arr.forEach(it => {
    list.push(it?.attributes?.name);
  });

  return list.join(', ');
};