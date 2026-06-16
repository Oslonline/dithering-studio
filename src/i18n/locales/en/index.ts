import layout from './layout';
import header from './header';
import homepage from './homepage';
import tool from './tool';
import explorer from './explorer';
import common from './common';
import algoData from './algoData';
import education from './education';
import legal from './legal';
import technicalSummaries from './technicalSummaries';

const en = {
  ...layout,
  ...header,
  ...homepage,
  ...education,
  tool,
  explorer,
  ...common,
  ...algoData,
  ...technicalSummaries,
  legal,
};

export default en;
