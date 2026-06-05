import layout from './layout';
import homepage from './homepage';
import tool from './tool';
import explorer from './explorer';
import common from './common';
import algoData from './algoData';
import technicalSummaries from './technicalSummaries';
import education from './education';

const hi = {
  ...layout,
  ...homepage,
  ...education,
  tool,
  explorer,
  ...common,
  ...algoData,
  ...technicalSummaries,
};

export default hi;
