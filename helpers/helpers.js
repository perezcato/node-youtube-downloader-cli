
const path = require('path');

exports.getRootDir = () => {
  const pt = path.parse(process.cwd()).dir.split('/');
  return `/${pt[1]}/${pt[2]}/`;
};

exports.isEmpty = (obj) => {
  for(const key in obj){
    if(obj.hasOwnProperty(key)) return false;
  }
  return true;
};

exports.convertSize = (value) => {
  if (value === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(value) / Math.log(k));
  return parseFloat((value / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
