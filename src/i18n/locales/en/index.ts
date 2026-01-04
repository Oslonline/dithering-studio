import layout from './layout';
import homepage from './homepage';
import tool from './tool';
import explorer from './explorer';
import common from './common';
import algoData from './algoData';
import education from './education';

const en = {
  ...layout,
  ...homepage,
  ...education,
  tool,
  explorer,
  ...common,
  ...algoData,
};

export default en;
