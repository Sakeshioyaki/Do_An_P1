async function formatCost(price) {
  const firesIndexSpace = price.indexOf("triệu");
  const indexOfComma = price.indexOf(",");
  let priceInt;
  let priceDecimal;
  let priceOfItem = 0;

  if (indexOfComma == -1) {
    priceInt = Number(price.substring(0, firesIndexSpace - 1));
    priceOfItem = priceInt;
  } else {
    priceInt = Number(price.substring(0, indexOfComma));
    priceDecimal = Number(
      price.substring(indexOfComma + 1, firesIndexSpace - 1)
    );
    priceOfItem = priceInt + priceDecimal / 10;
  }
  return priceOfItem;
}

export default { formatCost };
