function render(expression, caniuseFeatureArray) {
  const features = caniuseFeatureArray.reduce((prev, feature) => `${prev}${feature}, `, '');
  return {
    as_user: true,
    text: `I've found *${caniuseFeatureArray.length} browser features* containing the expression '${expression}':\n*${features}*`,
  };
}

module.exports = render;
