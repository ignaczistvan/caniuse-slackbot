const supportedBrowsers = [
  'android',
  'chrome',
  'edge',
  'firefox',
  'ie',
  'ios_saf',
  'safari',
];

const browserName = {
  android: 'Android BuiltIn Browser',
  chrome: 'Google Chrome',
  edge: 'Microsoft Edge',
  firefox: 'Firefox',
  ie: 'Internet Explorer',
  ios_saf: 'Safari on iOS',
  safari: 'Safari',
};

function render(feature, level, caniuseSupportObject) {
  const fields = Object.getOwnPropertyNames(caniuseSupportObject)
    .filter(browser => supportedBrowsers.indexOf(browser) > -1)
    .filter(browser => Object.getOwnPropertyNames(caniuseSupportObject[browser]).length)
    .map((browser) => {
      const support = Object.getOwnPropertyNames(caniuseSupportObject[browser])
        .reduce((prev, key) => {
          switch (key) {
            case 'y':
              return `${prev}Full support from ${caniuseSupportObject[browser][key]}, `;
            case 'n':
              return `${prev}Not supported to ${caniuseSupportObject[browser][key]}, `;
            case 'a':
              return `${prev}Partial support to ${caniuseSupportObject[browser][key]}, `;
            case 'x':
              return `${prev}Prefixed support ${caniuseSupportObject[browser][key]}, `;
            default:
              return prev;
          }
        }, '');
      return {
        title: browserName[browser],
        value: support,
        short: false,
      };
    });
  return {
    as_user: true,
    attachments: [
      {
        title: `Browser support for ${feature}`,
        title_link: `http://caniuse.com/#feat=${feature}`,
        color: level,
        fields,
      },
    ],
  };
}

module.exports = render;
