const textData = {
  content:
    "Taiwan called motorcycle, motor bike [1] or a motorcycle," +
    " the motorcycle referred to in the mainland, Hong Kong and Southeast" +
    " Asia known as motorcycles.",
  title: "Motorcycle",
};

let dataArray = [
  { image: "https://zos.alipayobjects.com/rmsportal/DGOtoWASeguMJgV.png" },
  { image: "https://zos.alipayobjects.com/rmsportal/BXJNKCeUSkhQoSS.png" },
  { image: "https://zos.alipayobjects.com/rmsportal/TDIbcrKdLWVeWJM.png" },
  { image: "https://zos.alipayobjects.com/rmsportal/SDLiKqyfBvnKMrA.png" },
  { image: "https://zos.alipayobjects.com/rmsportal/UcVbOrSDHCLPqLG.png" },
  { image: "https://zos.alipayobjects.com/rmsportal/QJmGZYJBRLkxFSy.png" },
  { image: "https://zos.alipayobjects.com/rmsportal/PDiTkHViQNVHddN.png" },
  { image: "https://zos.alipayobjects.com/rmsportal/beHtidyjUMOXbkI.png" },
  { image: "https://zos.alipayobjects.com/rmsportal/vJcpMCTaSKSVWyH.png" },
  { image: "https://zos.alipayobjects.com/rmsportal/dvQuFtUoRmvWLsZ.png" },
  { image: "https://zos.alipayobjects.com/rmsportal/QqWQKvgLSJaYbpr.png" },
  { image: "https://zos.alipayobjects.com/rmsportal/pTfNdthdsUpLPLJ.png" },
  { image: "https://zos.alipayobjects.com/rmsportal/DGOtoWASeguMJgV.png" },
  { image: "https://zos.alipayobjects.com/rmsportal/BXJNKCeUSkhQoSS.png" },
  { image: "https://zos.alipayobjects.com/rmsportal/TDIbcrKdLWVeWJM.png" },
  { image: "https://zos.alipayobjects.com/rmsportal/SDLiKqyfBvnKMrA.png" },
  { image: "https://zos.alipayobjects.com/rmsportal/UcVbOrSDHCLPqLG.png" },
  { image: "https://zos.alipayobjects.com/rmsportal/QJmGZYJBRLkxFSy.png" },
  { image: "https://zos.alipayobjects.com/rmsportal/PDiTkHViQNVHddN.png" },
  { image: "https://zos.alipayobjects.com/rmsportal/beHtidyjUMOXbkI.png" },
  { image: "https://zos.alipayobjects.com/rmsportal/vJcpMCTaSKSVWyH.png" },
  { image: "https://zos.alipayobjects.com/rmsportal/dvQuFtUoRmvWLsZ.png" },
  { image: "https://zos.alipayobjects.com/rmsportal/QqWQKvgLSJaYbpr.png" },
  { image: "https://zos.alipayobjects.com/rmsportal/pTfNdthdsUpLPLJ.png" },
];

const test = {
  1: "1",
  "2": "2",
};

/**
 * @description:导出数据
 * @param {*} item
 * @return {*}
 * @example
 *
 */
export default dataArray.map((item) => ({ ...item, ...textData }));
