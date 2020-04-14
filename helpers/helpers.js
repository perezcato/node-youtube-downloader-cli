
const path = require('path');

exports.getRootDir = () => {
  const pt = path.parse(process.cwd()).dir.split('/');
  return `/${pt[1]}/${pt[2]}/`;
};
